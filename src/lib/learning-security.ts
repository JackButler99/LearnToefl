import { HttpError } from "./http";

/** A canonical public origin, never Host/X-Forwarded-* supplied by the client. */
export function checkLearningRequest(request: Request) {
  let target: string;
  const configured = process.env.APP_ORIGIN;
  if (configured) {
    try {
      const url = new URL(configured);
      if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || url.pathname !== "/" || url.search || url.hash) throw Error();
      if (process.env.NODE_ENV === "production" && url.protocol !== "https:" && !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)) throw Error();
      target = url.origin;
    } catch { throw new HttpError("APP_ORIGIN belum dikonfigurasi dengan benar.", 503); }
  } else {
    const url = new URL(request.url);
    if (process.env.NODE_ENV === "production" || !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)) throw new HttpError("APP_ORIGIN wajib dikonfigurasi untuk layanan ini.", 503);
    target = url.origin;
  }
  let source: URL;
  try {
    const header = request.headers.get("origin");
    if (!header) throw Error();
    source = new URL(header);
    if (source.username || source.password || source.pathname !== "/" || source.search || source.hash || source.origin !== target) throw Error();
  } catch { throw new HttpError("Asal permintaan tidak diizinkan.", 403); }
  if (request.headers.get("sec-fetch-site") === "cross-site") throw new HttpError("Permintaan lintas situs tidak diizinkan.", 403);
  if (request.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase() !== "application/json") throw new HttpError("Gunakan Content-Type application/json.", 415);
}

/** String-aware linear scan before JSON.parse; not a replacement for schema validation. */
export function checkJsonDepth(text: string, maxDepth = 12) {
  let depth = 0, quoted = false, escaped = false;
  for (const char of text) {
    if (quoted) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === '"') quoted = false;
    } else if (char === '"') quoted = true;
    else if (char === "{" || char === "[") {
      if (++depth > maxDepth) throw new HttpError("Struktur JSON terlalu dalam.", 400);
    } else if (char === "}" || char === "]") depth--;
  }
}
