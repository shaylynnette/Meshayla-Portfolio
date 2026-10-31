import test from "node:test";
import assert from "node:assert/strict";
import {
  allowSubmission, isOwner, listReviews, memoryStore, moderate, saveReview, setReply, shortenName, sniffImage, toPublic, validate, LIMITS,
  type SubmitInput, type Validated,
} from "../functions/lib/reviews.ts";

const NOW = 1_800_000_000_000;
const jpeg = () => new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3]).buffer;
const png = () => new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]).buffer;
const base = (o: Partial<SubmitInput> = {}): SubmitInput => ({
  name: "Maria Teresa Gonzalez", what: "GC Academy", rating: "5", text: "My daughter finally enjoys reading practice and asks for it.",
  email: "maria@example.com", consent: "yes", website: "", openedAt: String(NOW - 30_000), photos: [], ...o,
});
const ok = (i: SubmitInput) => { const v = validate(i, NOW); assert.ok(v.ok, JSON.stringify(v)); return v as Validated; };
const errs = (i: SubmitInput) => { const v = validate(i, NOW); assert.equal(v.ok, false); return (v as { errors: Record<string, string> }).errors; };

test("a good review validates and the name is shortened", () => {
  const v = ok(base());
  assert.equal(v.review.name, "Maria G.");
  assert.equal(v.review.rating, 5);
});

test("honeypot and too-fast submissions are treated as bots", () => {
  const a = validate(base({ website: "http://spam.example" }), NOW);
  const b = validate(base({ openedAt: String(NOW - 500) }), NOW);
  const c = validate(base({ openedAt: "" }), NOW);
  for (const r of [a, b, c]) assert.ok(!r.ok && r.bot);
});

test("required fields and consent are enforced", () => {
  assert.ok(errs(base({ name: "A" })).name);
  assert.ok(errs(base({ what: "Casino" })).what);
  assert.ok(errs(base({ text: "too short" })).text);
  assert.ok(errs(base({ consent: "" })).consent);
  assert.ok(errs(base({ rating: "9" })).rating);
  assert.ok(errs(base({ email: "nope" })).email);
});

test("rating and email are optional", () => {
  const v = ok(base({ rating: "", email: "" }));
  assert.equal(v.review.rating, null);
});

test("links are rejected in review text", () => {
  assert.ok(errs(base({ text: "Great stuff, visit www.cheap-pills.example now for more" })).text);
  assert.ok(errs(base({ text: "Great stuff, see https://spam.example/buy for more info please" })).text);
});

test("photos are checked by real file type, count and size", () => {
  assert.equal(sniffImage(jpeg()), "image/jpeg");
  assert.equal(sniffImage(png()), "image/png");
  const fake = new TextEncoder().encode("<script>alert(1)</script>").buffer as ArrayBuffer;
  assert.ok(errs(base({ photos: [{ bytes: fake, type: "image/jpeg" }] })).photos); // claims jpeg, is not
  const four = Array.from({ length: 4 }, () => ({ bytes: jpeg(), type: "image/jpeg" }));
  assert.ok(errs(base({ photos: four })).photos);
  const big = new Uint8Array(LIMITS.photoBytesMax + 1); big.set([0xff, 0xd8, 0xff]);
  assert.ok(errs(base({ photos: [{ bytes: big.buffer, type: "image/jpeg" }] })).photos);
  assert.equal(ok(base({ photos: [{ bytes: jpeg(), type: "x" }] })).photos[0].type, "image/jpeg");
});

test("shortenName never keeps a full last name", () => {
  assert.equal(shortenName("  dana   RAY "), "Dana R.");
  assert.equal(shortenName("Priya"), "Priya");
});

test("new reviews are pending and invisible until approved", async () => {
  const rs = memoryStore(), ps = memoryStore();
  const saved = await saveReview(rs, ps, ok(base({ photos: [{ bytes: jpeg(), type: "image/jpeg" }] })), NOW);
  assert.equal(saved.status, "pending");
  assert.equal((await listReviews(rs, "approved")).length, 0);
  assert.equal((await listReviews(rs, "pending")).length, 1);
  await moderate(rs, ps, saved.id, "approve");
  const pub = (await listReviews(rs, "approved")).map(toPublic);
  assert.equal(pub.length, 1);
  assert.deepEqual(pub[0].photos, [`/api/review-photo/${saved.id}/1`]);
});

