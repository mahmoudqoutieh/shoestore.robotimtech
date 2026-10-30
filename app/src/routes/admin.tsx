import { createFileRoute } from "@tanstack/react-router";

import { AdminPanel } from "@/components/bayt/admin-panel";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "لوحة التحكم | بيت الرياضة" }, { name: "robots", content: "noindex" }],
  }),
  component: AdminPage,
});

function AdminPage() {
  return (
    <main className="bh-admin">
      <AdminPanel />
    </main>
  );
}
