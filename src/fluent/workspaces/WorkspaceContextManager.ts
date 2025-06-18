import { parseEverythingAsCodeOIWorkspace, parseJsonc } from './.deps.ts';

import type { WorkspaceDFSContextManager } from './WorkspaceDFSContextManager.ts';
import { type WorkspaceContext, WorkspaceContextSchema } from '../types/WorkspaceContext.ts';
import type { WorkspaceConfig } from '../types/WorkspaceConfig.ts';
import type { ISecretProvider } from '../../secrets/providers/ISecretProvider.ts';
import { SecretResolverChain } from '../../secrets/SecretResolverChain.ts';
import type { IoCContainer } from './.deps.ts';
import type { EverythingAsCodeOIWorkspace } from '../types/.deps.ts';

/**
 * Builds and manages a WorkspaceContext with DFS, Secrets, and Everything-as-Code.
 */
export class WorkspaceContextManager {
  protected readonly secretChain: SecretResolverChain = new SecretResolverChain();

  protected context!: WorkspaceContext;

  constructor(
    protected readonly dfsCtx: WorkspaceDFSContextManager,
    protected readonly ioc: IoCContainer,
  ) {}

  public async Init(
    secretsRegistrationFn: (
      register: (provider: ISecretProvider) => void,
      ctx: WorkspaceContext,
    ) => void | Promise<void>,
  ): Promise<void> {
    const config = await this.loadWorkspaceJsonc();
    const eac = await this.loadEaCConfig();

    this.context = {
      Config: config,
      DFSs: this.dfsCtx,
      IoC: this.ioc,
      EaC: eac,
      Services: {},
      Secrets: {
        Get: async (key: string) => await this.secretChain.GetSecret(key),
        GetRequired: async (key: string) => {
          const value = await this.secretChain.GetSecret(key);
          if (value === undefined) {
            throw new Error(
              `❌ Required secret '${key}' could not be resolved.`,
            );
          }
          return value;
        },
      },
    };

    await secretsRegistrationFn((provider) => {
      this.secretChain.Register(provider);
    }, this.context);
  }

  public GetContext(): WorkspaceContext {
    return this.context;
  }

  protected async loadWorkspaceJsonc(): Promise<WorkspaceConfig> {
    const dfs = await this.dfsCtx.GetWorkspaceDFS();

    const tryLoad = async (path: string): Promise<WorkspaceConfig | null> => {
      if (await dfs.HasFile(path)) {
        const file = await dfs.GetFileInfo(path);
        const raw = await new Response(file?.Contents).text();
        const json = parseJsonc(raw);
        return WorkspaceContextSchema.shape.Config.parse(json); // Just the config portion
      }
      return null;
    };

    return (
      (await tryLoad('workspace.oi.jsonc')) ||
      (await tryLoad('workspace.oi.json')) ||
      (() => {
        throw new Error(
          '❌ No workspace configuration found (workspace.oi.jsonc or workspace.oi.json)',
        );
      })()
    );
  }

  protected async loadEaCConfig(): Promise<EverythingAsCodeOIWorkspace> {
    const dfs = await this.dfsCtx.GetWorkspaceDFS();

    const tryLoad = async (
      path: string,
    ): Promise<EverythingAsCodeOIWorkspace | null> => {
      if (await dfs.HasFile(path)) {
        const file = await dfs.GetFileInfo(path);
        const raw = await new Response(file?.Contents).text();
        const json = parseJsonc(raw);
        return parseEverythingAsCodeOIWorkspace(json);
      }
      return null;
    };

    return (
      (await tryLoad('.eac.jsonc')) ||
      (await tryLoad('.eac.json')) ||
      (() => {
        throw new Error(
          '❌ No EaC configuration file found (.eac.jsonc or .eac.json)',
        );
      })()
    );
  }
}
