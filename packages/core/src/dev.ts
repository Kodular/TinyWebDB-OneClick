/**
 * Development server
 *
 * Simple Node.js HTTP server for local development and testing.
 * This is NOT used in production deployments.
 */

import { createServer, IncomingMessage, ServerResponse } from 'http';
import { Application } from './application';
import { InMemoryStorage } from './adapters/storage';
import { HttpRequest } from './application/handlers';

const PORT = process.env.PORT ?? 3000;

// Create application with in-memory storage
const storage = new InMemoryStorage();
const app = new Application(storage);

// Create HTTP server
const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
  try {
    // Parse request body
    const body = await parseBody(req);

    // Convert Node.js request to our cloud-agnostic format
    const request: HttpRequest = {
      method: req.method ?? 'GET',
      path: req.url ?? '/',
      body: body,
      query: parseQuery(req.url ?? ''),
    };

    // Handle request
    const response = await app.handleRequest(request);

    // Send response
    res.writeHead(response.status, response.headers);
    res.end(response.body);
  } catch (error) {
    console.error('Request error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      })
    );
  }
});

server.listen(PORT, () => {
  console.log(`TinyWebDB development server running at http://localhost:${PORT}`);
  console.log('\nAvailable endpoints:');
  console.log('  POST /storeavalue - Store a tag-value pair');
  console.log('  POST /getvalue    - Retrieve a value by tag');
  console.log('  POST /deleteentry - Delete an entry by tag');
  console.log('\nPress Ctrl+C to stop');
});

/**
 * Parses request body from Node.js IncomingMessage
 */
async function parseBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        if (!body) {
          resolve({});
          return;
        }

        // Try to parse as JSON
        if (req.headers['content-type']?.includes('application/json')) {
          resolve(JSON.parse(body));
          return;
        }

        // Try to parse as form data
        if (req.headers['content-type']?.includes('application/x-www-form-urlencoded')) {
          const params = new URLSearchParams(body);
          const result: Record<string, unknown> = {};
          for (const [key, value] of params.entries()) {
            result[key] = value;
          }
          resolve(result);
          return;
        }

        // Default to JSON parsing
        resolve(JSON.parse(body));
      } catch (error) {
        reject(new Error('Failed to parse request body'));
      }
    });

    req.on('error', reject);
  });
}

/**
 * Parses query parameters from URL
 */
function parseQuery(url: string): Record<string, string> {
  const queryStart = url.indexOf('?');
  if (queryStart === -1) {
    return {};
  }

  const queryString = url.slice(queryStart + 1);
  const params = new URLSearchParams(queryString);
  const result: Record<string, string> = {};

  for (const [key, value] of params.entries()) {
    result[key] = value;
  }

  return result;
}
