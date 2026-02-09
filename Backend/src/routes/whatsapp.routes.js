// src/routes/whatsapp.route.js
import express from "express";
import axios from "axios";
import Redis from "ioredis";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Document } from "../models/document.model.js";
import { resolveAlias } from "../utils/aliasEngine/index.js";

const router = express.Router();

const PHONE_ID = process.env.META_PHONE_NUMBER_ID;
const TOKEN = process.env.META_WHATSAPP_TOKEN;
const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN;
const REDIS_URL = process.env.REDIS_URL || null;
const CANDIDATE_TTL = Number(process.env.WA_CANDIDATE_TTL_SECONDS || 600); // default 10m

// const WA = (path) => `https://graph.facebook.com/v21.0/${PHONE_ID}/${path}`;
const WA = (path) => `https://graph.facebook.com/v24.0/${PHONE_ID}/${path}`;


const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

console.log("[WA] DocuFlow route: alias-engine v3 loaded (exact->fuzzy->llm, multi-choice)");

// Redis (or in-memory fallback)
let redis = null;
if (REDIS_URL) {
  redis = new Redis(REDIS_URL);
  redis.on("error", (e) => console.error("[redis] error", e));
} else {
  console.warn("[WA] REDIS_URL not set — using ephemeral in-memory candidate cache (not shared across instances).");
  const inMemory = new Map();
  redis = {
    async setex(key, ttl, val) {
      inMemory.set(key, val);
      setTimeout(() => inMemory.delete(key), ttl * 1000);
    },
    async get(key) {
      return inMemory.get(key) || null;
    },
    async del(key) {
      inMemory.delete(key);
    },
  };
}

