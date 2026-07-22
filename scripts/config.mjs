import { readFile } from "node:fs/promises";
import { domainToASCII } from "node:url";

const HOSTNAME_PATTERN = /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;
const SERVICE_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

export function normalizeDomain(value) {
  const input = value.trim().toLowerCase().replace(/\.$/, "");

  if (!input || input.includes("://") || input.includes("/") || input.includes(":")) {
    throw new Error("DOMAIN must be a hostname without protocol, path, or port.");
  }

  const domain = domainToASCII(input);
  if (!domain || !HOSTNAME_PATTERN.test(domain)) {
    throw new Error("DOMAIN must be a valid hostname, such as markets.example.com.");
  }

  return domain;
}

export function buildConfig(baseConfig, services) {
  const domain = normalizeDomain(baseConfig.vars?.DOMAIN ?? "");
  const routes = Object.entries(services).map(([service, upstream]) => {
    if (!SERVICE_PATTERN.test(service) || !upstream.endsWith(".kuest.com")) {
      throw new Error(`Invalid service mapping: ${service} -> ${upstream}`);
    }

    return {
      pattern: `${service}.${domain}`,
      custom_domain: true,
    };
  });

  return {
    ...baseConfig,
    vars: {
      ...baseConfig.vars,
      DOMAIN: domain,
    },
    routes,
  };
}

export async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

