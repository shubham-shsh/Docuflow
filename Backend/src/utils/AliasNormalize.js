export function normalizeAlias(raw) {
  if (!raw) return null;

  return String(raw)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")     // remove punctuation
    .replace(/\s+/g, " ");        // collapse spaces
}

export function normalizeArray(arr) {
  if (!arr) return [];
  const list = Array.isArray(arr) ? arr : String(arr).split(",");

  return [...new Set(
    list
      .map((a) => normalizeAlias(a))
      .filter(Boolean)
  )];
}
