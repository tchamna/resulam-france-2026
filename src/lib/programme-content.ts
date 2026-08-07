import { readFile } from "node:fs/promises";
import path from "node:path";

const PROGRAMME_HTML_PATH = path.join(
  process.cwd(),
  "src",
  "content",
  "programme-conference-2026.html",
);

const PROGRAMME_PUBLIC_HTML_PATH = path.join(
  process.cwd(),
  "src",
  "content",
  "programme-public-2026.html",
);

function extractBodyHtml(html: string) {
  const match = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  return match?.[1]?.trim() ?? html.trim();
}

export async function readProgrammeHtml() {
  const raw = await readFile(PROGRAMME_HTML_PATH, "utf8");
  return extractBodyHtml(raw);
}

export async function readPublicProgrammeHtml() {
  const raw = await readFile(PROGRAMME_PUBLIC_HTML_PATH, "utf8");
  return extractBodyHtml(raw);
}
