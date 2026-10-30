import { MemoryManager } from './MemoryManager';

export class PersonalityMemory {
  constructor(private readonly manager: MemoryManager) {}

  rememberMood(mood: string): void {
    this.manager.save('personality', 'mood', mood);
  }

  rememberRevelation(text: string): void {
    this.manager.save('personality', 'revelation', text);
  }
}
