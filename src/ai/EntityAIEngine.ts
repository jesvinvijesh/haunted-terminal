import type { AIWhisperResponse, CommandContext } from '../types/entity';
import type { AIProvider } from './AIProvider';
import { AIResponseValidator } from './AIResponseValidator';
import { PromptManager } from './PromptManager';

export class EntityAIEngine {
  constructor(
    private readonly provider: AIProvider,
    private readonly model: string,
    private readonly promptManager = new PromptManager(),
    private readonly validator = new AIResponseValidator(),
  ) {}

  async generateWhisper(context: CommandContext, signal?: AbortSignal): Promise<AIWhisperResponse> {
    const prompt = this.promptManager.buildWhisperPrompt(context);
    const raw = await this.provider.generate(prompt, this.model, signal);
    return this.validator.validate(raw);
  }
}
