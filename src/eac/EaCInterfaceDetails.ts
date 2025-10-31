import { EaCVertexDetails, EaCVertexDetailsSchema, JSONSchema7, z } from './.deps.ts';

/**
 * Group of authoring instructions associated with an interface code block.
 * Groups help AI co-authors understand intent for specific portions of the page.
 */
export type EaCInterfaceMessageGroup = {
  Title?: string;
  Messages: string[];
};

export type EaCInterfaceSegmentMode = 'spec' | 'code';

export type EaCInterfaceLiteral =
  | string
  | number
  | boolean
  | null
  | EaCInterfaceLiteral[]
  | { [key: string]: EaCInterfaceLiteral };

export type EaCInterfaceLiteralValue = {
  Kind: 'literal';
  Value: EaCInterfaceLiteral;
};

export type EaCInterfaceDataBindingValue = {
  Kind: 'data';
  Slice: string;
  Path?: string;
  Fallback?: EaCInterfaceLiteral;
};

export type EaCInterfaceStateBindingValue = {
  Kind: 'state';
  Path: string;
  Fallback?: EaCInterfaceLiteral;
};

export type EaCInterfaceActionBindingValue = {
  Kind: 'action';
  Action: string;
  Path?: string;
  Fallback?: EaCInterfaceLiteral;
};

export type EaCInterfaceHelperCallValue = {
  Kind: 'helper';
  Helper: string;
  Arguments?: EaCInterfacePropValue[];
  Fallback?: EaCInterfaceLiteral;
};

export type EaCInterfaceCodeValue = {
  Kind: 'code';
  Code: string;
  Imports?: string[];
};

export type EaCInterfacePropValue =
  | EaCInterfaceLiteralValue
  | EaCInterfaceDataBindingValue
  | EaCInterfaceStateBindingValue
  | EaCInterfaceActionBindingValue
  | EaCInterfaceHelperCallValue
  | EaCInterfaceCodeValue;

export type EaCInterfaceLayoutLoop = {
  Each: EaCInterfacePropValue;
  As?: string;
  IndexAs?: string;
  Empty?: EaCInterfaceLayoutNode[];
};

export type EaCInterfaceLayoutNode = {
  Element: string;
  Key?: string;
  Variant?: string;
  Props?: Record<string, EaCInterfacePropValue>;
  Children?: EaCInterfaceLayoutNode[];
  Slots?: Record<string, EaCInterfaceLayoutNode[]>;
  Condition?: EaCInterfacePropValue;
  Loop?: EaCInterfaceLayoutLoop;
};

export type EaCInterfaceActionStep =
  | {
    Kind: 'invoke';
    Invocation: EaCInterfacePageDataActionInvocation;
    Arguments?: Record<string, EaCInterfacePropValue>;
    AssignTo?: string;
  }
  | {
    Kind: 'mutate';
    Target: string;
    Value: EaCInterfacePropValue;
    Strategy?: 'set' | 'merge' | 'append' | 'remove';
  }
  | {
    Kind: 'branch';
    Condition: EaCInterfacePropValue;
    WhenTrue?: EaCInterfaceActionStep[];
    WhenFalse?: EaCInterfaceActionStep[];
  }
  | {
    Kind: 'code';
    Code: string;
    Imports?: string[];
  };

export type EaCInterfaceEffectTrigger =
  | {
    Kind: 'lifecycle';
    Event: 'mount' | 'unmount' | 'visible';
    DebounceMs?: number;
    ThrottleMs?: number;
  }
  | {
    Kind: 'data';
    Slice: string;
    Path?: string;
    On?: 'change' | 'settled';
    DebounceMs?: number;
    ThrottleMs?: number;
  }
  | {
    Kind: 'action';
    Action: string;
    Event?: 'start' | 'success' | 'error';
  }
  | {
    Kind: 'custom';
    Name: string;
  };

export type EaCInterfaceHelperParameter = {
  Name: string;
  Description?: string;
  Schema?: JSONSchema7;
  Source?: 'argument' | 'data' | 'state' | 'action' | 'helper';
};

export type EaCInterfaceHelperSignature = {
  Key: string;
  Parameters?: EaCInterfaceHelperParameter[];
  Returns?: JSONSchema7;
};

export type EaCInterfaceSegmentType =
  | 'layout'
  | 'action'
  | 'effect'
  | 'helper'
  | 'code';

export type EaCInterfaceCodeSegmentBase<TType extends EaCInterfaceSegmentType> = {
  Id: string;
  Type: TType;
  Title?: string;
  Description?: string;
  Messages?: string[];
  MessageGroups?: EaCInterfaceMessageGroup[];
  Mode?: EaCInterfaceSegmentMode;
  Locked?: boolean;
};

