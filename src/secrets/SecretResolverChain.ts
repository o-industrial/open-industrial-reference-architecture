import { ISecretProvider } from './providers/ISecretProvider.ts';

export class SecretResolverChain {
  private providers: ISecretProvider[] = [];

  public Register(provider: ISecretProvider): void {
    this.providers.push(provider);
  }

  public async GetSecret(key: string): Promise<string | undefined> {
    for (const provider of this.providers) {
      const value = await provider.GetSecret(key);
      if (value !== undefined) return value;
    }
    return undefined;
  }
}
