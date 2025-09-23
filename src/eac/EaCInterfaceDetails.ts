import { z } from './.deps.ts';
import { InterfaceSpec, InterfaceSpecSchema } from './InterfaceSpec.ts';

export type InterfaceDraftState = {
  SpecPath?: string;
  AssetPaths?: Record<string, string>;
  UpdatedAt?: string;
  Notes?: string;
};

export type EaCInterfaceAssets = {
  Code?: {
    Index?: string;
    Data?: string;
    Actions?: string;
  };
  Media?: Record<string, string>;
};

export type EaCInterfaceEmbedOptions = {
  Defer?: boolean;
  Attributes?: Record<string, string>;
};

/**
 * Details describing a workspace interface definition.
 */
export type EaCInterfaceDetails = {
  Name: string;
  Description?: string;
  Version: number;
  ApiPath?: string;
  Spec: InterfaceSpec;
  ComponentTag?: string;
  EmbedOptions?: EaCInterfaceEmbedOptions;
  Assets?: EaCInterfaceAssets;
  DraftState?: InterfaceDraftState;
  Thumbnails?: { Path: string; Timestamp: string }[];
};

const InterfaceDraftStateSchema: z.ZodType<InterfaceDraftState> = z
  .object({
    SpecPath: z.string().optional(),
    AssetPaths: z.record(z.string()).optional(),
    UpdatedAt: z.string().optional(),
    Notes: z.string().optional(),
  })
  .strict()
  .describe('Transient draft pointers for interface authoring.');

const EaCInterfaceAssetsSchema: z.ZodType<EaCInterfaceAssets> = z
  .object({
    Code: z
      .object({
        Index: z.string().optional(),
        Data: z.string().optional(),
        Actions: z.string().optional(),
      })
      .strict()
      .optional(),
    Media: z.record(z.string()).optional(),
  })
  .strict()
  .describe('References to generated code and media assets for the interface.');

const EaCInterfaceEmbedOptionsSchema: z.ZodType<EaCInterfaceEmbedOptions> = z
  .object({
    Defer: z.boolean().optional(),
    Attributes: z.record(z.string()).optional(),
  })
  .strict()
  .describe('Embed configuration for the interface custom element.');

export const EaCInterfaceDetailsSchema: z.ZodType<EaCInterfaceDetails> = z
  .object({
    Name: z.string().min(1, 'Interface name is required.'),
    Description: z.string().optional(),
    Version: z.number().int().nonnegative(),
    ApiPath: z.string().optional(),
    Spec: InterfaceSpecSchema,
    ComponentTag: z.string().optional(),
    EmbedOptions: EaCInterfaceEmbedOptionsSchema.optional(),
    Assets: EaCInterfaceAssetsSchema.optional(),
    DraftState: InterfaceDraftStateSchema.optional(),
    Thumbnails: z
      .array(
        z
          .object({
            Path: z.string().min(1),
            Timestamp: z.string().min(1),
          })
          .strict(),
      )
      .optional(),
  })
  .strict()
  .describe('Workspace-level interface definition details.');

export function isEaCInterfaceDetails(value: unknown): value is EaCInterfaceDetails {
  return EaCInterfaceDetailsSchema.safeParse(value).success;
}

export function parseEaCInterfaceDetails(value: unknown): EaCInterfaceDetails {
  return EaCInterfaceDetailsSchema.parse(value);
}
