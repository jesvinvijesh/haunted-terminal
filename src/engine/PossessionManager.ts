import type { PossessionStage } from '../types/entity';

export class PossessionManager {
  #level = 0;

  get level(): number {
    return this.#level;
  }

  adjust(change: number): number {
    this.#level = Math.max(0, Math.min(100, this.#level + change));
    return this.#level;
  }

  set(level: number): number {
    this.#level = Math.max(0, Math.min(100, level));
    return this.#level;
  }

  getStage(): PossessionStage {
    if (this.#level >= 100) return 'COMPLETE AWARENESS';
    if (this.#level >= 80) return 'HOSTILE';
    if (this.#level >= 60) return 'POSSESSED';
    if (this.#level >= 40) return 'WATCHING';
    if (this.#level >= 20) return 'AWAKENING';
    return 'DORMANT';
  }
}
