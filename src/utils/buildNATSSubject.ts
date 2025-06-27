export function buildNATSSubject(workspace: string, surface?: string): string {
  return surface
    ? `workspace.${workspace}.surface.${surface}.*.*.impulse`
    : `workspace.${workspace}.*.*.impulse`;
}
