import { lazy, Suspense, useEffect, useRef, useState } from "react";

import { scrollScrubScenes, scrollScrubTheme } from "@/scroll-scrub-scenes";

import { JourneyActions } from "./journey-actions";

// The heavy scroll-scrubbed film is desktop only. Phones get a light hero: one
// short muted loop that pauses off screen, so scrolling stays smooth.
const ScrollScrub = lazy(() =>
  import("@/components/scroll-scrub/scroll-scrub").then((m) => ({ default: m.ScrollScrub })),
);

const scene = scrollScrubScenes[0];

function LightHero({ playVideo }: { playVideo: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video || !playVideo) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void video.play().catch(() => undefined);
        else video.pause();
      },
      { threshold: 0.15 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [playVideo]);

  return (
    <section aria-labelledby="hero-title" className="bh-hero">
      <div aria-hidden="true" className="bh-hero__media">
        <img
          alt=""
          className="bh-hero__poster"
          decoding="async"
          fetchPriority="high"
          height={540}
          src="/assets/world/hero-poster.webp"
          width={960}
        />
        {playVideo ? (
          <video
            className="bh-hero__video"
            loop
            muted
            playsInline
            poster="/assets/world/hero-poster.webp"
            preload="auto"
            ref={ref}
            src="/assets/world/hero-loop.mp4"
          />
        ) : null}
      </div>
      <div className="bh-hero__copy">
        <p className="bh-hero__kicker">{scene.kicker}</p>
        <h1 className="bh-hero__title" id="hero-title">
          {scene.title}
        </h1>
        <p className="bh-hero__body">{scene.body}</p>
        <ul className="bh-hero__tags">
          {scene.tags?.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
        <div className="bh-hero__actions">
          <JourneyActions />
        </div>
      </div>
    </section>
  );
}

export function Hero() {
  const [mode, setMode] = useState<"light" | "scrub">("light");
  const [playVideo, setPlayVideo] = useState(false);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 900px) and (hover: hover) and (pointer: fine)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (desktop.matches && !reduce.matches) setMode("scrub");
    setPlayVideo(!reduce.matches && !connection?.saveData);
  }, []);

  if (mode === "scrub") {
    return (
      <Suspense fallback={<LightHero playVideo={false} />}>
        <ScrollScrub scenes={scrollScrubScenes} theme={scrollScrubTheme} />
      </Suspense>
    );
  }
  return <LightHero playVideo={playVideo} />;
}
