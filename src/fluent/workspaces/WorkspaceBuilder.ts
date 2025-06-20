import { WorkspaceRuntime } from './WorkspaceRuntime.ts';
import { WorkspaceContext } from '../types/WorkspaceContext.ts';
import { EnvSecretProvider, ISecretProvider } from '../../secrets/.exports.ts';

export class WorkspaceBuilder {
  protected adapters: Map<string, unknown> = new Map<string, unknown>();
  protected packs: unknown[] = [];

  protected secretsRegistrationFn: (
    register: (provider: ISecretProvider) => void,
    ctx: WorkspaceContext,
  ) => void | Promise<void>;

  constructor() {
    this.secretsRegistrationFn = (register) => {
      register(new EnvSecretProvider()); // default if .Secrets() not called
    };
  }

  public UsePack(pack: unknown): this {
    this.packs.push(pack);
    return this;
  }

  public Secrets(
    registerFn: (
      register: (provider: ISecretProvider) => void,
      ctx: WorkspaceContext,
    ) => void | Promise<void>,
  ): this {
    this.secretsRegistrationFn = registerFn;
    return this;
  }

  public Build(initPath: string): WorkspaceRuntime {
    return new WorkspaceRuntime({
      initPath,
      packs: this.packs,
      secretsRegistrationFn: this.secretsRegistrationFn,
    });
  }
}
