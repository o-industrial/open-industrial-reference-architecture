/**
 * Descriptor defining metadata for an API endpoint.
 */
export interface ApiEndpointDescriptor {
  /**
   * HTTP method for the endpoint (e.g., GET, POST).
   */
  method: string;

  /**
   * Path where the endpoint is exposed.
   */
  path: string;

  /**
   * Flag indicating the endpoint uses Server-Sent Events.
   */
  sse?: boolean;

  /**
   * Flag indicating the endpoint uses WebSockets.
   */
  webSocket?: boolean;

  /**
   * Flag indicating the endpoint is a chat protocol.
   */
  chat?: boolean;

  /**
   * Flag indicating the endpoint triggers a cold path.
   */
  cold?: boolean;

  /**
   * Flag indicating the endpoint triggers a warm path.
   */
  warm?: boolean;
}
