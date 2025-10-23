/**
 * Vercel Edge Function entry point for TinyWebDB with KV storage
 */

import { Application, HttpRequest } from '@kodular/tinywebdb-core';
import { kv } from '@vercel/kv';
import { VercelKVStorage } from '../src/VercelKVStorage';

/**
 * Converts Vercel Request to our cloud-agnostic HttpRequest
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
 * Vercel Edge Function handler
 */
export default async function handler(request: Request): Promise<Response> {
  try {
    // Initialize storage and application
    const storage = new VercelKVStorage(kv);
    const app = new Application(storage);

    // Convert request format
    const httpRequest = await toHttpRequest(request);

    // Handle request
    const httpResponse = await app.handleRequest(httpRequest);

    // Convert response format
    return toVercelResponse(httpResponse);
  } catch (error) {
    console.error('Edge function error:', error);
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

/**
 * Configure this function to run on the Edge runtime
 */
export const config = {
  runtime: 'edge',
};
