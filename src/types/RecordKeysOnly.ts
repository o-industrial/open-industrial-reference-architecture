/**
 * Utility: Extract only those keys of T that are Record<string, U>
 */

export type RecordKeysOnly<T> = {
  [K in keyof T]: T[K] extends Record<string, unknown> ? K : never;
}[keyof T];
