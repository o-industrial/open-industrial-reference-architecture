import { KustoResponseDataSet, z } from './.deps.ts';

export const AzureDataExplorerOutputSchema: z.ZodAny = z.any();

export type AzureDataExplorerOutput = KustoResponseDataSet;