// Simple helpers
async function sendText(to, body) {
  return axios.post(
    WA("messages"),
    { messaging_product: "whatsapp", to, text: { body } },
    { headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" } }
  );
}

async function sendByMimeLink({ to, link, mime, filename, caption }) {
  const base = { messaging_product: "whatsapp", to };

  if (mime?.startsWith("image/")) {
    return axios.post(
      WA("messages"),
      { ...base, type: "image", image: { link, caption } },
      { headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" } }
    );
  }

  if (mime?.startsWith("video/")) {
    return axios.post(
      WA("messages"),
      { ...base, type: "video", video: { link, caption } },
      { headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" } }
    );
  }

  if (mime?.startsWith("audio/")) {
    return axios.post(
      WA("messages"),
      { ...base, type: "audio", audio: { link } },
      { headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" } }
    );
  }

  // default → document
  return axios.post(
    WA("messages"),
    { ...base, type: "document", document: { link, filename, caption } },
    { headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" } }
  );
}

// GET /whatsapp/webhook (verification)
router.get(
  "/webhook",
  asyncHandler(async (req, res) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];
    if (mode === "subscribe" && token === VERIFY_TOKEN) return res.status(200).send(challenge);
    return res.sendStatus(403);
  })
);

// POST /whatsapp/webhook (receive messages)
router.post(
  "/webhook",
  asyncHandler(async (req, res) => {
    const entry = req.body?.entry?.[0];
    const change = entry?.changes?.[0];
    const message = change?.value?.messages?.[0];

    if (!message) return res.status(200).json(new ApiResponse(200, "no message"));

    const from = message.from;
    let incoming = (message.text?.body || "").trim();
    console.log("[WA] incoming:", incoming, "from:", from);

    if (!incoming) {
      await sendText(from, "👋 Send an alias or hash (e.g., aadhar).");
      return res.status(200).json(new ApiResponse(200, "prompt sent"));
    }

    // If user replies with a single digit selection (1,2,3) check cached candidates first
    const maybeSelection = incoming.trim();
    if (/^[1-9]$/.test(maybeSelection)) {
      const cached = await redis.get(`wa:${from}:candidates`);
      if (cached) {
        try {
          const ids = JSON.parse(cached);
          const idx = Number(maybeSelection) - 1;
          if (idx >= 0 && idx < ids.length) {
            const docId = ids[idx];
            // fetch minimal fields
            const doc = await Document.findById(docId, { fileUrl: 1, mimetype: 1, originalName: 1, title: 1, shareExpiration: 1 }).lean();
            if (!doc) {
              await sendText(from, "❌ The selected document was not found.");
              await redis.del(`wa:${from}:candidates`);
              return res.status(200).json(new ApiResponse(200, "candidate missing"));
            }

            if (doc.shareExpiration && new Date(doc.shareExpiration) < new Date()) {
              await sendText(from, "❌ This document's share link has expired.");
              await redis.del(`wa:${from}:candidates`);
              return res.status(200).json(new ApiResponse(200, "share expired"));
            }

            const mime = doc.mimetype || "application/octet-stream";
            const filename = doc.originalName || doc.title || "file";
            try {
              await sendByMimeLink({ to: from, link: doc.fileUrl, mime, filename, caption: `📎 ${doc.title || ""}` });
              await redis.del(`wa:${from}:candidates`);
              return res.status(200).json(new ApiResponse(200, "candidate sent"));
            } catch (err) {
              console.error("[WA] send error (candidate):", err?.response?.data || err.message || err);
              await sendText(from, "⚠️ Couldn't send the file right now. Here’s the link:\n" + doc.fileUrl);
              await redis.del(`wa:${from}:candidates`);
              return res.status(200).json(new ApiResponse(200, "fallback link sent"));
            }
          } else {
            await sendText(from, "❌ Invalid selection. Please reply with the number shown (e.g., 1).");
            return res.status(200).json(new ApiResponse(200, "invalid selection"));
          }
        } catch (e) {
          console.error("[WA] candidate selection parse error", e);
          await redis.del(`wa:${from}:candidates`);
        }
      }
      // if no cached candidates, fallthrough to normal resolve below
    }

    // strip leading commands: "get aadhar", "send aadhar"
    if (/^(get|send)\s+/i.test(incoming)) incoming = incoming.replace(/^(get|send)\s+/i, "").trim();

    // Resolve alias (exact -> fuzzy -> llm)
    const resolved = await resolveAlias(incoming);

    if (resolved.type === "none") {
      await sendText(from, "❌ No document found for that alias/hash.");
      return res.status(200).json(new ApiResponse(200, "not found"));
    }

    if (resolved.type === "multi") {
      // prepare up to 5 choices (but show only first 3 prominently)
      const choices = resolved.results.slice(0, 5);
      const listText = choices.slice(0, 3).map((d, i) => `${i + 1}) ${d.title || d.originalName || "Untitled"}`).join("\n");
      // Cache the candidate IDs for selection mapping
      const ids = choices.map((d) => String(d._id));
      await redis.setex(`wa:${from}:candidates`, CANDIDATE_TTL, JSON.stringify(ids));
      await sendText(
        from,
        `Found ${resolved.results.length} documents. Reply with the number to choose:\n\n${listText}\n\n(Reply with 1, 2 or 3)`
      );
      return res.status(200).json(new ApiResponse(200, "multi returned"));
    }

    // single result path (exact | fuzzy | llm)
    const docRef = resolved.results[0];
    const doc = await Document.findById(docRef._id, { fileUrl: 1, mimetype: 1, originalName: 1, title: 1, shareExpiration: 1 }).lean();

    if (!doc) {
      await sendText(from, "❌ Document not found.");
      return res.status(200).json(new ApiResponse(200, "doc missing"));
    }

    if (doc.shareExpiration && new Date(doc.shareExpiration) < new Date()) {
      await sendText(from, "❌ This document's share link has expired.");
      return res.status(200).json(new ApiResponse(200, "share expired"));
    }

    const mime = doc.mimetype || "application/octet-stream";
    const filename = doc.originalName || doc.title || "file";
    const fileUrl = doc.fileUrl;
    if (!fileUrl) throw new ApiError(500, "fileUrl missing on document");

    try {
      await sendByMimeLink({ to: from, link: fileUrl, mime, filename, caption: `📎 ${doc.title || incoming}` });
      return res.status(200).json(new ApiResponse(200, "media sent by link"));
    } catch (err) {
      console.error("[WA] send error:", err?.response?.data || err.message || err);
      await sendText(from, "⚠️ Couldn't send the file right now. Here’s the link:\n" + fileUrl);
      return res.status(200).json(new ApiResponse(200, "fallback link sent"));
    }
  })
);

export default router;
