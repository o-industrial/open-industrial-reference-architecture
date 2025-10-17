import { EaCVertexDetails, EaCVertexDetailsSchema, JSONSchema7, z } from './.deps.ts';

/**
 * Group of authoring instructions associated with an interface code block.
 * Groups help AI co-authors understand intent for specific portions of the page.
 */
export type EaCInterfaceMessageGroup = {
  Title?: string;
  Messages: string[];
};

/**
 * Represents a discrete block of interface code (page or handler) alongside
 * contextual authoring guidance for AI-assisted workflows.
 */
export type EaCInterfaceCodeBlock = {
  Code?: string;
  Description?: string;
  Messages?: string[];
  MessageGroups?: EaCInterfaceMessageGroup[];
};

/**
 * Workspace interface details describing how a page is constructed.
 *
 * Interfaces are authored as composable code blocks instead of serialized specs,
 * enabling collaborative editing between humans and AI.
 */
export type EaCInterfacePageDataHydration = {
  Server?: boolean;
  Client?: boolean;
  ClientRefreshMs?: number;
};

export type EaCInterfacePageDataAccessMode = 'server' | 'client' | 'both';

export type EaCInterfaceHistoricSliceFormat = 'json' | 'csv';

export type EaCInterfaceHistoricWindowMode = 'relative' | 'absolute';

export type EaCInterfaceRelativeTimeUnit = 'minutes' | 'hours' | 'days';

export type EaCInterfaceRelativeTimeOffset = {
  Amount: number;
  Unit: EaCInterfaceRelativeTimeUnit;
};

export type EaCInterfaceHistoricRange = {
  Amount: number;
  Unit: EaCInterfaceRelativeTimeUnit;
  Offset?: EaCInterfaceRelativeTimeOffset;
};

export type EaCInterfaceHistoricAbsoluteRange = {
  Start: string;
  End?: string;
};

export type EaCInterfaceDataConnectionHistoricSlice = {
  Enabled?: boolean;
  Format?: EaCInterfaceHistoricSliceFormat;
  Range?: EaCInterfaceHistoricRange;
  Mode?: EaCInterfaceHistoricWindowMode;
  AbsoluteRange?: EaCInterfaceHistoricAbsoluteRange;
};

export type EaCInterfaceDataConnectionFeatures = {
  AllowHistoricDownload?: boolean;
  HistoricDownloadFormats?: EaCInterfaceHistoricSliceFormat[];
  PrefetchHistoricSlice?: EaCInterfaceDataConnectionHistoricSlice;
};

export type EaCInterfacePageDataActionInvocationMode = 'server' | 'client' | 'both';

/**
 * Indicates which capability an interface action should invoke when triggered.
 * `mcpTool`/`mcpResource` allow interfaces to call MCP capabilities directly.
 */
export type EaCInterfacePageDataActionInvocationType =
  | 'warmQuery'
  | 'dataConnection'
  | 'interface'
  | 'mcpTool'
  | 'mcpResource'
  | 'custom';

export type EaCInterfacePageDataActionInvocation = {
  Type?: EaCInterfacePageDataActionInvocationType;
  Lookup?: string;
  Mode?: EaCInterfacePageDataActionInvocationMode;
};

export type EaCInterfacePageDataAction = {
  Key: string;
  Label?: string;
  Description?: string;
  Input?: JSONSchema7;
  Output?: JSONSchema7;
  Invocation?: EaCInterfacePageDataActionInvocation;
};

export type EaCInterfaceGeneratedDataSlice = {
  Label?: string;
  Description?: string;
  SourceCapability?: string;
  Schema: JSONSchema7;
  Hydration?: EaCInterfacePageDataHydration;
  Actions?: EaCInterfacePageDataAction[];
  Enabled?: boolean;
  AccessMode?: EaCInterfacePageDataAccessMode;
  DataConnection?: EaCInterfaceDataConnectionFeatures;
};

export type EaCInterfacePageDataType = {
  Generated: Record<string, EaCInterfaceGeneratedDataSlice>;
};

export type EaCInterfaceDetails = EaCVertexDetails & {
  /** Optional path where this interface is served within the runtime. */
  WebPath?: string;

  /** Optional list of import statements that customize this interface's module scope. */
  Imports?: string[];

  /** Optional JSON Schema structure describing generated and custom page data segments. */
  PageDataType?: EaCInterfacePageDataType;

  /** Optional server-side handler definition and associated authoring guidance. */
  PageHandler?: EaCInterfaceCodeBlock;

  /** Optional client page component implementation and supporting guidance. */
  Page?: EaCInterfaceCodeBlock;
};

const EaCInterfaceMessageGroupSchema: z.ZodType<EaCInterfaceMessageGroup> = z
  .object({
    Title: z.string().optional(),
    Messages: z.array(z.string().min(1)).min(1),
  })
  .strict()
  .describe('Named grouping of authoring instructions for a code block.');

const EaCInterfaceCodeBlockSchema: z.ZodType<EaCInterfaceCodeBlock> = z
  .object({
    Code: z.string().optional(),
    Description: z.string().optional(),
    Messages: z.array(z.string().min(1)).optional(),
    MessageGroups: z.array(EaCInterfaceMessageGroupSchema).optional(),
  })
  .strict()
  .describe('Code block definition paired with authoring instructions.');

const JSONSchema7Schema: z.ZodType<JSONSchema7> = z.custom<JSONSchema7>(
  (value) =>
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value),
  'JSON schema must be an object.',
);

