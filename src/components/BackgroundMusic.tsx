"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PageCopy } from "@/lib/content";
import { MEDIA_FOCUS_EVENT, MEDIA_RELEASE_EVENT } from "@/lib/media-focus";
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
  const pausedForOtherMediaRef = useRef(false);
  const otherYouTubePlayingRef = useRef(false);
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

    function attemptInitialAutoplay() {
      if (stoppedByUserRef.current || isOtherMediaPlaying()) {
        return;
      }

      const attempt = audio.play();
      if (attempt === undefined) {
        setPlaying(!audio.paused);
        return;
      }

      attempt.then(() => setPlaying(true)).catch(() => setPlaying(false));
    }

    function onStartGesture() {
      if (stoppedByUserRef.current || !audio.paused || isOtherMediaPlaying()) {
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

      stoppedByUserRef.current = true;
      audio.pause();
      setPlaying(false);
      removeStartListeners();
    }

    togglePlaybackRef.current = togglePlayback;

    function playNextTrack() {
      if (stoppedByUserRef.current || isOtherMediaPlaying()) {
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

    function pauseForMediaPlayback() {
      if (stoppedByUserRef.current) {
        return;
      }

      if (!audio.paused) {
        pausedForOtherMediaRef.current = true;
        audio.pause();
        setPlaying(false);
      }
    }

    let resumeTimer = 0;

    function tryResumeBackgroundMusic() {
      window.clearTimeout(resumeTimer);
      resumeTimer = window.setTimeout(() => {
        if (stoppedByUserRef.current || !pausedForOtherMediaRef.current || isOtherMediaPlaying()) {
          return;
        }

        pausedForOtherMediaRef.current = false;
        const attempt = audio.play();
        if (attempt === undefined) {
          setPlaying(!audio.paused);
          return;
        }

        attempt.then(() => setPlaying(true)).catch(() => setPlaying(false));
      }, 50);
    }

    function isOtherMediaPlaying() {
      if (otherYouTubePlayingRef.current) {
        return true;
      }

      return [...document.querySelectorAll("audio, video")].some(
        (element) =>
          element instanceof HTMLMediaElement &&
          element !== audio &&
          !element.paused &&
          !element.ended,
      );
    }

    function pauseWhenMediaPlays(event: Event) {
      const target = event.target;
      if (target instanceof HTMLMediaElement && target !== audio) {
        pauseForMediaPlayback();
      }
    }

    function resumeWhenMediaStops(event: Event) {
      const target = event.target;
      if (target instanceof HTMLMediaElement && target !== audio) {
        tryResumeBackgroundMusic();
      }
    }

    function pauseWhenYouTubePlays(event: MessageEvent) {
      if (!event.origin.includes("youtube.com") && !event.origin.includes("youtube-nocookie.com")) {
        return;
      }

      let data: unknown = event.data;
      if (typeof data === "string") {
        try {
          data = JSON.parse(data) as unknown;
        } catch {
          return;
        }
      }

      if (!data || typeof data !== "object") {
        return;
      }

      const message = data as { event?: unknown; info?: unknown };
      if (message.event !== "onStateChange") {
        return;
      }

      if (message.info === 1) {
        otherYouTubePlayingRef.current = true;
        pauseForMediaPlayback();
        return;
      }

      if (message.info === 0 || message.info === 2) {
        otherYouTubePlayingRef.current = false;
        tryResumeBackgroundMusic();
      }
    }

    function onMediaRelease() {
      otherYouTubePlayingRef.current = false;
      tryResumeBackgroundMusic();
    }

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", playNextTrack);

    document.addEventListener("play", pauseWhenMediaPlays, CAPTURE);
    document.addEventListener("pause", resumeWhenMediaStops, CAPTURE);
    document.addEventListener("ended", resumeWhenMediaStops, CAPTURE);
    window.addEventListener(MEDIA_FOCUS_EVENT, pauseForMediaPlayback);
    window.addEventListener(MEDIA_RELEASE_EVENT, onMediaRelease);
    window.addEventListener("message", pauseWhenYouTubePlays);
    window.addEventListener("pointerdown", onStartGesture, CAPTURE);
    window.addEventListener("touchstart", onStartGesture, CAPTURE);
    window.addEventListener("keydown", onStartGesture, CAPTURE);
    window.addEventListener("keydown", stopOnDoubleShift);

    attemptInitialAutoplay();

    removeStartListeners = () => {
      window.removeEventListener("pointerdown", onStartGesture, CAPTURE);
      window.removeEventListener("touchstart", onStartGesture, CAPTURE);
      window.removeEventListener("keydown", onStartGesture, CAPTURE);
    };

    return () => {
      window.clearTimeout(resumeTimer);
      removeStartListeners();
      playFromGestureRef.current = null;
      togglePlaybackRef.current = null;
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", playNextTrack);
      document.removeEventListener("play", pauseWhenMediaPlays, CAPTURE);
      document.removeEventListener("pause", resumeWhenMediaStops, CAPTURE);
      document.removeEventListener("ended", resumeWhenMediaStops, CAPTURE);
      window.removeEventListener(MEDIA_FOCUS_EVENT, pauseForMediaPlayback);
      window.removeEventListener(MEDIA_RELEASE_EVENT, onMediaRelease);
      window.removeEventListener("message", pauseWhenYouTubePlays);
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
