#!/usr/bin/env node

import { createInterface } from 'node:readline';
import { TerminalEngine } from './engine/TerminalEngine';

const engine = new TerminalEngine();
const prompt = 'haunted> ';
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
    console.log('Enter a shell command, .help for this message, or .exit to quit.');
    readline.prompt();
    return;
  }

  if (!command) {
    readline.prompt();
    return;
  }

  const result = await engine.execute(command);
  if (result.output) {
    process.stdout.write(result.output.endsWith('\n') ? result.output : `${result.output}\n`);
  }
  if (!isClosing) {
    readline.prompt();
  }
};

let commandQueue = Promise.resolve();
readline.on('line', (line) => {
  commandQueue = commandQueue.then(() => handleLine(line));
});

console.log('The haunted terminal is listening. Type .help for commands or .exit to quit.');
readline.prompt();

readline.on('close', () => {
  isClosing = true;
  console.log('\nThe terminal goes quiet.');
});