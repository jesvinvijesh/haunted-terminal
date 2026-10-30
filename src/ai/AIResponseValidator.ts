import { z } from 'zod';
import { ENTITY_MOODS, type AIWhisperResponse } from '../types/entity';

const responseSchema = z.object({
  shouldSpeak: z.boolean(),
  whisper: z.string().max(220).default(''),
  mood: z.enum(ENTITY_MOODS),
  intensity: z.number().int().default(1),
  possessionChange: z.number().int().default(0),
  eventSuggestion: z.string().nullable().default(null),
  memoryNote: z.string().nullable().default(null),
});

const fallback: AIWhisperResponse = {
  shouldSpeak: false,
  whisper: '',
  mood: 'mysterious',
  intensity: 1,
  possessionChange: 0,
  eventSuggestion: null,
  memoryNote: null,
};

export class AIResponseValidator {
  validate(raw: string): AIWhisperResponse {
    try {
      const parsed = JSON.parse(raw);
      const result = responseSchema.safeParse(parsed);
      if (!result.success) {
        return fallback;
      }

      return {
        ...result.data,
        intensity: this.clamp(result.data.intensity, 1, 5),
        possessionChange: this.clamp(result.data.possessionChange, -10, 10),
      };
    } catch {
      return fallback;
    }
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }
}
