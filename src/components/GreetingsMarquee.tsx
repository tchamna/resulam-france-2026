"use client";

import { useRef, useState } from "react";
import type { GreetingEntry, GreetingsCopy } from "@/lib/greetings";
import { howAreYouGreetings, phrasebookLinks, welcomeGreetings } from "@/lib/greetings";

function GreetingCard({
  item,
  trackId,
  playLabel,
  playingLabel,
  playingId,
  onPlay,
}: {
  item: GreetingEntry;
  trackId: string;
  playLabel: string;
  playingLabel: string;
  playingId: string | null;
  onPlay: (item: GreetingEntry, trackId: string) => void;
}) {
  const hasAudio = Boolean(item.audio);
  const cardId = `${trackId}-${item.slug}`;
  const isPlaying = hasAudio && playingId === cardId;

  const className = isPlaying
    ? "greetingCard greetingCardPlaying greetingCardAudio"
    : hasAudio
      ? "greetingCard greetingCardAudio"
      : "greetingCard greetingCardStatic";

  const content = (
    <>
      <span className="greetingLanguage">{item.language}</span>
      <span className="greetingTranslation">{item.translation}</span>
      {hasAudio ? (
        <span className="greetingPlay" aria-hidden="true">
          {isPlaying ? "❚❚" : "▶"}
        </span>
      ) : null}
    </>
  );

  if (!hasAudio) {
    return <article className={className}>{content}</article>;
  }

  return (
    <button
      type="button"
      className={className}
      onPointerDown={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onPlay(item, trackId);
      }}
      aria-label={`${isPlaying ? playingLabel : playLabel}: ${item.language}`}
      aria-pressed={isPlaying}
    >
      {content}
    </button>
  );
}

function GreetingCards({
  items,
  keyPrefix,
  trackId,
  playLabel,
  playingLabel,
  playingId,
  onPlay,
}: {
  items: GreetingEntry[];
  keyPrefix: string;
  trackId: string;
  playLabel: string;
  playingLabel: string;
  playingId: string | null;
  onPlay: (item: GreetingEntry, trackId: string) => void;
}) {
  return (
    <>
      {items.map((item) => (
        <GreetingCard
          key={`${keyPrefix}-${item.slug}`}
          item={item}
          trackId={trackId}
          playLabel={playLabel}
          playingLabel={playingLabel}
          playingId={playingId}
          onPlay={onPlay}
        />
      ))}
    </>
  );
}

function GreetingTrack({
  trackId,
  label,
  items,
  direction,
  playLabel,
  playingLabel,
  phrasebookHref,
  openPhrasebook,
  audioRef,
  playingId,
  setPlayingId,
  setMarqueePaused,
}: {
  trackId: string;
  label: string;
  items: GreetingEntry[];
  direction: "left" | "right";
  playLabel: string;
  playingLabel: string;
  phrasebookHref: string;
  openPhrasebook: string;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  playingId: string | null;
  setPlayingId: (id: string | null) => void;
  setMarqueePaused: (paused: boolean) => void;
}) {
  async function playEntry(item: GreetingEntry, entryTrackId: string) {
    if (!item.audio) return;

    const audio = audioRef.current;
    if (!audio) return;

    const cardId = `${entryTrackId}-${item.slug}`;

    if (playingId === cardId) {
      audio.pause();
      setPlayingId(null);
      setMarqueePaused(false);
      return;
    }

    setMarqueePaused(true);
    audio.pause();
    audio.src = item.audio;
    audio.load();

    try {
      await audio.play();
      setPlayingId(cardId);
    } catch {
      setPlayingId(null);
      setMarqueePaused(false);
    }
  }

  return (
    <div className="greetingsRow">
      <div className="greetingsRowHead">
        <p className="greetingsRowLabel">{label}</p>
        <a className="greetingsPhrasebookLink" href={phrasebookHref} target="_blank" rel="noopener noreferrer">
          {openPhrasebook}
        </a>
      </div>
      <div
        className="greetingsMarquee"
        aria-label={label}
        onPointerEnter={() => setMarqueePaused(true)}
        onPointerLeave={() => {
          if (!playingId) setMarqueePaused(false);
        }}
      >
        <div className={`greetingsTrack greetingsTrack-${direction}`}>
          <GreetingCards
            items={items}
            keyPrefix={`${direction}-a`}
            trackId={trackId}
            playLabel={playLabel}
            playingLabel={playingLabel}
            playingId={playingId}
            onPlay={playEntry}
          />
          <GreetingCards
            items={items}
            keyPrefix={`${direction}-b`}
            trackId={trackId}
            playLabel={playLabel}
            playingLabel={playingLabel}
            playingId={playingId}
            onPlay={playEntry}
          />
        </div>
      </div>
    </div>
  );
}

export function GreetingsMarquee({ copy }: { copy: GreetingsCopy }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [marqueePaused, setMarqueePaused] = useState(false);

  function handleAudioEnded() {
    setPlayingId(null);
    setMarqueePaused(false);
  }

  return (
    <section
      className={marqueePaused ? "greetingsSection greetingsSectionPaused" : "greetingsSection"}
      aria-labelledby="greetings-title"
    >
      <audio ref={audioRef} preload="none" onEnded={handleAudioEnded} />

      <div className="greetingsIntro">
        <p className="greetingsEyebrow">{copy.eyebrow}</p>
        <h2 id="greetings-title">{copy.title}</h2>
        <p className="greetingsHint">{copy.listenHint}</p>
      </div>

      <GreetingTrack
        trackId="howAreYou"
        label={copy.howAreYou}
        items={howAreYouGreetings}
        direction="left"
        playLabel={copy.playLabel}
        playingLabel={copy.playingLabel}
        phrasebookHref={phrasebookLinks.howAreYou}
        openPhrasebook={copy.openPhrasebook}
        audioRef={audioRef}
        playingId={playingId}
        setPlayingId={setPlayingId}
        setMarqueePaused={setMarqueePaused}
      />
      <GreetingTrack
        trackId="welcome"
        label={copy.welcome}
        items={welcomeGreetings}
        direction="right"
        playLabel={copy.playLabel}
        playingLabel={copy.playingLabel}
        phrasebookHref={phrasebookLinks.welcome}
        openPhrasebook={copy.openPhrasebook}
        audioRef={audioRef}
        playingId={playingId}
        setPlayingId={setPlayingId}
        setMarqueePaused={setMarqueePaused}
      />
    </section>
  );
}
