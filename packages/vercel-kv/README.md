# @tinywebdb/vercel-kv

TinyWebDB deployment for Vercel Edge Functions with KV storage.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FKodular%2FTinyWebDB-OneClick%2Ftree%2Fmain%2Fpackages%2Fvercel-kv&project-name=tinywebdb-vercel-kv&repository-name=tinywebdb-vercel-kv&stores=%5B%7B%22type%22%3A%22kv%22%7D%5D)

## Features

- **Global edge deployment**: Runs on Vercel's Edge Network
- **Low latency**: Redis-based KV storage with sub-millisecond reads
- **Free tier**: Generous limits on Vercel's Hobby plan
- **Serverless**: Automatic scaling with zero configuration

## Prerequisites

1. A Vercel account ([sign up for free](https://vercel.com/signup))
2. [Vercel CLI](https://vercel.com/docs/cli) installed (optional for manual deployment):
   ```bash
   npm install -g vercel
   ```

## Quick Deploy (Recommended)

The easiest way to deploy is using the one-click button:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FKodular%2FTinyWebDB-OneClick%2Ftree%2Fmain%2Fpackages%2Fvercel-kv&project-name=tinywebdb-vercel-kv&repository-name=tinywebdb-vercel-kv&stores=%5B%7B%22type%22%3A%22kv%22%7D%5D)

This will:
1. Clone the repository to your GitHub account
2. Create a new Vercel project
3. Automatically create a Vercel KV database
4. Deploy your TinyWebDB service

## Manual Setup

### 1. Install Dependencies

```bash
cd packages/vercel-kv
npm install
```

### 2. Create Vercel KV Database

Using Vercel CLI:

```bash
vercel link  # Link to your Vercel project
vercel kv create tinywebdb-kv  # Create KV database
```

Or via [Vercel Dashboard](https://vercel.com/dashboard):
1. Go to your project
2. Navigate to "Storage" tab
3. Create a new KV database
4. Name it `tinywebdb-kv`

### 3. Link Environment Variables

The KV database credentials will be automatically linked to your project. Verify by checking:

```bash
vercel env ls
```

You should see:
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`

### 4. Deploy

```bash
npm run deploy
```

Or using Vercel CLI:

```bash
vercel --prod
```

Your TinyWebDB service will be deployed to:
```
https://your-project-name.vercel.app
```

## Development

### Local Development

```bash
# Pull environment variables from Vercel
vercel env pull .env.local

# Start development server
npm run dev
```

This starts a local development server at `http://localhost:3000`.

### Build

```bash
npm run build
```

## API Endpoints

Once deployed, your service will have these endpoints:

### Store a value
```bash
curl -X POST https://your-project.vercel.app/storeavalue \
  -H "Content-Type: application/json" \
  -d '{"tag":"mykey","value":"myvalue"}'
```

### Get a value
```bash
curl -X POST https://your-project.vercel.app/getvalue \
  -H "Content-Type: application/json" \
  -d '{"tag":"mykey"}'
```

### Delete a value
```bash
curl -X POST https://your-project.vercel.app/deleteentry \
  -H "Content-Type: application/json" \
  -d '{"tag":"mykey"}'
```

## Configuration

### Custom Domain

To use a custom domain:

1. Go to your project settings in Vercel Dashboard
2. Navigate to "Domains"
3. Add your custom domain
4. Follow the DNS configuration instructions

### Environment-Specific Deployments

Vercel automatically creates preview deployments for each branch:

- **Production**: `main` branch → `your-project.vercel.app`
- **Preview**: Other branches → `your-project-git-branch.vercel.app`

To use different KV databases per environment:

1. Create separate KV databases (e.g., `tinywebdb-kv-prod`, `tinywebdb-kv-dev`)
2. Link them to specific branches in Vercel Dashboard
3. Configure environment variables per environment

## Pricing

Vercel KV pricing (as of 2024):

**Hobby (Free) plan:**
- 256 MB storage
- 3,000 commands/day
- Global replication

**Pro plan ($20/month):**
- 1 GB storage included
- 100,000 commands/day included
- Additional: $1/GB storage, $0.25 per 100K commands

See [Vercel KV pricing](https://vercel.com/docs/storage/vercel-kv/usage-and-pricing) for details.

## Limitations

- **Eventually consistent**: KV replication is eventually consistent across regions
- **Key size limit**: 1 KB
- **Value size limit**: 100 MB (JSON payload limits apply)
- **Command limit**: Free tier limited to 3,000 commands/day

## Troubleshooting

### "KV_REST_API_URL is not defined"

Make sure you've:
1. Created a Vercel KV database
2. Linked it to your project
3. Pulled environment variables locally: `vercel env pull .env.local`

### "Too Many Requests" error

You've hit the daily command limit. Either:
- Wait for the daily reset
- Upgrade to a paid plan
- Optimize your application to reduce KV operations

### Deployment fails

1. Ensure you're logged in: `vercel login`
2. Check that dependencies are installed: `npm install`
3. Verify your project is linked: `vercel link`

### CORS issues

If you need to enable CORS for browser requests, modify the response headers in `api/index.ts`:

```typescript
return new Response(httpResponse.body, {
  status: httpResponse.status,
  headers: {
    ...httpResponse.headers,
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  },
});
```

## License

MIT
