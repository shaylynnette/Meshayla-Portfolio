// POST /api/review-submit (multipart form). Validates, then stores the review as PENDING.
// Nothing becomes public until the owner approves it in /review-admin.
import type { Context } from "@netlify/functions";
import { allowSubmission, saveReview, validate } from "./lib/reviews.ts";
import { blobStore } from "./lib/blobs-store.ts";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });

async function hash(s: string) {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${Netlify.env.get("REVIEW_SALT") ?? Netlify.env.get("REVIEW_ADMIN_TOKEN") ?? "meshayla"}:${s}`));
  return Array.from(new Uint8Array(d).slice(0, 12), (x) => x.toString(16).padStart(2, "0")).join("");
}

export default async (req: Request, context: Context): Promise<Response> => {
  if (req.method !== "POST") return json({ error: "POST only" }, 405);
  const len = Number(req.headers.get("content-length") ?? 0);
  if (len > 6_000_000) return json({ error: "That upload is too large.", errors: { photos: "Your photos add up to too much. Try fewer or smaller ones." } }, 413);

  let form: FormData;
  try { form = await req.formData(); } catch { return json({ error: "We could not read that form." }, 400); }

  const photos = [];
  for (const f of form.getAll("photos")) {
    if (typeof f === "string" || f.size === 0) continue;
    photos.push({ bytes: await f.arrayBuffer(), type: f.type });
  }
  const g = (k: string) => String(form.get(k) ?? "");
  const now = Date.now();
  const result = validate(
    { name: g("name"), what: g("what"), rating: g("rating"), text: g("text"), email: g("email"), consent: g("consent"), website: g("website"), openedAt: g("openedAt"), photos },
    now,
  );
  if (!result.ok) {
    if (result.bot) return json({ ok: true }); // look like success; store nothing
    return json({ error: "Please check the highlighted fields.", errors: result.errors }, 422);
  }

  const reviews = blobStore("reviews");
  if (!(await allowSubmission(reviews, await hash(context.ip ?? "unknown"), now))) {
    return json({ error: "You have sent a few reviews already. Please try again in an hour." }, 429);
  }
  await saveReview(reviews, blobStore("review-photos"), result, now);
  return json({ ok: true });
};

export const config = { path: "/api/review-submit" };
