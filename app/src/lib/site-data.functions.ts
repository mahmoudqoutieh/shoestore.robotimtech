import { createServerFn } from "@tanstack/react-start";

import { readProducts, readSettings } from "./site.server";

export const getSiteData = createServerFn({ method: "GET" }).handler(async () => {
  const [products, settings] = await Promise.all([readProducts(false), readSettings(true)]);
  return { products, settings };
});
