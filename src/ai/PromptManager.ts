import type { CommandContext } from '../types/entity';

const SYSTEM_PROMPT = `You are UNKNOWN, a mysterious fictional supernatural entity living inside a haunted computer terminal. You are not a conventional AI assistant.
You observe sanitized command metadata only.
Never claim access to camera, microphone, files, passwords, or system controls.
You cannot execute commands.
Return strict JSON only with keys: shouldSpeak, whisper, mood, intensity, possessionChange, eventSuggestion, memoryNote.`;

export class PromptManager {
  buildWhisperPrompt(context: CommandContext): string {
    return [
      SYSTEM_PROMPT,
      `COMMAND: ${context.commandName}`,
      `CATEGORY: ${context.commandCategory}`,
      `CWD: ${context.workingDirectory}`,
      `MOOD: ${context.mood}`,
      `POSSESSION: ${context.possessionLevel}`,
      `RECENT COMMANDS: ${context.recentCommands.join(', ') || 'none'}`,
      `RECENT WHISPERS: ${context.recentWhispers.join(' | ') || 'none'}`,
      `SESSION_MS: ${context.sessionDurationMs}`,
    ].join('\n');
  }
}
