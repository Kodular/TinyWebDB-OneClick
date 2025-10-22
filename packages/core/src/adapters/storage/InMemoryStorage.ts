import { StoragePort } from '../../domain/ports';
import { StoredData } from '../../domain/models';

/**
 * In-Memory Storage Adapter
 *
 * Implements StoragePort using an in-memory Map.
 * Useful for development, testing, and serverless environments with short-lived instances.
 *
 * Note: Data is lost when the process terminates.
 */
export class InMemoryStorage implements StoragePort {
  private storage: Map<string, StoredData>;

  constructor() {
    this.storage = new Map();
  }

  async get(tag: string): Promise<StoredData | null> {
    return this.storage.get(tag) ?? null;
  }

  async set(tag: string, value: string): Promise<StoredData> {
    const data = new StoredData(tag, value);
    this.storage.set(tag, data);
    return data;
  }

  async delete(tag: string): Promise<boolean> {
    return this.storage.delete(tag);
  }

  async list(): Promise<StoredData[]> {
    return Array.from(this.storage.values()).sort((a, b) => a.tag.localeCompare(b.tag));
  }

  /**
   * Clears all stored data
   * Useful for testing
   */
  clear(): void {
    this.storage.clear();
  }

  /**
   * Returns the number of stored entries
   */
  size(): number {
    return this.storage.size;
  }
}
