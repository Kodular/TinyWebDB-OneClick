/**
 * Main exports for TinyWebDB OneClick
 *
 * This module provides the cloud-agnostic core implementation.
 * Cloud-specific adapters (Cloudflare, Vercel, etc.) should import from here.
 */

// Domain layer
export { StoredData } from './domain/models/index.js';
export { TinyWebDBService } from './domain/services/index.js';
export type { StoreResult, GetResult } from './domain/services/index.js';
export type { StoragePort } from './domain/ports/index.js';

// Adapters
export { InMemoryStorage } from './adapters/storage/index.js';

// Application layer
export { Application } from './application/index.js';
export type { HttpRequest, HttpResponse, ErrorResponse } from './application/handlers/index.js';
