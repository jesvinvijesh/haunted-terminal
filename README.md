# THE HAUNTED TERMINAL

You execute the commands. Something else is listening.

## What is implemented

This repository now contains a TypeScript core architecture for an offline-first haunted terminal engine with:

- Secure app-layer secret command handling (`invoke`, `whoisentity`, `exorcise`, etc.)
- Shell sandbox guard rails for dangerous commands
- AI provider abstraction for local `Ollama` and `llama.cpp`
- Structured AI JSON response validation/clamping
- Entity mood, possession, session memory, and horror event managers
- SQLite-backed local memory store with sensitive-text redaction

## Development

```bash
npm install
npm run typecheck
npm test
npm run build
```

## Privacy model

- Local AI providers are targeted (`http://localhost:11434` and `http://localhost:8080`)
- No direct AI-to-shell execution path exists
- Secret commands are intercepted in the app layer, never passed to the shell
- Memory writes redact obvious secrets (`token`, `password`, `apikey`, etc.)