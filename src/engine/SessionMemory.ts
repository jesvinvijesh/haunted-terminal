import type { EntityMood } from '../types/entity';

export class SessionMemory {
  recentCommands: string[] = [];
  recentWhispers: string[] = [];
  recentEvents: string[] = [];
  mood: EntityMood = 'dormant';

  pushCommand(commandName: string, max = 20): void {
    this.recentCommands.push(commandName);
    if (this.recentCommands.length > max) {
      this.recentCommands.shift();
    }
  }

  pushWhisper(whisper: string, max = 12): void {
    this.recentWhispers.push(whisper);
    if (this.recentWhispers.length > max) {
      this.recentWhispers.shift();
    }
  }

  pushEvent(eventName: string, max = 12): void {
    this.recentEvents.push(eventName);
    if (this.recentEvents.length > max) {
      this.recentEvents.shift();
    }
  }
}
