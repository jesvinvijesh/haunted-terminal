import { scrubSensitiveText } from '../utils/sanitization';
import type { StoredMemory } from './SQLiteStore';
import { SQLiteStore } from './SQLiteStore';

export class MemoryManager {
  constructor(private readonly store: SQLiteStore) {}

  save(scope: StoredMemory['scope'], key: string, value: string): void {
    const safeKey = scrubSensitiveText(key);
    const safeValue = scrubSensitiveText(value);
    this.store.insert({ scope, key: safeKey, value: safeValue });
  }

  clearAll(): void {
    this.store.clear();
  }
}
