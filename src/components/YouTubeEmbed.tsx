"use client";

import { useRef } from "react";
import { getYouTubeEmbedUrl } from "@/lib/youtube";

type YouTubeEmbedProps = {
  url: string;
  title: string;
  className?: string;
};

export function YouTubeEmbed({ url, title, className = "youtubeEmbed" }: YouTubeEmbedProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const embedUrl = getYouTubeEmbedUrl(url);
  if (!embedUrl) {
    return null;
  }

  function registerPlaybackListener() {
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) {
      return;
    }

    iframe.contentWindow.postMessage(
      JSON.stringify({ event: "command", func: "addEventListener", args: ["onStateChange"] }),
      "*",
    );
  }

  return (
    <iframe
      ref={iframeRef}
      className={className}
      src={embedUrl}
      title={title}
      loading="lazy"
      onLoad={registerPlaybackListener}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      referrerPolicy="strict-origin-when-cross-origin"
      allowFullScreen
    />
  );
}
