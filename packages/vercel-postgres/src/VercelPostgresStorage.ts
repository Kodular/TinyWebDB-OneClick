import { StoragePort, StoredData } from '@kodular/tinywebdb-core';
import { sql } from '@vercel/postgres';

/**
 * Vercel Postgres Storage Adapter
 *
 * Implements StoragePort using Vercel Postgres (Serverless PostgreSQL).
 * Vercel Postgres provides strongly consistent SQL database with auto-scaling.
 *
 * Benefits:
 * - Strong consistency (no eventual consistency delays)
 * - Full PostgreSQL feature set (JSON, transactions, etc.)
 * - Auto-scaling and connection pooling
 * - Better for structured and relational data
 */
export class VercelPostgresStorage implements StoragePort {
  async get(tag: string): Promise<StoredData | null> {
    const result = await sql`
      SELECT tag, value, date
      FROM stored_data
      WHERE tag = ${tag}
    `;

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return StoredData.fromObject({
      tag: row.tag as string,
      value: row.value as string,
      date: (row.date as Date).toISOString(),
    });
  }

  async set(tag: string, value: string): Promise<StoredData> {
    const data = new StoredData(tag, value);
    const dateStr = data.date.toISOString();

    // Use INSERT ... ON CONFLICT to handle both new entries and updates
    await sql`
      INSERT INTO stored_data (tag, value, date)
      VALUES (${tag}, ${value}, ${dateStr})
      ON CONFLICT (tag)
      DO UPDATE SET value = ${value}, date = ${dateStr}
    `;

    return data;
  }

  async delete(tag: string): Promise<boolean> {
    const result = await sql`
      DELETE FROM stored_data
      WHERE tag = ${tag}
    `;

    // Check if any rows were affected
    return (result.rowCount ?? 0) > 0;
  }

  async list(): Promise<StoredData[]> {
    const result = await sql`
      SELECT tag, value, date
      FROM stored_data
      ORDER BY tag ASC
    `;

    return result.rows.map((row) =>
      StoredData.fromObject({
        tag: row.tag as string,
        value: row.value as string,
        date: (row.date as Date).toISOString(),
      })
    );
  }
}
