// GET /api/review-photo/:id/:n  serves a photo only when its review is approved.
import type { Context } from "@netlify/functions";
import type { Review } from "./lib/reviews.ts";
import { blobStore } from "./lib/blobs-store.ts";

export default async (_req: Request, context: Context): Promise<Response> => {
  const { id = "", n = "" } = context.params as Record<string, string>;
  if (!/^[a-z0-9]{6,16}$/.test(id) || !/^[1-3]$/.test(n)) return new Response("Not found", { status: 404 });
  const review = await blobStore("reviews").getJSON<Review>(`r/${id}`);
  if (!review || review.status !== "approved") return new Response("Not found", { status: 404 });
  const photo = await blobStore("review-photos").getBytes(`${id}/${n}`);
  if (!photo) return new Response("Not found", { status: 404 });
  return new Response(photo.data, {
    headers: { "content-type": photo.type, "cache-control": "public, max-age=3600", "x-content-type-options": "nosniff", "content-security-policy": "default-src 'none'; sandbox" },
  });
};

export const config = { path: "/api/review-photo/:id/:n" };
