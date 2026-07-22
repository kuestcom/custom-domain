import { writeFile } from "node:fs/promises";
import { normalizeDomain, readJson } from "./config.mjs";

const domain = normalizeDomain(process.argv[2] ?? "");
const configUrl = new URL("../wrangler.jsonc", import.meta.url);
const config = await readJson(configUrl);

config.vars = { ...config.vars, DOMAIN: domain };
await writeFile(configUrl, `${JSON.stringify(config, null, 2)}\n`);

