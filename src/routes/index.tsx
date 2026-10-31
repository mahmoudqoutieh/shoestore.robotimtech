import { createFileRoute } from "@tanstack/react-router";

import { BrandMarquee } from "@/components/bayt/brand-marquee";
import { Collection } from "@/components/bayt/collection";
import { Services } from "@/components/bayt/services";
import { SiteFooter } from "@/components/bayt/site-footer";
import { SiteNav } from "@/components/bayt/site-nav";
import { Visit } from "@/components/bayt/visit";
import { Worlds } from "@/components/bayt/worlds";
import { Hero } from "@/components/bayt/hero";
import { getSiteData } from "@/lib/site-data.functions";

const DEFAULT_BRANDS =
  "NIKE,ADIDAS,PUMA,NEW BALANCE,REEBOK,ASICS,SKECHERS,UNDER ARMOUR,FILA,CLARKS,GEOX,ALDO";

export const Route = createFileRoute("/")({
  loader: () => getSiteData(),
  component: Index,
});

function Index() {
  const { products, settings } = Route.useLoaderData();
  const brands = (settings.brands || DEFAULT_BRANDS)
    .split(",")
    .map((b) => b.trim())
    .filter(Boolean);

  return (
    <>
      <SiteNav />
      <main id="top">
        <Hero />
        <BrandMarquee brands={brands} />
        <Worlds />
        <Collection products={products} whatsapp={settings.whatsapp} />
        <Services />
        <Visit settings={settings} />
      </main>
      <SiteFooter />
    </>
  );
}
