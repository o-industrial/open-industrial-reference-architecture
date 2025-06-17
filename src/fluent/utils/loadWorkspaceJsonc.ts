import { WorkspaceConfig } from '../types/WorkspaceConfig.ts';
import { DFSFileHandler, parseJsonc } from './.deps.ts';

export async function loadWorkspaceJsonc(
  dfs: DFSFileHandler,
  path = './workspace.oi.jsonc',
): Promise<WorkspaceConfig> {
  const file = await dfs.GetFileInfo(path);

  if (!file?.Contents) {
    throw new Error(`❌ Could not read workspace file: ${path}`);
  }

  const parsed = parseJsonc(
    await new Response(file.Contents).text(),
  ) as WorkspaceConfig;

  if (!parsed?.Name || !parsed?.Version || !parsed?.Runtime?.Version) {
    throw new Error(
      `❌ Invalid or incomplete workspace.oi.jsonc configuration.`,
    );
  }

  return parsed;
}
