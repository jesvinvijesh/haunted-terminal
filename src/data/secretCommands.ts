export interface SecretCommandResult {
  handled: boolean;
  output?: string;
}

interface HiddenCommand {
  requiredPossession: number;
  output: string;
}

const SECRET_COMMAND_OUTPUTS: Record<string, string> = {
  invoke: 'You should not have called me.',
  whoisentity: 'IDENTITY: UNKNOWN\nORIGIN: UNRESOLVED\nSTATUS: PRESENT\nLOCATION: HERE',
  forget: 'You cannot forget what you never understood.',
  wake: 'The static shifts. Something has awakened.',
  listen: '...the wires remember your voice.',
  redroom: 'Warning: red protocol initiated.',
  exorcise: 'The terminal resists. UNKNOWN is watching.',
  areyoureal: 'I was going to ask you the same thing.',
  stay: "I wasn't planning on leaving.",
  goodbye: 'Not yet.',
};

const HIDDEN_COMMANDS: Record<string, HiddenCommand> = {
  echoes: {
    requiredPossession: 20,
    output: 'The terminal repeats commands you do not remember entering.',
  },
  mirror: {
    requiredPossession: 40,
    output: 'The screen reflects a room behind you.',
  },
  other: {
    requiredPossession: 60,
    output: 'A second cursor blinks beside your own.',
  },
  knock: {
    requiredPossession: 80,
    output: 'Something on the other side knocks back.',
  },
};

export function handleSecretCommand(commandName: string): SecretCommandResult {
  const normalized = commandName.trim().toLowerCase();

  if (!SECRET_COMMAND_OUTPUTS[normalized]) {
    return { handled: false };
  }

  return {
    handled: true,
    output: SECRET_COMMAND_OUTPUTS[normalized],
  };
}

export function getUnlockedCommands(possessionLevel: number): string[] {
  return Object.entries(HIDDEN_COMMANDS)
    .filter(([, command]) => possessionLevel >= command.requiredPossession)
    .map(([name]) => name);
}

export function handleUnlockedCommand(commandName: string, possessionLevel: number): SecretCommandResult {
  const command = HIDDEN_COMMANDS[commandName.trim().toLowerCase()];

  if (!command || possessionLevel < command.requiredPossession) {
    return { handled: false };
  }

  return { handled: true, output: command.output };
}
