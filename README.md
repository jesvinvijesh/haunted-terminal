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

## Requirements

- Node.js 22 or newer. The memory store uses Node's built-in `node:sqlite` API.
- npm 10 or newer.
- Ollama or llama.cpp is optional. The CLI uses the deterministic offline provider when neither local AI service is available.

The project does not require cloud credentials or a remote API.

## Development

```bash
npm install
npm run typecheck
npm test
npm run build
```

The commands do the following:

| Command | Purpose |
| --- | --- |
| `npm install` | Install runtime and development dependencies. |
| `npm run typecheck` | Typecheck `src/` without writing output. |
| `npm test` | Run the Vitest suite in `test/`. |
| `npm run build` | Compile TypeScript declarations, source maps, and JavaScript into `dist/`. |
| `npm run dev` | Run the TypeScript CLI directly through `tsx`. |
| `npm start` | Build the project, then run the compiled CLI. |

## Run

Start the interactive terminal with:

```bash
npm start
```

For development without building first:

```bash
npm run dev
```

Enter shell commands at the `haunted>` prompt. Use `.help` for help and `.exit` to quit.

The CLI also supports:

| Input | Purpose |
| --- | --- |
| `.help` | Show the CLI command summary. |
| `.state` | Show the active entity, possession percentage, possession stage, and unlocked commands. |
| `.exit` or `.quit` | Close the terminal. |
| Any other input | Observe the command through the entity, then execute it through the sandboxed shell unless it is intercepted. |

The CLI prints shell output, entity whispers as `[UNKNOWN] ...` or `[THE OTHER] ...`, and horror events as `[EVENT] ...`.

## Secret commands

Secret commands are intercepted before they reach the shell. Enter them as the complete command name:

| Command | Response |
| --- | --- |
| `invoke` | You should not have called me. |
| `whoisentity` | Reports an unknown identity, unresolved origin, and present status. |
| `forget` | You cannot forget what you never understood. |
| `wake` | The static shifts. Something has awakened. |
| `listen` | ...the wires remember your voice. |
| `redroom` | Warning: red protocol initiated. |
| `exorcise` | The terminal resists. UNKNOWN is watching. |
| `areyoureal` | I was going to ask you the same thing. |
| `stay` | I wasn't planning on leaving. |
| `goodbye` | Not yet. |

The app-layer interception is implemented by `handleSecretCommand`. It prevents secret commands from being passed to `ShellManager` and increases possession by three when they are observed by `EntityEngine`.

During an entity-aware session, additional commands unlock as possession rises:

| Possession | Command | Response |
| ---: | --- | --- |
| 20% | `echoes` | The terminal repeats commands you do not remember entering. |
| 40% | `mirror` | The screen reflects a room behind you. |
| 60% | `other` | A second cursor blinks beside your own. |
| 80% | `knock` | Something on the other side knocks back. |

At 80% possession, `THE OTHER` awakens and becomes the active entity. Use `.state` in the CLI to inspect possession, the current stage, active entity, and unlocked commands.

Normal commands add one possession point. Public secret commands add three. A valid AI response can add or remove up to ten additional points. Possession is kept in memory for the current process and starts over when the CLI restarts.

The possession stages are:

| Level | Stage |
| ---: | --- |
| 0-19 | `DORMANT` |
| 20-39 | `AWAKENING` |
| 40-59 | `WATCHING` |
| 60-79 | `POSSESSED` |
| 80-99 | `HOSTILE` |
| 100 | `COMPLETE AWARENESS` |

Horror events are probabilistic and have a cooldown. Secret and unlocked commands force an event check, while ordinary commands may remain silent.

## AI integration

AI integration is local-first and provider-agnostic. The available providers are:

- **Ollama** at `http://localhost:11434`, using `/api/tags` and `/api/generate`
- **llama.cpp** at `http://localhost:8080`, using `/health` and the OpenAI-compatible `/v1/models` and `/v1/chat/completions` endpoints

### Ollama setup

Install and start Ollama, then pull a local model. The default model setting is `qwen3:4b`.

```bash
ollama serve
ollama pull qwen3:4b
```

The provider URL can be overridden when constructing it:

```ts
import { OllamaProvider } from 'haunted-terminal';

const provider = new OllamaProvider('http://localhost:11434');
```

### Connect a provider

Use `AIConnectionManager` to check providers and select the first reachable one. Pass the selected provider and model to `EntityAIEngine`, then pass that engine to `EntityEngine`:

```ts
import {
	AIConnectionManager,
	EntityAIEngine,
	EntityEngine,
	LlamaCppProvider,
	OllamaProvider,
} from 'haunted-terminal';

const providers = [
	new OllamaProvider(),
	new LlamaCppProvider(),
];
const connections = new AIConnectionManager(providers);
const provider = await connections.firstAvailableProvider();

if (!provider) {
	throw new Error('No local AI provider is available');
}

const entity = new EntityEngine(
	new EntityAIEngine(provider, 'qwen3:4b'),
);
const response = await entity.observe('ls -la');

if (response.shouldSpeak) {
	console.log(response.whisper);
}
```

