import { type JSONSchema7, z } from './.deps.ts';

export type InterfaceSpecMeta = {
  Name: string;
  Version: number;
  Theme?: string;
  Breakpoints?: Record<string, number>;
  LayoutGrid?: {
    Columns?: number;
    Gutter?: number;
    RowHeight?: number;
  };
};

export type InterfaceSpecImports = {
  Components?: string[];
  Inputs?: string[];
};

export type InterfaceSpecDataProviderType = 'warmQuery' | 'dataConnection';

export type InterfaceSpecDataProvider = {
  ID: string;
  Type: InterfaceSpecDataProviderType;
  Lookup: string;
  Params?: Record<string, unknown>;
  Sample?: unknown;
  SchemaLookup?: string;
  Description?: string;
};

export type InterfaceSpecBindingTransform = {
  Ref: string;
  Args?: Record<string, unknown>;
};

export type InterfaceSpecBinding = {
  ProviderID: string;
  Select: string;
  Transform?: InterfaceSpecBindingTransform;
};

export type InterfaceSpecLayoutNodeResponsiveConfig = {
  Span?: number;
  Order?: number;
  Hidden?: boolean;
  Align?: 'start' | 'center' | 'end' | 'stretch';
  Basis?: string;
};

export type InterfaceSpecLayoutNode = {
  ID: string;
  Type: string;
  Props?: Record<string, unknown>;
  BindingRefs?: string[];
  Children?: InterfaceSpecLayoutNode[];
  Responsive?: Record<string, InterfaceSpecLayoutNodeResponsiveConfig>;
  IsContainer?: boolean;
};

export type InterfaceSpecActionPolicy = {
  Roles?: string[];
  RateLimit?: {
    WindowMs: number;
    Max: number;
  };
  ApprovalRequired?: boolean;
};

export type InterfaceSpecActionHandlerRef = {
  Type: 'function' | 'sop';
  Reference: string;
};

export type InterfaceSpecAction = {
  ID: string;
  Name: string;
  Description?: string;
  InputSchema?: JSONSchema7 | Record<string, unknown>;
  Policy?: InterfaceSpecActionPolicy;
  Handler: InterfaceSpecActionHandlerRef;
};

export type InterfaceSpecThemeTokens = {
  Colors?: Record<string, string>;
  Spacing?: Record<string, string | number>;
  Typography?: {
    Families?: Record<string, string>;
    Sizes?: Record<string, string>;
    Weights?: Record<string, number>;
    LineHeights?: Record<string, string>;
  };
  Radii?: Record<string, string | number>;
  Shadows?: Record<string, string>;
};

export type InterfaceSpecAsset = {
  ID: string;
  Type?: 'image' | 'video' | 'audio' | 'document' | 'other';
  Path: string;
  Description?: string;
  ContentType?: string;
  Metadata?: Record<string, unknown>;
};

export type InterfaceSpecAssets = {
  Media?: InterfaceSpecAsset[];
  Additional?: Record<string, InterfaceSpecAsset>;
};

export type InterfaceSpecData = {
  Providers?: InterfaceSpecDataProvider[];
  Bindings?: Record<string, InterfaceSpecBinding>;
};

export type InterfaceSpec = {
  Meta: InterfaceSpecMeta;
  Imports?: InterfaceSpecImports;
  Data?: InterfaceSpecData;
  Layout: InterfaceSpecLayoutNode[];
  Actions?: InterfaceSpecAction[];
  Theme?: InterfaceSpecThemeTokens;
  Assets?: InterfaceSpecAssets;
  Notes?: string;
};

const InterfaceSpecLayoutNodeResponsiveSchema: z.ZodType<InterfaceSpecLayoutNodeResponsiveConfig> =
  z
    .object({
      Span: z.number().int().positive().max(24).optional(),
      Order: z.number().int().optional(),
      Hidden: z.boolean().optional(),
      Align: z.enum(['start', 'center', 'end', 'stretch']).optional(),
      Basis: z.string().optional(),
    })
    .catchall(z.unknown())
    .describe('Breakpoint-specific overrides for layout nodes.');

const InterfaceSpecLayoutNodeSchema: z.ZodType<InterfaceSpecLayoutNode> = z.lazy(() =>
  z
    .object({
      ID: z.string().min(1, 'Node ID is required.'),
      Type: z.string().min(1, 'Component type is required.'),
      Props: z.record(z.unknown()).optional(),
      BindingRefs: z.array(z.string().min(1)).optional(),
      Children: z.array(InterfaceSpecLayoutNodeSchema).optional(),
      Responsive: z.record(InterfaceSpecLayoutNodeResponsiveSchema).optional(),
      IsContainer: z.boolean().optional(),
    })
    .strict()
    .describe('Declarative representation of a layout node for the interface.')
);

const InterfaceSpecBindingTransformSchema: z.ZodType<InterfaceSpecBindingTransform> = z
  .object({
    Ref: z.string().min(1, 'Transform ref is required.'),
    Args: z.record(z.unknown()).optional(),
  })
  .strict()
  .describe('Reference to a reusable transform applied to a binding value.');

const InterfaceSpecBindingSchema: z.ZodType<InterfaceSpecBinding> = z
  .object({
    ProviderID: z.string().min(1, 'Provider reference is required.'),
    Select: z.string().min(1, 'Selection path is required.'),
    Transform: InterfaceSpecBindingTransformSchema.optional(),
  })
  .strict()
  .describe('Binding definition mapping a provider result to component props.');

