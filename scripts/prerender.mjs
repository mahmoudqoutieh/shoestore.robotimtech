// Safety net for hosts that publish a static folder instead of running Node:
// after the build, boot the server once, save the rendered home page as
// dist/index.html and copy the public assets next to it. When the host runs
// the Node server (.output/server/index.mjs) this folder is simply unused.
import { spawn } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const PORT = 4599;
const OUT = "dist";

async function main() {
  if (!existsSync(".output/server/index.mjs")) throw new Error("server build not found");
  const dataDir = mkdtempSync(join(tmpdir(), "bayt-prerender-"));
  const server = spawn(process.execPath, [".output/server/index.mjs"], {
    env: { ...process.env, PORT: String(PORT), HOST: "127.0.0.1", DATA_DIR: dataDir },
    stdio: "ignore",
  });
  try {
    let html = "";
    for (let i = 0; i < 40 && !html; i += 1) {
      await new Promise((r) => setTimeout(r, 250));
      try {
        const res = await fetch(`http://127.0.0.1:${PORT}/`);
        if (res.ok) html = await res.text();
      } catch {
        /* server still starting */
      }
    }
    if (!html.includes("</html>")) throw new Error("home page did not render");
    rmSync(OUT, { recursive: true, force: true });
    mkdirSync(OUT, { recursive: true });
    cpSync(".output/public", OUT, { recursive: true });
    writeFileSync(join(OUT, "index.html"), html);
    console.log(`[prerender] wrote ${OUT}/index.html (${html.length} bytes)`);
  } finally {
    server.kill();
    rmSync(dataDir, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.warn("[prerender] skipped:", error.message);
});
