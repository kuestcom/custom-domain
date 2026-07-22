import services from "../services.json";

function getUpstreamHostname(hostname: string, domain: string): string | undefined {
  const suffix = `.${domain.toLowerCase()}`;
  const normalizedHostname = hostname.toLowerCase();

  if (!normalizedHostname.endsWith(suffix)) {
    return undefined;
  }

  const service = normalizedHostname.slice(0, -suffix.length);
  return services[service as keyof typeof services];
}

function rewriteLocation(response: Response, incomingUrl: URL, upstreamUrl: URL): Response {
  const location = response.headers.get("Location");
  if (!location) {
    return response;
  }

  let redirectUrl: URL;
  try {
    redirectUrl = new URL(location, upstreamUrl);
  } catch {
    return response;
  }

  if (redirectUrl.origin !== upstreamUrl.origin) {
    return response;
  }

  redirectUrl.protocol = incomingUrl.protocol;
  redirectUrl.host = incomingUrl.host;

  const headers = new Headers(response.headers);
  headers.set("Location", redirectUrl.toString());

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const incomingUrl = new URL(request.url);
    const upstreamHostname = getUpstreamHostname(incomingUrl.hostname, env.DOMAIN);

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

    const upstreamRequest = new Request(upstreamUrl, {
      method: request.method,
      headers,
      body: request.method === "GET" || request.method === "HEAD" ? undefined : request.body,
      redirect: "manual",
    });

    try {
      const response = await fetch(upstreamRequest);
      return rewriteLocation(response, incomingUrl, upstreamUrl);
    } catch (error) {
      console.error(
        JSON.stringify({
          message: "Upstream request failed",
          upstream: upstreamHostname,
          error: error instanceof Error ? error.message : String(error),
        }),
      );
      return new Response("Upstream unavailable", { status: 502 });
    }
  },
} satisfies ExportedHandler<Env>;