const PageDataHydrationSchema: z.ZodType<EaCInterfacePageDataHydration> = z
  .object({
    Server: z.boolean().optional(),
    Client: z.boolean().optional(),
    ClientRefreshMs: z.number().int().positive().optional(),
  })
  .strict();

const PageDataAccessModeSchema: z.ZodType<EaCInterfacePageDataAccessMode> = z.enum([
  'server',
  'client',
  'both',
]);

const HistoricSliceFormatSchema: z.ZodType<EaCInterfaceHistoricSliceFormat> = z.enum([
  'json',
  'csv',
]);

const HistoricWindowModeSchema: z.ZodType<EaCInterfaceHistoricWindowMode> = z.enum([
  'relative',
  'absolute',
]);

const RelativeTimeUnitSchema: z.ZodType<EaCInterfaceRelativeTimeUnit> = z.enum([
  'minutes',
  'hours',
  'days',
]);

const RelativeTimeOffsetSchema: z.ZodType<EaCInterfaceRelativeTimeOffset> = z
  .object({
    Amount: z.number().int().positive(),
    Unit: RelativeTimeUnitSchema,
  })
  .strict();

const HistoricRangeSchema: z.ZodType<EaCInterfaceHistoricRange> = z
  .object({
    Amount: z.number().int().positive(),
    Unit: RelativeTimeUnitSchema,
    Offset: RelativeTimeOffsetSchema.optional(),
  })
  .strict();

const HistoricAbsoluteRangeSchema: z.ZodType<EaCInterfaceHistoricAbsoluteRange> = z
  .object({
    Start: z.string(),
    End: z.string().optional(),
  })
  .strict();

const DataConnectionHistoricSliceSchema: z.ZodType<EaCInterfaceDataConnectionHistoricSlice> = z
  .object({
    Enabled: z.boolean().optional(),
    Format: HistoricSliceFormatSchema.optional(),
    Range: HistoricRangeSchema.optional(),
    Mode: HistoricWindowModeSchema.optional(),
    AbsoluteRange: HistoricAbsoluteRangeSchema.optional(),
  })
  .strict();

const DataConnectionFeaturesSchema: z.ZodType<EaCInterfaceDataConnectionFeatures> = z
  .object({
    AllowHistoricDownload: z.boolean().optional(),
    HistoricDownloadFormats: z.array(HistoricSliceFormatSchema).optional(),
    PrefetchHistoricSlice: DataConnectionHistoricSliceSchema.optional(),
  })
  .strict();

const PageDataActionInvocationModeSchema: z.ZodType<EaCInterfacePageDataActionInvocationMode> = z
  .enum(['server', 'client', 'both']);

const PageDataActionInvocationSchema: z.ZodType<EaCInterfacePageDataActionInvocation> = z
  .object({
    Type: z
      .enum(['warmQuery', 'dataConnection', 'interface', 'mcpTool', 'mcpResource', 'custom'])
      .optional(),
    Lookup: z.string().optional(),
    Mode: PageDataActionInvocationModeSchema.optional(),
  })
  .strict();

const PageDataActionSchema: z.ZodType<EaCInterfacePageDataAction> = z
  .object({
    Key: z.string(),
    Label: z.string().optional(),
    Description: z.string().optional(),
    Input: JSONSchema7Schema.optional(),
    Output: JSONSchema7Schema.optional(),
    Invocation: PageDataActionInvocationSchema.optional(),
  })
  .strict();

const GeneratedDataSliceSchema: z.ZodType<EaCInterfaceGeneratedDataSlice> = z
  .object({
    Label: z.string().optional(),
    Description: z.string().optional(),
    SourceCapability: z.string().optional(),
    Schema: JSONSchema7Schema,
    Hydration: PageDataHydrationSchema.optional(),
    Actions: z.array(PageDataActionSchema).optional(),
    Enabled: z.boolean().optional(),
    AccessMode: PageDataAccessModeSchema.optional(),
    DataConnection: DataConnectionFeaturesSchema.optional(),
  })
  .strict();

const PageDataTypeSchema: z.ZodType<EaCInterfacePageDataType> = z
  .object({
    Generated: z.record(GeneratedDataSliceSchema),
  })
  .strict();

export const EaCInterfaceDetailsSchema: z.ZodType<EaCInterfaceDetails> = EaCVertexDetailsSchema
  .extend({
    WebPath: z
      .string()
      .trim()
      .min(1)
      .optional()
      .describe('Relative route path (e.g. /docs/overview) where this interface is served.'),
    Imports: z
      .array(z.string().min(1))
      .optional()
      .describe('Standalone import statements to prepend to the generated module.'),
    PageDataType: PageDataTypeSchema
      .optional()
      .describe('Structured JSON schema definition representing page data segments.'),
    PageHandler: EaCInterfaceCodeBlockSchema
      .optional()
      .describe('Server-side handler implementation and related guidance.'),
    Page: EaCInterfaceCodeBlockSchema
      .optional()
      .describe('Client page implementation and related guidance.'),
  })
  .describe('Workspace-level interface definition expressed as composable code blocks.');

export function isEaCInterfaceDetails(
  value: unknown,
): value is EaCInterfaceDetails {
  return EaCInterfaceDetailsSchema.safeParse(value).success;
}

export function parseEaCInterfaceDetails(
  value: unknown,
): EaCInterfaceDetails {
  return EaCInterfaceDetailsSchema.parse(value);
}
