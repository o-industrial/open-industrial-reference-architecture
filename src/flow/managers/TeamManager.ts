import { TeamMember } from '../types/TeamMember.ts';
import { OpenIndustrialAPIClient } from '../../api/clients/OpenIndustrialAPIClient.ts';
import { EaCUserRecord } from '../../api/.client.deps.ts';
import { EaCManager } from './EaCManager.ts';

export class TeamManager {
  protected members: TeamMember[] = [];

  protected listeners: (() => void)[] = [];

  constructor(
    protected oiSvc: OpenIndustrialAPIClient,
    protected eac: EaCManager,
    initialMembers?: TeamMember[]) {
    const joined = new Date().toISOString();

    this.members = initialMembers ?? [
      {
        Email: 'admin@factory.com',
        Role: 'Owner',
        Name: 'Admin',
        Joined: joined,
      },
      {
        Email: 'engineer@factory.com',
        Role: 'Editor',
        Name: 'Engineer',
        Joined: joined,
      },
    ];
  }

  public async ListUsers(): Promise<EaCUserRecord[]> {
    const users = await this.oiSvc.Workspaces.ListUsers()
    
    return users;
  }

  public async InviteUser(
    email: string,
    role: TeamMember['Role'] = 'Viewer',
    name?: string,
  ): Promise<void> {
    if (!email || this.members.some((m) => m.Email === email)) return;
    

    const userEac = this.eac.GetEaC();

    const userRecord: EaCUserRecord = {
      EnterpriseLookup: userEac.EnterpriseLookup ?? "",
      EnterpriseName: userEac.Details?.Name ?? "",   
      Owner: false,
      ParentEnterpriseLookup: userEac.ParentEnterpriseLookup ?? "",
      Username: email,
    }

    const inviteResult = await this.oiSvc.Workspaces.InviteUser(userRecord)

    this.members.push({
      Email: email,
      Role: role,
      Name: name,
      Joined: new Date().toISOString(),
    }); 

    this.emitChange();
  }

  public UpdateUserRole(email: string, role: TeamMember['Role']): void {
    const member = this.members.find((m) => m.Email === email);
    if (member && member.Role !== role) {
      member.Role = role;
      this.emitChange();
    }
  }

  public RemoveUser(email: string): void {
    const initial = this.members.length;
    this.members = this.members.filter((m) => m.Email !== email);

    if (this.members.length !== initial) {
      this.emitChange();
    }
  }

  public OnChange(cb: () => void): () => void {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter((fn) => fn !== cb);
    };
  }

  protected emitChange(): void {
    for (const cb of this.listeners) cb();
  }
}
