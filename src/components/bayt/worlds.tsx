import { ArrowUpLeft } from "lucide-react";

import { useTilt } from "./use-tilt";

function World({
  title,
  text,
  image,
  href,
  tone,
}: {
  title: string;
  text: string;
  image: string;
  href: string;
  tone: "sport" | "formal";
}) {
  const tilt = useTilt<HTMLAnchorElement>(8);
  return (
    <a className={`bh-world bh-world--${tone}`} href={href} {...tilt}>
      <div className="bh-world__copy">
        <h3>{title}</h3>
        <p>{text}</p>
        <span className="bh-world__go">
          استعرض
          <ArrowUpLeft aria-hidden="true" size={18} strokeWidth={2.6} />
        </span>
      </div>
      <img
        alt=""
        className="bh-world__img"
        decoding="async"
        height={1125}
        loading="lazy"
        sizes="(min-width: 820px) 40vw, 60vw"
        src={image}
        srcSet={`${image.replace(".webp", "-sm.webp")} 480w, ${image} 900w`}
        width={900}
      />
    </a>
  );
}

export function Worlds() {
  return (
    <section className="bh-section bh-worlds" id="worlds">
      <h2 className="bh-h2">اختر عالمك</h2>
      <div className="bh-worlds__grid">
        <World
          href="#collection"
          image="/assets/products/runner.webp"
          text="خفة وثبات وتهوية لكل خطوة، للجري والتدريب واللعب."
          title="رياضي"
          tone="sport"
        />
        <World
          href="#collection"
          image="/assets/products/oxford.webp"
          text="جلد مصقول وخطوط أنيقة للعمل والمناسبات."
          title="رسمي"
          tone="formal"
        />
      </div>
    </section>
  );
}
