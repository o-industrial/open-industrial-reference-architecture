import {
  DFSFileHandler,
  dirname,
  existsSync,
  fromFileUrl,
  IoCContainer,
  join,
  LocalDFSFileHandler,
  LocalDFSFileHandlerDetails,
} from './.deps.ts';

export class WorkspaceDFSContextManager {
  constructor(protected ioc: IoCContainer) {}

  // ─── Registration ────────────────────────────────────────────────

  public RegisterCustomDFS(
    name: string,
    details: LocalDFSFileHandlerDetails,
  ): string {
    this.ioc.Register(
      LocalDFSFileHandler,
      () => new LocalDFSFileHandler(details),
      { Name: name },
    );

    return details.FileRoot;
  }

  public RegisterExecutionDFS(cwd: string = Deno.cwd()): string {
    return this.RegisterCustomDFS('execution', { FileRoot: cwd });
  }

  public RegisterWorkspaceDFS(
    fileUrlInWorkspace: string,
    name: string = 'workspace',
  ): string {
    const path = fileUrlInWorkspace.startsWith('file:///')
      ? fromFileUrl(fileUrlInWorkspace)
      : fileUrlInWorkspace;

    const localPath = dirname(path);
    const workspaceRoot = this.findWorkspaceRoot(localPath);

    return this.RegisterCustomDFS(name, { FileRoot: workspaceRoot });
  }

  public RegisterUserHomeDFS(): string {
    const homeDir = this.getUserHomeDir();
    return this.RegisterCustomDFS('user-home', { FileRoot: homeDir });
  }

  // ─── DFS Accessors ────────────────────────────────────────────────

  public async GetDFS(name: string): Promise<DFSFileHandler> {
    const dfs = await this.ioc.Resolve(LocalDFSFileHandler, name);
    if (!dfs) throw new Error(`DFS "${name}" not registered.`);
    return dfs;
  }

  public async GetWorkspaceDFS(): Promise<DFSFileHandler> {
    return await this.GetDFS('workspace');
  }

  public async GetExecutionDFS(): Promise<DFSFileHandler> {
    return await this.GetDFS('execution');
  }

  public async GetUserHomeDFS(): Promise<DFSFileHandler> {
    try {
      return await this.GetDFS('user-home');
    } catch {
      this.RegisterUserHomeDFS();
      return await this.GetDFS('user-home');
    }
  }

  public async ResolvePath(scope: string, ...parts: string[]): Promise<string> {
    const dfs = await this.GetDFS(scope);
    return dfs.ResolvePath(...parts);
  }

  // ─── Root Detection ────────────────────────────────────────────────

  protected findWorkspaceRoot(startDir: string): string {
    let current = startDir;
    while (true) {
      const candidate = join(current, 'workspace.oi.jsonc');
      if (existsSync(candidate)) return current;

      const parent = dirname(current);
      if (parent === current) {
        throw new Error(
          `No workspace.oi.jsonc found walking up from: ${startDir}`,
        );
      }

      current = parent;
    }
  }

  protected getUserHomeDir(): string {
    const env = Deno.env.get(
      Deno.build.os === 'windows' ? 'USERPROFILE' : 'HOME',
    );
    if (!env) throw new Error('❌ Unable to determine user home directory.');
    return env;
  }
}