const InterfaceSpecDataProviderSchema: z.ZodType<InterfaceSpecDataProvider> = z
  .object({
    ID: z.string().min(1, 'Provider ID is required.'),
    Type: z.enum(['warmQuery', 'dataConnection']),
    Lookup: z.string().min(1, 'Lookup is required for providers.'),
    Params: z.record(z.unknown()).optional(),
    Sample: z.unknown().optional(),
    SchemaLookup: z.string().optional(),
    Description: z.string().optional(),
  })
  .strict()
  .describe('Data provider wiring for an interface.');

const InterfaceSpecActionPolicySchema: z.ZodType<InterfaceSpecActionPolicy> = z
  .object({
    Roles: z.array(z.string().min(1)).optional(),
    RateLimit: z
      .object({
        WindowMs: z.number().int().positive(),
        Max: z.number().int().positive(),
      })
      .optional(),
    ApprovalRequired: z.boolean().optional(),
  })
  .catchall(z.unknown())
  .describe('Runtime enforcement policy for interface actions.');

const InterfaceSpecActionHandlerRefSchema: z.ZodType<InterfaceSpecActionHandlerRef> = z
  .object({
    Type: z.enum(['function', 'sop']),
    Reference: z.string().min(1),
  })
  .strict()
  .describe('Handler reference for interface actions.');

const JsonSchemaLikeSchema: z.ZodType<JSONSchema7 | Record<string, unknown>> = z.custom();

const InterfaceSpecActionSchema: z.ZodType<InterfaceSpecAction> = z
  .object({
    ID: z.string().min(1),
    Name: z.string().min(1),
    Description: z.string().optional(),
    InputSchema: JsonSchemaLikeSchema.optional(),
    Policy: InterfaceSpecActionPolicySchema.optional(),
    Handler: InterfaceSpecActionHandlerRefSchema,
  })
  .strict()
  .describe('Declarative definition for an interface action.');
const InterfaceSpecThemeTokensSchema: z.ZodType<InterfaceSpecThemeTokens> = z
  .object({
    Colors: z.record(z.string()).optional(),
    Spacing: z.record(z.union([z.string(), z.number()])).optional(),
    Typography: z
      .object({
        Families: z.record(z.string()).optional(),
        Sizes: z.record(z.string()).optional(),
        Weights: z.record(z.number()).optional(),
        LineHeights: z.record(z.string()).optional(),
      })
      .optional(),
    Radii: z.record(z.union([z.string(), z.number()])).optional(),
    Shadows: z.record(z.string()).optional(),
  })
  .catchall(z.unknown())
  .describe('Theme tokens applied to the interface runtime.');

const InterfaceSpecAssetSchema: z.ZodType<InterfaceSpecAsset> = z
  .object({
    ID: z.string().min(1),
    Type: z.enum(['image', 'video', 'audio', 'document', 'other']).optional(),
    Path: z.string().min(1),
    Description: z.string().optional(),
    ContentType: z.string().optional(),
    Metadata: z.record(z.unknown()).optional(),
  })
  .strict()
  .describe('Static asset referenced by the interface.');

const InterfaceSpecAssetsSchema: z.ZodType<InterfaceSpecAssets> = z
  .object({
    Media: z.array(InterfaceSpecAssetSchema).optional(),
    Additional: z.record(InterfaceSpecAssetSchema).optional(),
  })
  .strict()
  .describe('Collection of static assets referenced by the interface.');

const InterfaceSpecImportsSchema: z.ZodType<InterfaceSpecImports> = z
  .object({
    Components: z.array(z.string().min(1)).optional(),
    Inputs: z.array(z.string().min(1)).optional(),
  })
  .strict()
  .describe('External component or input references used by the spec.');

const InterfaceSpecMetaSchema: z.ZodType<InterfaceSpecMeta> = z
  .object({
    Name: z.string().min(1),
    Version: z.number().int().nonnegative(),
    Theme: z.string().optional(),
    Breakpoints: z.record(z.number().positive()).optional(),
    LayoutGrid: z
      .object({
        Columns: z.number().int().positive().optional(),
        Gutter: z.number().nonnegative().optional(),
        RowHeight: z.number().positive().optional(),
      })
      .strict()
      .optional(),
  })
  .strict()
  .describe('Metadata describing the interface specification.');

const InterfaceSpecDataSchema: z.ZodType<InterfaceSpecData> = z
  .object({
    Providers: z.array(InterfaceSpecDataProviderSchema).optional(),
    Bindings: z.record(InterfaceSpecBindingSchema).optional(),
  })
  .strict()
  .describe('Data wiring configuration for the interface.');

export const InterfaceSpecSchema: z.ZodType<InterfaceSpec> = z
  .object({
    Meta: InterfaceSpecMetaSchema,
    Imports: InterfaceSpecImportsSchema.optional(),
    Data: InterfaceSpecDataSchema.optional(),
    Layout: z.array(InterfaceSpecLayoutNodeSchema).min(1, 'At least one layout node is required.'),
    Actions: z.array(InterfaceSpecActionSchema).optional(),
    Theme: InterfaceSpecThemeTokensSchema.optional(),
    Assets: InterfaceSpecAssetsSchema.optional(),
    Notes: z.string().optional(),
  })
  .strict()
  .describe('Canonical Everything-as-Code interface specification.');

export const INTERFACE_SPEC_VERSION = 1;

export function isInterfaceSpec(value: unknown): value is InterfaceSpec {
  return InterfaceSpecSchema.safeParse(value).success;
}

export function parseInterfaceSpec(value: unknown): InterfaceSpec {
  return InterfaceSpecSchema.parse(value);
}
