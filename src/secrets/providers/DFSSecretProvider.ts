import { DFSFileHandler } from '../.deps.ts';
import { ISecretProvider } from './ISecretProvider.ts';

export class DFSSecretProvider implements ISecretProvider {
  constructor(
    private readonly dfs: DFSFileHandler,
    private readonly filePath: string,
  ) {}

  private async load(): Promise<Record<string, string>> {
    try {
      const file = await this.dfs.GetFileInfo(this.filePath);
      if (!file?.Contents) throw new Error('No contents in DFS file');

      const text = await new Response(file.Contents).text();
      const ext = this.filePath.split('.').pop()?.toLowerCase();

      if (ext === 'json') {
        return JSON.parse(text);
      }

      const secrets: Record<string, string> = {};
      for (const line of text.split('\n')) {
        const [key, ...rest] = line.trim().split('=');
        if (key && rest.length > 0) {
          secrets[key] = rest.join('=').trim();
        }
      }

      return secrets;
    } catch (err) {
      console.warn(`⚠️ Failed to load secrets from DFS: ${this.filePath}`, err);
      return {};
    }
  }

  async GetSecret(key: string): Promise<string | undefined> {
    const secrets = await this.load();
    return secrets[key];
  }
}
