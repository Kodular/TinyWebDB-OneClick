# @tinywebdb/vercel-blob

TinyWebDB deployment for Vercel Edge Functions with Blob storage.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FKodular%2FTinyWebDB-OneClick%2Ftree%2Fmain%2Fpackages%2Fvercel-blob&project-name=tinywebdb-vercel-blob&repository-name=tinywebdb-vercel-blob&stores=%5B%7B%22type%22%3A%22blob%22%7D%5D)

## Features

- **Global edge deployment**: Runs on Vercel's Edge Network
- **Unlimited storage**: No size limits for individual values
- **CDN distribution**: Automatic global content delivery
- **Cost-effective**: Pay only for what you use

## Prerequisites

1. A Vercel account ([sign up for free](https://vercel.com/signup))
2. [Vercel CLI](https://vercel.com/docs/cli) installed (optional for manual deployment):
   ```bash
   npm install -g vercel
   ```

## Quick Deploy (Recommended)

The easiest way to deploy is using the one-click button:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FKodular%2FTinyWebDB-OneClick%2Ftree%2Fmain%2Fpackages%2Fvercel-blob&project-name=tinywebdb-vercel-blob&repository-name=tinywebdb-vercel-blob&stores=%5B%7B%22type%22%3A%22blob%22%7D%5D)

This will:
1. Clone the repository to your GitHub account
2. Create a new Vercel project
3. Automatically create a Vercel Blob store
4. Deploy your TinyWebDB service

## Manual Setup

### 1. Install Dependencies

```bash
cd packages/vercel-blob
npm install
```

### 2. Create Vercel Blob Store

Using Vercel CLI:

```bash
vercel link  # Link to your Vercel project
vercel blob create tinywebdb-blob  # Create Blob store
```

Or via [Vercel Dashboard](https://vercel.com/dashboard):
1. Go to your project
2. Navigate to "Storage" tab
3. Create a new Blob store
4. Name it `tinywebdb-blob`

### 3. Link Environment Variables

The Blob store credentials will be automatically linked to your project. Verify by checking:

```bash
vercel env ls
```

You should see:
- `BLOB_READ_WRITE_TOKEN`

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

To use different Blob stores per environment:

1. Create separate Blob stores (e.g., `tinywebdb-prod`, `tinywebdb-dev`)
2. Link them to specific branches in Vercel Dashboard
3. Configure environment variables per environment

### Blob Management

#### List all blobs
```bash
vercel blob list
```

#### Delete a specific blob
```bash
vercel blob delete <blob-url>
```

#### Get blob metadata
```bash
vercel blob get <blob-url>
```

## Pricing

Vercel Blob pricing (as of 2024):

**Hobby (Free) plan:**
- 100 MB storage
- 1 GB bandwidth/month
- Public access included

**Pro plan ($20/month):**
- 100 GB storage included
- 1 TB bandwidth/month included
- Additional: $0.15/GB storage, $0.15/GB bandwidth

See [Vercel Blob pricing](https://vercel.com/docs/storage/vercel-blob/usage-and-pricing) for details.

## Limitations

- **Storage limit**: Free tier limited to 100 MB
- **Bandwidth**: Free tier limited to 1 GB/month
- **File size**: Individual blobs can be up to 500 MB (with multipart upload)

## Troubleshooting

### "BLOB_READ_WRITE_TOKEN is not defined"

Make sure you've:
1. Created a Vercel Blob store
2. Linked it to your project
3. Pulled environment variables locally: `vercel env pull .env.local`

### "Storage quota exceeded"

You've hit the storage limit. Either:
- Delete unused blobs
- Upgrade to a paid plan
- Optimize your data storage

### "Bandwidth quota exceeded"

You've hit the monthly bandwidth limit. Either:
- Wait for the monthly reset
- Upgrade to a paid plan
- Reduce the number of requests

### Slow initial reads

Blob data is distributed via CDN. The first read from a new region may be slower, but subsequent reads will be cached and faster.

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

## Use Cases

Vercel Blob is ideal for:
- **Large values**: Storing data > 25 MB (KV limit)
- **File storage**: Images, documents, media files
- **Cost-sensitive**: Applications with large storage needs
- **CDN delivery**: Content that benefits from global distribution

## License

MIT
