import { createFileRoute } from "@tanstack/react-router";

import { isAuthed, json } from "@/lib/admin.server";
import { bindings } from "@/lib/bindings.server";
import { readProducts } from "@/lib/site.server";

const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
const IMAGE_TYPES: Record<string, string> = {
  "image/webp": "webp",
  "image/jpeg": "jpg",
  "image/png": "png",
};

function text(form: FormData, key: string, max: number): string {
  const value = form.get(key);
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export const Route = createFileRoute("/api/admin/products")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        if (!(await isAuthed(request))) return json({ error: "غير مصرح" }, 401);
        return json({ products: await readProducts(true) });
      },
      POST: async ({ request }) => {
        if (!(await isAuthed(request))) return json({ error: "غير مصرح" }, 401);
        const { DB, STORAGE } = bindings();
        if (!DB || !STORAGE) return json({ error: "التخزين غير متاح" }, 503);

        const form = await request.formData();
        const name = text(form, "name", 80);
        const category = text(form, "category", 10) === "formal" ? "formal" : "sport";
        const file = form.get("image");
        if (!name) return json({ error: "اسم المنتج مطلوب" }, 400);
        if (!(file instanceof File) || file.size === 0) return json({ error: "صورة المنتج مطلوبة" }, 400);
        const ext = IMAGE_TYPES[file.type];
        if (!ext) return json({ error: "الصيغة المسموحة: WebP أو JPG أو PNG" }, 400);
        if (file.size > MAX_IMAGE_BYTES) return json({ error: "حجم الصورة أكبر من 3 ميجابايت" }, 400);

        const key = `${crypto.randomUUID()}.${ext}`;
        await STORAGE.put(key, await file.arrayBuffer(), { httpMetadata: { contentType: file.type } });
        await DB.prepare(
          "INSERT INTO products (name, category, price, old_price, badge, sizes, image) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        )
          .bind(
            name,
            category,
            text(form, "price", 40),
            text(form, "oldPrice", 40),
            text(form, "badge", 24),
            text(form, "sizes", 80),
            `/api/img/${key}`,
          )
          .run();
        return json({ ok: true });
      },
      PATCH: async ({ request }) => {
        if (!(await isAuthed(request))) return json({ error: "غير مصرح" }, 401);
        const { DB } = bindings();
        if (!DB) return json({ error: "التخزين غير متاح" }, 503);
        const body = (await request.json().catch(() => ({}))) as { id?: number; active?: boolean };
        if (typeof body.id !== "number" || typeof body.active !== "boolean") {
          return json({ error: "طلب غير صالح" }, 400);
        }
        await DB.prepare("UPDATE products SET active = ?1 WHERE id = ?2")
          .bind(body.active ? 1 : 0, body.id)
          .run();
        return json({ ok: true });
      },
      DELETE: async ({ request }) => {
        if (!(await isAuthed(request))) return json({ error: "غير مصرح" }, 401);
        const { DB, STORAGE } = bindings();
        if (!DB) return json({ error: "التخزين غير متاح" }, 503);
        const body = (await request.json().catch(() => ({}))) as { id?: number };
        if (typeof body.id !== "number") return json({ error: "طلب غير صالح" }, 400);
        const row = await DB.prepare("SELECT image FROM products WHERE id = ?1")
          .bind(body.id)
          .first<{ image: string }>();
        await DB.prepare("DELETE FROM products WHERE id = ?1").bind(body.id).run();
        if (row?.image.startsWith("/api/img/") && STORAGE) {
          await STORAGE.delete(row.image.slice("/api/img/".length));
        }
        return json({ ok: true });
      },
    },
  },
});
