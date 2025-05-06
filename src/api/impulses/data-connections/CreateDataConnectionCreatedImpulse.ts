import { DataHubDataConnectionConfig } from './DataHubDataConnectionConfig.ts';
import { HTTPDataConnectionConfig } from './HTTPDataConnectionConfig.ts';

/**
 * Shared base fields for all created data connection responses.
 */
type BaseCreateDataConnection = {
  /**
   * Unique ID for this data connection.
   */
  DataConnectionID: string;

  /**
   * The ingestion endpoint the system exposes for receiving HTTP data.
   */
  IngestURL: string;

  /**
   * The name of the registered connection.
   */
  Name: string;
};

/**
 * Discriminated union representing the result of a CreateDataConnection impulse.
 * The `Config` type is inferred based on the `SourceType` value.
 */
export type CreateDataConnectionCreatedImpulse =
  & BaseCreateDataConnection
  & (
    | {
      SourceType: 'data-hub';
      Config: DataHubDataConnectionConfig;
    }
    | {
      SourceType: 'http';
      Config: HTTPDataConnectionConfig;
    }
  );
