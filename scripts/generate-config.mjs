import { writeFile } from "node:fs/promises";
import { buildConfig, readJson } from "./config.mjs";

const baseConfig = await readJson(new URL("../wrangler.jsonc", import.meta.url));
const services = await readJson(new URL("../services.json", import.meta.url));
if (process.env.DOMAIN) {
  baseConfig.vars.DOMAIN = process.env.DOMAIN;
}
const generatedConfig = buildConfig(baseConfig, services);

await writeFile(
  new URL("../wrangler.generated.jsonc", import.meta.url),
  `${JSON.stringify(generatedConfig, null, 2)}\n`,
);

console.log(`Configured ${generatedConfig.routes.length} Kuest domains for ${generatedConfig.vars.DOMAIN}.`);
