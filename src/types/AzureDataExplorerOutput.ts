import { z } from './.deps.ts';
import { KustoResponseDataSet } from 'npm:azure-kusto-data@6.0.2';

export const AzureDataExplorerOutputSchema: z.ZodAny = z.any();

export type AzureDataExplorerOutput = KustoResponseDataSet;
