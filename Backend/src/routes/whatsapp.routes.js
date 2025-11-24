// src/routes/whatsapp.route.js
import express from "express";
import axios from "axios";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Document } from "../models/document.model.js";

const router = express.Router();

const PHONE_ID = process.env.META_PHONE_NUMBER_ID;
const TOKEN = process.env.META_WHATSAPP_TOKEN;
const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN;

const WA = (path) => `https://graph.facebook.com/v21.0/${PHONE_ID}/${path}`;
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

console.log("[WA] DocuFlow route: Day3 v1.1 (send-by-link) loaded");


// GET /whatsapp/webhook  (verication)

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


// POST /whatsapp/webhook  (Receive messages)

router.post(
  "/webhook",
  asyncHandler(async (req, res) => {
    const entry = req.body?.entry?.[0];
    const change = entry?.changes?.[0];
    const message = change?.value?.messages?.[0];

    if (!message) return res.status(200).json(new ApiResponse(200, "no message"));

    const from = message.from;
    const incoming = (message.text?.body || "").trim();
    console.log("[WA] incoming:", incoming);

    if (!incoming) {
      await sendText(from, "👋 Send an alias or hash (e.g., aadhar).");
      return res.status(200).json(new ApiResponse(200, "prompt sent"));
    }

    // normalize commands: "get aadhar", "send aadhar", or "aadhar"
    let alias = incoming;
    if (/^(get|send)\s+/i.test(alias)) alias = alias.replace(/^(get|send)\s+/i, "");
    const keyword = alias.trim().toLowerCase();
    console.log("[WA] keyword:", keyword);

    // find by aliases[] or hash (case-insensitive)
    const doc = await Document.findOne({
      $or: [
        { aliases: { $elemMatch: { $regex: `^${escapeRegex(keyword)}$`, $options: "i" } } },
        { hash: { $regex: `^${escapeRegex(keyword)}$`, $options: "i" } },
      ],
    });

    console.log("[WA] found?", !!doc);

    if (!doc) {
      await sendText(from, "❌ No document found for that alias/hash.");
      return res.status(200).json(new ApiResponse(200, "not found"));
    }

    const mime = doc.mimetype || "application/octet-stream";
    const filename = doc.originalName || `${doc.title || "file"}`;
    const fileUrl = doc.fileUrl;
    if (!fileUrl) throw new ApiError(500, "fileUrl missing on document");

    try {
      console.log("[WA] sending by MIME (link)...");
      await sendByMimeLink({ to: from, link: fileUrl, mime, filename, caption: `📎 ${doc.title || keyword}` });
      console.log("[WA] sent ✅");
      return res.status(200).json(new ApiResponse(200, "media sent by link"));
    } catch (err) {
      const e = err?.response?.data || err.message || err;
      console.error("[WA] send error:", e);
      await sendText(from, "⚠️ Couldn't send the file right now. Here’s the link:\n" + fileUrl);
      return res.status(200).json(new ApiResponse(200, "fallback link sent"));
    }
  })
);


// Helpers

async function sendText(to, body) {
  return axios.post(
    WA("messages"),
    { messaging_product: "whatsapp", to, text: { body } },
    { headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" } }
  );
}

// Send media by LINK (no /media upload). Messages API supports link for all types.
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

  // default → document (pdf, pptx, docx, xlsx, txt, zip, etc.)
  return axios.post(
    WA("messages"),
    { ...base, type: "document", document: { link, filename, caption } },
    { headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" } }
  );
}

export default router;
