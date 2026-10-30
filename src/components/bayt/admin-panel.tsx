import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";

import type { Product } from "@/lib/site.server";

type State = "loading" | "setup" | "login" | "ok";

async function shrink(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1000 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas unavailable");
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("encode failed"))), "image/webp", 0.84),
  );
}

async function call(url: string, init?: RequestInit): Promise<{ ok: boolean; data: Record<string, unknown> }> {
  const res = await fetch(url, init);
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  return { ok: res.ok, data };
}

function Gate({ state, onDone }: { state: "setup" | "login"; onDone: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    const { ok, data } = await call("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: state, password }),
    });
    setBusy(false);
    if (ok) onDone();
    else setError(String(data.error ?? "حدث خطأ"));
  };

  return (
    <form className="bh-admin__gate" onSubmit={submit}>
      <h1>{state === "setup" ? "إنشاء كلمة مرور المدير" : "دخول لوحة التحكم"}</h1>
      <p>
        {state === "setup"
          ? "أنشئ كلمة مرور قوية (8 أحرف على الأقل). لن تظهر هذه الصفحة بعد الإنشاء إلا لتسجيل الدخول."
          : "أدخل كلمة المرور لإدارة المنتجات."}
      </p>
      <input
        autoComplete={state === "setup" ? "new-password" : "current-password"}
        className="bh-admin__input"
        minLength={state === "setup" ? 8 : 1}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="كلمة المرور"
        required
        type="password"
        value={password}
      />
      {error ? <p className="bh-admin__error">{error}</p> : null}
      <button className="bh-admin__btn" disabled={busy} type="submit">
        {state === "setup" ? "إنشاء ودخول" : "دخول"}
      </button>
    </form>
  );
}

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const [p, s] = await Promise.all([call("/api/admin/products"), call("/api/admin/settings")]);
    if (p.ok) setProducts(p.data.products as Product[]);
    if (s.ok) setSettings(s.data.settings as Record<string, string>);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const addProduct = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const file = data.get("image");
    if (!(file instanceof File) || file.size === 0) {
      setMessage("اختر صورة للمنتج");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      data.set("image", new File([await shrink(file)], "product.webp", { type: "image/webp" }));
      const res = await call("/api/admin/products", { method: "POST", body: data });
      if (res.ok) {
        form.reset();
        setMessage("تمت إضافة المنتج");
        await load();
      } else {
        setMessage(String(res.data.error ?? "تعذرت الإضافة"));
      }
    } catch {
      setMessage("تعذرت معالجة الصورة");
    }
    setBusy(false);
  };

  const toggle = async (product: Product) => {
    await call("/api/admin/products", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: product.id, active: !product.active }),
    });
    await load();
  };

  const remove = async (product: Product) => {
    if (!window.confirm(`حذف «${product.name}» نهائياً؟`)) return;
    await call("/api/admin/products", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: product.id }),
    });
    await load();
  };

  const saveSettings = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const body = Object.fromEntries(new FormData(event.currentTarget).entries());
    const res = await call("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setMessage(res.ok ? "تم حفظ بيانات المحل" : String(res.data.error ?? "تعذر الحفظ"));
  };

  const logout = async () => {
    await call("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
    });
    onLogout();
  };

  return (
    <div className="bh-admin__dash">
      <header className="bh-admin__top">
        <h1>لوحة التحكم</h1>
        <div>
          <a href="/">عرض الموقع</a>
          <button className="bh-admin__ghost" onClick={logout} type="button">
            خروج
          </button>
        </div>
      </header>
      {message ? (
        <p className="bh-admin__note" role="status">
          {message}
        </p>
      ) : null}

      <section className="bh-admin__panel">
        <h2>إضافة منتج</h2>
        <form className="bh-admin__form" onSubmit={addProduct}>
          <label>
            اسم المنتج
            <input className="bh-admin__input" maxLength={80} name="name" required />
          </label>
          <label>
            القسم
            <select className="bh-admin__input" name="category">
              <option value="sport">رياضي</option>
              <option value="formal">رسمي</option>
            </select>
          </label>
          <label>
            السعر (مع العملة)
            <input className="bh-admin__input" maxLength={40} name="price" placeholder="مثال: 199" />
          </label>
          <label>
            السعر قبل الخصم
            <input className="bh-admin__input" maxLength={40} name="oldPrice" />
          </label>
          <label>
            شارة (جديد، خصم...)
            <input className="bh-admin__input" maxLength={24} name="badge" />
          </label>
          <label>
            المقاسات (مفصولة بفواصل)
            <input className="bh-admin__input" maxLength={80} name="sizes" placeholder="40,41,42,43" />
          </label>
          <label className="bh-admin__wide">
            صورة المنتج
            <input accept="image/*" className="bh-admin__input" name="image" required type="file" />
          </label>
          <button className="bh-admin__btn bh-admin__wide" disabled={busy} type="submit">
            {busy ? "جارٍ الرفع..." : "إضافة المنتج"}
          </button>
        </form>
      </section>

      <section className="bh-admin__panel">
        <h2>المنتجات ({products.length})</h2>
        <ul className="bh-admin__list">
          {products.map((p) => (
            <li key={p.id}>
              <img alt="" height={64} src={p.image} width={52} />
              <div>
                <b>{p.name}</b>
                <span>
                  {p.category === "formal" ? "رسمي" : "رياضي"}
                  {p.active ? "" : " (مخفي)"}
                </span>
              </div>
              <button className="bh-admin__ghost" onClick={() => toggle(p)} type="button">
                {p.active ? "إخفاء" : "إظهار"}
              </button>
              <button className="bh-admin__ghost bh-admin__danger" onClick={() => remove(p)} type="button">
                حذف
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="bh-admin__panel">
        <h2>بيانات المحل</h2>
        <form className="bh-admin__form" key={JSON.stringify(settings)} onSubmit={saveSettings}>
          <label>
            رقم واتساب (بصيغة دولية بدون +)
            <input className="bh-admin__input" defaultValue={settings.whatsapp ?? ""} inputMode="numeric" name="whatsapp" />
          </label>
          <label>
            رقم الهاتف
            <input className="bh-admin__input" defaultValue={settings.phone ?? ""} name="phone" />
          </label>
          <label>
            العنوان
            <input className="bh-admin__input" defaultValue={settings.address ?? ""} name="address" />
          </label>
          <label>
            ساعات العمل
            <input className="bh-admin__input" defaultValue={settings.hours ?? ""} name="hours" />
          </label>
          <label className="bh-admin__wide">
            الماركات التي تعرضها (مفصولة بفواصل)
            <input className="bh-admin__input" defaultValue={settings.brands ?? ""} name="brands" />
          </label>
          <button className="bh-admin__btn bh-admin__wide" type="submit">
            حفظ
          </button>
        </form>
      </section>
    </div>
  );
}

export function AdminPanel() {
  const [state, setState] = useState<State>("loading");

  const refresh = useCallback(async () => {
    const { data } = await call("/api/admin/session");
    setState((data.state as State) ?? "login");
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  if (state === "loading") return <p className="bh-admin__loading">جارٍ التحميل...</p>;
  if (state === "ok") return <Dashboard onLogout={() => void refresh()} />;
  return <Gate onDone={() => void refresh()} state={state} />;
}
