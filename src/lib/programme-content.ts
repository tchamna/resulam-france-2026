import { readFile } from "node:fs/promises";
import path from "node:path";

const PROGRAMME_HTML_PATH = path.join(
  process.cwd(),
  "src",
  "content",
  "programme-conference-2026.html",
);

function extractBodyHtml(html: string) {
  const match = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  return match?.[1]?.trim() ?? html.trim();
}

export async function readProgrammeHtml() {
  const raw = await readFile(PROGRAMME_HTML_PATH, "utf8");
  return extractBodyHtml(raw);
}
