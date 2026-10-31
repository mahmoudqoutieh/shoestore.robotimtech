import { lazy, Suspense, useEffect, useRef, useState } from "react";

import { scrollScrubScenes, scrollScrubTheme } from "@/scroll-scrub-scenes";

import { JourneyActions } from "./journey-actions";

// Desktop: the full scroll-scrubbed film (loaded on demand).
const ScrollScrub = lazy(() =>
  import("@/components/scroll-scrub/scroll-scrub").then((m) => ({ default: m.ScrollScrub })),
);

const scene = scrollScrubScenes[0];
const FRAME_COUNT = 40;
const frameUrl = (i: number) => `/assets/frames/f${String(i + 1).padStart(2, "0")}.webp`;
const clamp = (v: number) => Math.min(1, Math.max(0, v));

// Phones: 40 small portrait frames drawn on a canvas by scroll position. No video
// decoding or seeking, so it stays smooth. The picture and the words move as you scroll.
function FrameHero() {
  const runway = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const picture = useRef<HTMLDivElement>(null);
  const capA = useRef<HTMLParagraphElement>(null);
  const capB = useRef<HTMLParagraphElement>(null);
  const intro = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = runway.current;
    const cv = canvas.current;
    const ctx = cv?.getContext("2d");
    if (!el || !cv || !ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = Boolean(
      (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData,
    );
    const frames: (HTMLImageElement | undefined)[] = new Array(FRAME_COUNT);
    let shown = -1;
    let current = 0;
    let target = 0;
    let raf = 0;

    const draw = (index: number) => {
      let i = index;
      while (i >= 0 && !frames[i]) i -= 1;
      const img = frames[i];
      if (!img || i === shown) return;
      shown = i;
      ctx.drawImage(img, 0, 0, cv.width, cv.height);
    };

    const load = (i: number) => {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => {
        frames[i] = img;
        if (i === 0 || Math.abs(i - Math.round(current)) < 2) draw(Math.round(current));
      };
      img.src = frameUrl(i);
    };
    // first frame, then the rest in order
    load(0);
    if (!reduce && !saveData) for (let i = 1; i < FRAME_COUNT; i += 1) load(i);

    const apply = (p: number) => {
      if (picture.current) {
        picture.current.style.transform = `translate3d(0, ${(-p * 7).toFixed(2)}svh, 0) scale(${(1 + p * 0.1).toFixed(3)})`;
      }
      if (intro.current) {
        intro.current.style.transform = `translate3d(0, ${(-p * 5).toFixed(2)}svh, 0)`;
      }
      const a = 1 - clamp((p - 0.38) / 0.18);
      const b = clamp((p - 0.5) / 0.18);
      if (capA.current) {
        capA.current.style.opacity = a.toFixed(2);
        capA.current.style.transform = `translate3d(0, ${((1 - a) * -14).toFixed(1)}px, 0)`;
      }
      if (capB.current) {
        capB.current.style.opacity = b.toFixed(2);
        capB.current.style.transform = `translate3d(0, ${((1 - b) * 14).toFixed(1)}px, 0)`;
      }
    };

    const read = () => {
      const rect = el.getBoundingClientRect();
      const span = el.offsetHeight - window.innerHeight;
      target = span > 0 ? clamp(-rect.top / span) * (FRAME_COUNT - 1) : 0;
    };

    const tick = () => {
      raf = 0;
      current += (target - current) * 0.22;
      if (Math.abs(target - current) < 0.02) current = target;
      draw(Math.round(current));
      apply(current / (FRAME_COUNT - 1));
      if (current !== target) raf = requestAnimationFrame(tick);
    };

    const onScroll = () => {
      read();
      if (!raf) raf = requestAnimationFrame(tick);
    };

    if (!reduce) {
      read();
      current = target;
      apply(current / (FRAME_COUNT - 1));
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll, { passive: true });
    }
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section aria-labelledby="hero-title" className="bh-fh" ref={runway}>
      <div className="bh-fh__stage">
        <div className="bh-fh__picture" ref={picture}>
          <img
            alt=""
            className="bh-fh__poster"
            decoding="async"
            fetchPriority="high"
            height={480}
            src="/assets/world/hero-poster.webp"
            width={480}
          />
          <canvas aria-hidden="true" className="bh-fh__canvas" height={480} ref={canvas} width={480} />
        </div>
        <div className="bh-fh__text">
          <div className="bh-fh__intro" ref={intro}>
            <p className="bh-fh__kicker">{scene.kicker}</p>
            <h1 className="bh-fh__title" id="hero-title">
              {scene.title}
            </h1>
          </div>
          <div className="bh-fh__caps">
            <p className="bh-fh__cap" ref={capA}>
              <b>رياضي</b> خفة وثبات لكل خطوة
            </p>
            <p className="bh-fh__cap bh-fh__cap--b" ref={capB}>
              <b>رسمي</b> جلد مصقول وأناقة تليق بك
            </p>
          </div>
          <div className="bh-fh__actions">
            <JourneyActions />
          </div>
        </div>
      </div>
    </section>
  );
}

export function Hero() {
  const [desktop, setDesktop] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 900px) and (hover: hover) and (pointer: fine)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    setDesktop(query.matches && !reduce.matches);
  }, []);

  if (desktop) {
    return (
      <Suspense fallback={<FrameHero />}>
        <ScrollScrub scenes={scrollScrubScenes} theme={scrollScrubTheme} />
      </Suspense>
    );
  }
  return <FrameHero />;
}
