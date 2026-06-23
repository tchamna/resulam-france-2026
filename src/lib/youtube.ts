export type YouTubeVideo = {
  id: string;
  start?: number;
};

export function parseYouTubeUrl(url: string): YouTubeVideo | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = parsed.pathname.slice(1).split("/")[0];
      if (!id) return null;
      return { id, start: readStart(parsed.searchParams) };
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      if (parsed.pathname === "/watch") {
        const id = parsed.searchParams.get("v");
        if (!id) return null;
        return { id, start: readStart(parsed.searchParams) };
      }

      const embedMatch = parsed.pathname.match(/^\/embed\/([^/?]+)/);
      if (embedMatch?.[1]) {
        return { id: embedMatch[1], start: readStart(parsed.searchParams) };
      }
    }
  } catch {
    return null;
  }

  return null;
}

function readStart(params: URLSearchParams) {
  const start = params.get("start") ?? params.get("t");
  if (!start) return undefined;

  if (/^\d+$/.test(start)) {
    return Number(start);
  }

  const match = start.match(/(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s?)?$/);
  if (!match) return undefined;

  const hours = Number(match[1] ?? 0);
  const minutes = Number(match[2] ?? 0);
  const seconds = Number(match[3] ?? 0);
  return hours * 3600 + minutes * 60 + seconds;
}

export function getYouTubeEmbedUrl(url: string) {
  const video = parseYouTubeUrl(url);
  if (!video) return null;

  const params = new URLSearchParams({
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
  });

  if (video.start && video.start > 0) {
    params.set("start", String(video.start));
  }

  return `https://www.youtube-nocookie.com/embed/${video.id}?${params.toString()}`;
}
