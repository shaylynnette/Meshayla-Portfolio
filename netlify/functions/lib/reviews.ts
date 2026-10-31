// Review pipeline logic: validation, storage and moderation. Pure functions over a small store
// interface so the same code runs on Netlify Blobs in production and in memory in tests.
// Every submission is stored as "pending". Nothing is public until the owner approves it.

export type Status = "pending" | "approved" | "rejected";

export interface PhotoRef { n: number; type: string }
export interface Review {
  id: string;
  status: Status;
  createdAt: string;
  name: string;        // shortened to "First L." before it is stored
  what: string;        // product or service, from the allowlist
  rating: number | null;
  text: string;
  email: string;       // optional, never shown publicly
  photos: PhotoRef[];
  reply?: { text: string; at: string };   // the owner's public response, if any
}

/** The slice of the Netlify Blobs API this code uses. */
export interface Store {
  getJSON<T>(key: string): Promise<T | null>;
  setJSON(key: string, value: unknown): Promise<void>;
  getBytes(key: string): Promise<{ data: ArrayBuffer; type: string } | null>;
  setBytes(key: string, data: ArrayBuffer, type: string): Promise<void>;
  remove(key: string): Promise<void>;
  keys(prefix: string): Promise<string[]>;
}

export const WHAT_OPTIONS = [
  "Training & change management",
  "AI-enabled learning",
  "K-12 curriculum & products",
  "Website design",
  "GC Academy",
  "Kempbell Academy",
  "Something else",
] as const;

export const LIMITS = {
  nameMin: 2, nameMax: 60,
  textMin: 20, textMax: 1500,
  emailMax: 120,
  photosMax: 3,
  photoBytesMax: 1_500_000,
  totalBytesMax: 4_000_000,
  replyMax: 800,
  perHour: 5,           // submissions per visitor per hour
  minFillSeconds: 4,    // faster than this is a bot
};

export type FieldErrors = Record<string, string>;
export interface PhotoInput { bytes: ArrayBuffer; type: string }
export interface SubmitInput {
  name: string; what: string; rating: string; text: string; email: string;
  consent: string; website: string; openedAt: string; photos: PhotoInput[];
}

const clean = (s: unknown, max: number) =>
  String(s ?? "").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F​-‏‪-‮]/g, "").trim().slice(0, max);

/** "maria teresa gonzalez" -> "Maria G." (privacy: never store a full last name). */
export function shortenName(raw: string): string {
  const parts = clean(raw, LIMITS.nameMax).split(/\s+/).filter(Boolean);
  const cap = (w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
  if (parts.length === 0) return "";
  if (parts.length === 1) return cap(parts[0]);
  const last = parts[parts.length - 1];
  return `${cap(parts[0])} ${last.charAt(0).toUpperCase()}.`;
}

/** Detects the real image type from the first bytes, ignoring whatever the browser claimed. */
export function sniffImage(bytes: ArrayBuffer): string | null {
  const b = new Uint8Array(bytes.slice(0, 12));
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "image/png";
  if (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) return "image/webp";
  return null;
}

const URL_RE = /(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|io|co|biz|info|xyz|ru|cn)\b)/i;

export interface Validated { ok: true; review: Omit<Review, "id" | "createdAt" | "status" | "photos">; photos: { bytes: ArrayBuffer; type: string }[] }
export interface Invalid { ok: false; errors: FieldErrors; bot?: boolean }

