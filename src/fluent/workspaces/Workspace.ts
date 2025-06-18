import { WorkspaceBuilder } from './WorkspaceBuilder.ts';

export function Workspace(): WorkspaceBuilder {
  return new WorkspaceBuilder();
}
