// Adapts Netlify Blobs to the small Store interface in reviews.ts.
import { getStore } from "@netlify/blobs";
import type { Store } from "./reviews.ts";

export function blobStore(name: string): Store {
  const s = getStore({ name, consistency: "strong" });
  return {
    async getJSON<T>(key: string) { return ((await s.get(key, { type: "json" })) as T) ?? null; },
    async setJSON(key, value) { await s.setJSON(key, value as object); },
    async getBytes(key) {
      const r = await s.getWithMetadata(key, { type: "arrayBuffer" });
      return r ? { data: r.data as ArrayBuffer, type: String(r.metadata?.type ?? "application/octet-stream") } : null;
    },
    async setBytes(key, data, type) { await s.set(key, data, { metadata: { type } }); },
    async remove(key) { await s.delete(key); },
    async keys(prefix) { const { blobs } = await s.list({ prefix }); return blobs.map((b) => b.key); },
  };
}
