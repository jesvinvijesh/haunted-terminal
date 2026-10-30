import type { AIProvider, AIProviderStatus } from './AIProvider';

interface OllamaGenerateResponse {
  response?: string;
}

export class OllamaProvider implements AIProvider {
  readonly name = 'ollama';

  constructor(private readonly baseUrl = 'http://localhost:11434') {}

  async healthCheck(): Promise<AIProviderStatus> {
    const start = Date.now();
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      return {
        connected: response.ok,
        provider: this.name,
        latencyMs: Date.now() - start,
      };
    } catch {
      return { connected: false, provider: this.name, latencyMs: Date.now() - start };
    }
  }

  async listModels(): Promise<string[]> {
    const response = await fetch(`${this.baseUrl}/api/tags`);
    if (!response.ok) return [];

    const data = (await response.json()) as { models?: Array<{ name?: string }> };
    return (data.models ?? []).map((model) => model.name ?? '').filter(Boolean);
  }

  async generate(prompt: string, model: string, signal?: AbortSignal): Promise<string> {
    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ model, prompt, stream: false }),
      signal: signal ?? null,
    });

    if (!response.ok) {
      throw new Error(`Ollama generation failed: ${response.status}`);
    }

    const data = (await response.json()) as OllamaGenerateResponse;
    return data.response ?? '';
  }
}
