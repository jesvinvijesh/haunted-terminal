import { spawn } from 'node:child_process';

export interface ShellResult {
  code: number;
  stdout: string;
  stderr: string;
}

const DENIED_COMMANDS = new Set(['rm', 'sudo', 'su', 'chmod', 'chown']);

export class ShellManager {
  async execute(command: string, cwd = process.cwd()): Promise<ShellResult> {
    const commandName = command.trim().split(/\s+/)[0]?.toLowerCase() ?? '';

    if (DENIED_COMMANDS.has(commandName)) {
      return {
        code: 1,
        stdout: '',
        stderr: `Command blocked in sandbox mode: ${commandName}`,
      };
    }

    return await new Promise((resolve) => {
      const child = spawn(command, {
        cwd,
        shell: true,
        env: process.env,
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (chunk: Buffer) => {
        stdout += chunk.toString('utf8');
      });

      child.stderr.on('data', (chunk: Buffer) => {
        stderr += chunk.toString('utf8');
      });

      child.on('close', (code) => {
        resolve({ code: code ?? 1, stdout, stderr });
      });
    });
  }
}
