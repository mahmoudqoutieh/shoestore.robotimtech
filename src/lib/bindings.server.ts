import { getDb, getStorage } from "./db.server";

export function bindings() {
  return { DB: getDb(), STORAGE: getStorage() };
}
