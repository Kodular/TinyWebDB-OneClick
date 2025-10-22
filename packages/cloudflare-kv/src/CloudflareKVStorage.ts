import { StoragePort, StoredData } from 'tinywebdb-core';

/**
 * Cloudflare KV Storage Adapter
 *
 * Implements StoragePort using Cloudflare Workers KV.
 * KV is a global, low-latency key-value store.
 *
 * Note: KV is eventually consistent, so recent writes may not be immediately visible.
 */
export class CloudflareKVStorage implements StoragePort {
  constructor(private readonly kv: KVNamespace) {}

  async get(tag: string): Promise<StoredData | null> {
    const value = await this.kv.get(tag, 'json');
    if (!value) {
      return null;
    }

    return StoredData.fromObject(value as { tag: string; value: string; date: string });
  }

  async set(tag: string, value: string): Promise<StoredData> {
    const data = new StoredData(tag, value);
    await this.kv.put(tag, JSON.stringify(data.toObject()));
    return data;
  }

  async delete(tag: string): Promise<boolean> {
    const exists = await this.kv.get(tag);
    if (!exists) {
      return false;
    }

    await this.kv.delete(tag);
    return true;
  }

  async list(): Promise<StoredData[]> {
    const { keys } = await this.kv.list();
    const entries: StoredData[] = [];

    // Fetch all values in parallel
    const promises = keys.map(async (key) => {
      const data = await this.get(key.name);
      if (data) {
        entries.push(data);
      }
    });

    await Promise.all(promises);

    // Sort by tag
    return entries.sort((a, b) => a.tag.localeCompare(b.tag));
  }
}
