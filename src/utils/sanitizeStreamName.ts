/**
 * Convert dot- and slash-based stream names to NATS-safe dash-separated names.
 */

export function sanitizeStreamName(name: string): string {
  return name.replace(/[.\s\/]+/g, '-');
}
