import reviewedLayouts from "./reading-layouts.json";

export type ReadingPassage = { title: string; paragraphs: string[]; source: string; reviewedLayout: boolean };

/** Presentation fingerprint only: not a security hash or a source-authenticity claim. */
export function readingLayoutKey(text: string): string {
  let first = 2166136261, second = 5381;
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    first = Math.imul(first ^ code, 16777619) >>> 0;
    second = (Math.imul(second, 33) ^ code) >>> 0;
  }
  return `${text.length}:${first.toString(16)}:${second.toString(16)}`;
}

/** Keep the supplied layout if a question refers to paragraph or line locations. */
export function referencesPassageLocation(prompt: string): boolean {
  return /\b(?:paragraphs?|lines?|paragraf|baris)\b/i.test(prompt);
}

export function parseReadingPassage(raw: string, preserveLayout = false): ReadingPassage {
  const text = raw.replace(/\r\n?/g, "\n").trim();
  if (!text) return { title: "", paragraphs: [], source: "", reviewedLayout: false };
  if (preserveLayout) return { title: "", paragraphs: [text], source: "", reviewedLayout: false };
  let content = text, source = "";
  // Accept an explicit trailing source note, on its own line or after a sentence.
  const note = content.match(/(^|\n+|[.!?]\s+)(Passage adapted from [^\n]{1,160})$/);
  if (note && content.slice(0, content.length - note[2].length).trim()) { source = note[2]; content = content.slice(0, content.length - source.length).trimEnd(); }
  const blocks = content.split(/\n[\t ]*\n+/).map(block => block.trim()).filter(Boolean);
  let title = "";
  if (blocks.length > 1 && !blocks[0].includes("\n") && blocks[0].length <= 120 && blocks[0].split(/\s+/).length <= 18 && !/[.!?]$/.test(blocks[0])) title = blocks.shift()!;
  // Existing paragraph breaks always win. Only exact reviewed bodies get new breaks.
  const body = blocks.join("\n\n");
  const offsets = blocks.length === 1 ? (reviewedLayouts as Record<string, number[]>)[readingLayoutKey(body)] : undefined;
  if (offsets?.length && offsets.every((n, i) => Number.isInteger(n) && n > (i ? offsets[i - 1] : 0) && n < body.length && /\s/.test(body[n - 1]) && /\S/.test(body[n]))) {
    const positions = [0, ...offsets, body.length];
    return { title, paragraphs: positions.slice(0, -1).map((start, i) => body.slice(start, positions[i + 1]).trim()), source, reviewedLayout: true };
  }
  return { title, paragraphs: blocks, source, reviewedLayout: false };
}
