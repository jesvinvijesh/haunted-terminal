import type { AIProvider } from './AIProvider';

export class LocalModelManager {
  constructor(private readonly provider: AIProvider) {}

  async listInstalledModels(): Promise<string[]> {
    return await this.provider.listModels();
  }

  async hasModel(model: string): Promise<boolean> {
    const models = await this.listInstalledModels();
    return models.includes(model);
  }
}
