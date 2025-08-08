export type TeamMember = {
  Email: string;

  Role: 'Owner' | 'Editor' | 'Viewer';

  Name?: string;

  Joined?: string;
};
