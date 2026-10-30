#!/usr/bin/env node

import { createInterface } from 'node:readline';
import { AIConnectionManager } from './ai/AIConnectionManager';
import { EntityAIEngine } from './ai/EntityAIEngine';
import type { AIProvider } from './ai/AIProvider';
import { LlamaCppProvider } from './ai/LlamaCppProvider';
import { OfflineEntityProvider } from './ai/OfflineEntityProvider';
import { OllamaProvider } from './ai/OllamaProvider';
import { EntityEngine } from './engine/EntityEngine';
import { TerminalEngine } from './engine/TerminalEngine';

const prompt = 'haunted> ';

async function selectProvider(): Promise<{ provider: AIProvider; model: string }> {
  const candidates = [
    new OllamaProvider(process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434'),
    new LlamaCppProvider(process.env.LLAMACPP_BASE_URL ?? 'http://localhost:8080'),
  ];
  const connections = new AIConnectionManager(candidates);

  for (const candidate of candidates) {
    const status = (await connections.getProviderStatuses()).find((item) => item.provider === candidate.name);
    if (!status?.connected) continue;

    const models = await candidate.listModels().catch(() => []);
    const model = process.env.HAUNTED_MODEL ?? models[0];
    if (model) return { provider: candidate, model };
  }

  return { provider: new OfflineEntityProvider(), model: 'offline' };
}

async function main(): Promise<void> {
  const selected = await selectProvider();
  const entity = new EntityEngine(new EntityAIEngine(selected.provider, selected.model));
  const terminal = new TerminalEngine();
  let isClosing = false;

  const readline = createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt,
  });

  const handleLine = async (line: string): Promise<void> => {
    const command = line.trim();

    if (command === '.exit' || command === '.quit') {
      isClosing = true;
      readline.close();
      return;
    }

    if (command === '.help') {
      console.log('Enter a shell command, .state for entity state, or .exit to quit.');
      readline.prompt();
      return;
    }

    if (command === '.state') {
      const state = entity.getState();
      console.log(`${state.activeEntity} | possession ${state.possessionLevel}% | stage ${state.stage}`);
      console.log(`Unlocked commands: ${state.unlockedCommands.join(', ') || 'none'}`);
      readline.prompt();
      return;
    }

    if (!command) {
      readline.prompt();
      return;
    }

    let observation;
    try {
      observation = await entity.observe(command);
    } catch {
      console.log('[UNKNOWN] The connection stutters. The shell still answers.');
    }

    if (observation?.commandHandled) {
      if (observation.commandOutput) console.log(observation.commandOutput);
    } else {
      const result = await terminal.execute(command);
      if (result.output) {
        process.stdout.write(result.output.endsWith('\n') ? result.output : `${result.output}\n`);
      }
    }

    if (observation?.horrorEvent) {
      console.log(`[EVENT] ${observation.horrorEvent}`);
    }
    if (observation?.shouldSpeak && observation.whisper) {
      console.log(`[${observation.entity ?? 'UNKNOWN'}] ${observation.whisper}`);
    }
    if (!isClosing) readline.prompt();
  };

  let commandQueue = Promise.resolve();
  readline.on('line', (line) => {
    commandQueue = commandQueue.then(() => handleLine(line));
  });

  readline.on('close', () => {
    isClosing = true;
    console.log('\nThe terminal goes quiet.');
  });

  console.log(`The haunted terminal is listening. AI provider: ${selected.provider.name}.`);
  console.log('Type .help for commands or .exit to quit.');
  readline.prompt();
}

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});