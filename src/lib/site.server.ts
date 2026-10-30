import { getSettings, listProducts, putSetting } from "./db.server";

export type Category = "sport" | "formal";

export interface Product {
  id: number;
  name: string;
  category: Category;
  price: string;
  oldPrice: string;
  badge: string;
  sizes: string[];
  image: string;
  active: boolean;
}

export const PUBLIC_SETTING_KEYS = ["whatsapp", "phone", "address", "hours", "brands"] as const;

export const DEFAULT_BRANDS =
  "NIKE,ADIDAS,PUMA,NEW BALANCE,REEBOK,ASICS,SKECHERS,UNDER ARMOUR,FILA,CLARKS,GEOX,ALDO";

export async function readProducts(includeHidden: boolean): Promise<Product[]> {
  return listProducts(includeHidden).map((p) => ({
    ...p,
    sizes: p.sizes
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  }));
}

export async function readSettings(onlyPublic: boolean): Promise<Record<string, string>> {
  const all = getSettings();
  if (!onlyPublic) return all;
  const out: Record<string, string> = {};
  for (const key of PUBLIC_SETTING_KEYS) if (key in all) out[key] = all[key];
  return out;
}

export async function writeSetting(key: string, value: string): Promise<void> {
  putSetting(key, value);
}

export async function readSetting(key: string): Promise<string | null> {
  return getSettings()[key] ?? null;
}
