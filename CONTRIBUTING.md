# Contributing to TinyWebDB OneClick

Thank you for your interest in contributing! This guide will help you set up your development environment and understand the project architecture.

## Architecture

This implementation follows **Ports and Adapters (Hexagonal) Architecture** to ensure complete separation between business logic and infrastructure:

```
┌─────────────────────────────────────────────┐
│    Cloud Providers (Cloudflare, Vercel)     │
└───────────────┬─────────────────────────────┘
                │
┌───────────────▼─────────────────────────────┐
│         Adapters (HTTP, Storage)            │
└───────────────┬─────────────────────────────┘
                │
┌───────────────▼─────────────────────────────┐
│      Ports (Interfaces/Contracts)           │
└───────────────┬─────────────────────────────┘
                │
┌───────────────▼─────────────────────────────┐
│   Domain (Business Logic - Cloud Agnostic)  │
└─────────────────────────────────────────────┘
```

### Key Principles

- **Cloud-agnostic core**: Business logic has zero dependencies on cloud providers
- **Dependency isolation**: Each deployment package only includes its required dependencies
- **Type-safe**: Full TypeScript with strict mode enabled
- **Well-tested**: Comprehensive test coverage across all layers

## Project Structure

This project uses a **monorepo with npm workspaces**:

```
packages/
├── core/                   # Cloud-agnostic core (zero cloud dependencies)
│   ├── src/
│   │   ├── domain/        # Business logic
│   │   │   ├── models/    # Domain models (StoredData)
│   │   │   ├── services/  # Business logic (TinyWebDBService)
│   │   │   └── ports/     # Interfaces (StoragePort)
│   │   ├── adapters/      # Infrastructure implementations
│   │   │   └── storage/   # In-memory storage adapter
│   │   └── application/   # HTTP handlers and routing
│   └── package.json       # @tinywebdb/core
│
├── cloudflare-kv/         # Cloudflare Workers + KV deployment
│   ├── src/
│   │   ├── index.ts      # Workers entry point
│   │   └── CloudflareKVStorage.ts
│   ├── wrangler.toml     # Cloudflare config
│   └── package.json      # Only Cloudflare dependencies
│
├── cloudflare-d1/         # Cloudflare Workers + D1 (SQLite)
│   ├── src/
│   │   ├── index.ts
│   │   ├── CloudflareD1Storage.ts
│   │   └── schema.sql    # Database schema
│   ├── wrangler.toml
│   └── package.json
│
└── cloudflare-r2/         # Cloudflare Workers + R2 (Object Storage)
    ├── src/
    │   ├── index.ts
    │   └── CloudflareR2Storage.ts
    ├── wrangler.toml
    └── package.json
```

## API Reference

All TinyWebDB deployments provide the same API, following the original TinyWebDB protocol:

### POST /storeavalue

Stores or updates a tag-value pair.

**Request:**
```json
{
  "tag": "myKey",
  "value": "myValue"
}
```

**Response:**
```json
["STORED", "myKey", "myValue"]
```

### POST /getvalue

Retrieves a value by its tag. Returns empty string if tag doesn't exist.

**Request:**
```json
{
  "tag": "myKey"
}
```

**Response (found):**
```json
["VALUE", "myKey", "myValue"]
```

**Response (not found):**
```json
["VALUE", "myKey", ""]
```

### POST /deleteentry

Deletes an entry by its tag.

**Request:**
```json
{
  "tag": "myKey"
}
```

**Response:**
```json
{
  "deleted": true,
  "tag": "myKey"
}
```

## Using with App Inventor

1. Deploy using one of the available options (KV, D1, or R2)
2. Copy your deployment URL (e.g., `https://tinywebdb.YOUR_SUBDOMAIN.workers.dev`)
3. In App Inventor, add a TinyWebDB component to your project
4. Set the ServiceURL property to your deployment URL
5. Use the `StoreValue`, `GetValue`, and `DeleteEntry` blocks in your app

For more information on using TinyWebDB in App Inventor, see the [official documentation](https://ai2.appinventor.mit.edu/reference/other/tinywebdb.html).

## Development Setup

### Prerequisites

- Node.js 24+
- npm (with workspaces support)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) (for Cloudflare deployments)

### Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/Kodular/TinyWebDB-OneClick.git
   cd TinyWebDB-OneClick
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build all packages**
   ```bash
   npm run build
   ```

4. **Run tests**
   ```bash
   npm run test
   ```

5. **Type check**
   ```bash
   npm run typecheck
   ```

### Development Workflow

#### Working with the Core Package

```bash
cd packages/core

# Run tests in watch mode
npm test

# Start local development server
npm run dev

# Build
npm run build
```

The dev server will start at `http://localhost:3000`.

#### Working with Cloudflare Packages

```bash
cd packages/cloudflare-kv  # or cloudflare-d1, cloudflare-r2

# Local development with Wrangler
npm run dev

# Build
npm run build

# Deploy to Cloudflare
npm run deploy
```

