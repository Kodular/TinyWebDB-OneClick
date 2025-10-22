/**
 * StoredData model
 *
 * Represents a tag-value pair stored in TinyWebDB.
 * This model is immutable - all fields are readonly.
 */
export class StoredData {
  /**
   * Unique tag identifier for the data
   */
  readonly tag: string;

  /**
   * Value associated with the tag (stored as string)
   */
  readonly value: string;

  /**
   * Timestamp when the data was created or last updated
   */
  readonly date: Date;

  /**
   * Creates a StoredData instance
   *
   * @param tag - Tag to identify the data (cannot be empty)
   * @param value - Value to store
   * @param date - Creation/update timestamp (defaults to current time)
   */
  constructor(tag: string, value: string, date?: Date) {
    if (!tag || tag.trim().length === 0) {
      throw new Error('Tag cannot be empty');
    }

    this.tag = tag;
    this.value = value;
    this.date = date ?? new Date();
  }

  /**
   * Creates a StoredData instance from a plain object
   *
   * @param data - Plain object with tag, value, and optional date
   * @returns StoredData instance
   */
  static fromObject(data: {
    tag: string;
    value: string;
    date?: Date | string;
  }): StoredData {
    const date = data.date instanceof Date ? data.date : new Date(data.date ?? Date.now());
    return new StoredData(data.tag, data.value, date);
  }

  /**
   * Converts StoredData to a plain object
   *
   * @returns Plain object representation
   */
  toObject(): { tag: string; value: string; date: string } {
    return {
      tag: this.tag,
      value: this.value,
      date: this.date.toISOString(),
    };
  }
}
