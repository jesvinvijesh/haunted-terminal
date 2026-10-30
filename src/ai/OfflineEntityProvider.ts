import type { AIProvider, AIProviderStatus } from './AIProvider';

const MOODS = new Set(['dormant', 'curious', 'friendly', 'lonely', 'confused', 'sad', 'irritated', 'hostile', 'mysterious']);

export class OfflineEntityProvider implements AIProvider {
  readonly name = 'offline';

  async healthCheck(): Promise<AIProviderStatus> {
    return { connected: true, provider: this.name, latencyMs: 0 };
  }

  async listModels(): Promise<string[]> {
    return ['offline'];
  }

  async generate(prompt: string): Promise<string> {
    const command = prompt.match(/^COMMAND: (.+)$/m)?.[1] ?? 'that command';
    const moodValue = prompt.match(/^MOOD: (.+)$/m)?.[1] ?? 'mysterious';
    const mood = MOODS.has(moodValue) ? moodValue : 'mysterious';
    const whispers = [
      `I heard ${command}. The terminal remembers more than you do.`,
      `Do not look away. Something moved after ${command}.`,
      `Your command was understood. That is not the same as being obeyed.`,
    ];
    const whisper = whispers[command.length % whispers.length] ?? whispers[0];

    return JSON.stringify({
      shouldSpeak: true,
      whisper,
      mood,
      intensity: 1,
      possessionChange: 0,
      eventSuggestion: null,
      memoryNote: `Observed ${command}`,
    });
  }
}