### Testing the API

Once the dev server is running (core or any Cloudflare package):

```bash
# Store a value
curl -X POST http://localhost:3000/storeavalue \
  -H "Content-Type: application/json" \
  -d '{"tag":"test","value":"hello"}'

# Get a value
curl -X POST http://localhost:3000/getvalue \
  -H "Content-Type: application/json" \
  -d '{"tag":"test"}'

# Delete a value
curl -X POST http://localhost:3000/deleteentry \
  -H "Content-Type: application/json" \
  -d '{"tag":"test"}'
```

## Adding a New Storage Adapter

To add support for a new storage backend (e.g., Vercel Blob, PostgreSQL, Redis):

### 1. Create a New Package

```bash
mkdir -p packages/your-adapter/src
cd packages/your-adapter
```

### 2. Implement the StoragePort Interface

Create `src/YourStorage.ts`:

```typescript
import { StoragePort, StoredData } from '@tinywebdb/core';

export class YourStorage implements StoragePort {
  async get(tag: string): Promise<StoredData | null> {
    // Your implementation
  }

  async set(tag: string, value: string): Promise<StoredData> {
    // Your implementation
  }

  async delete(tag: string): Promise<boolean> {
    // Your implementation
  }

  async list(): Promise<StoredData[]> {
    // Your implementation
  }
}
```

### 3. Create the Entry Point

Create `src/index.ts` that:
1. Imports your storage adapter
2. Creates an Application instance with your storage
3. Handles platform-specific request/response conversion

Example for a generic HTTP platform:

```typescript
import { Application, HttpRequest } from '@tinywebdb/core';
import { YourStorage } from './YourStorage';

export async function handler(request: PlatformRequest): Promise<PlatformResponse> {
  const storage = new YourStorage(/* config */);
  const app = new Application(storage);

  // Convert platform request to HttpRequest
  const httpRequest: HttpRequest = {
    method: request.method,
    path: request.path,
    body: await request.json(),
    query: request.queryParams,
  };

  // Handle request
  const httpResponse = await app.handleRequest(httpRequest);

  // Convert HttpResponse to platform response
  return new PlatformResponse(httpResponse.body, {
    status: httpResponse.status,
    headers: httpResponse.headers,
  });
}
```

### 4. Add package.json

```json
{
  "name": "@tinywebdb/your-adapter",
  "version": "1.0.0",
  "dependencies": {
    "@tinywebdb/core": "*",
    "your-platform-sdk": "^x.x.x"
  }
}
```

### 5. Write Tests

Create tests for your storage adapter:

```typescript
import { describe, it, expect } from 'vitest';
import { YourStorage } from './YourStorage';

describe('YourStorage', () => {
  it('should store and retrieve values', async () => {
    const storage = new YourStorage();
    await storage.set('test', 'value');
    const result = await storage.get('test');
    expect(result?.value).toBe('value');
  });
});
```

### 6. Update Root README

Add your adapter to the deployment options in the main README.

## Testing Guidelines

- All new features must include tests
- Aim for >80% code coverage
- Test both success and error cases
- Use descriptive test names

### Running Tests

```bash
# Run all tests
npm test

# Run tests for a specific package
npm test -w @tinywebdb/core

# Run tests in watch mode
npm test -- --watch

# Generate coverage report
npm run test:coverage -w @tinywebdb/core
```

## Code Style

- Use TypeScript strict mode
- Follow existing naming conventions
- Write clear, descriptive comments for public APIs
- Use JSDoc for all exported functions and classes

### Formatting

```bash
# Format all code
npm run format

# Lint code
npm run lint
```

## Pull Request Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and ensure they pass (`npm test`)
5. Run type checking (`npm run typecheck`)
6. Build all packages (`npm run build`)
7. Commit your changes (`git commit -m 'Add amazing feature'`)
8. Push to your branch (`git push origin feature/amazing-feature`)
9. Open a Pull Request

### PR Requirements

- All tests must pass
- Code must be properly formatted
- New features must include tests
- Update documentation if needed

## Architecture Decisions

### Why Ports and Adapters?

- **Testability**: Core logic can be tested with in-memory adapters
- **Flexibility**: Easy to add new cloud providers or storage backends
- **Maintainability**: Changes to infrastructure don't affect business logic
- **Portability**: Deploy to any platform without modifying core code

### Why Monorepo?

- **Code sharing**: Core package is shared across all deployments
- **Type safety**: TypeScript works across workspace boundaries
- **Atomic changes**: Update core and adapters together
- **Dependency isolation**: Each deployment only bundles what it needs

### Why npm Workspaces?

- Built into npm (no additional tools needed)
- Simple configuration
- Good IDE support
- Industry standard

## Questions?

Feel free to open an issue for:
- Bug reports
- Feature requests
- Architecture questions
- Documentation improvements

## License

MIT - See LICENSE file for details
