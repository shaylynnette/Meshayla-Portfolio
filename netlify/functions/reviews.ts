// GET /api/reviews: approved reviews only, newest first. No emails, no pending items.
import { listReviews, toPublic } from "./lib/reviews.ts";
import { blobStore } from "./lib/blobs-store.ts";

export default async (req: Request): Promise<Response> => {
  if (req.method !== "GET") return new Response("GET only", { status: 405 });
  const items = (await listReviews(blobStore("reviews"), "approved", 30)).map(toPublic);
  return new Response(JSON.stringify({ reviews: items }), {
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "public, max-age=60" },
  });
};

export const config = { path: "/api/reviews" };
