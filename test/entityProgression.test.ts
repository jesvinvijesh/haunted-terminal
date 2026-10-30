import { describe, expect, it, vi } from 'vitest';
import { EntityAIEngine } from '../src/ai/EntityAIEngine';
import type { AIProvider } from '../src/ai/AIProvider';
import { EntityEngine } from '../src/engine/EntityEngine';

const whisper = JSON.stringify({
  shouldSpeak: true,
  whisper: 'The wires remember.',
  mood: 'mysterious',
  intensity: 1,
  possessionChange: 0,
  eventSuggestion: null,
  memoryNote: null,
});

function createEntity(): EntityEngine {
  const provider: AIProvider = {
    name: 'test',
    healthCheck: vi.fn(),
    listModels: vi.fn(),
    generate: vi.fn().mockResolvedValue(whisper),
  };

  return new EntityEngine(new EntityAIEngine(provider, 'test-model'));
}

describe('EntityEngine progression', () => {
  it('unlocks hidden commands as possession increases', async () => {
    const entity = createEntity();
    vi.spyOn(Math, 'random').mockReturnValue(1);

    for (let index = 0; index < 20; index += 1) {
      await entity.observe('printf signal');
    }

    const result = await entity.observe('echoes');

    expect(result.commandHandled).toBe(true);
    expect(result.commandOutput).toContain('commands you do not remember');
    expect(result.horrorEvent).not.toBe('THE OTHER AWAKENS');
    vi.restoreAllMocks();
  });

  it('awakens THE OTHER at the final possession threshold', async () => {
    const entity = createEntity();
    vi.spyOn(Math, 'random').mockReturnValue(1);

    let finalObservation;
    for (let index = 0; index < 80; index += 1) {
      finalObservation = await entity.observe('printf signal');
    }

    const state = entity.getState();
    expect(state.activeEntity).toBe('THE OTHER');
    expect(state.possessionLevel).toBe(80);
    expect(finalObservation?.horrorEvent).toBe('THE OTHER AWAKENS');

    vi.restoreAllMocks();
  });
});