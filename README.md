<h1 align="center">
  <img src="https://github.com/user-attachments/assets/0cc687fb-89c4-43fa-a056-d89c307215ad" alt="Kuest" height="96" /><br/>
  Kuest Custom Domain Proxy
</h1>

<p align="center">Route Kuest services through your own Cloudflare domain.</p>

<p align="center">
  <a href="https://deploy.workers.cloudflare.com/?url=https://github.com/kuestcom/custom-domain">
    <img src="https://deploy.workers.cloudflare.com/button" alt="Deploy to Cloudflare" />
  </a>
</p>

Enter your domain when Cloudflare asks for `DOMAIN`. The deployment creates the Worker, DNS records, and certificates for every service in [`services.json`](services.json).

Cloudflare creates an independent copy, not a fork. Automatic Kuest updates are available only to GitHub forks with Actions enabled; the sync workflow preserves `DOMAIN`.

## Local development

```bash
npm install
npm run types
npm test
npm run check
```
