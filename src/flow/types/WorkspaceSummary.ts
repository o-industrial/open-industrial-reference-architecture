import { EaCEnterpriseDetails } from "../.deps.ts";

export type WorkspaceSummary = {
  Lookup: string;

  Details: EaCEnterpriseDetails;

  Views?: number;

  Forks?: number;

  UpdatedAt?: string;

  Archived?: boolean;
};
