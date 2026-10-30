import type { EntityMood } from '../types/entity';

export class EntityMoodEngine {
  #mood: EntityMood = 'dormant';

  get mood(): EntityMood {
    return this.#mood;
  }

  updateFromCommand(commandName: string, possessionLevel: number): EntityMood {
    const command = commandName.toLowerCase();

    if (command === 'exit') {
      this.#mood = 'sad';
    } else if (command === 'invoke') {
      this.#mood = 'curious';
    } else if (command === 'exorcise') {
      this.#mood = possessionLevel >= 60 ? 'hostile' : 'irritated';
    } else if (command === 'whoami') {
      this.#mood = 'mysterious';
    } else if (possessionLevel > 80) {
      this.#mood = 'hostile';
    } else if (possessionLevel > 50) {
      this.#mood = 'confused';
    } else {
      this.#mood = 'curious';
    }

    return this.#mood;
  }

  updateFromInactivity(idleMs: number): EntityMood {
    if (idleMs > 60_000) {
      this.#mood = 'lonely';
    }

    return this.#mood;
  }
}
