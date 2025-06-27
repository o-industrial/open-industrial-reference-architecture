/**
 * Internal interface representing the subset of HTTP helper methods exposed to subclients.
 *
 * These provide the ability to:
 * - Construct scoped request URLs
 * - Inject authorization headers
 * - Parse JSON responses safely
 */

export interface ClientHelperBridge {
  url(path: string | URL): string | URL;
  headers(extra?: HeadersInit): HeadersInit;
  json<T>(response: Response): Promise<T>;
  token(): string;
}
