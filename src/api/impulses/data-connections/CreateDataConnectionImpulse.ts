/**
 * Represents a request to create a new data connection.
 * This is the entrypoint into the OpenIndustrial system
 * for registering a stream of incoming telemetry.
 */
export type CreateDataConnectionImpulse = {
  /**
   * A user-defined name for this connection.
   * Used for display and identification purposes.
   */
  Name: string;

  /**
   * The type of data source this connection references.
   * Must be either:
   * - "data-hub": For Azure IoT/Event Hub-style streams
   * - "http": For HTTP-based push models
   */
  SourceType: 'data-hub' | 'http';
};
