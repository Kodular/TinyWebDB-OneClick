import { StoragePort, StoredData } from '@kodular/tinywebdb-core';

/**
 * Cloudflare D1 Storage Adapter
 *
 * Implements StoragePort using Cloudflare D1 (SQLite at the edge).
 * D1 provides strongly consistent SQL database with global replication.
 *
 * Benefits over KV:
 * - Strong consistency (no eventual consistency delays)
 * - SQL queries and transactions
 * - Better for structured data
 */
export class CloudflareD1Storage implements StoragePort {
  constructor(private readonly db: D1Database) {}

  async get(tag: string): Promise<StoredData | null> {
    const result = await this.db
      .prepare('SELECT tag, value, date FROM stored_data WHERE tag = ?')
      .bind(tag)
      .first<{ tag: string; value: string; date: string }>();

    if (!result) {
      return null;
    }

    return StoredData.fromObject(result);
  }

  async set(tag: string, value: string): Promise<StoredData> {
    const data = new StoredData(tag, value);
    const dateStr = data.date.toISOString();

    // Use INSERT OR REPLACE to handle both new entries and updates
    await this.db
      .prepare('INSERT OR REPLACE INTO stored_data (tag, value, date) VALUES (?, ?, ?)')
      .bind(tag, value, dateStr)
      .run();

    return data;
  }

  async delete(tag: string): Promise<boolean> {
    const result = await this.db
      .prepare('DELETE FROM stored_data WHERE tag = ?')
      .bind(tag)
      .run();

    // Check if any rows were affected
    return result.meta.changes > 0;
  }

  async list(): Promise<StoredData[]> {
    const result = await this.db
      .prepare('SELECT tag, value, date FROM stored_data ORDER BY tag ASC')
      .all<{ tag: string; value: string; date: string }>();

    return result.results.map((row) => StoredData.fromObject(row));
  }
}