export type EaCInterfaceLayoutSegment =
  | (EaCInterfaceCodeSegmentBase<'layout'> & {
    Mode?: 'spec';
    Root: EaCInterfaceLayoutNode;
  })
  | (EaCInterfaceCodeSegmentBase<'layout'> & {
    Mode: 'code';
    Code: string;
    Imports?: string[];
  });

export type EaCInterfaceActionSegment =
  | (EaCInterfaceCodeSegmentBase<'action'> & {
    Mode?: 'spec';
    Action: EaCInterfacePageDataAction;
    Steps?: EaCInterfaceActionStep[];
  })
  | (EaCInterfaceCodeSegmentBase<'action'> & {
    Mode: 'code';
    Action: EaCInterfacePageDataAction;
    Code: string;
    Imports?: string[];
  });

export type EaCInterfaceEffectSegment =
  | (EaCInterfaceCodeSegmentBase<'effect'> & {
    Mode?: 'spec';
    Triggers: EaCInterfaceEffectTrigger[];
    Steps?: EaCInterfaceActionStep[];
  })
  | (EaCInterfaceCodeSegmentBase<'effect'> & {
    Mode: 'code';
    Code: string;
    Imports?: string[];
    Triggers?: EaCInterfaceEffectTrigger[];
  });

export type EaCInterfaceHelperSegment =
  | (EaCInterfaceCodeSegmentBase<'helper'> & {
    Mode?: 'spec';
    Helper: EaCInterfaceHelperSignature;
    Steps?: EaCInterfaceActionStep[];
  })
  | (EaCInterfaceCodeSegmentBase<'helper'> & {
    Mode: 'code';
    Helper: EaCInterfaceHelperSignature;
    Code: string;
    Imports?: string[];
  });

export type EaCInterfaceCustomCodeSegment = EaCInterfaceCodeSegmentBase<'code'> & {
  Mode?: 'code';
  Code: string;
  Imports?: string[];
};

export type EaCInterfaceSegment =
  | EaCInterfaceLayoutSegment
  | EaCInterfaceActionSegment
  | EaCInterfaceEffectSegment
  | EaCInterfaceHelperSegment
  | EaCInterfaceCustomCodeSegment;

/**
 * Represents a discrete block of interface code (page or handler) alongside
 * contextual authoring guidance for AI-assisted workflows.
 */
export type EaCInterfaceCodeBlock = {
  Code?: string;
  Description?: string;
  Messages?: string[];
  MessageGroups?: EaCInterfaceMessageGroup[];
  /** Optional structured segments composing this block via specs and code mixes. */
  Segments?: EaCInterfaceSegment[];
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

  /** Optional JSON Schema structure describing generated and custom interface data segments. */
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

const JSONSchema7Schema: z.ZodType<JSONSchema7> = z.custom<JSONSchema7>(
  (value) =>
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value),
  'JSON schema must be an object.',
);

const InterfaceLiteralSchema: z.ZodType<EaCInterfaceLiteral> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(InterfaceLiteralSchema),
    z.record(InterfaceLiteralSchema),
  ])
);

const InterfacePropValueSchema: z.ZodType<EaCInterfacePropValue> = z.lazy(() =>
  z.union([
    z.object({
      Kind: z.literal('literal'),
      Value: InterfaceLiteralSchema,
    }).strict(),
    z.object({
      Kind: z.literal('data'),
      Slice: z.string().min(1),
      Path: z.string().optional(),
      Fallback: InterfaceLiteralSchema.optional(),
    }).strict(),
    z.object({
      Kind: z.literal('state'),
      Path: z.string().min(1),
      Fallback: InterfaceLiteralSchema.optional(),
    }).strict(),
    z.object({
      Kind: z.literal('action'),
      Action: z.string().min(1),
      Path: z.string().optional(),
      Fallback: InterfaceLiteralSchema.optional(),
    }).strict(),
    z.object({
      Kind: z.literal('helper'),
      Helper: z.string().min(1),
      Arguments: z.array(InterfacePropValueSchema).optional(),
      Fallback: InterfaceLiteralSchema.optional(),
    }).strict(),
    z.object({
      Kind: z.literal('code'),
      Code: z.string().min(1),
      Imports: z.array(z.string().min(1)).optional(),
    }).strict(),
  ])
);

const InterfaceLayoutLoopSchema: z.ZodType<EaCInterfaceLayoutLoop> = z.lazy(() =>
  z.object({
    Each: InterfacePropValueSchema,
    As: z.string().optional(),
    IndexAs: z.string().optional(),
    Empty: z.array(InterfaceLayoutNodeSchema).optional(),
  }).strict()
);

