export interface AIProviderStatus {
  connected: boolean;
  provider: string;
  latencyMs?: number;
}

export interface AIProvider {
  readonly name: string;
  healthCheck(): Promise<AIProviderStatus>;
  listModels(): Promise<string[]>;
  generate(prompt: string, model: string, signal?: AbortSignal): Promise<string>;
}
