import { handleSecretCommand } from '../data/secretCommands';
import { sanitizeCommandInput } from '../utils/sanitization';
import { ShellManager, type ShellResult } from './ShellManager';

export interface CommandExecutionResult {
  isSecret: boolean;
  output: string;
  shellResult?: ShellResult;
}

export class TerminalEngine {
  #shell: ShellManager;
  readonly history: string[] = [];

  constructor(shellManager = new ShellManager()) {
    this.#shell = shellManager;
  }

  async execute(command: string, cwd?: string): Promise<CommandExecutionResult> {
    this.history.push(command);

    const sanitized = sanitizeCommandInput(command);
    const secret = handleSecretCommand(sanitized.commandName);

    if (secret.handled) {
      return {
        isSecret: true,
        output: secret.output ?? '',
      };
    }

    const shellResult = await this.#shell.execute(command, cwd);
    return {
      isSecret: false,
      output: shellResult.stdout || shellResult.stderr,
      shellResult,
    };
  }
}
