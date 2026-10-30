import { MessageCircle } from "lucide-react";
import { useMemo, useState } from "react";

import type { Product } from "@/lib/site.server";

import { useTilt } from "./use-tilt";

type Filter = "all" | "sport" | "formal";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "الكل" },
  { id: "sport", label: "رياضي" },
  { id: "formal", label: "رسمي" },
];

function orderLink(whatsapp: string | undefined, name: string): string {
  const digits = (whatsapp ?? "").replace(/\D/g, "");
  if (!digits) return "#visit";
  const text = encodeURIComponent(`مرحباً، أرغب بالاستفسار عن: ${name}`);
  return `https://wa.me/${digits}?text=${text}`;
}

function Card({ product, whatsapp, index }: { product: Product; whatsapp?: string; index: number }) {
  const tilt = useTilt<HTMLDivElement>(14);
  const link = orderLink(whatsapp, product.name);
  return (
    <li className="bh-card">
      <div className="bh-card__stage" {...tilt}>
        {product.badge ? <span className="bh-card__badge">{product.badge}</span> : null}
        <img
          alt={product.name}
          className="bh-card__img"
          decoding="async"
          height={1125}
          loading={index < 2 ? "eager" : "lazy"}
          src={product.image}
          style={{ animationDelay: `${(index % 6) * -0.9}s` }}
          width={900}
        />
      </div>
      <div className="bh-card__info">
        <h3>{product.name}</h3>
        <p className="bh-card__price">
          {product.price ? <strong>{product.price}</strong> : <span>اسأل عن السعر</span>}
          {product.oldPrice ? <s>{product.oldPrice}</s> : null}
        </p>
        {product.sizes.length ? (
          <ul aria-label="المقاسات المتوفرة" className="bh-card__sizes">
            {product.sizes.slice(0, 6).map((size) => (
              <li key={size}>{size}</li>
            ))}
          </ul>
        ) : null}
        <a className="bh-order" href={link} rel="noopener" target={link.startsWith("http") ? "_blank" : undefined}>
          <MessageCircle aria-hidden="true" size={18} strokeWidth={2.4} />
          <span>اطلب عبر واتساب</span>
        </a>
      </div>
    </li>
  );
}

export function Collection({ products, whatsapp }: { products: Product[]; whatsapp?: string }) {
  const [filter, setFilter] = useState<Filter>("all");
  const visible = useMemo(
    () => (filter === "all" ? products : products.filter((p) => p.category === filter)),
    [filter, products],
  );

  return (
    <section className="bh-section bh-collection" id="collection">
      <div className="bh-collection__head">
        <h2 className="bh-h2">المجموعة</h2>
        <div aria-label="تصفية المنتجات" className="bh-chips" role="group">
          {FILTERS.map((item) => (
            <button
              aria-pressed={filter === item.id}
              className="bh-chip"
              key={item.id}
              onClick={() => setFilter(item.id)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
      {visible.length ? (
        <ul className="bh-grid">
          {visible.map((product, i) => (
            <Card index={i} key={product.id} product={product} whatsapp={whatsapp} />
          ))}
        </ul>
      ) : (
        <p className="bh-empty">منتجات جديدة قادمة قريباً.</p>
      )}
    </section>
  );
}
