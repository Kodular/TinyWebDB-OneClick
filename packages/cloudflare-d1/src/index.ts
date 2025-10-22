/**
 * Cloudflare Workers entry point for TinyWebDB with D1 storage
 */

import { Application, HttpRequest } from '@kodular/tinywebdb-core';
import { CloudflareD1Storage } from './CloudflareD1Storage';

/**
 * Cloudflare Workers environment bindings
 */
export interface Env {
  TINYWEBDB_D1: D1Database;
}

/**
 * Converts Cloudflare Request to our cloud-agnostic HttpRequest
 */
async function toHttpRequest(request: Request): Promise<HttpRequest> {
  const url = new URL(request.url);
  let body: Record<string, unknown> = {};

  if (request.method === 'POST') {
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      body = (await request.json()) as Record<string, unknown>;
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData();
      body = {};
      for (const [key, value] of formData.entries()) {
        body[key] = value;
      }
    }
  }

  const query: Record<string, string> = {};
  for (const [key, value] of url.searchParams.entries()) {
    query[key] = value;
  }

  return {
    method: request.method,
    path: url.pathname,
    body,
    query,
  };
}

/**
 * Converts our cloud-agnostic HttpResponse to Cloudflare Response
 */
function toCloudflareResponse(
  httpResponse: Awaited<ReturnType<Application['handleRequest']>>
): Response {
  return new Response(httpResponse.body, {
    status: httpResponse.status,
    headers: httpResponse.headers,
  });
}

/**
 * Cloudflare Workers fetch handler
 */
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      // Initialize storage and application
      const storage = new CloudflareD1Storage(env.TINYWEBDB_D1);
      const app = new Application(storage);

      // Convert request format
      const httpRequest = await toHttpRequest(request);

      // Handle request
      const httpResponse = await app.handleRequest(httpRequest);

      // Convert response format
      return toCloudflareResponse(httpResponse);
    } catch (error) {
      console.error('Worker error:', error);
      return new Response(
        JSON.stringify({
          error: 'Internal Server Error',
          message: error instanceof Error ? error.message : 'Unknown error',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  },
};
