/**
 * Vercel Function entry point for TinyWebDB with Blob storage
 * Uses Node.js Runtime (required for @vercel/blob compatibility)
 */

import { Application, HttpRequest } from '@kodular/tinywebdb-core';
import { VercelBlobStorage } from '../src/VercelBlobStorage.js';

/**
 * Converts Vercel Request to our cloud-agnostic HttpRequest
 */
async function toHttpRequest(request: Request): Promise<HttpRequest> {
  // Handle both full URLs and relative paths
  const requestUrl = request.url.startsWith('http')
    ? request.url
    : `https://dummy.local${request.url}`;
  const url = new URL(requestUrl);
  let body: Record<string, unknown> = {};

  if (request.method === 'POST') {
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      body = (await request.json()) as Record<string, unknown>;
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData();
      body = {};
      (formData as any).forEach((value: any, key: string) => {
        body[key] = value;
      });
    }
  }

  const query: Record<string, string> = {};
  (url.searchParams as any).forEach((value: string, key: string) => {
    query[key] = value;
  });

  return {
    method: request.method,
    path: url.pathname,
    body,
    query,
  };
}

/**
 * Converts our cloud-agnostic HttpResponse to Vercel Response
 */
function toVercelResponse(
  httpResponse: Awaited<ReturnType<Application['handleRequest']>>
): Response {
  return new Response(httpResponse.body, {
    status: httpResponse.status,
    headers: httpResponse.headers,
  });
}

/**
 * Vercel Function handler (Node.js Runtime)
 *
 * Note: @vercel/blob requires Node.js runtime and is not compatible with Edge runtime.
 * The Edge runtime doesn't support the Node.js built-in modules (stream, net, http, etc.)
 * that @vercel/blob depends on.
 */
export default async function handler(request: Request): Promise<Response> {
  try {
    // Initialize storage and application
    const storage = new VercelBlobStorage();
    const app = new Application(storage);

    // Convert request format
    const httpRequest = await toHttpRequest(request);

    // Handle request
    const httpResponse = await app.handleRequest(httpRequest);

    // Convert response format
    return toVercelResponse(httpResponse);
  } catch (error) {
    console.error('Function error:', error);
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
}
