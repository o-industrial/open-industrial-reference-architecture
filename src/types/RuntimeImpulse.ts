/**
 * Common properties shared by all runtime impulses.
 */
export type BaseImpulseFields = {
  /**
   * The collectin of headers for the impulse.
   */
  Headers: Record<string, string>;

  /**
   * The unique ID that identifies this impulse.
   */
  ID: string;

  /**
   * Timestamp of when the impulse occurred (ISO 8601 format).
   */
  Timestamp: string;

  /**
   * Calculated confidence level (0.0–1.0), used for UI display.
   */
  Confidence: number;

  /**
   * The metadta for an impulse.
   */
  Metadata: RuntimeImpulseMetadata;

  /**
   * Raw payload data associated with the impulse.
   */
  Payload: Record<string, unknown>;

  /**
   * Identifier for this impulse source.
   */
  Source: RuntimeImpulseSources;

  /**
   * Impulse subject.
   */
  Subject: string;
};

type impulseSources =
  | DataConnectionImpulse
  | SignalImpulse
  | SurfaceAgentImpulse
  | SurfaceConnectionImpulse
  | SurfaceSchemaImpulse
  | SurfaceWarmQueryImpulse
  | SurfaceInterfaceImpulse
  | SystemImpulse;

export type RuntimeImpulseMetadata = impulseSources['Metadata'];

export type RuntimeImpulseSources = impulseSources['Source'];

/**
 * A unified runtime impulse, discriminated by the `Source` property and extended with shared fields.
 */
export type RuntimeImpulse = impulseSources & BaseImpulseFields;

/**
 * An impulse emitted directly from a global or edge-level DataConnection.
 */
export type DataConnectionImpulse = {
  /**
   * Identifier for this impulse source.
   */
  Source: 'DataConnection';

  /**
   * Connection context for this impulse.
   */
  Metadata?: {
    /**
     * Lookup key for the DataConnection (typically a GUID or short ID).
     */
    ConnectionLookup: string;
  };
};

/**
 * An impulse emitted from a Surface-scoped DataConnection.
 */
export type SurfaceConnectionImpulse = {
  /**
   * Identifier for this impulse source.
   */
  Source: 'SurfaceConnection';

  /**
   * Surface and connection identifiers for source mapping.
   */
  Metadata?: {
    /**
     * Lookup key for the Surface where the connection is defined.
     */
    SurfaceLookup: string;

    /**
     * Lookup key for the scoped DataConnection.
     */
    ConnectionLookup: string;
  };
};

/**
 * An impulse that represents a schema transformation or enrichment event.
 */
export type SurfaceSchemaImpulse = {
  /**
   * Identifier for this impulse source.
   */
  Source: 'SurfaceSchema';

  /**
   * Schema execution context on a given surface.
   */
  Metadata?: {
    /**
     * Surface where the schema is executed.
     */
    SurfaceLookup: string;

    /**
     * Schema identifier (typically a short-form ID or key).
     */
    SchemaLookup: string;
  };
};

/**
 * An impulse emitted from an Agent logic execution event.
 */
export type SurfaceAgentImpulse = {
  /**
   * Identifier for this impulse source.
   */
  Source: 'SurfaceAgent';

  /**
   * Agent context and matched schema for this impulse.
   */
  Metadata?: {
    /**
     * Surface where the agent is defined.
     */
    SurfaceLookup: string;

    /**
     * Unique agent identifier (often a short slug or UUID).
     */
    AgentLookup: string;

    /**
     * Lookup key of the schema matched for input resolution.
     */
    MatchedSchemaLookup: string;
  };
};

/**
 * An impulse emitted by a WarmQuery (predefined structured query).
 */
export type SurfaceWarmQueryImpulse = {
  /**
   * Identifier for this impulse source.
   */
  Source: 'SurfaceWarmQuery';

  /**
   * Execution context of the query.
   */
  Metadata?: {
    /**
     * Surface where the query is defined.
     */
    SurfaceLookup: string;

    /**
     * Unique query lookup (registered in schema or memory).
     */
    WarmQueryLookup: string;
  };
};

export type SurfaceInterfaceImpulse = {
  Source: 'SurfaceInterface';
  Metadata?: {
    SurfaceLookup: string;
    InterfaceLookup: string;
  };
};
/**
 * An impulse raised by an explicit Signal, triggered by agents or schemas.
 */
export type SignalImpulse = {
  /**
   * Identifier for this impulse source.
   */
  Source: 'Signal';

  /**
   * Signal execution metadata.
   */
  Metadata?: {
    /**
     * Lookup key for the signal that was raised.
     */
    SignalLookup: string;

    /**
     * Agent that raised the signal, if any.
     */
    TriggeringAgentLookup: string;
  };
};

/**
 * A system-generated impulse for internal events (restarts, memory sync, etc.).
 */
export type SystemImpulse = {
  /**
   * Identifier for this impulse source.
   */
  Source: 'System';

  /**
   * System-level metadata describing the event type.
   */
  Metadata?: {
    /**
     * System event type (e.g. "MemoryReplay", "RuntimeStart").
     */
    EventType: string;
  };
};
