export interface SecretCommandResult {
  handled: boolean;
  output?: string;
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
