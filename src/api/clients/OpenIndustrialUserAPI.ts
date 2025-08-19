import { AccountProfile } from '../../types/AccountProfile.ts';
import { ClientHelperBridge } from './ClientHelperBridge.ts';

/**
 * Subclient for managing the current user's account profile.
 * Provides methods to retrieve, update, or delete the user's profile/account.
 */
export class OpenIndustrialUserAPI {
  constructor(private bridge: ClientHelperBridge) {}

  /**
   * Retrieve the current user's account profile.
   */
  public async GetProfile(): Promise<AccountProfile> {
    const res = await fetch(this.bridge.url('/api/users/profile'), {
      method: 'GET',
      headers: this.bridge.headers(),
    });
    if (!res.ok) {
      throw new Error(`Failed to retrieve account profile: ${res.status}`);
    }
    return await this.bridge.json<AccountProfile>(res);
  }

  /**
   * Update the current user's account profile with new data.
   * @param profile - The profile fields to save (Name, Bio, etc).
   */
  public async UpdateProfile(profile: AccountProfile): Promise<AccountProfile> {
    const res = await fetch(this.bridge.url('/api/users/profile'), {
      method: 'PUT', // Use PUT (or POST) to update the profile
      headers: this.bridge.headers({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(profile),
    });
    if (!res.ok) {
      throw new Error(`Failed to update profile: ${res.status}`);
    }
    return await this.bridge.json<AccountProfile>(res);
  }

  /**
   * Delete the current user's account permanently.
   * This will remove the user and all associated data.
   */
  public async DeleteAccount(): Promise<void> {
    const res = await fetch(this.bridge.url('/api/users'), {
      method: 'DELETE',
      headers: this.bridge.headers(),
    });
    if (!res.ok) {
      throw new Error(`Failed to delete account: ${res.status}`);
    }
    // No JSON to return on success (assume 204 No Content on success).
  }
}
