const EVENTS = [
  'THE BREATH',
  'MEMORY LEAK',
  'THE KNOCK',
  'THE WATCHER',
  'CORRUPTION',
  'FALSE COMMAND',
  'THE FORGOTTEN MESSAGE',
  'THE SECOND VOICE',
  'THE LAST WARNING',
] as const;

export type HorrorEvent = (typeof EVENTS)[number];

export class HorrorEventManager {
  #lastEventAt = 0;
  #cooldownMs: number;

  constructor(cooldownMs = 10_000) {
    this.#cooldownMs = cooldownMs;
  }

  maybeTrigger(possessionLevel: number, force = false): HorrorEvent | null {
    const now = Date.now();
    const canTrigger = force || now - this.#lastEventAt >= this.#cooldownMs;

    if (!canTrigger) return null;

    const threshold = Math.min(0.65, 0.05 + possessionLevel / 200);
    if (!force && Math.random() > threshold) {
      return null;
    }

    this.#lastEventAt = now;
    return EVENTS[Math.floor(Math.random() * EVENTS.length)] ?? null;
  }
}
