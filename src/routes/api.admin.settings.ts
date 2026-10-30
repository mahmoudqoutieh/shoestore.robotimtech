import { createFileRoute } from "@tanstack/react-router";

import { isAuthed, json } from "@/lib/admin.server";
import { PUBLIC_SETTING_KEYS, readSettings, writeSetting } from "@/lib/site.server";

export const Route = createFileRoute("/api/admin/settings")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        if (!(await isAuthed(request))) return json({ error: "غير مصرح" }, 401);
        return json({ settings: await readSettings(true) });
      },
      POST: async ({ request }) => {
        if (!(await isAuthed(request))) return json({ error: "غير مصرح" }, 401);
        const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
        for (const key of PUBLIC_SETTING_KEYS) {
          const value = body[key];
          if (typeof value === "string") await writeSetting(key, value.trim().slice(0, 400));
        }
        return json({ ok: true });
      },
    },
  },
});
