import { bindings } from "./bindings.server";

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

interface ProductRow {
  id: number;
  name: string;
  category: string;
  price: string;
  old_price: string;
  badge: string;
  sizes: string;
  image: string;
  active: number;
}

function toProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    category: row.category === "formal" ? "formal" : "sport",
    price: row.price,
    oldPrice: row.old_price,
    badge: row.badge,
    sizes: row.sizes
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    image: row.image,
    active: row.active === 1,
  };
}

export async function readProducts(includeHidden: boolean): Promise<Product[]> {
  const { DB } = bindings();
  if (!DB) return [];
  const sql = includeHidden
    ? "SELECT * FROM products ORDER BY id DESC"
    : "SELECT * FROM products WHERE active = 1 ORDER BY id DESC";
  const { results } = await DB.prepare(sql).all<ProductRow>();
  return results.map(toProduct);
}

export async function readSettings(onlyPublic: boolean): Promise<Record<string, string>> {
  const { DB } = bindings();
  const out: Record<string, string> = {};
  if (!DB) return out;
  const { results } = await DB.prepare("SELECT key, value FROM settings").all<{
    key: string;
    value: string;
  }>();
  for (const row of results) {
    if (onlyPublic && !(PUBLIC_SETTING_KEYS as readonly string[]).includes(row.key)) continue;
    out[row.key] = row.value;
  }
  return out;
}

export async function writeSetting(key: string, value: string): Promise<void> {
  const { DB } = bindings();
  if (!DB) throw new Error("database unavailable");
  await DB.prepare(
    "INSERT INTO settings (key, value) VALUES (?1, ?2) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
  )
    .bind(key, value)
    .run();
}

export async function readSetting(key: string): Promise<string | null> {
  const { DB } = bindings();
  if (!DB) return null;
  const row = await DB.prepare("SELECT value FROM settings WHERE key = ?1")
    .bind(key)
    .first<{ value: string }>();
  return row?.value ?? null;
}
