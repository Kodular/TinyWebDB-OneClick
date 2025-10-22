# @tinywebdb/cloudflare-d1

TinyWebDB deployment for Cloudflare Workers with D1 (SQLite) storage.

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Kodular/TinyWebDB-OneClick/tree/main/packages/cloudflare-d1)

## Features

- **SQL database at the edge**: Full SQLite database capabilities
- **Strong consistency**: No eventual consistency delays (unlike KV)
- **ACID transactions**: Reliable data integrity
- **SQL queries**: Rich querying capabilities
- **Global replication**: Automatic replication across Cloudflare's network
- **Free tier**: 5 million reads/day and 100,000 writes/day

## When to Use D1 vs KV

**Choose D1 when:**
- You need strong consistency
- You want SQL querying capabilities
- You need transactions
- You have relational data

**Choose KV when:**
- You need the absolute lowest latency (sub-millisecond reads)
- You're okay with eventual consistency
- Simple key-value operations are sufficient

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

### 2. Create D1 Database

```bash
cd packages/cloudflare-d1
npm run db:create
```

This will output:
```
✅ Successfully created DB 'tinywebdb'
[[d1_databases]]
binding = "TINYWEBDB_D1"
database_name = "tinywebdb"
database_id = "abc123-def456-ghi789"
```

### 3. Update wrangler.toml

Copy the `database_id` from the output and update `wrangler.toml`:

```toml
[[d1_databases]]
binding = "TINYWEBDB_D1"
database_name = "tinywebdb"
database_id = "YOUR_D1_DATABASE_ID"  # Replace with your actual ID
```

### 4. Initialize Database Schema

```bash
npm run db:init
```

This creates the `stored_data` table in your D1 database.

### 5. Deploy

```bash
npm run deploy
```

Your TinyWebDB service will be deployed to:
```
https://tinywebdb-d1.YOUR_SUBDOMAIN.workers.dev
```

## Development

### Local Development

```bash
# First, initialize local database
npm run db:init:local

# Then start dev server
npm run dev
```

This starts a local development server with a local D1 database.

### Build

```bash
npm run build
```

## Database Management

### Execute SQL Queries

```bash
# Query remote database
wrangler d1 execute tinywebdb --command "SELECT * FROM stored_data LIMIT 10"

# Query local database
wrangler d1 execute tinywebdb --local --command "SELECT COUNT(*) FROM stored_data"
```

### Migrations

To modify the schema:

1. Create a new SQL file with your changes
2. Execute it against your database:
   ```bash
   wrangler d1 execute tinywebdb --file=./migrations/001_add_column.sql
   ```

### Backup and Restore

```bash
# Export data
wrangler d1 export tinywebdb --output=backup.sql

# Restore data
wrangler d1 execute tinywebdb --file=backup.sql
```

## API Endpoints

Once deployed, your service will have these endpoints:

### Store a value
```bash
curl -X POST https://tinywebdb-d1.YOUR_SUBDOMAIN.workers.dev/storeavalue \
  -H "Content-Type: application/json" \
  -d '{"tag":"mykey","value":"myvalue"}'
```

### Get a value
```bash
curl -X POST https://tinywebdb-d1.YOUR_SUBDOMAIN.workers.dev/getvalue \
  -H "Content-Type: application/json" \
  -d '{"tag":"mykey"}'
```

### Delete a value
```bash
curl -X POST https://tinywebdb-d1.YOUR_SUBDOMAIN.workers.dev/deleteentry \
  -H "Content-Type: application/json" \
  -d '{"tag":"mykey"}'
```

## Configuration

### Multiple Environments

```toml
[env.production]
name = "tinywebdb-d1-production"
[[env.production.d1_databases]]
binding = "TINYWEBDB_D1"
database_name = "tinywebdb-production"
database_id = "YOUR_PRODUCTION_D1_ID"

[env.staging]
name = "tinywebdb-d1-staging"
[[env.staging.d1_databases]]
binding = "TINYWEBDB_D1"
database_name = "tinywebdb-staging"
database_id = "YOUR_STAGING_D1_ID"
```

Deploy to a specific environment:
```bash
wrangler deploy --env production
```

## Pricing

Cloudflare D1 pricing (as of 2024):

**Free tier (Workers Free plan):**
- 5 million read queries/day
- 100,000 write queries/day
- 5 GB storage

**Paid plans (Workers Paid - $5/month):**
- First 25 billion reads free, then $0.001 per million
- First 50 million writes free, then $1.00 per million
- First 5 GB storage free, then $0.75 per GB-month

See [Cloudflare D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/) for details.

## Limitations

- **Database size limit**: 10 GB per database (contact Cloudflare for higher limits)
- **Query timeout**: 30 seconds per query
- **Max databases**: 50 per account (free), 500 per account (paid)
- **SQL features**: Most SQLite features supported, some limitations on certain functions

## Performance Comparison

| Storage | Read Latency | Write Latency | Consistency |
|---------|--------------|---------------|-------------|
| KV | <1ms | 1-60s propagation | Eventual |
| D1 | ~5ms | Immediate | Strong |

## Troubleshooting

### "Error: No database with ID..."

Make sure you've created the D1 database and updated the ID in `wrangler.toml`.

### "Error: table stored_data already exists"

The schema is already initialized. Skip the `db:init` step.

### "Error: no such table: stored_data"

Run `npm run db:init` to initialize the schema.

### Migrations not applying

Ensure you're running migrations against the correct database (local vs remote).

## License

MIT
