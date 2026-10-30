import { createFileRoute } from "@tanstack/react-router";

import { storage } from "@/lib/db.server";

export const Route = createFileRoute("/api/img/$key")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const key = params.key;
        if (!/^[a-f0-9-]{36}\.(webp|jpg|png)$/.test(key)) {
          return new Response("Not found", { status: 404 });
        }
        const object = storage.get(key);
        if (!object) return new Response("Not found", { status: 404 });
        return new Response(object.body as BodyInit, {
          headers: {
            "Content-Type": object.contentType,
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      },
    },
  },
});
