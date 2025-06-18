import { fromFileUrl, IoCContainer } from './.deps.ts';

import { WorkspaceDFSContextManager } from './WorkspaceDFSContextManager.ts';
import { WorkspaceContextManager } from './WorkspaceContextManager.ts';

import type { WorkspaceContext } from '../types/WorkspaceContext.ts';
import type { ISecretProvider } from '../../secrets/providers/ISecretProvider.ts';

/**
 * Manages the full runtime state of an Open Industrial Workspace.
 */
export class WorkspaceRuntime {
  public readonly dfsCtx: WorkspaceDFSContextManager;

  protected readonly contextMgr: WorkspaceContextManager;

  constructor(
    public readonly options: {
      initPath: string;
      packs: unknown[];
      secretsRegistrationFn: (
        register: (provider: ISecretProvider) => void,
        ctx: WorkspaceContext,
      ) => void | Promise<void>;
    },
    protected readonly ioc: IoCContainer = new IoCContainer(),
  ) {
    this.dfsCtx = new WorkspaceDFSContextManager(this.ioc);
    this.contextMgr = new WorkspaceContextManager(this.dfsCtx, this.ioc);

    this.ioc.Register(WorkspaceRuntime, () => this);
    this.ioc.Register(WorkspaceDFSContextManager, () => this.dfsCtx);
  }

  public GetContext(): WorkspaceContext {
    return this.contextMgr.GetContext();
  }

  public async Run(): Promise<void> {
    this.setupWorkspaceDFS();

    await this.contextMgr.Init(this.options.secretsRegistrationFn);
  }

  protected setupWorkspaceDFS() {
    this.dfsCtx.RegisterExecutionDFS();

    if (this.options.initPath) {
      const resolvedPath = this.options.initPath.startsWith('file:///')
        ? fromFileUrl(this.options.initPath)
        : this.options.initPath;

      this.dfsCtx.RegisterWorkspaceDFS(resolvedPath);
    }
  }
}
