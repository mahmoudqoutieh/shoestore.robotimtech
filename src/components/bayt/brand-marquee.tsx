function Row({ brands, reverse }: { brands: string[]; reverse?: boolean }) {
  const loop = [...brands, ...brands];
  return (
    <div className={reverse ? "bh-marquee__row bh-marquee__row--rev" : "bh-marquee__row"}>
      <ul className="bh-marquee__track" dir="ltr">
        {loop.map((brand, i) => (
          <li aria-hidden={i >= brands.length ? true : undefined} key={`${brand}-${i}`}>
            {brand}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function BrandMarquee({ brands }: { brands: string[] }) {
  const half = Math.ceil(brands.length / 2);
  const a = brands.slice(0, half);
  const b = brands.slice(half).length ? brands.slice(half) : brands;
  return (
    <section aria-label="العلامات التجارية" className="bh-marquee">
      <Row brands={a} />
      <Row brands={b} reverse />
    </section>
  );
}
