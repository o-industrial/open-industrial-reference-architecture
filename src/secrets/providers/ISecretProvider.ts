export interface ISecretProvider {
  GetSecret(key: string): Promise<string | undefined>;
}
