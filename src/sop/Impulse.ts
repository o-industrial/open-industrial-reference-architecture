/**
 * An Impulse is the core execution message structure in OpenIndustrial.
 *
 * It represents an incoming observation, event, or declared intent.
 * Every impulse has:
 * - Headers: dynamic JSON metadata for routing, attribution, context
 * - Payload: the actual structured or unstructured data being carried
 */
export type Impulse<
  TPayload = unknown,
  THeaders extends Record<string, unknown> = Record<string, unknown>,
> = {
  /**
   * Metadata that describes the context, origin, or routing of the impulse.
   * Headers are fully dynamic and may contain strings, numbers, booleans, or complex objects.
   */
  Headers: THeaders;

  /**
   * The main content of the impulse—this may represent sensor data, user actions,
   * configuration changes, or system requests.
   */
  Payload: TPayload;
};
