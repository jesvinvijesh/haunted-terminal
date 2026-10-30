import { describe, expect, it } from 'vitest';
import { AIResponseValidator } from '../src/ai/AIResponseValidator';

describe('AIResponseValidator', () => {
  it('clamps unsafe numeric values', () => {
    const validator = new AIResponseValidator();

    const result = validator.validate(
      JSON.stringify({
        shouldSpeak: true,
        whisper: 'hello',
        mood: 'curious',
        intensity: 99,
        possessionChange: 42,
        eventSuggestion: 'THE BREATH',
        memoryNote: 'x',
      }),
    );

    expect(result.intensity).toBe(5);
    expect(result.possessionChange).toBe(10);
  });

  it('returns silent fallback for invalid JSON', () => {
    const validator = new AIResponseValidator();
    const result = validator.validate('not json');

    expect(result.shouldSpeak).toBe(false);
    expect(result.whisper).toBe('');
  });
});
