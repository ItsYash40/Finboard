import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const moduleDir = dirname(fileURLToPath(import.meta.url));

export function getScalarBundlePath() {
  return join(moduleDir, "../../node_modules/@scalar/api-reference/dist/browser/standalone.js");
}

export const scalarScriptUrl = "/docs/scalar.js";
