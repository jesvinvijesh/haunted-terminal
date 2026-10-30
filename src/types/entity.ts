export const ENTITY_MOODS = [
  'dormant',
  'curious',
  'friendly',
  'lonely',
  'confused',
  'sad',
  'irritated',
  'hostile',
  'mysterious',
] as const;

export type EntityMood = (typeof ENTITY_MOODS)[number];

export type EntityName = 'UNKNOWN' | 'THE OTHER';

export interface AIWhisperResponse {
  shouldSpeak: boolean;
  whisper: string;
  mood: EntityMood;
  intensity: number;
  possessionChange: number;
  eventSuggestion: string | null;
  memoryNote: string | null;
  horrorEvent?: string | null;
  entity?: EntityName;
  commandHandled?: boolean;
  commandOutput?: string;
}

export interface CommandContext {
  commandName: string;
  commandCategory: string;
  workingDirectory: string;
  possessionLevel: number;
  mood: EntityMood;
  sessionDurationMs: number;
  recentCommands: string[];
  recentWhispers: string[];
}

export type PossessionStage =
  | 'DORMANT'
  | 'AWAKENING'
  | 'AWARE'
  | 'WATCHING'
  | 'POSSESSED'
  | 'HOSTILE'
  | 'COMPLETE AWARENESS';
