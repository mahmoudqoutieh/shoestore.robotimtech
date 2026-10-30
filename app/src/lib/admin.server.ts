import { readSetting, writeSetting } from "./site.server";

const encoder = new TextEncoder();
const COOKIE = "bh_admin";
const SESSION_SECONDS = 60 * 60 * 24 * 7;

function toHex(bytes: ArrayBuffer | Uint8Array): string {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  return Array.from(view, (b) => b.toString(16).padStart(2, "0")).join("");
}

function equal(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function derive(password: string, saltHex: string): Promise<string> {
  const salt = new Uint8Array(saltHex.match(/.{2}/g)!.map((h) => Number.parseInt(h, 16)));
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, [
    "deriveBits",
  ]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations: 100000 },
    key,
    256,
  );
  return toHex(bits);
}

async function sha256(value: string): Promise<string> {
  return toHex(await crypto.subtle.digest("SHA-256", encoder.encode(value)));
}

export function json(data: unknown, status = 200, headers?: Record<string, string>): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...headers },
  });
}

export async function hasAdmin(): Promise<boolean> {
  return (await readSetting("admin_hash")) !== null;
}

export async function setPassword(password: string): Promise<void> {
  const salt = toHex(crypto.getRandomValues(new Uint8Array(16)));
  await writeSetting("admin_hash", `${salt}:${await derive(password, salt)}`);
}

export async function verifyPassword(password: string): Promise<boolean> {
  const stored = await readSetting("admin_hash");
  if (!stored) return false;
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  return equal(await derive(password, salt), hash);
}

export async function startSession(): Promise<string> {
  const token = toHex(crypto.getRandomValues(new Uint8Array(32)));
  const expires = Date.now() + SESSION_SECONDS * 1000;
  await writeSetting("admin_session", `${await sha256(token)}:${expires}`);
  return `${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_SECONDS}`;
}

export async function endSession(): Promise<string> {
  await writeSetting("admin_session", "");
  return `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}

export async function isAuthed(request: Request): Promise<boolean> {
  const cookies = request.headers.get("cookie") ?? "";
  const match = cookies.split(";").map((c) => c.trim()).find((c) => c.startsWith(`${COOKIE}=`));
  if (!match) return false;
  const token = match.slice(COOKIE.length + 1);
  const stored = await readSetting("admin_session");
  if (!token || !stored) return false;
  const [hash, expires] = stored.split(":");
  if (!hash || Number(expires) < Date.now()) return false;
  return equal(await sha256(token), hash);
}

export async function failDelay(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 600));
}
