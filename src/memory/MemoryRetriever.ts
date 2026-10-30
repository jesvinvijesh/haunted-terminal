import type { StoredMemory } from './SQLiteStore';
import { SQLiteStore } from './SQLiteStore';

export class MemoryRetriever {
  constructor(private readonly store: SQLiteStore) {}

  recent(limit = 10): StoredMemory[] {
    return this.store.list().slice(0, limit);
  }

  byScope(scope: StoredMemory['scope'], limit = 10): StoredMemory[] {
    return this.store.list(scope).slice(0, limit);
  }
}
