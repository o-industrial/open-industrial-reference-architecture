import { EaCVertexDetails, EaCVertexDetailsSchema, z } from './.deps.ts';

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
export type EaCInterfaceDetails = EaCVertexDetails & {
  /** Optional list of import statements that customize this interface's module scope. */
  Imports?: string[];

  /** Optional TypeScript snippet describing the server supplied page data shape. */
  PageDataType?: string;

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

export const EaCInterfaceDetailsSchema: z.ZodType<EaCInterfaceDetails> = EaCVertexDetailsSchema
  .extend({
    Imports: z
      .array(z.string().min(1))
      .optional()
      .describe('Standalone import statements to prepend to the generated module.'),
    PageDataType: z
      .string()
      .optional()
      .describe('TypeScript type definition representing data passed into the page.'),
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