test("public view never exposes email or status", async () => {
  const rs = memoryStore(), ps = memoryStore();
  const saved = await saveReview(rs, ps, ok(base()), NOW);
  const pub = JSON.stringify(toPublic(saved));
  assert.ok(!pub.includes("maria@example.com"));
  assert.ok(!pub.includes("status"));
});

test("reject hides a review; delete removes it and its photos", async () => {
  const rs = memoryStore(), ps = memoryStore();
  const saved = await saveReview(rs, ps, ok(base({ photos: [{ bytes: jpeg(), type: "image/jpeg" }] })), NOW);
  await moderate(rs, ps, saved.id, "approve");
  await moderate(rs, ps, saved.id, "reject");
  assert.equal((await listReviews(rs, "approved")).length, 0);
  await moderate(rs, ps, saved.id, "delete");
  assert.equal(await ps.getBytes(`${saved.id}/1`), null);
  assert.equal((await listReviews(rs, "rejected")).length, 0);
  assert.equal(await moderate(rs, ps, "../etc/passwd", "approve"), null);
});

test("per-visitor limit blocks the sixth submission in an hour", async () => {
  const s = memoryStore();
  for (let i = 0; i < LIMITS.perHour; i++) assert.equal(await allowSubmission(s, "abc", NOW), true);
  assert.equal(await allowSubmission(s, "abc", NOW), false);
  assert.equal(await allowSubmission(s, "other", NOW), true);
  assert.equal(await allowSubmission(s, "abc", NOW + 3_700_000), true); // next hour
});

test("owner check needs a long secret and an exact match", () => {
  const secret = "a-long-secret-token-1234";
  assert.equal(isOwner(`Bearer ${secret}`, secret), true);
  assert.equal(isOwner(`Bearer ${secret}x`, secret), false);
  assert.equal(isOwner("Bearer wrong-wrong-wrong-wrong", secret), false);
  assert.equal(isOwner(null, secret), false);
  assert.equal(isOwner("Bearer short", "short"), false);   // secret too short
  assert.equal(isOwner(`Bearer ${secret}`, undefined), false);
});

test("owner can reply, edit and remove a reply, and the public view shows it", async () => {
  const rs = memoryStore(), ps = memoryStore();
  const saved = await saveReview(rs, ps, ok(base()), NOW);
  await moderate(rs, ps, saved.id, "approve");
  const r1 = await setReply(rs, saved.id, "  Thank you, Maria!  ", NOW);
  assert.ok(r1 && r1 !== "too-long" && r1.reply?.text === "Thank you, Maria!");
  const pub = toPublic((await listReviews(rs, "approved"))[0]);
  assert.equal(pub.reply?.text, "Thank you, Maria!");
  await setReply(rs, saved.id, "Updated reply", NOW);
  assert.equal(toPublic((await listReviews(rs, "approved"))[0]).reply?.text, "Updated reply");
  await setReply(rs, saved.id, "   ", NOW);                     // empty removes it
  assert.equal(toPublic((await listReviews(rs, "approved"))[0]).reply, null);
});

test("reply rejects over-long text and unknown or malformed ids", async () => {
  const rs = memoryStore(), ps = memoryStore();
  const saved = await saveReview(rs, ps, ok(base()), NOW);
  assert.equal(await setReply(rs, saved.id, "x".repeat(LIMITS.replyMax + 1), NOW), "too-long");
  assert.equal(await setReply(rs, "doesnotexist1", "hi", NOW), null);
  assert.equal(await setReply(rs, "../bad", "hi", NOW), null);
});

test("a visitor whose clock runs ahead is not mistaken for a bot", () => {
  const r = validate(base({ openedAt: String(NOW + 3_600_000) }), NOW);
  assert.ok(r.ok);
});

test("rate-limit counters from earlier hours are cleaned up", async () => {
  const st = memoryStore();
  await allowSubmission(st, "abc", NOW - 3_600_000);
  await allowSubmission(st, "abc", NOW);
  const keys = await st.keys("rl/abc/");
  assert.equal(keys.length, 1);
});
