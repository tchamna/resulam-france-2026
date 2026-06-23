import { getYouTubeEmbedUrl } from "@/lib/youtube";

type YouTubeEmbedProps = {
  url: string;
  title: string;
  className?: string;
};

export function YouTubeEmbed({ url, title, className = "youtubeEmbed" }: YouTubeEmbedProps) {
  const embedUrl = getYouTubeEmbedUrl(url);
  if (!embedUrl) {
    return null;
  }

  return (
    <iframe
      className={className}
      src={embedUrl}
      title={title}
      loading="lazy"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      referrerPolicy="strict-origin-when-cross-origin"
      allowFullScreen
    />
  );
}
