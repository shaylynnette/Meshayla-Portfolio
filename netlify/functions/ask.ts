// GET /api/ask?q=fifth+grade+rounding+decimals
// Standards-grounded tutor: retrieves from the Texas K-5 math TEKS (19 TAC Ch. 111, Subch. A) and cites,
// or declines. Keyword retrieval (BM25); no model call, no stored data, no logging of questions.
import { Index, ask, type Standard } from "./lib/retrieve.ts";
import standards from "./lib/standards.json" with { type: "json" };

const index = new Index(standards as Standard[]); // built once per warm instance

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "public, max-age=300" },
  });

export default async (req: Request): Promise<Response> => {
  if (req.method !== "GET") return json({ error: "GET only" }, 405);
  const q = (new URL(req.url).searchParams.get("q") ?? "").trim();
  if (!q) return json({ error: "Add a question with ?q=" }, 400);
  if (q.length > 300) return json({ error: "Question too long (300 characters max)." }, 400);
  return json({ question: q, ...ask(index, q) });
};

export const config = { path: "/api/ask" };
