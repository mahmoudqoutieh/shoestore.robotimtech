// Server-only storage for the shop. No native modules and no database server:
// products and settings live in ONE JSON file, uploaded images on the disk.
// Everything is under DATA_DIR (default ./data). On the host, point DATA_DIR at
// a folder OUTSIDE the deployed app directory so redeploys never wipe it.
import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { extname, join } from "node:path";

export interface ProductRecord {
  id: number;
  name: string;
  category: "sport" | "formal";
  price: string;
  oldPrice: string;
  badge: string;
  sizes: string;
  image: string;
  active: boolean;
}

interface StoreFile {
  nextId: number;
  products: ProductRecord[];
  settings: Record<string, string>;
}

const TYPES: Record<string, string> = { ".webp": "image/webp", ".jpg": "image/jpeg", ".png": "image/png" };

const dataDir = () => process.env.DATA_DIR || join(process.cwd(), "data");

const SEED: [string, "sport" | "formal", string, string, string][] = [
  ["حذاء الجري كوبالت", "sport", "جديد", "40,41,42,43,44", "/assets/products/runner.webp"],
  ["حذاء كرة السلة العالي", "sport", "الأكثر طلباً", "41,42,43,44,45", "/assets/products/hightop.webp"],
  ["حذاء التدريب الرمادي", "sport", "", "40,41,42,43", "/assets/products/trail.webp"],
  ["أوكسفورد جلد أسود", "formal", "رسمي", "40,41,42,43,44", "/assets/products/oxford.webp"],
  ["بروغ جلد بني", "formal", "", "41,42,43,44", "/assets/products/brogue.webp"],
  ["لوفر جلد كحلي", "formal", "جديد", "40,41,42,43", "/assets/products/loafer.webp"],
];

let cache: StoreFile | undefined;

function seedFile(): StoreFile {
  return {
    nextId: SEED.length + 1,
    settings: {},
    products: SEED.map(([name, category, badge, sizes, image], i) => ({
      id: SEED.length - i,
      name,
      category,
      price: "",
      oldPrice: "",
      badge,
      sizes,
      image,
      active: true,
    })),
  };
}

function load(): StoreFile {
  if (cache) return cache;
  mkdirSync(join(dataDir(), "uploads"), { recursive: true });
  const path = join(dataDir(), "store.json");
  if (existsSync(path)) {
    cache = JSON.parse(readFileSync(path, "utf8")) as StoreFile;
  } else {
    cache = seedFile();
    save();
  }
  return cache;
}

function save(): void {
  const path = join(dataDir(), "store.json");
  const tmp = `${path}.tmp`;
  writeFileSync(tmp, JSON.stringify(cache));
  renameSync(tmp, path);
}

export function listProducts(includeHidden: boolean): ProductRecord[] {
  const products = load().products.filter((p) => includeHidden || p.active);
  return [...products].sort((a, b) => b.id - a.id);
}

export function addProduct(input: Omit<ProductRecord, "id" | "active">): void {
  const store = load();
  store.products.push({ ...input, id: store.nextId, active: true });
  store.nextId += 1;
  save();
}

export function setProductActive(id: number, active: boolean): void {
  const product = load().products.find((p) => p.id === id);
  if (!product) return;
  product.active = active;
  save();
}

export function removeProduct(id: number): ProductRecord | null {
  const store = load();
  const product = store.products.find((p) => p.id === id) ?? null;
  store.products = store.products.filter((p) => p.id !== id);
  save();
  return product;
}

export function getSettings(): Record<string, string> {
  return { ...load().settings };
}

export function putSetting(key: string, value: string): void {
  load().settings[key] = value;
  save();
}

export const storage = {
  put(key: string, data: ArrayBuffer): void {
    mkdirSync(join(dataDir(), "uploads"), { recursive: true });
    writeFileSync(join(dataDir(), "uploads", key), new Uint8Array(data));
  },
  get(key: string): { body: Uint8Array; contentType: string } | null {
    const path = join(dataDir(), "uploads", key);
    if (!existsSync(path)) return null;
    return {
      body: new Uint8Array(readFileSync(path)),
      contentType: TYPES[extname(key)] ?? "application/octet-stream",
    };
  },
  remove(key: string): void {
    const path = join(dataDir(), "uploads", key);
    if (existsSync(path)) unlinkSync(path);
  },
};
