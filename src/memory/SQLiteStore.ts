import { DatabaseSync } from 'node:sqlite';

export interface StoredMemory {
  id?: number;
  scope: 'short' | 'long' | 'personality';
  key: string;
  value: string;
  createdAt?: string;
}

export class SQLiteStore {
  private readonly db: DatabaseSync;

  constructor(filePath = ':memory:') {
    this.db = new DatabaseSync(filePath);
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS memories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        scope TEXT NOT NULL,
        key TEXT NOT NULL,
        value TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }

  insert(memory: StoredMemory): void {
    const stmt = this.db.prepare('INSERT INTO memories(scope, key, value) VALUES(?, ?, ?)');
    stmt.run(memory.scope, memory.key, memory.value);
  }

  list(scope?: StoredMemory['scope']): StoredMemory[] {
    if (scope) {
      const stmt = this.db.prepare('SELECT id, scope, key, value, created_at as createdAt FROM memories WHERE scope = ? ORDER BY id DESC');
      return stmt.all(scope) as unknown as StoredMemory[];
    }

    const stmt = this.db.prepare('SELECT id, scope, key, value, created_at as createdAt FROM memories ORDER BY id DESC');
    return stmt.all() as unknown as StoredMemory[];
  }

  clear(): void {
    this.db.exec('DELETE FROM memories');
  }
}
