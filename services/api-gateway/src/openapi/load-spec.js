import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";

const specPath = join(dirname(fileURLToPath(import.meta.url)), "../../../../docs/openapi.yaml");

let cachedSpec = null;

export function loadOpenApiSpec() {
  if (!cachedSpec) {
    const source = readFileSync(specPath, "utf8");
    cachedSpec = parseYaml(source);
  }
  return cachedSpec;
}