export function validate(input: SubmitInput, nowMs: number): Validated | Invalid {
  // Bot traps first. Answer them like a success so bots learn nothing (the caller drops them).
  if (clean(input.website, 200) !== "") return { ok: false, errors: {}, bot: true };
  // A missing or nonsense timestamp counts as a bot too (Number("") is 0, which would look "opened long ago").
  const opened = clean(input.openedAt, 20) === "" ? NaN : Number(input.openedAt);
  const age = nowMs - opened;
  if (!Number.isFinite(opened) || opened <= 0 || age < LIMITS.minFillSeconds * 1000) return { ok: false, errors: {}, bot: true };

  const errors: FieldErrors = {};
  const name = shortenName(input.name);
  if (clean(input.name, 200).length < LIMITS.nameMin) errors.name = "Please add your first name.";

  const what = clean(input.what, 80);
  if (!(WHAT_OPTIONS as readonly string[]).includes(what)) errors.what = "Please choose what you are reviewing.";

  let rating: number | null = null;
  if (clean(input.rating, 4) !== "") {
    const r = Number(input.rating);
    if (!Number.isInteger(r) || r < 1 || r > 5) errors.rating = "Please choose between 1 and 5 stars.";
    else rating = r;
  }

  const text = String(input.text ?? "").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F​-‏‪-‮]/g, "").replace(/\r\n?/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  if (text.length < LIMITS.textMin) errors.text = `Please write at least ${LIMITS.textMin} characters so others get a real picture.`;
  else if (text.length > LIMITS.textMax) errors.text = `Please keep it under ${LIMITS.textMax} characters.`;
  else if (URL_RE.test(text)) errors.text = "Please leave web links out of your review.";

  const email = clean(input.email, LIMITS.emailMax + 1);
  if (email && (email.length > LIMITS.emailMax || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) errors.email = "That email address does not look right.";

  if (clean(input.consent, 8) !== "yes") errors.consent = "Please confirm you agree so I can share your review.";

  const photos: { bytes: ArrayBuffer; type: string }[] = [];
  if (input.photos.length > LIMITS.photosMax) errors.photos = `You can add up to ${LIMITS.photosMax} photos.`;
  else {
    let total = 0;
    for (const p of input.photos) {
      total += p.bytes.byteLength;
      const type = sniffImage(p.bytes);
      if (!type) { errors.photos = "Photos must be JPG, PNG or WebP images."; break; }
      if (p.bytes.byteLength > LIMITS.photoBytesMax) { errors.photos = "One of your photos is too large. Try a smaller one."; break; }
      photos.push({ bytes: p.bytes, type });
    }
    if (!errors.photos && total > LIMITS.totalBytesMax) errors.photos = "Your photos add up to too much. Try fewer or smaller ones.";
  }

  if (Object.keys(errors).length) return { ok: false, errors };
  return { ok: true, review: { name, what, rating, text, email }, photos };
}

const newId = () => {
  const a = new Uint8Array(9); crypto.getRandomValues(a);
  return Array.from(a, (x) => x.toString(36).padStart(2, "0")).join("").slice(0, 12);
};

export async function saveReview(reviews: Store, photos: Store, v: Validated, nowMs: number): Promise<Review> {
  const id = newId();
  const refs: PhotoRef[] = [];
  let n = 0;
  for (const p of v.photos) { n++; await photos.setBytes(`${id}/${n}`, p.bytes, p.type); refs.push({ n, type: p.type }); }
  const review: Review = { id, status: "pending", createdAt: new Date(nowMs).toISOString(), ...v.review, photos: refs };
  await reviews.setJSON(`r/${id}`, review);
  return review;
}

/** Best-effort per-visitor limit. `who` should already be a hash, never a raw address. */
export async function allowSubmission(store: Store, who: string, nowMs: number): Promise<boolean> {
  const key = `rl/${who}/${Math.floor(nowMs / 3_600_000)}`;
  const cur = (await store.getJSON<{ c: number }>(key))?.c ?? 0;
  if (cur >= LIMITS.perHour) return false;
  await store.setJSON(key, { c: cur + 1 });
  return true;
}

export async function listReviews(store: Store, status: Status, limit = 50): Promise<Review[]> {
  const out: Review[] = [];
  for (const k of await store.keys("r/")) {
    const r = await store.getJSON<Review>(k);
    if (r && r.status === status) out.push(r);
  }
  out.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return out.slice(0, limit);
}

export async function moderate(reviews: Store, photos: Store, id: string, action: "approve" | "reject" | "delete"): Promise<Review | null> {
  if (!/^[a-z0-9]{6,16}$/.test(id)) return null;
  const r = await reviews.getJSON<Review>(`r/${id}`);
  if (!r) return null;
  if (action === "delete") {
    for (const p of r.photos) await photos.remove(`${id}/${p.n}`);
    await reviews.remove(`r/${id}`);
    return r;
  }
  r.status = action === "approve" ? "approved" : "rejected";
  await reviews.setJSON(`r/${id}`, r);
  return r;
}

/** Sets (or, with empty text, removes) the owner's public reply. Returns null if the review is missing. */
export async function setReply(reviews: Store, id: string, text: string, nowMs: number): Promise<Review | null | "too-long"> {
  if (!/^[a-z0-9]{6,16}$/.test(id)) return null;
  const r = await reviews.getJSON<Review>(`r/${id}`);
  if (!r) return null;
  const t = String(text ?? "").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u200B-\u200F\u202A-\u202E]/g, "").replace(/\r\n?/g, "\n").trim();
  if (t.length > LIMITS.replyMax) return "too-long";
  if (t) r.reply = { text: t, at: new Date(nowMs).toISOString() }; else delete r.reply;
  await reviews.setJSON(`r/${id}`, r);
  return r;
}

/** What the public may see: no email, no status, and photo links that only work once approved. */
export function toPublic(r: Review) {
  return {
    id: r.id, name: r.name, what: r.what, rating: r.rating, text: r.text, date: r.createdAt.slice(0, 10),
    photos: r.photos.map((p) => `/api/review-photo/${r.id}/${p.n}`),
    reply: r.reply ? { text: r.reply.text, date: r.reply.at.slice(0, 10) } : null,
  };
}

export function isOwner(authHeader: string | null, secret: string | undefined): boolean {
  if (!secret || secret.length < 16 || !authHeader) return false;
  const given = authHeader.replace(/^Bearer\s+/i, "");
  if (given.length !== secret.length) return false;
  let diff = 0; // constant-time compare
  for (let i = 0; i < secret.length; i++) diff |= given.charCodeAt(i) ^ secret.charCodeAt(i);
  return diff === 0;
}

/** In-memory store for tests. */
export function memoryStore(): Store {
  const j = new Map<string, unknown>(); const bin = new Map<string, { data: ArrayBuffer; type: string }>();
  return {
    async getJSON<T>(k: string) { return (j.get(k) as T) ?? null; },
    async setJSON(k, v) { j.set(k, JSON.parse(JSON.stringify(v))); },
    async getBytes(k) { return bin.get(k) ?? null; },
    async setBytes(k, d, t) { bin.set(k, { data: d, type: t }); },
    async remove(k) { j.delete(k); bin.delete(k); },
    async keys(p) { return [...j.keys(), ...bin.keys()].filter((k) => k.startsWith(p)); },
  };
}
