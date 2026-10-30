// Server-only storage for the shop: SQLite (node:sqlite, Node 22.13+) for
// products/settings and the local disk for uploaded product images.
// Everything lives under DATA_DIR (default ./data). On the host, point DATA_DIR
// at a folder OUTSIDE the deployed app directory so redeploys never wipe it.
import { createRequire } from "node:module";
import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { extname, join } from "node:path";

type SqlValue = string | number | null;

interface Statement {
  bind(...params: SqlValue[]): Statement;
  run(): Promise<void>;
  first<T>(): Promise<T | null>;
  all<T>(): Promise<{ results: T[] }>;
}

export interface Db {
  prepare(sql: string): Statement;
}

export interface Storage {
  put(key: string, data: ArrayBuffer, options?: { httpMetadata?: { contentType?: string } }): Promise<void>;
  get(key: string): Promise<{ body: Uint8Array; httpMetadata: { contentType: string } } | null>;
  delete(key: string): Promise<void>;
}

const TYPES: Record<string, string> = { ".webp": "image/webp", ".jpg": "image/jpeg", ".png": "image/png" };

const dataDir = () => process.env.DATA_DIR || join(process.cwd(), "data");

const SCHEMA = `
CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'sport',
  price TEXT NOT NULL DEFAULT '',
  old_price TEXT NOT NULL DEFAULT '',
  badge TEXT NOT NULL DEFAULT '',
  sizes TEXT NOT NULL DEFAULT '',
  image TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`;

const SEED: [string, string, string, string, string][] = [
  ["حذاء الجري كوبالت", "sport", "جديد", "40,41,42,43,44", "/assets/products/runner.webp"],
  ["حذاء كرة السلة العالي", "sport", "الأكثر طلباً", "41,42,43,44,45", "/assets/products/hightop.webp"],
  ["حذاء التدريب الرمادي", "sport", "", "40,41,42,43", "/assets/products/trail.webp"],
  ["أوكسفورد جلد أسود", "formal", "رسمي", "40,41,42,43,44", "/assets/products/oxford.webp"],
  ["بروغ جلد بني", "formal", "", "41,42,43,44", "/assets/products/brogue.webp"],
  ["لوفر جلد كحلي", "formal", "جديد", "40,41,42,43", "/assets/products/loafer.webp"],
];

let db: Db | undefined;

function open(): Db {
  const dir = dataDir();
  mkdirSync(join(dir, "uploads"), { recursive: true });
  const { DatabaseSync } = createRequire(import.meta.url)("node:sqlite") as typeof import("node:sqlite");
  const raw = new DatabaseSync(join(dir, "bayt.db"));
  raw.exec("PRAGMA journal_mode = WAL;");
  raw.exec(SCHEMA);

  const seeded = raw.prepare("SELECT value FROM settings WHERE key = 'seeded'").get();
  if (!seeded) {
    const count = raw.prepare("SELECT COUNT(*) AS n FROM products").get() as { n: number };
    if (count.n === 0) {
      const insert = raw.prepare(
        "INSERT INTO products (name, category, badge, sizes, image) VALUES (?, ?, ?, ?, ?)",
      );
      for (const [name, category, badge, sizes, image] of SEED) insert.run(name, category, badge, sizes, image);
    }
    raw.prepare("INSERT INTO settings (key, value) VALUES ('seeded', '1')").run();
  }

  const make = (sql: string, params: SqlValue[] = []): Statement => ({
    bind: (...next) => make(sql, next),
    run: async () => {
      raw.prepare(sql).run(...params);
    },
    first: async <T,>() => (raw.prepare(sql).get(...params) as T | undefined) ?? null,
    all: async <T,>() => ({ results: raw.prepare(sql).all(...params) as T[] }),
  });
  return { prepare: (sql) => make(sql) };
}

export function getDb(): Db {
  db ??= open();
  return db;
}

export function getStorage(): Storage {
  const dir = join(dataDir(), "uploads");
  mkdirSync(dir, { recursive: true });
  const path = (key: string) => join(dir, key);
  return {
    put: async (key, data) => {
      writeFileSync(path(key), new Uint8Array(data));
    },
    get: async (key) => {
      if (!existsSync(path(key))) return null;
      return {
        body: new Uint8Array(readFileSync(path(key))),
        httpMetadata: { contentType: TYPES[extname(key)] ?? "application/octet-stream" },
      };
    },
    delete: async (key) => {
      if (existsSync(path(key))) unlinkSync(path(key));
    },
  };
}
