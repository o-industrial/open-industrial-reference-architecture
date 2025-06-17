import { TeamMember } from '../types/TeamMember.ts';

export class TeamManager {
  protected members: TeamMember[] = [];

  protected listeners: (() => void)[] = [];

  constructor(initialMembers?: TeamMember[]) {
    this.members = initialMembers ?? [
      { Email: 'admin@factory.com', Role: 'Owner' },
      { Email: 'engineer@factory.com', Role: 'Editor' },
    ];
  }

  public ListUsers(): TeamMember[] {
    return [...this.members];
  }

  public InviteUser(email: string, role: string = 'Viewer'): void {
    if (!email || this.members.some((m) => m.Email === email)) return;

    this.members.push({ Email: email, Role: role });
    this.emitChange();
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
