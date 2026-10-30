/**
 * Scene data for the scroll-scrub journey. Single-shot: ONE continuous film.
 * Keep this array a module constant.
 */
import type {
  ScrollScrubScene,
  ScrollScrubTheme,
} from "@/components/scroll-scrub/scroll-scrub";
import { JourneyActions } from "@/components/bayt/journey-actions";

export const scrollScrubTheme: ScrollScrubTheme = {
  accent: "#FFC93C",
  background: "#061653",
  ink: "#F5F7FF",
  muted: "#B8C4F5",
};

export const scrollScrubScenes: ScrollScrubScene[] = [
  {
    actions: <JourneyActions />,
    body: "أحذية رياضية تركض معك، وأحذية رسمية تليق بك. كل ما تحتاجه من الملعب إلى المكتب في مكان واحد.",
    clip: "/assets/world/scene-01.mp4",
    id: "scene-01",
    kicker: "بيت الرياضة",
    label: "الرحلة",
    linger: 0.15,
    mobileClip: "/assets/world/scene-01-mobile.mp4",
    mobilePoster: "/assets/world/scene-01-mobile-poster.png",
    poster: "/assets/world/scene-01-poster.png",
    scroll: 4.2,
    tags: ["أحذية رياضية", "أحذية رسمية", "وصل حديثاً"],
    title: "من الملعب إلى المكتب",
  },
];
