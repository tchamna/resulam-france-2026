"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PageCopy } from "@/lib/content";
import { createShuffledPlaylist, pickRandomStartIndex } from "@/lib/soundtracks";

const BACKGROUND_VOLUME = 0.4;
const DOUBLE_SHIFT_MS = 450;
const CAPTURE = { capture: true };

type BackgroundMusicProps = {
  copy: PageCopy["music"];
};

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return Boolean(target.closest("input, textarea, select, [contenteditable='true']"));
}

export function BackgroundMusic({ copy }: BackgroundMusicProps) {
  const [audioEl, setAudioEl] = useState<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const playlistRef = useRef<string[]>([]);
  const trackIndexRef = useRef(0);
  const stoppedByUserRef = useRef(false);
  const lastShiftAtRef = useRef(0);
  const playFromGestureRef = useRef<(() => void) | null>(null);
  const togglePlaybackRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const playlist = createShuffledPlaylist();
    if (playlist.length === 0 || !audioEl) {
      return;
    }

    playlistRef.current = playlist;
    trackIndexRef.current = pickRandomStartIndex(playlist.length);
    stoppedByUserRef.current = false;

    const audio = audioEl;
    audio.volume = BACKGROUND_VOLUME;
    audio.src = playlist[trackIndexRef.current];
    audio.load();

    let removeStartListeners = () => {};

    function playFromUserGesture() {
      if (stoppedByUserRef.current) {
        return;
      }

      const attempt = audio.play();
      if (attempt === undefined) {
        setPlaying(!audio.paused);
        return;
      }

      attempt
        .then(() => {
          setPlaying(true);
          removeStartListeners();
        })
        .catch(() => {
          setPlaying(false);
        });
    }

    playFromGestureRef.current = playFromUserGesture;

    function onStartGesture() {
      if (stoppedByUserRef.current || !audio.paused) {
        return;
      }

      playFromUserGesture();
    }

    function togglePlayback() {
      if (audio.paused) {
        if (stoppedByUserRef.current) {
          stoppedByUserRef.current = false;
        }
        playFromUserGesture();
        return;
      }

      audio.pause();
      setPlaying(false);
    }

    togglePlaybackRef.current = togglePlayback;

    function playNextTrack() {
      if (stoppedByUserRef.current) {
        return;
      }

      trackIndexRef.current = (trackIndexRef.current + 1) % playlistRef.current.length;
      audio.src = playlistRef.current[trackIndexRef.current];
      audio.load();

      const attempt = audio.play();
      if (attempt !== undefined) {
        attempt.then(() => setPlaying(true)).catch(() => setPlaying(false));
      }
    }

    function stopOnDoubleShift(event: KeyboardEvent) {
      if (event.key !== "Shift" || isEditableTarget(event.target)) {
        return;
      }

      const now = Date.now();
      if (now - lastShiftAtRef.current <= DOUBLE_SHIFT_MS) {
        stoppedByUserRef.current = true;
        lastShiftAtRef.current = 0;
        audio.pause();
        audio.currentTime = 0;
        setPlaying(false);
        removeStartListeners();
        return;
      }

      lastShiftAtRef.current = now;
    }

    function onPause() {
      setPlaying(false);
    }

    function onPlay() {
      setPlaying(true);
    }

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", playNextTrack);

    window.addEventListener("pointerdown", onStartGesture, CAPTURE);
    window.addEventListener("touchstart", onStartGesture, CAPTURE);
    window.addEventListener("keydown", onStartGesture, CAPTURE);
    window.addEventListener("keydown", stopOnDoubleShift);

    removeStartListeners = () => {
      window.removeEventListener("pointerdown", onStartGesture, CAPTURE);
      window.removeEventListener("touchstart", onStartGesture, CAPTURE);
      window.removeEventListener("keydown", onStartGesture, CAPTURE);
    };

    return () => {
      removeStartListeners();
      playFromGestureRef.current = null;
      togglePlaybackRef.current = null;
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", playNextTrack);
      window.removeEventListener("keydown", stopOnDoubleShift);
      audio.pause();
    };
  }, [audioEl]);

  const handleToggle = useCallback(() => {
    togglePlaybackRef.current?.();
  }, []);

  return (
    <>
      <audio ref={setAudioEl} preload="auto" playsInline aria-hidden="true" />
      <button
        type="button"
        className="musicToggle"
        aria-pressed={playing}
        aria-label={playing ? copy.pause : copy.play}
        onClick={handleToggle}
      >
        {playing ? "♪" : "♫"}
      </button>
    </>
  );
}
