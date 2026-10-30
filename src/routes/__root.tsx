import { Link, Outlet, HeadContent, Scripts, createRootRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";

import appCss from "../styles.css?url";
import appMeta from "../app-meta.json";
import { THEME_COLOR } from "../lib/brand";

const TITLE = appMeta.og_title ?? "بيت الرياضة";
const DESCRIPTION =
  appMeta.og_description ?? "بيت الرياضة: أحذية رياضية وأحذية رسمية بتصاميم عصرية.";
const OG_IMAGE = appMeta.og_image_url;

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: THEME_COLOR },
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "ar_AR" },
      { name: "twitter:card", content: OG_IMAGE ? "summary_large_image" : "summary" },
      ...(OG_IMAGE
        ? [
            { property: "og:image", content: OG_IMAGE },
            { name: "twitter:image", content: OG_IMAGE },
          ]
        : []),
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" as const },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;700&family=Readex+Pro:wght@500;700&display=swap",
      },
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.svg" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32.png" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/site.webmanifest" },
    ],
  }),
  shellComponent: RootShell,
  component: Outlet,
  notFoundComponent: NotFound,
  errorComponent: ErrorView,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl" style={{ colorScheme: "dark" }}>
      <head>
        <HeadContent />
      </head>
      <body className="bh-body">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function NotFound() {
  return (
    <div className="bh-fallback">
      <h1>الصفحة غير موجودة</h1>
      <p>الصفحة التي تبحث عنها غير متوفرة أو تم نقلها.</p>
      <Link to="/" className="bh-order">
        العودة للرئيسية
      </Link>
    </div>
  );
}

function ErrorView({ error }: { error: unknown }) {
  console.error(error);
  return (
    <div className="bh-fallback">
      <h1>تعذر تحميل الصفحة</h1>
      <p>حدث خطأ من جانبنا. حاول التحديث أو العودة للرئيسية.</p>
      <a href="/" className="bh-order">
        الرئيسية
      </a>
    </div>
  );
}
