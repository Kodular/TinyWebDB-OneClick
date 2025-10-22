# @tinywebdb/cloudflare-r2

TinyWebDB deployment for Cloudflare Workers with R2 (Object Storage).

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Kodular/TinyWebDB-OneClick/tree/main/packages/cloudflare-r2)

## Features

- **Unlimited storage**: No size limits (unlike KV's 25MB per value)
- **Zero egress fees**: No charges for data retrieval
- **S3-compatible**: Standard object storage interface
- **Cost-effective**: $0.015 per GB-month storage
- **Automatic global replication**: Data replicated across Cloudflare's network
- **Free tier**: 10 GB storage, 1 million Class A operations, 10 million Class B operations

## When to Use R2 vs KV vs D1

**Choose R2 when:**
- You need to store large values (>25MB)
- Storage cost is a concern (R2 is very cheap)
- You need unlimited storage capacity
- You're storing binary data or large JSON/text

**Choose KV when:**
- You need sub-millisecond read latency
- Values are small (<25MB)
- Simple key-value operations

**Choose D1 when:**
- You need SQL queries and transactions
- You need strong consistency
- You have relational data

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

### 2. Create R2 Bucket

```bash
cd packages/cloudflare-r2
wrangler r2 bucket create tinywebdb
```

This will create an R2 bucket named `tinywebdb`.

### 3. Update wrangler.toml (if needed)

The default configuration should work, but you can customize the bucket name in `wrangler.toml`:

```toml
[[r2_buckets]]
binding = "TINYWEBDB_R2"
bucket_name = "tinywebdb"  # Your bucket name
```

### 4. Deploy

```bash
npm run deploy
```

Your TinyWebDB service will be deployed to:
```
https://tinywebdb-r2.YOUR_SUBDOMAIN.workers.dev
```

## Development

### Local Development

```bash
npm run dev
```

This starts a local development server. Note: R2 buckets are emulated locally but don't persist between restarts.

### Build

```bash
npm run build
```

## R2 Bucket Management

### List buckets

```bash
wrangler r2 bucket list
```

### List objects in a bucket

```bash
wrangler r2 object list tinywebdb
```

### Delete a bucket

```bash
wrangler r2 bucket delete tinywebdb
```

**Warning:** This deletes all objects in the bucket!

### Get object info

```bash
wrangler r2 object get tinywebdb data/mykey
```

## API Endpoints

Once deployed, your service will have these endpoints:

### Store a value
```bash
curl -X POST https://tinywebdb-r2.YOUR_SUBDOMAIN.workers.dev/storeavalue \
  -H "Content-Type: application/json" \
  -d '{"tag":"mykey","value":"myvalue"}'
```

### Get a value
```bash
curl -X POST https://tinywebdb-r2.YOUR_SUBDOMAIN.workers.dev/getvalue \
  -H "Content-Type: application/json" \
  -d '{"tag":"mykey"}'
```

### Delete a value
```bash
curl -X POST https://tinywebdb-r2.YOUR_SUBDOMAIN.workers.dev/deleteentry \
  -H "Content-Type: application/json" \
  -d '{"tag":"mykey"}'
```

## Storage Strategy

This adapter uses the following storage strategy:

1. **Data objects**: Each tag-value pair is stored as `data/{tag}`
2. **Index object**: A special object `__tinywebdb_index__` maintains a list of all tags
3. **Metadata**: The timestamp is stored in R2 custom metadata

This approach provides:
- Efficient individual get/set operations
- Fast listing via the index
- No size limits per value

## Configuration

### Multiple Environments

```toml
[env.production]
name = "tinywebdb-r2-production"
[[env.production.r2_buckets]]
binding = "TINYWEBDB_R2"
bucket_name = "tinywebdb-production"

[env.staging]
name = "tinywebdb-r2-staging"
[[env.staging.r2_buckets]]
binding = "TINYWEBDB_R2"
bucket_name = "tinywebdb-staging"
```

Deploy to a specific environment:
```bash
wrangler deploy --env production
```

### CORS Configuration

If you need to access R2 directly from browsers, configure CORS:

```bash
# Create cors.json
cat > cors.json << EOF
[
  {
    "AllowedOrigins": ["https://example.com"],
    "AllowedMethods": ["GET", "PUT", "DELETE"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3000
  }
]
EOF

# Apply CORS rules
wrangler r2 bucket cors put tinywebdb --rules cors.json
```

## Pricing

Cloudflare R2 pricing (as of 2024):

**Free tier (included with Workers):**
- 10 GB storage/month
- 1 million Class A operations/month (writes, lists)
- 10 million Class B operations/month (reads)

**Paid usage:**
- **Storage**: $0.015 per GB-month (~7x cheaper than S3)
- **Class A operations** (writes): $4.50 per million
- **Class B operations** (reads): $0.36 per million
- **Egress**: FREE (unlike S3!)

See [Cloudflare R2 pricing](https://developers.cloudflare.com/r2/pricing/) for details.

## Performance Comparison

| Operation | KV | D1 | R2 |
|-----------|----|----|-----|
| Read latency | <1ms | ~5ms | ~10ms |
| Write latency | 1-60s propagation | Immediate | Immediate |
| Consistency | Eventual | Strong | Strong |
| Max value size | 25 MB | ~1 GB (practical) | Unlimited |
| Cost (storage) | $0.50/GB | $0.75/GB | $0.015/GB |

## Limitations

- **List operations**: The index approach requires maintaining a separate index object
- **Atomic operations**: While R2 operations are atomic, the index update is a separate operation (eventual consistency for lists)
- **Object count**: No hard limit, but very large indexes (>100K tags) may be slow to update

## Optimization Tips

1. **Batch operations**: If you need to write many values, batch them to reduce Class A operations
2. **Large values**: R2 excels with large values - use it for values >1MB
3. **Index optimization**: For extremely large datasets, consider sharding the index or using D1 for indexing

## Troubleshooting

### "Error: Bucket not found"

Make sure you've created the R2 bucket and the name in `wrangler.toml` matches.

### Slow list operations

If you have many tags (>10,000), list operations may be slow. Consider using D1 for indexing or implementing pagination.

### Index corruption

If the index gets out of sync, you can rebuild it by listing all objects:

```bash
wrangler r2 object list tinywebdb --prefix=data/
```

Then manually recreate the index object.

## License

MIT
