import assert from "node:assert/strict";
import test from "node:test";
import { buildConfig, normalizeDomain, readJson } from "../scripts/config.mjs";

test("normalizes a configured domain", () => {
  assert.equal(normalizeDomain("Markets.Example.com."), "markets.example.com");
});

test("rejects URLs instead of hostnames", () => {
  assert.throws(() => normalizeDomain("https://example.com"), /without protocol/);
});

test("creates one custom domain per service", () => {
  const config = buildConfig(
    { vars: { DOMAIN: "site-fork.com" } },
    { clob: "clob.kuest.com", relayer: "relayer.kuest.com" },
  );

  assert.deepEqual(config.routes, [
    { pattern: "clob.site-fork.com", custom_domain: true },
    { pattern: "relayer.site-fork.com", custom_domain: true },
  ]);
});

test("the project config creates all 15 custom domains", async () => {
  const baseConfig = await readJson(new URL("../wrangler.jsonc", import.meta.url));
  const services = await readJson(new URL("../services.json", import.meta.url));
  const config = buildConfig(baseConfig, services);

  assert.equal(config.routes.length, 15);
  assert.equal(config.routes[1].pattern, "clob.example.com");
});
