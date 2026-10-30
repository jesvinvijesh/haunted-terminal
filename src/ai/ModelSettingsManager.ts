export interface ModelSettings {
  provider: 'ollama' | 'llama.cpp';
  model: string;
  temperature: number;
  maxTokens: number;
  aiDialogueEnabled: boolean;
}

export class ModelSettingsManager {
  #settings: ModelSettings;

  constructor(initial?: Partial<ModelSettings>) {
    this.#settings = {
      provider: 'ollama',
      model: 'qwen3:4b',
      temperature: 0.8,
      maxTokens: 120,
      aiDialogueEnabled: true,
      ...initial,
    };
  }

  get settings(): ModelSettings {
    return { ...this.#settings };
  }

  update(patch: Partial<ModelSettings>): ModelSettings {
    this.#settings = { ...this.#settings, ...patch };
    return this.settings;
  }
}
