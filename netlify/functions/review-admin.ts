// Owner-only moderation. Requires the REVIEW_ADMIN_TOKEN environment variable (16+ characters)
// sent as "Authorization: Bearer <token>". Without it every request is refused.
//   GET  /api/review-admin?status=pending|approved|rejected   list reviews (includes email)
//   GET  /api/review-admin?photo=<id>/<n>                      fetch a photo for preview
//   POST /api/review-admin  {id, action: "approve"|"reject"|"delete"}
//   POST /api/review-admin  {id, action: "reply", text}   public reply from the owner (empty text removes it)
import { isOwner, listReviews, moderate, setReply, type Status } from "./lib/reviews.ts";
import { blobStore } from "./lib/blobs-store.ts";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });

export default async (req: Request): Promise<Response> => {
  const secret = Netlify.env.get("REVIEW_ADMIN_TOKEN");
  if (!secret) return json({ error: "Moderation is not set up yet. Add REVIEW_ADMIN_TOKEN in Netlify." }, 503);
  if (!isOwner(req.headers.get("authorization"), secret)) return json({ error: "Not authorized." }, 401);

  const reviews = blobStore("reviews"), photos = blobStore("review-photos");
  const url = new URL(req.url);

  if (req.method === "GET") {
    const photo = url.searchParams.get("photo");
    if (photo) {
      if (!/^[a-z0-9]{6,16}\/[1-3]$/.test(photo)) return json({ error: "Bad photo id." }, 400);
      const p = await photos.getBytes(photo);
      return p ? new Response(p.data, { headers: { "content-type": p.type, "cache-control": "no-store", "x-content-type-options": "nosniff" } }) : json({ error: "Not found." }, 404);
    }
    const status = url.searchParams.get("status") as Status;
    if (!["pending", "approved", "rejected"].includes(status)) return json({ error: "Choose a status." }, 400);
    return json({ reviews: await listReviews(reviews, status, 100) });
  }

  if (req.method === "POST") {
    let body: { id?: string; action?: string; text?: string };
    try { body = await req.json(); } catch { return json({ error: "Bad request." }, 400); }
    if (body.action === "reply") {
      const r = await setReply(reviews, String(body.id ?? ""), String(body.text ?? ""), Date.now());
      if (r === "too-long") return json({ error: "Please keep your reply under 800 characters." }, 422);
      return r ? json({ ok: true, reply: r.reply ?? null }) : json({ error: "Review not found." }, 404);
    }
    if (!["approve", "reject", "delete"].includes(body.action ?? "")) return json({ error: "Unknown action." }, 400);
    const r = await moderate(reviews, photos, String(body.id ?? ""), body.action as "approve" | "reject" | "delete");
    return r ? json({ ok: true }) : json({ error: "Review not found." }, 404);
  }
  return json({ error: "Method not allowed." }, 405);
};

export const config = { path: "/api/review-admin" };
