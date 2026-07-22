import { normalizeDomain, readJson } from "./config.mjs";

const config = await readJson(new URL("../wrangler.jsonc", import.meta.url));
process.stdout.write(normalizeDomain(config.vars?.DOMAIN ?? ""));

