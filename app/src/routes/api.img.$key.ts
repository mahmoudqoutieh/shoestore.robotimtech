import { createFileRoute } from "@tanstack/react-router";

import { bindings } from "@/lib/bindings.server";

export const Route = createFileRoute("/api/img/$key")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const { STORAGE } = bindings();
        const key = params.key;
        if (!STORAGE || !/^[a-f0-9-]{36}\.(webp|jpg|png)$/.test(key)) {
          return new Response("Not found", { status: 404 });
        }
        const object = await STORAGE.get(key);
        if (!object) return new Response("Not found", { status: 404 });
        return new Response(object.body as unknown as ReadableStream, {
          headers: {
            "Content-Type": object.httpMetadata?.contentType ?? "image/webp",
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      },
    },
  },
});
