# @tinywebdb/cloudflare-kv

TinyWebDB deployment for Cloudflare Workers with KV storage.

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Kodular/TinyWebDB-OneClick/tree/main/packages/cloudflare-kv)

## Features

- **Global edge deployment**: Runs on Cloudflare's global network
- **Low latency**: KV storage with sub-millisecond reads
- **Free tier**: 100,000 reads/day and 1,000 writes/day on free plan
- **Zero dependencies**: Only Cloudflare Workers runtime required

## Prerequisites

1. A Cloudflare account (free tier works!)
2. [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) installed:
   ```bash
   npm install -g wrangler
   ```

## Setup

### 1. Authenticate with Cloudflare

```bash
wrangler login
```

### 2. Create KV Namespace

```bash
cd packages/cloudflare-kv
wrangler kv:namespace create TINYWEBDB_KV
```

This will output something like:
```
🌀 Creating namespace with title "tinywebdb-TINYWEBDB_KV"
✨ Success!
Add the following to your configuration file in your kv_namespaces array:
{ binding = "TINYWEBDB_KV", id = "abc123..." }
```

### 3. Update wrangler.toml

Copy the `id` from the output and update `wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "TINYWEBDB_KV"
id = "YOUR_KV_NAMESPACE_ID"  # Replace with your actual ID
```

### 4. Deploy

```bash
npm run deploy
```

Your TinyWebDB service will be deployed to:
```
https://tinywebdb.YOUR_SUBDOMAIN.workers.dev
```

## Development

### Local Development

```bash
npm run dev
```

This starts a local development server with hot reloading.

### Build

```bash
npm run build
```

## API Endpoints

Once deployed, your service will have these endpoints:

### Store a value
```bash
curl -X POST https://tinywebdb.YOUR_SUBDOMAIN.workers.dev/storeavalue \
  -H "Content-Type: application/json" \
  -d '{"tag":"mykey","value":"myvalue"}'
```

### Get a value
```bash
curl -X POST https://tinywebdb.YOUR_SUBDOMAIN.workers.dev/getvalue \
  -H "Content-Type: application/json" \
  -d '{"tag":"mykey"}'
```

### Delete a value
```bash
curl -X POST https://tinywebdb.YOUR_SUBDOMAIN.workers.dev/deleteentry \
  -H "Content-Type: application/json" \
  -d '{"tag":"mykey"}'
```

## Configuration

### Custom Domain

To use a custom domain, update `wrangler.toml`:

```toml
routes = [
  { pattern = "tinywebdb.yourdomain.com", custom_domain = true }
]
```

### Environment Variables

For different environments (dev/staging/prod), you can create multiple configurations:

```toml
[env.production]
name = "tinywebdb-production"
[[env.production.kv_namespaces]]
binding = "TINYWEBDB_KV"
id = "YOUR_PRODUCTION_KV_ID"

[env.staging]
name = "tinywebdb-staging"
[[env.staging.kv_namespaces]]
binding = "TINYWEBDB_KV"
id = "YOUR_STAGING_KV_ID"
```

Deploy to a specific environment:
```bash
wrangler deploy --env production
```

## Pricing

Cloudflare Workers KV pricing (as of 2024):

**Free tier:**
- 100,000 reads/day
- 1,000 writes/day
- 1 GB stored data

**Paid plans:**
- $0.50 per million reads
- $5.00 per million writes
- $0.50 per GB-month of storage

See [Cloudflare pricing](https://developers.cloudflare.com/workers/platform/pricing/) for details.

## Limitations

- **Eventually consistent**: KV is eventually consistent, so recent writes may take up to 60 seconds to propagate globally
- **Key size limit**: 512 bytes
- **Value size limit**: 25 MB
- **List operations**: Limited to 1000 keys per list() call (automatically handled by the adapter)

## Troubleshooting

### "Error: No namespace with ID..."

Make sure you've created the KV namespace and updated the ID in `wrangler.toml`.

### "Error: Authentication required"

Run `wrangler login` to authenticate.

### Slow writes

KV is optimized for reads. If you need faster write propagation, consider using [Cloudflare D1](../cloudflare-d1/) instead.

## License

MIT
