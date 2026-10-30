import type { CommandContext } from '../types/entity';

const SECRET_PATTERNS = [/token/i, /password/i, /passwd/i, /secret/i, /apikey/i, /bearer\s+/i, /\*{4,}/];
const SAFE_COMMAND_RE = /^[a-zA-Z0-9._/-]+$/;

export interface SanitizedCommand {
  commandName: string;
  commandCategory: string;
  safeWorkingDirectory: string;
}

export function inferCommandCategory(commandName: string): string {
  const categoryMap: Record<string, string> = {
    ls: 'filesystem',
    cd: 'navigation',
    cat: 'filesystem',
    pwd: 'navigation',
    history: 'history',
    clear: 'display',
    whoami: 'identity',
  };

  return categoryMap[commandName] ?? 'general';
}

export function sanitizeCommandInput(rawInput: string): SanitizedCommand {
  const trimmed = rawInput.trim();
  const firstToken = trimmed.split(/\s+/)[0]?.toLowerCase() ?? '';
  const commandName = SAFE_COMMAND_RE.test(firstToken) ? firstToken : 'unknown';

  return {
    commandName,
    commandCategory: inferCommandCategory(commandName),
    safeWorkingDirectory: '.',
  };
}

export function scrubSensitiveText(value: string): string {
  if (SECRET_PATTERNS.some((pattern) => pattern.test(value))) {
    return '[REDACTED]';
  }

  return value;
}

export function buildSafeContext(
  base: Omit<CommandContext, 'commandName' | 'commandCategory' | 'workingDirectory'>,
  sanitized: SanitizedCommand,
): CommandContext {
  return {
    ...base,
    commandName: sanitized.commandName,
    commandCategory: sanitized.commandCategory,
    workingDirectory: sanitized.safeWorkingDirectory,
  };
}
