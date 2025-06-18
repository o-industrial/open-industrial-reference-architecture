import { SecretClient } from 'npm:@azure/keyvault-secrets@4.10.0';
import { AccessToken, DefaultAzureCredential, TokenCredential } from 'npm:@azure/identity@4.10.1';
import { ISecretProvider } from './ISecretProvider.ts';

type TokenInput = string | (() => Promise<string>) | TokenCredential;

function isCredential(input: TokenInput): input is TokenCredential {
  return (
    typeof input === 'object' &&
    typeof (input as TokenCredential).getToken === 'function'
  );
}

function isTokenFn(input: TokenInput): input is () => Promise<string> {
  return typeof input === 'function';
}

/**
 * Secret provider that fetches secrets from Azure Key Vault
 * using either a static token, token function, or Azure credential.
 */
export class AzureKeyVaultSecretProvider implements ISecretProvider {
  protected client: SecretClient | null = null;

  constructor(
    private readonly vaultName: string,
    private readonly tokenInput: TokenInput = new DefaultAzureCredential(),
  ) {}

  public async GetSecret(key: string): Promise<string | undefined> {
    const client = await this.resolveClient();

    try {
      const secret = await client.getSecret(key);
      return secret?.value;
    } catch (err) {
      console.warn(`❌ Azure Key Vault: Failed to fetch '${key}'`, err);
      return undefined;
    }
  }

  protected resolveClient(): Promise<SecretClient> {
    if (this.client) {
      return Promise.resolve(this.client);
    }

    const vaultUrl = `https://${this.vaultName}.vault.azure.net`;

    let credential: TokenCredential;

    if (isCredential(this.tokenInput)) {
      credential = this.tokenInput;
    } else {
      credential = {
        getToken: async () => {
          const token = isTokenFn(this.tokenInput) ? await this.tokenInput() : this.tokenInput;

          return {
            token,
            expiresOnTimestamp: Date.now() + 60 * 60 * 1000, // 1hr
          } as AccessToken;
        },
      };
    }

    this.client = new SecretClient(vaultUrl, credential);

    return Promise.resolve(this.client);
  }
}
