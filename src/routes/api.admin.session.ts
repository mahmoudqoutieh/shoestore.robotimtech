import { createFileRoute } from "@tanstack/react-router";

import { hasAdmin, isAuthed, json } from "@/lib/admin.server";

export const Route = createFileRoute("/api/admin/session")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        if (await isAuthed(request)) return json({ state: "ok" });
        return json({ state: (await hasAdmin()) ? "login" : "setup" });
      },
    },
  },
});
