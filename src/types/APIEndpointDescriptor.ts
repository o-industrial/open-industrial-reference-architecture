/**
 * Descriptor defining metadata for an API endpoint.
 */
export interface APIEndpointDescriptor {
  /**
   * HTTP method for the endpoint (e.g., GET, POST).
   */
  Method: string;

  /**
   * Path where the endpoint is exposed.
   */
  Path: string;

  /**
   * Flag indicating the endpoint uses Server-Sent Events.
   */
  SSE?: boolean;

  /**
   * Flag indicating the endpoint uses WebSockets.
   */
  WebSocket?: boolean;

  /**
   * Flag indicating the endpoint is a chat protocol.
   */
  Chat?: boolean;

  /**
   * Flag indicating the endpoint triggers a cold path.
   */
  Cold?: boolean;

  /**
   * Flag indicating the endpoint triggers a warm path.
   */
  Warm?: boolean;
}
