import { StoragePort, StoredData } from 'tinywebdb-core';
import type { VercelKV } from '@vercel/kv';

/**
 * Vercel KV Storage Adapter
 *
 * Implements StoragePort using Vercel KV (Redis-based key-value store).
 * Vercel KV provides low-latency, globally distributed storage.
 *
 * Note: Vercel KV is eventually consistent across regions.
 */
export class VercelKVStorage implements StoragePort {
  constructor(private readonly kv: VercelKV) {}

  async get(tag: string): Promise<StoredData | null> {
    const value = await this.kv.get<{ tag: string; value: string; date: string }>(tag);
    if (!value) {
      return null;
    }

    return StoredData.fromObject(value);
  }

  async set(tag: string, value: string): Promise<StoredData> {
    const data = new StoredData(tag, value);
    await this.kv.set(tag, data.toObject());
    return data;
  }

  async delete(tag: string): Promise<boolean> {
    const exists = await this.kv.exists(tag);
    if (!exists) {
      return false;
    }

    await this.kv.del(tag);
    return true;
  }

  async list(): Promise<StoredData[]> {
    // Vercel KV uses SCAN to iterate through keys
    const keys: string[] = [];
    let cursor = '0';

    do {
      const [nextCursor, scanKeys] = await this.kv.scan(cursor, { count: 100 });
      keys.push(...scanKeys);
      cursor = nextCursor;
    } while (cursor !== '0');

    const entries: StoredData[] = [];

    // Fetch all values in parallel
    const promises = keys.map(async (key) => {
      const data = await this.get(key);
      if (data) {
        entries.push(data);
      }
    });

    await Promise.all(promises);

    // Sort by tag
    return entries.sort((a, b) => a.tag.localeCompare(b.tag));
  }
}
