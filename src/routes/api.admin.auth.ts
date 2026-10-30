import { createFileRoute } from "@tanstack/react-router";

import {
  endSession,
  failDelay,
  hasAdmin,
  json,
  setPassword,
  startSession,
  verifyPassword,
} from "@/lib/admin.server";

interface AuthBody {
  action?: string;
  password?: string;
}

export const Route = createFileRoute("/api/admin/auth")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json().catch(() => ({}))) as AuthBody;
        const password = typeof body.password === "string" ? body.password : "";

        if (body.action === "logout") {
          return json({ ok: true }, 200, { "Set-Cookie": await endSession() });
        }
        if (body.action === "setup") {
          if (await hasAdmin()) return json({ error: "تم إعداد كلمة المرور مسبقاً" }, 409);
          if (password.length < 8) return json({ error: "كلمة المرور يجب ألا تقل عن 8 أحرف" }, 400);
          await setPassword(password);
          return json({ ok: true }, 200, { "Set-Cookie": await startSession() });
        }
        if (body.action === "login") {
          if (!(await verifyPassword(password))) {
            await failDelay();
            return json({ error: "كلمة المرور غير صحيحة" }, 401);
          }
          return json({ ok: true }, 200, { "Set-Cookie": await startSession() });
        }
        return json({ error: "طلب غير صالح" }, 400);
      },
    },
  },
});
