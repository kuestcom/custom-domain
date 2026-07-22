const SERVICES = {
  relayer: "relayer.kuest.com",
  clob: "clob.kuest.com",
  "data-api": "data-api.kuest.com",
  "user-pnl-api": "user-pnl-api.kuest.com",
  community: "community.kuest.com",
  "create-market": "create-market.kuest.com",
  "gamma-api": "gamma-api.kuest.com",
  "price-reference": "price-reference.kuest.com",
  geoblock: "geoblock.kuest.com",
  "sdk-download": "sdk-download.kuest.com",
  "ws-live-data": "ws-live-data.kuest.com",
  "ws-subscriptions-clob": "ws-subscriptions-clob.kuest.com",
};

export default {
  async fetch(request, env) {
    if (typeof env.DOMAIN !== "string" || !env.DOMAIN) {
      return new Response("DOMAIN is not configured", { status: 500 });
    }

    const incomingUrl = new URL(request.url);
    const suffix = `.${env.DOMAIN.toLowerCase()}`;
    const service = incomingUrl.hostname.toLowerCase().endsWith(suffix)
      ? incomingUrl.hostname.slice(0, -suffix.length)
      : "";
    const upstreamHostname = SERVICES[service];

    if (!upstreamHostname) {
      return new Response("Unknown host", { status: 404 });
    }

    const upstreamUrl = new URL(request.url);
    upstreamUrl.protocol = "https:";
    upstreamUrl.hostname = upstreamHostname;
    upstreamUrl.port = "";

    const headers = new Headers(request.headers);
    headers.delete("Host");
    headers.set("X-Forwarded-Host", incomingUrl.hostname);
    headers.set("X-Forwarded-Proto", incomingUrl.protocol.slice(0, -1));

    return fetch(
      new Request(upstreamUrl, {
        method: request.method,
        headers,
        body: request.method === "GET" || request.method === "HEAD" ? undefined : request.body,
        redirect: "manual",
      }),
    );
  },
};
