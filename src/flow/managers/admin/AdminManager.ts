// src/flow/managers/admin/AdminManager.ts
import { EaCUserRecord } from 'jsr:@fathym/eac@0.2.116';
import { OpenIndustrialAPIClient } from '../../../api/clients/OpenIndustrialAPIClient.ts';
import { EaCUserLicense } from '../../.deps.ts';
import { EverythingAsCodeOIWorkspace } from '../../../eac/EverythingAsCodeOIWorkspace.ts';

export class AdminManager {
  protected oiSvc: OpenIndustrialAPIClient;
  protected userLicense: EaCUserLicense | undefined;

  constructor(oiSvc: OpenIndustrialAPIClient, userLicense?: EaCUserLicense) {
    this.oiSvc = oiSvc;
    this.userLicense = userLicense;
  }

  /**
   * Retrieve a summary of high‑level admin metrics.  This implementation
   * calls the new admin API to count the number of enterprises and users.
   * Replace the user count logic with a real endpoint once it is available.
   */
  public async GetDashboardSummary(): Promise<{
    enterprises: number;
    users: number;
    egi: number;
  }> {
    const enterprises = await this.ListWorkspaces();
    // TODO(mcgear): call a future admin/users API; for now return zero.
    const users: number = 0;

    // Example Enterprise Growth Index (EGI) – compute or fetch as needed.
    const egi = enterprises.length; // placeholder logic

    return {
      enterprises: enterprises.length,
      users,
      egi,
    };
  }

  /**
   * Load a list of enterprises from the admin API.  Accepts an optional search
   * query to filter by name.
   */
  public async ListWorkspaces(
    search?: string,
  ): Promise<EverythingAsCodeOIWorkspace[]> {
    return await this.oiSvc.Admin.ListWorkspaces(search);
  }

  /**
   * Placeholder for listing users.  When a users API becomes available,
   * call that here (e.g. this.oiSvc.Admin.ListUsers()).
   */
  public ListUsers(): Promise<EaCUserRecord[]> {
    // TODO(mcgear): implement via admin/users endpoint once available.
    return Promise.resolve([]);
  }
}