Before selecting a model, use `provider.listModels()` or `LocalModelManager` to inspect models installed by the selected backend. `AIConnectionManager` only checks connectivity; it does not download models or start providers.

The CLI connects `EntityEngine` to command execution. It uses a reachable local Ollama or llama.cpp model when available and falls back to `OfflineEntityProvider` when neither is running. Set `OLLAMA_BASE_URL`, `LLAMACPP_BASE_URL`, or `HAUNTED_MODEL` to override local provider settings. Applications embedding the library can call `entity.observe(command)` alongside their own command execution to receive whispers, events, active-entity state, and progression-gated command results.

### AI response contract

Providers receive a prompt generated by `PromptManager` and must return strict JSON with these fields:

```json
{
	"shouldSpeak": true,
	"whisper": "The wires remember.",
	"mood": "mysterious",
	"intensity": 2,
	"possessionChange": 1,
	"eventSuggestion": null,
	"memoryNote": null
}
```

`AIResponseValidator` rejects malformed responses and returns a silent fallback. It limits `whisper` to 220 characters, `intensity` to 1-5, and `possessionChange` to -10 through 10.

### CLI provider configuration

The CLI checks providers in this order:

1. Ollama
2. llama.cpp
3. `OfflineEntityProvider`

The first reachable provider with at least one installed model is selected. Environment variables configure the local endpoints and model:

```bash
OLLAMA_BASE_URL=http://localhost:11434 \
LLAMACPP_BASE_URL=http://localhost:8080 \
HAUNTED_MODEL=qwen3:4b \
npm run dev
```

If `HAUNTED_MODEL` is set, that model name is used for the selected provider. Otherwise, the first model returned by that provider is used. The offline provider always returns valid, eerie JSON and does not execute commands or access the network.

## Runtime flow

For each user command, the entity-aware CLI follows this sequence:

1. Sanitize command metadata before it is sent to an AI provider.
2. Record the command in `SessionMemory`.
3. Increase possession and update UNKNOWN's mood.
4. Check public and possession-gated commands before shell execution.
5. Ask the selected AI provider for a strict JSON whisper when the entity chooses to speak.
6. Validate and clamp the AI response.
7. Apply any possession change, record whispers and events, and print the result.
8. Execute ordinary commands through `ShellManager` only after the entity observation.

There is no direct AI-to-shell execution path. AI output is treated as narrative data and cannot issue shell commands.

## Memory and personality

`SessionMemory` keeps recent commands, whispers, events, and the current mood for the active process. `EntityMoodEngine` updates mood from commands, possession, and inactivity. `PossessionManager` tracks the level and stage, while `EntityEngine` switches the active name from `UNKNOWN` to `THE OTHER` at 80% possession.

SQLite-backed memory utilities are available for applications that need memory across runs:

```ts
import { MemoryManager, MemoryRetriever, PersonalityMemory, SQLiteStore } from 'haunted-terminal';

const store = new SQLiteStore('./haunted-terminal.sqlite');
const memories = new MemoryManager(store);
const personality = new PersonalityMemory(memories);

personality.rememberMood('curious');
console.log(new MemoryRetriever(store).byScope('personality'));
```

The default `SQLiteStore()` uses `:memory:`. Persistent storage requires an explicit file path. Memory writes redact obvious credentials and secrets before insertion. The CLI currently uses session memory; applications embedding the library can opt into SQLite persistence.

## Project layout

| Path | Responsibility |
| --- | --- |
| `src/cli.ts` | Interactive CLI, provider selection, entity/shell coordination, and output formatting. |
| `src/engine/EntityEngine.ts` | Observation flow, possession, whispers, events, hidden commands, and active entity. |
| `src/engine/TerminalEngine.ts` | Command sanitization, public secret interception, and shell execution. |
| `src/engine/ShellManager.ts` | Sandboxed child-process execution and blocked command checks. |
| `src/engine/HorrorEventManager.ts` | Cooldown and probability rules for mysterious events. |
| `src/ai/` | Provider interfaces, local backends, prompts, validation, and offline fallback. |
| `src/memory/` | Session-adjacent memory APIs, SQLite storage, retrieval, and personality helpers. |
| `src/data/secretCommands.ts` | Public and possession-gated command definitions. |
| `test/` | Unit and progression tests. |

## Testing and verification

Run the complete local verification sequence with:

```bash
npm run typecheck
npm test
npm run build
```

To exercise the CLI without an AI service, use `npm start`; it automatically selects `OfflineEntityProvider`. To test a local model, start Ollama or llama.cpp first, then run `HAUNTED_MODEL=<model> npm start`.

## Privacy model

- Local AI providers are targeted (`http://localhost:11434` and `http://localhost:8080`)
- No direct AI-to-shell execution path exists
- Secret commands are intercepted in the app layer, never passed to the shell
- Memory writes redact obvious secrets (`token`, `password`, `apikey`, etc.)