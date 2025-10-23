# TinyWebDB OneClick

A modern, cloud-agnostic implementation of TinyWebDB for App Inventor with one-click deployments to multiple cloud
providers.

## What is TinyWebDB?

TinyWebDB is a simple key-value web service designed for [App Inventor for Android](http://appinventor.mit.edu/). It
provides a RESTful API for storing and retrieving tag-value pairs, making it easy for mobile apps to persist data in
the cloud.

[Original TinyWebDB Documentation (MIT)](https://ai2.appinventor.mit.edu/reference/other/tinywebdb.html)

## Quick Start

Pick the hosting and storage option that best fits your needs:

| Hosting               | Database            | Deploy                                                                                                                                                                                                                                                                                                                             |
|-----------------------|---------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Cloudflare Workers    | KV (Key-Value)      | [![Deploy](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Kodular/TinyWebDB-OneClick/tree/main/packages/cloudflare-kv)                                                                                                                                               |
| Cloudflare Workers    | D1 (SQLite)         | [![Deploy](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Kodular/TinyWebDB-OneClick/tree/main/packages/cloudflare-d1)                                                                                                                                               |
| Cloudflare Workers    | R2 (Object Storage) | [![Deploy](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Kodular/TinyWebDB-OneClick/tree/main/packages/cloudflare-r2)                                                                                                                                               |
| Vercel Edge Functions | KV (Redis)          | [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FKodular%2FTinyWebDB-OneClick%2Ftree%2Fmain%2Fpackages%2Fvercel-kv&project-name=tinywebdb-vercel-kv&repository-name=tinywebdb-vercel-kv&stores=%5B%7B%22type%22%3A%22kv%22%7D%5D)                         |
| Vercel Edge Functions | Postgres            | [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FKodular%2FTinyWebDB-OneClick%2Ftree%2Fmain%2Fpackages%2Fvercel-postgres&project-name=tinywebdb-vercel-postgres&repository-name=tinywebdb-vercel-postgres&stores=%5B%7B%22type%22%3A%22postgres%22%7D%5D) |
| Vercel Functions      | Blob Storage        | [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FKodular%2FTinyWebDB-OneClick%2Ftree%2Fmain%2Fpackages%2Fvercel-blob&project-name=tinywebdb-vercel-blob&repository-name=tinywebdb-vercel-blob&stores=%5B%7B%22type%22%3A%22blob%22%7D%5D)                 |

### Database Comparison

Note that Vercel does not "natively" offer a database option (except for the Blob storage). Instead, different
providers are offered in a marketplace.  
Still, 1-click deployments, but specific limits may vary from one option within the same "database type" to another
depending on the provider.

| Database            | Type           | Read Latency | Consistency | Max Value Size | Free Tier      |
|---------------------|----------------|--------------|-------------|----------------|----------------|
| **Cloudflare KV**   | Key-Value      | <1ms         | Eventual    | 25 MB          | 100K reads/day |
| **Cloudflare D1**   | SQLite         | ~5ms         | Strong      | ~1 GB          | 5M reads/day   |
| **Cloudflare R2**   | Object Storage | ~10ms        | Strong      | Unlimited      | 10 GB storage  |
| **Vercel KV**       | Redis          | <1ms         | Eventual    | _Depends_      | _Depends_      |
| **Vercel Postgres** | PostgreSQL     | ~5ms         | Strong      | _Depends_      | _Depends_      |
| **Vercel Blob**     | Object Storage | ~10ms        | Strong      | 500 MB/blob    | 100 MB storage |

**Detailed setup guides:**

- [Cloudflare KV Setup Guide](packages/cloudflare-kv/README.md)
- [Cloudflare D1 Setup Guide](packages/cloudflare-d1/README.md)
- [Cloudflare R2 Setup Guide](packages/cloudflare-r2/README.md)
- [Vercel KV Setup Guide](packages/vercel-kv/README.md)
- [Vercel Postgres Setup Guide](packages/vercel-postgres/README.md)
- [Vercel Blob Setup Guide](packages/vercel-blob/README.md)

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for:

- Development setup
- Architecture overview
- How to add new storage adapters
- Testing guidelines
- Pull request process

## License

MIT - See [LICENSE](LICENSE) file for details

## Credits

Based on the original [TinyWebDB](https://ai2.appinventor.mit.edu/reference/other/tinywebdb.html) by David Wolber and
Hal Abelson.
