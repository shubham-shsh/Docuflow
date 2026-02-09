// src/utils/aliasEngine/index.js
import { normalizeAlias } from "../AliasNormalize.js";
import { fuzzyFind } from "../fuzzyMatch.js";
import { llmResolveQuery } from "../llmResolve.js";
import { Document } from "../../models/document.model.js";

export async function resolveAlias(keyword) {
  if (!keyword) return { type: "none", results: [] };

  const clean = normalizeAlias(keyword);

  // 1) Exact match (aliases are assumed normalized in DB)
  const exact = await Document.find({
    aliases: { $elemMatch: { $regex: `^${clean}$`, $options: "i" } }
  }).lean();

  if (exact.length === 1) return { type: "exact", results: exact };
  if (exact.length > 1) return { type: "multi", results: exact };

  // 2) Fuzzy match - fetch minimal fields for performance
  const allDocs = await Document.find({}, { aliases: 1, title: 1, fileUrl: 1, mimetype: 1, originalName: 1 }).lean();
  const fuzzy = fuzzyFind(clean, allDocs);
  if (fuzzy.length === 1) return { type: "fuzzy", results: [fuzzy[0].doc] };
  if (fuzzy.length > 1) return { type: "multi", results: fuzzy.map(r => r.doc) };

  // 3) LLM fallback
  const predicted = await llmResolveQuery(keyword);
  if (predicted) {
    const predictedNorm = normalizeAlias(predicted);
    const llmExact = allDocs.filter(d =>
      (d.aliases || []).map(a => a.toLowerCase()).includes(predictedNorm)
    );
    if (llmExact.length === 1) return { type: "llm", results: llmExact };
    if (llmExact.length > 1) return { type: "multi", results: llmExact };
  }

  return { type: "none", results: [] };
}