const InterfaceLayoutNodeSchema: z.ZodType<EaCInterfaceLayoutNode> = z.lazy(() =>
  z.object({
    Element: z.string().min(1),
    Key: z.string().optional(),
    Variant: z.string().optional(),
    Props: z.record(InterfacePropValueSchema).optional(),
    Children: z.array(InterfaceLayoutNodeSchema).optional(),
    Slots: z.record(z.array(InterfaceLayoutNodeSchema)).optional(),
    Condition: InterfacePropValueSchema.optional(),
    Loop: InterfaceLayoutLoopSchema.optional(),
  }).strict()
);

const InterfaceActionStepSchema: z.ZodType<EaCInterfaceActionStep> = z.lazy(() =>
  z.union([
    z.object({
      Kind: z.literal('invoke'),
      Invocation: PageDataActionInvocationSchema,
      Arguments: z.record(InterfacePropValueSchema).optional(),
      AssignTo: z.string().optional(),
    }).strict(),
    z.object({
      Kind: z.literal('mutate'),
      Target: z.string().min(1),
      Value: InterfacePropValueSchema,
      Strategy: z.enum(['set', 'merge', 'append', 'remove']).optional(),
    }).strict(),
    z.object({
      Kind: z.literal('branch'),
      Condition: InterfacePropValueSchema,
      WhenTrue: z.array(InterfaceActionStepSchema).optional(),
      WhenFalse: z.array(InterfaceActionStepSchema).optional(),
    }).strict(),
    z.object({
      Kind: z.literal('code'),
      Code: z.string().min(1),
      Imports: z.array(z.string().min(1)).optional(),
    }).strict(),
  ])
);

const InterfaceEffectTriggerSchema: z.ZodType<EaCInterfaceEffectTrigger> = z.union([
  z.object({
    Kind: z.literal('lifecycle'),
    Event: z.enum(['mount', 'unmount', 'visible']),
    DebounceMs: z.number().int().positive().optional(),
    ThrottleMs: z.number().int().positive().optional(),
  }).strict(),
  z.object({
    Kind: z.literal('data'),
    Slice: z.string().min(1),
    Path: z.string().optional(),
    On: z.enum(['change', 'settled']).optional(),
    DebounceMs: z.number().int().positive().optional(),
    ThrottleMs: z.number().int().positive().optional(),
  }).strict(),
  z.object({
    Kind: z.literal('action'),
    Action: z.string().min(1),
    Event: z.enum(['start', 'success', 'error']).optional(),
  }).strict(),
  z.object({
    Kind: z.literal('custom'),
    Name: z.string().min(1),
  }).strict(),
]);

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

const InterfaceHelperParameterSchema: z.ZodType<EaCInterfaceHelperParameter> = z
  .object({
    Name: z.string().min(1),
    Description: z.string().optional(),
    Schema: JSONSchema7Schema.optional(),
    Source: z.enum(['argument', 'data', 'state', 'action', 'helper']).optional(),
  })
  .strict();

const InterfaceHelperSignatureSchema: z.ZodType<EaCInterfaceHelperSignature> = z
  .object({
    Key: z.string().min(1),
    Parameters: z.array(InterfaceHelperParameterSchema).optional(),
    Returns: JSONSchema7Schema.optional(),
  })
  .strict();

const InterfaceLayoutSegmentSchema: z.ZodType<EaCInterfaceLayoutSegment> = z.union([
  z
    .object({
      Id: z.string().min(1),
      Type: z.literal('layout'),
      Title: z.string().optional(),
      Description: z.string().optional(),
      Messages: z.array(z.string().min(1)).optional(),
      MessageGroups: z.array(EaCInterfaceMessageGroupSchema).optional(),
      Mode: z.literal('spec').optional(),
      Locked: z.boolean().optional(),
      Root: InterfaceLayoutNodeSchema,
    })
    .strict(),
  z
    .object({
      Id: z.string().min(1),
      Type: z.literal('layout'),
      Title: z.string().optional(),
      Description: z.string().optional(),
      Messages: z.array(z.string().min(1)).optional(),
      MessageGroups: z.array(EaCInterfaceMessageGroupSchema).optional(),
      Mode: z.literal('code'),
      Locked: z.boolean().optional(),
      Code: z.string().min(1),
      Imports: z.array(z.string().min(1)).optional(),
    })
    .strict(),
]);

