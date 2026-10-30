import type { AIProvider } from './AIProvider';

export class AIConnectionManager {
  constructor(private readonly providers: AIProvider[]) {}

  async getProviderStatuses() {
    return await Promise.all(this.providers.map(async (provider) => provider.healthCheck()));
  }

  async firstAvailableProvider(): Promise<AIProvider | null> {
    for (const provider of this.providers) {
      const status = await provider.healthCheck();
      if (status.connected) return provider;
    }

    return null;
  }
}
