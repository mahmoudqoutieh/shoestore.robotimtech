import { createFileRoute } from "@tanstack/react-router";

import { isAuthed, json } from "@/lib/admin.server";
import { addProduct, removeProduct, setProductActive, storage } from "@/lib/db.server";
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
        storage.put(key, await file.arrayBuffer());
        addProduct({
          name,
          category,
          price: text(form, "price", 40),
          oldPrice: text(form, "oldPrice", 40),
          badge: text(form, "badge", 24),
          sizes: text(form, "sizes", 80),
          image: `/api/img/${key}`,
        });
        return json({ ok: true });
      },
      PATCH: async ({ request }) => {
        if (!(await isAuthed(request))) return json({ error: "غير مصرح" }, 401);
        const body = (await request.json().catch(() => ({}))) as { id?: number; active?: boolean };
        if (typeof body.id !== "number" || typeof body.active !== "boolean") {
          return json({ error: "طلب غير صالح" }, 400);
        }
        setProductActive(body.id, body.active);
        return json({ ok: true });
      },
      DELETE: async ({ request }) => {
        if (!(await isAuthed(request))) return json({ error: "غير مصرح" }, 401);
        const body = (await request.json().catch(() => ({}))) as { id?: number };
        if (typeof body.id !== "number") return json({ error: "طلب غير صالح" }, 400);
        const removed = removeProduct(body.id);
        if (removed?.image.startsWith("/api/img/")) {
          storage.remove(removed.image.slice("/api/img/".length));
        }
        return json({ ok: true });
      },
    },
  },
});
