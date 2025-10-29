## Hexagonal AI Agent Architecture

This document outlines the project's architecture using a formal Hexagonal (Ports & Adapters) model. This structure strictly separates business logic (the "Core") from technical implementations (the "Infrastructure").

## Core Principles

1. **Hexagonal Core**: The /src/core/ directory contains all pure business logic. It has zero dependencies on external libraries like fs, winston, or @google/generative-ai. It only knows about "Ports" (interfaces).

2. **Ports** (The Contracts): The /src/core/ports/ directory defines the "contracts" or interfaces that the Core needs to interact with the outside world.

3. **Adapters** (The Infrastructure): The /src/infrastructure/ directory contains the concrete implementations (adapters) for those ports. This is where all the technical code (fs, fetch, APIs) lives.

4. **TDD** (Test Driven Development): The FileSystemAdapter.js (in /infrastructure/) is your TDD module. Because the Core depends on an interface (FileSystemPort.js), it is easy to "mock" this adapter in tests for the HistoryService.

## File Structure and Module Roles

```
/my-ai-agent
|
|-- .env                 # (Untracked) Secrets (e.g., GEMINI_API_KEY)
|-- .gitignore           # Ignores .env, node_modules/, /agent_logs, /conversation_archives
|-- package.json         # Dependencies (e.g., @google/generative-ai, winston)
|
|-- /config/             # (Unchanged) Public configuration.
|   |-- agent_config.json
|   |-- provider_settings.json
|
|-- /src/
|   |
|   |-- /core/domain/      # === THE HEXAGON (Business Logic) ===
|   |   |-- Agent.js         # The main orchestrator.
|   |   |                  # Depends *only* on Port interfaces (e.g., `ProviderPort`, `HistoryService`).
|   |   |                  # Responsible for safely handling tool execution requests from the Provider (to prevent Prompt Injection attacks).
|   |   |
|   |   |-- HistoryService.js# Pure business logic for the lifecycle (4-day rule, archiving).
|   |   |                  # Depends *only* on `FileSystemPort` and `LoggingPort`.
|   |
|   |-- /core/ports/       # === THE PORTS (Interfaces / Contracts) ===
|   |   |-- FileSystemPort.js  # Contract: `read(path)`, `write(path, content)`, `stat(path)`, `archive(path)`.
|   |   |-- LoggingPort.js     # Contract: `info(message)`, `warn(message)`, `error(message)`.
|   |   |-- ProviderPort.js    # Contract: `generateResponse(prompt, history)`.
|   |   |-- SanitizerPort.js   # Contract: `clean(text)`.
|   |
|   |-- /infrastructure/   # === THE OUTSIDE WORLD (Technical Code) ===
|   |   |-- /adapters/       # Concrete implementations of the Ports.
|   |   |   |-- FileSystemAdapter.js # (YOUR TDD MODULE) Implements `FileSystemPort`.
|   |   |   |                  # *This is where you use `fs/promises`.*
|   |   |   |
|   |   |   |-- WinstonLoggingAdapter.js # Implements `LoggingPort`. Uses the `winston` library.
|   |   |   |
|   |   |   |-- GeminiProviderAdapter.js # Implements `ProviderPort`. Uses `@google/generative-ai`.
|   |   |   |
|   |   |   |-- SimpleSanitizerAdapter.js # Implements `SanitizerPort`. Uses regex to block potential OS command injection keywords (e.g., 'rm', 'curl', '>') from terminal input.
|   |   |
|   |   |-- ProviderFactory.js # Reads /config/ and returns the correct *Provider Adapter*.
|   |
|   |-- /application/      # === THE STARTUP LAYER ===
|   |   |-- index.js         # ENTRY POINT.
|   |   |                  # This is the *only* place where Core and Infrastructure meet.
|   |   |                  # It "wires" the application together (Dependency Injection).
|   |                      # 1. Creates adapter instances (new FileSystemAdapter()).
|   |                      # 2. Creates core instances (new HistoryService(fileSystemAdapter)).
|   |                      # 3. Creates the agent (new Agent(historyService, ...)).
|   |                      # 4. Starts the agent.
|
|-- /agent_logs/           # (Untracked) Generated log files.
|
|-- /conversation_archives/ # (Untracked) Old conversations (> 4 days).
|
|-- /tests/
|   |-- /infrastructure/
|   |   |-- FileSystemAdapter.test.js # (Your TDD tests).
|   |   |-- SimpleSanitizerAdapter.test.js # Tests for the input sanitizer.
|   |
|   |-- /core/
|   |   |-- HistoryService.test.js # Tests the 4-day logic (mocks the FileSystemPort).
```