import type { AIProvider, AIProviderStatus } from './AIProvider';

export class LlamaCppProvider implements AIProvider {
  readonly name = 'llama.cpp';

  constructor(private readonly baseUrl = 'http://localhost:8080') {}

  async healthCheck(): Promise<AIProviderStatus> {
    const start = Date.now();
    try {
      const response = await fetch(`${this.baseUrl}/health`);
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
    const response = await fetch(`${this.baseUrl}/v1/models`);
    if (!response.ok) return [];

    const data = (await response.json()) as { data?: Array<{ id?: string }> };
    return (data.data ?? []).map((m) => m.id ?? '').filter(Boolean);
  }

  async generate(prompt: string, model: string, signal?: AbortSignal): Promise<string> {
    const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      signal: signal ?? null,
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      throw new Error(`llama.cpp generation failed: ${response.status}`);
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    return data.choices?.[0]?.message?.content ?? '';
  }
}
