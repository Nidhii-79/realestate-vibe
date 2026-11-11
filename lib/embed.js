// Turns text into a 384-dimension unit vector and returns it as a pgvector literal "[0.1,0.2,...]".
// Default: all-MiniLM-L6-v2 (sentence-transformers) running locally via transformers.js.
// Fallback (EMBED_PROVIDER=hash): deterministic hashed bag-of-words, works fully offline.
const DIM = 384;
let extractor;

function hashEmbed(text) {
  const v = new Array(DIM).fill(0);
  const words = text.toLowerCase().match(/[a-z]+/g) || [];
  for (const w of words) {
    let h = 2166136261;
    for (const c of w) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0;
    v[h % DIM] += 1;
  }
  const n = Math.sqrt(v.reduce((s, x) => s + x * x, 0)) || 1;
  return v.map((x) => x / n);
}

export async function embedVector(text) {
  if (process.env.EMBED_PROVIDER === 'hash') return hashEmbed(text);
  const { pipeline } = await import('@xenova/transformers');
  extractor ??= await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  const out = await extractor(text, { pooling: 'mean', normalize: true });
  return Array.from(out.data);
}

export async function embed(text) {
  return '[' + (await embedVector(text)).join(',') + ']';
}
