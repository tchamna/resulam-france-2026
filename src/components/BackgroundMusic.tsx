"use client";

import { useEffect, useRef } from "react";
import { createShuffledPlaylist, pickRandomStartIndex } from "@/lib/soundtracks";

const BACKGROUND_VOLUME = 0.32;

export function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playlistRef = useRef<string[]>([]);
  const trackIndexRef = useRef(0);
  const startedRef = useRef(false);

  useEffect(() => {
    const playlist = createShuffledPlaylist();
    if (playlist.length === 0) {
      return;
    }

    playlistRef.current = playlist;
    trackIndexRef.current = pickRandomStartIndex(playlist.length);

    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    audio.volume = BACKGROUND_VOLUME;

    async function playCurrentTrack() {
      const track = playlistRef.current[trackIndexRef.current];
      if (!track) {
        return;
      }

      audio.src = track;
      audio.load();

      try {
        await audio.play();
        startedRef.current = true;
      } catch {
        // Autoplay is often blocked until the visitor interacts with the page.
      }
    }

    function playNextTrack() {
      trackIndexRef.current = (trackIndexRef.current + 1) % playlistRef.current.length;
      void playCurrentTrack();
    }

    function startOnInteraction() {
      if (!startedRef.current) {
        void playCurrentTrack();
      }
    }

    audio.addEventListener("ended", playNextTrack);
    window.addEventListener("pointerdown", startOnInteraction, { once: true });
    window.addEventListener("keydown", startOnInteraction, { once: true });

    void playCurrentTrack();

    return () => {
      audio.removeEventListener("ended", playNextTrack);
      window.removeEventListener("pointerdown", startOnInteraction);
      window.removeEventListener("keydown", startOnInteraction);
      audio.pause();
    };
  }, []);

  return <audio ref={audioRef} preload="auto" aria-hidden="true" />;
}
