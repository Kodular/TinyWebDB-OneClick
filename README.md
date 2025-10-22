# TinyWebDB OneClick

A modern, cloud-agnostic implementation of TinyWebDB for App Inventor with one-click deployments to multiple cloud
providers.

## What is TinyWebDB?

TinyWebDB is a simple key-value web service designed for [App Inventor for Android](http://appinventor.mit.edu/). It
provides a RESTful API for storing and retrieving tag-value pairs, making it easy for mobile apps to persist data in
the cloud.

[Original TinyWebDB Documentation (MIT)](https://ai2.appinventor.mit.edu/reference/other/tinywebdb.html)

## Quick Start

### 1. Install Dependencies

```bash
npm install
npm run build
```

### 2. Choose Your Deployment

Pick the storage option that best fits your needs:

## Storage Comparison

| Storage | Read Latency | Consistency | Max Value Size | Free Tier      | Best For               | Deploy |
|---------|--------------|-------------|----------------|----------------|------------------------|--------|
| **KV**  | <1ms         | Eventual    | 25 MB          | 100K reads/day | Fast, simple key-value | [![Deploy](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Kodular/TinyWebDB-OneClick/tree/main/packages/cloudflare-kv) |
| **D1**  | ~5ms         | Strong      | ~1 GB          | 5M reads/day   | Strong consistency     | [![Deploy](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Kodular/TinyWebDB-OneClick/tree/main/packages/cloudflare-d1) |
| **R2**  | ~10ms        | Strong      | Unlimited      | 10 GB storage  | Large values           | [![Deploy](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Kodular/TinyWebDB-OneClick/tree/main/packages/cloudflare-r2) |

**Detailed setup guides:**

- [KV Setup Guide](packages/cloudflare-kv/README.md)
- [D1 Setup Guide](packages/cloudflare-d1/README.md)
- [R2 Setup Guide](packages/cloudflare-r2/README.md)

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
