
export type TeamMembership = {
  Lookup: string; // team id
  Team: string; // team display name
  Role: 'Owner' | 'Editor' | 'Viewer';
  MemberSince: string; // friendly text
};
