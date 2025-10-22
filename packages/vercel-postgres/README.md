# @tinywebdb/vercel-postgres

TinyWebDB deployment for Vercel Edge Functions with Postgres storage.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FKodular%2FTinyWebDB-OneClick%2Ftree%2Fmain%2Fpackages%2Fvercel-postgres&project-name=tinywebdb-vercel-postgres&repository-name=tinywebdb-vercel-postgres&stores=%5B%7B%22type%22%3A%22postgres%22%7D%5D)

## Features

- **Global edge deployment**: Runs on Vercel's Edge Network
- **Strong consistency**: PostgreSQL with ACID guarantees
- **Auto-scaling**: Serverless Postgres with connection pooling
- **SQL power**: Full PostgreSQL features (JSON, transactions, indexes)

## Prerequisites

1. A Vercel account ([sign up for free](https://vercel.com/signup))
2. [Vercel CLI](https://vercel.com/docs/cli) installed (optional for manual deployment):
   ```bash
   npm install -g vercel
   ```

## Quick Deploy (Recommended)

The easiest way to deploy is using the one-click button:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FKodular%2FTinyWebDB-OneClick%2Ftree%2Fmain%2Fpackages%2Fvercel-postgres&project-name=tinywebdb-vercel-postgres&repository-name=tinywebdb-vercel-postgres&stores=%5B%7B%22type%22%3A%22postgres%22%7D%5D)

This will:
1. Clone the repository to your GitHub account
2. Create a new Vercel project
3. Automatically create a Vercel Postgres database
4. Deploy your TinyWebDB service

## Manual Setup

### 1. Install Dependencies

```bash
cd packages/vercel-postgres
npm install
```

### 2. Create Vercel Postgres Database

Using Vercel CLI:

```bash
vercel link  # Link to your Vercel project
vercel postgres create tinywebdb-postgres  # Create Postgres database
```

Or via [Vercel Dashboard](https://vercel.com/dashboard):
1. Go to your project
2. Navigate to "Storage" tab
3. Create a new Postgres database
4. Name it `tinywebdb-postgres`

### 3. Initialize Database Schema

After creating the database, run the schema initialization:

```bash
# Pull environment variables
vercel env pull .env.local

# Connect to your database and run schema.sql
# Option 1: Using Vercel CLI
vercel postgres sql -- < src/schema.sql

# Option 2: Using psql
psql $POSTGRES_URL < src/schema.sql
```

### 4. Verify Environment Variables

Check that the database credentials are linked:

```bash
vercel env ls
```

You should see:
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NO_SSL`
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_USER`
- `POSTGRES_HOST`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`

### 5. Deploy

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

To use different databases per environment:

1. Create separate Postgres databases (e.g., `tinywebdb-prod`, `tinywebdb-dev`)
2. Link them to specific branches in Vercel Dashboard
3. Configure environment variables per environment

### Database Management

#### View data
```bash
vercel postgres psql
SELECT * FROM stored_data;
```

#### Backup database
```bash
pg_dump $POSTGRES_URL > backup.sql
```

#### Reset database
```bash
vercel postgres psql < src/schema.sql
```

## Pricing

Vercel Postgres pricing (as of 2024):

**Hobby (Free) plan:**
- 256 MB storage
- 60 compute hours/month
- Connection pooling included

**Pro plan ($20/month):**
- 512 MB storage included
- 100 compute hours/month included
- Additional: $0.10/GB storage, $0.10 per compute hour

See [Vercel Postgres pricing](https://vercel.com/docs/storage/vercel-postgres/usage-and-pricing) for details.

## Limitations

- **Storage limit**: Free tier limited to 256 MB
- **Compute hours**: Free tier limited to 60 hours/month
- **Connections**: Uses connection pooling (max connections vary by plan)

## Troubleshooting

### "POSTGRES_URL is not defined"

Make sure you've:
1. Created a Vercel Postgres database
2. Linked it to your project
3. Pulled environment variables locally: `vercel env pull .env.local`

### "relation 'stored_data' does not exist"

You need to run the schema initialization:
```bash
vercel postgres sql -- < src/schema.sql
```

### Connection timeout errors

The database might be sleeping (on free tier). The first request after idle time may be slow. Consider upgrading to a paid plan for always-active databases.

### "Too many connections"

You're hitting the connection limit. The adapter uses Vercel's automatic connection pooling, but you may need to:
- Upgrade your plan for more connections
- Optimize your queries
- Reduce concurrent requests

## License

MIT
