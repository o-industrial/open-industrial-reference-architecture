import { z } from './.deps.ts';
import { EaCIntegrationDetails, EaCIntegrationDetailsSchema } from './EaCIntegrationDetails.ts';

export const GrafanaProvisionModes = ['api', 'bundle'] as const;
export type GrafanaProvisionMode = (typeof GrafanaProvisionModes)[number];

export type EaCGrafanaDatasource = {
  /** Unique lookup for referencing the datasource within the workspace. */
  Lookup: string;

  /** Grafana datasource type (e.g., grafana-azure-data-explorer-datasource). */
  Type: string;

  /** Raw datasource configuration payload forwarded to Grafana. */
  Config: Record<string, unknown>;

  /** Optional friendly description. */
  Description?: string;

  /** Optional tags for discovery/filtering. */
  Tags?: Record<string, string>;
};

const EaCGrafanaDatasourceSchema: z.ZodType<EaCGrafanaDatasource> = z.object({
  Lookup: z
    .string()
    .min(1)
    .describe('Unique lookup for referencing the datasource within the workspace.'),
  Type: z
    .string()
    .min(1)
    .describe('Grafana datasource type (e.g., grafana-azure-data-explorer-datasource).'),
  Config: z
    .record(z.unknown())
    .describe('Raw datasource configuration payload forwarded to Grafana.'),
  Description: z.string().optional(),
  Tags: z.record(z.string()).optional(),
});

export type EaCGrafanaDashboardBundle = {
  /** DFS lookup pointing to the dashboard JSON or provisioning bundle. */
  SourceDFSLookup: string;

  /** Optional target folder UID where dashboards should be published. */
  FolderUid?: string;

  /** Optional friendly description. */
  Description?: string;

  /** Whether the SOP should publish the dashboard automatically. */
  AutoPublish?: boolean;
};

const EaCGrafanaDashboardBundleSchema: z.ZodType<EaCGrafanaDashboardBundle> = z.object({
  SourceDFSLookup: z
    .string()
    .min(1)
    .describe('DFS lookup pointing to the dashboard JSON or provisioning bundle.'),
  FolderUid: z.string().optional(),
  Description: z.string().optional(),
  AutoPublish: z.boolean().optional(),
});

/**
 * Details describing a Grafana OEM integration.
 */
export type EaCGrafanaIntegrationDetails = {
  /** Discriminator identifying the integration subtype. */
  Type: 'GrafanaIntegration';

  /** Base URL of the target Grafana instance. */
  InstanceUrl: string;

  /** Secret lookup that resolves the Grafana access token. */
  AccessTokenSecretLookup: string;

  /** Optional provisioning mode that controls how dashboards are applied. */
  ProvisionMode?: GrafanaProvisionMode;

  /** Whether Grafana SSO should be enabled for this integration. */
  EnableSSO?: boolean;

  /** Datasources to create or update within the Grafana instance. */
  Datasources?: EaCGrafanaDatasource[];

  /** Dashboard bundles (stored in DFS) that should be published to Grafana. */
  DashboardBundles?: Record<string, EaCGrafanaDashboardBundle>;
} & EaCIntegrationDetails<'GrafanaIntegration'>;

/**
 * Zod schema for `EaCGrafanaIntegrationDetails`.
 */
export const EaCGrafanaIntegrationDetailsSchema: z.ZodType<EaCGrafanaIntegrationDetails> =
  EaCIntegrationDetailsSchema.extend({
    Type: z
      .literal('GrafanaIntegration')
      .describe('Discriminator identifying the Grafana integration subtype.'),
    InstanceUrl: z
      .string()
      .url()
      .describe('Base URL of the target Grafana instance.'),
    AccessTokenSecretLookup: z
      .string()
      .min(1)
      .describe('Secret lookup that resolves the Grafana access token.'),
    ProvisionMode: z
      .enum(GrafanaProvisionModes)
      .optional()
      .describe('Optional provisioning mode that controls how dashboards are applied.'),
    EnableSSO: z.boolean().optional().describe('Whether Grafana SSO should be enabled.'),
    Datasources: z
      .array(EaCGrafanaDatasourceSchema)
      .optional()
      .describe('Datasources to create or update within the Grafana instance.'),
    DashboardBundles: z
      .record(EaCGrafanaDashboardBundleSchema)
      .optional()
      .describe('Dashboard bundles stored in DFS that should be published to Grafana.'),
  }).describe('Details describing a Grafana OEM integration.');

/**
 * Type guard for `EaCGrafanaIntegrationDetails`.
 */
export function isEaCGrafanaIntegrationDetails(
  value: unknown,
): value is EaCGrafanaIntegrationDetails {
  return EaCGrafanaIntegrationDetailsSchema.safeParse(value).success;
}

/**
 * Validates and parses an object as `EaCGrafanaIntegrationDetails`.
 */
export function parseEaCGrafanaIntegrationDetails(
  value: unknown,
): EaCGrafanaIntegrationDetails {
  return EaCGrafanaIntegrationDetailsSchema.parse(value);
}
