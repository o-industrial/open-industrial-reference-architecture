/**
 * Configuration for a basic HTTP-push data connection.
 */

export type HTTPDataConnectionConfig = {
  /**
   * Expected HTTP method (POST by default).
   */
  Method?: 'POST' | 'PUT';

  /**
   * Optional headers the client must provide when pushing data.
   */
  RequiredHeaders?: Record<string, string>;
};
