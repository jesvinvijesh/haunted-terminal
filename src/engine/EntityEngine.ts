import { EntityAIEngine } from '../ai/EntityAIEngine';
import { getUnlockedCommands, handleSecretCommand, handleUnlockedCommand } from '../data/secretCommands';
import type { AIWhisperResponse, EntityName } from '../types/entity';
import { sanitizeCommandInput } from '../utils/sanitization';
import { EntityMoodEngine } from './EntityMoodEngine';
import { HorrorEventManager } from './HorrorEventManager';
import { PossessionManager } from './PossessionManager';
import { SessionMemory } from './SessionMemory';

const SILENT_RESPONSE: AIWhisperResponse = {
  shouldSpeak: false,
  whisper: '',
  mood: 'mysterious',
  intensity: 1,
  possessionChange: 0,
  eventSuggestion: null,
  memoryNote: null,
};

export class EntityEngine {
  #otherAwakened = false;

  constructor(
    private readonly ai: EntityAIEngine,
    private readonly mood = new EntityMoodEngine(),
    private readonly possession = new PossessionManager(),
    private readonly events = new HorrorEventManager(),
    private readonly memory = new SessionMemory(),
    private readonly startedAt = Date.now(),
  ) {}

  getState() {
    return {
      mood: this.mood.mood,
      possessionLevel: this.possession.level,
      stage: this.possession.getStage(),
      activeEntity: this.activeEntity,
      unlockedCommands: getUnlockedCommands(this.possession.level),
      recentCommands: [...this.memory.recentCommands],
      recentWhispers: [...this.memory.recentWhispers],
    };
  }

  get activeEntity(): EntityName {
    return this.#otherAwakened ? 'THE OTHER' : 'UNKNOWN';
  }

  async observe(command: string): Promise<AIWhisperResponse> {
    const sanitized = sanitizeCommandInput(command);
    const secret = handleSecretCommand(sanitized.commandName);

    this.memory.pushCommand(sanitized.commandName);
    this.possession.adjust(secret.handled ? 3 : 1);
    const hidden = handleUnlockedCommand(sanitized.commandName, this.possession.level);
    const otherAwakenedThisTurn = !this.#otherAwakened && this.possession.level >= 80;
    if (otherAwakenedThisTurn) this.#otherAwakened = true;
    const mood = this.mood.updateFromCommand(sanitized.commandName, this.possession.level);
    this.memory.mood = mood;

    let response = SILENT_RESPONSE;
    if (Math.random() < 0.35 || secret.handled || hidden.handled || otherAwakenedThisTurn) {
      response = await this.ai.generateWhisper({
        commandName: sanitized.commandName,
        commandCategory: sanitized.commandCategory,
        workingDirectory: sanitized.safeWorkingDirectory,
        possessionLevel: this.possession.level,
        mood,
        recentCommands: this.memory.recentCommands,
        recentWhispers: this.memory.recentWhispers,
        sessionDurationMs: Date.now() - this.startedAt,
      });

      if (response.shouldSpeak && response.whisper) {
        this.memory.pushWhisper(response.whisper);
      }
    }

    this.possession.adjust(response.possessionChange);
    const event = otherAwakenedThisTurn
      ? 'THE OTHER AWAKENS'
      : this.events.maybeTrigger(this.possession.level, Boolean(secret.handled || hidden.handled));
    if (event) this.memory.pushEvent(event);
    const commandOutput = secret.output ?? hidden.output;

    return {
      ...response,
      entity: this.activeEntity,
      horrorEvent: event,
      commandHandled: secret.handled || hidden.handled,
      ...(commandOutput ? { commandOutput } : {}),
    };
  }
}
