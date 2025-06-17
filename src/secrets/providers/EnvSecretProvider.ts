import { ISecretProvider } from './ISecretProvider.ts';

export class EnvSecretProvider implements ISecretProvider {
  public GetSecret(key: string): Promise<string | undefined> {
    return Promise.resolve(Deno.env.get(key));
  }
}