const InterfaceActionSegmentSchema: z.ZodType<EaCInterfaceActionSegment> = z.lazy(() =>
  z.union([
    z
      .object({
        Id: z.string().min(1),
        Type: z.literal('action'),
        Title: z.string().optional(),
        Description: z.string().optional(),
        Messages: z.array(z.string().min(1)).optional(),
        MessageGroups: z.array(EaCInterfaceMessageGroupSchema).optional(),
        Mode: z.literal('spec').optional(),
        Locked: z.boolean().optional(),
        Action: PageDataActionSchema,
        Steps: z.array(InterfaceActionStepSchema).optional(),
      })
      .strict(),
    z
      .object({
        Id: z.string().min(1),
        Type: z.literal('action'),
        Title: z.string().optional(),
        Description: z.string().optional(),
        Messages: z.array(z.string().min(1)).optional(),
        MessageGroups: z.array(EaCInterfaceMessageGroupSchema).optional(),
        Mode: z.literal('code'),
        Locked: z.boolean().optional(),
        Action: PageDataActionSchema,
        Code: z.string().min(1),
        Imports: z.array(z.string().min(1)).optional(),
      })
      .strict(),
  ])
);

const InterfaceEffectSegmentSchema: z.ZodType<EaCInterfaceEffectSegment> = z.union([
  z
    .object({
      Id: z.string().min(1),
      Type: z.literal('effect'),
      Title: z.string().optional(),
      Description: z.string().optional(),
      Messages: z.array(z.string().min(1)).optional(),
      MessageGroups: z.array(EaCInterfaceMessageGroupSchema).optional(),
      Mode: z.literal('spec').optional(),
      Locked: z.boolean().optional(),
      Triggers: z.array(InterfaceEffectTriggerSchema).min(1),
      Steps: z.array(InterfaceActionStepSchema).optional(),
    })
    .strict(),
  z
    .object({
      Id: z.string().min(1),
      Type: z.literal('effect'),
      Title: z.string().optional(),
      Description: z.string().optional(),
      Messages: z.array(z.string().min(1)).optional(),
      MessageGroups: z.array(EaCInterfaceMessageGroupSchema).optional(),
      Mode: z.literal('code'),
      Locked: z.boolean().optional(),
      Code: z.string().min(1),
      Imports: z.array(z.string().min(1)).optional(),
      Triggers: z.array(InterfaceEffectTriggerSchema).optional(),
    })
    .strict(),
]);

const InterfaceHelperSegmentSchema: z.ZodType<EaCInterfaceHelperSegment> = z.union([
  z
    .object({
      Id: z.string().min(1),
      Type: z.literal('helper'),
      Title: z.string().optional(),
      Description: z.string().optional(),
      Messages: z.array(z.string().min(1)).optional(),
      MessageGroups: z.array(EaCInterfaceMessageGroupSchema).optional(),
      Mode: z.literal('spec').optional(),
      Locked: z.boolean().optional(),
      Helper: InterfaceHelperSignatureSchema,
      Steps: z.array(InterfaceActionStepSchema).optional(),
    })
    .strict(),
  z
    .object({
      Id: z.string().min(1),
      Type: z.literal('helper'),
      Title: z.string().optional(),
      Description: z.string().optional(),
      Messages: z.array(z.string().min(1)).optional(),
      MessageGroups: z.array(EaCInterfaceMessageGroupSchema).optional(),
      Mode: z.literal('code'),
      Locked: z.boolean().optional(),
      Helper: InterfaceHelperSignatureSchema,
      Code: z.string().min(1),
      Imports: z.array(z.string().min(1)).optional(),
    })
    .strict(),
]);

const InterfaceCustomCodeSegmentSchema: z.ZodType<EaCInterfaceCustomCodeSegment> = z
  .object({
    Id: z.string().min(1),
    Type: z.literal('code'),
    Title: z.string().optional(),
    Description: z.string().optional(),
    Messages: z.array(z.string().min(1)).optional(),
    MessageGroups: z.array(EaCInterfaceMessageGroupSchema).optional(),
    Mode: z.literal('code').optional(),
    Locked: z.boolean().optional(),
    Code: z.string().min(1),
    Imports: z.array(z.string().min(1)).optional(),
  })
  .strict();

const InterfaceSegmentSchema: z.ZodType<EaCInterfaceSegment> = z.union([
  InterfaceLayoutSegmentSchema,
  InterfaceActionSegmentSchema,
  InterfaceEffectSegmentSchema,
  InterfaceHelperSegmentSchema,
  InterfaceCustomCodeSegmentSchema,
]);

const EaCInterfaceCodeBlockSchema: z.ZodType<EaCInterfaceCodeBlock> = z
  .object({
    Code: z.string().optional(),
    Description: z.string().optional(),
    Messages: z.array(z.string().min(1)).optional(),
    MessageGroups: z.array(EaCInterfaceMessageGroupSchema).optional(),
    Segments: z.array(InterfaceSegmentSchema).optional(),
  })
  .strict()
  .describe('Code block definition paired with authoring instructions.');

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
      .describe('Structured JSON schema definition representing interface data segments.'),
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
