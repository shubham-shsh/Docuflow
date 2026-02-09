// utils/fuzzyMatch.js
import levenshtein from "fast-levenshtein";

export function fuzzyScore(a, b) {
  if (!a || !b) return 0;

  a = a.toLowerCase();
  b = b.toLowerCase();

  // Exact match
  if (a === b) return 1;

  // Levenshtein normalized
  const lev = levenshtein.get(a, b);
  const maxLen = Math.max(a.length, b.length);
  const levScore = 1 - lev / maxLen;

  // Substring bonus
  const subScore = a.includes(b) || b.includes(a) ? 0.3 : 0;

  return Math.max(levScore, levScore + subScore);
}

/**
 * Returns list of documents sorted by fuzzy similarity
 * @param keyword user text
 * @param allDocs array of docs from MongoDB
 * @param threshold minimum acceptable fuzzy score
 */
export function fuzzyFind(keyword, allDocs, threshold = 0.65) {
  const results = [];

  for (const doc of allDocs) {
    const aliases = doc.aliases || [];
    let best = 0;

    for (const alias of aliases) {
      const score = fuzzyScore(keyword, alias);
      if (score > best) best = score;
    }

    results.push({ doc, score: best });
  }

  return results
    .filter(r => r.score >= threshold)
    .sort((a, b) => b.score - a.score);
}
