## AI Agent Architecture

This document outlines the architecture, module responsibilities, and core design principles for this project, following Clean Code, modularity, and TDD practices.

## Design Principles

- Modularity (Clean Code): Each module has a single, well-defined responsibility. For example, FileSystemService only handles file I/O, while HistoryService only handles the business logic for the conversation history.
- TDD (Test Driven Development): The FileSystemService module is developed using TDD. It is generic, has no knowledge of business logic, and is fully testable.
- Configuration Separation: Secrets (API keys) are stored securely in .env. Public configuration (active model, provider names) is stored in the /config directory.
- Simple Lifecycle: Only one conversation is "active" at any time. This conversation is loaded into memory on startup and saved back to disk at the end of the session.
- Automatic Archiving: If the active conversation file is older than 4 days, it is automatically archived (moved), and a new, empty conversation is started. Archives are read-only ("consultable") and are not modified by the agent.

## File Structure and Module Roles

```
/my-ai-agent
|
|-- .env                 # (Untracked) Secrets (e.g., GEMINI_API_KEY)
|-- .gitignore           # Ignores .env, node_modules/, /agent_logs, /conversation_archives
|-- package.json         # Dependencies (e.g., @google/generative-ai, winston, DOMPurify)
|
|-- /config/
|   |-- agent_config.json  # Defines the *active* provider (e.g., { "provider": "gemini" })
|   |-- provider_settings.json # Public config for *all* providers (model name, API key's env var)
|
|-- /src/
|   |
|   |-- index.js           # ENTRY POINT: Initializes the agent and passes it the user's prompt.
|   |
|   |-- Agent.js           # ORCHESTRATOR (Main Logic):
|   |                      # 1. Initializes all services (log, config, sanitizer, provider, history).
|   |                      # 2. Calls `historyService.loadHistory()` on startup.
|   |                      # 3. Holds the active conversation history in memory.
|   |                      # 4. Cleans the user prompt: `cleanPrompt = sanitizerService.clean(prompt)`.
|   |                      # 5. Calls `provider.generateResponse(cleanPrompt, history)`.
|   |                      # 6. Calls `historyService.saveHistory(newHistory)` on shutdown.
|   |
|   |-- /providers/        # AI MODULE (Handles AI API logic)
|   |   |-- ProviderInterface.js # The "contract" or base class that all providers must implement.
|   |   |-- GeminiProvider.js  # Concrete implementation for the Gemini API.
|   |   |-- ProviderFactory.js # Factory that reads /config/agent_config.json and returns the correct provider instance.
|   |
|   |-- /services/         # TECHNICAL MODULES (Tools)
|   |   |-- LoggingService.js  # (Your file) Manages logs. Ideally, this uses a plugin like **Winston** to handle log file rotation.
|   |   |
|   |   |-- FileSystemService.js # (YOUR TDD MODULE)
|   |   |                    # Knows *only* files. 100% generic.
|   |   |                    # Functions: `read(path)`, `write(path, content)`, `stat(path)` (for date), `archive(path, newPath)` (to move/rename).
|   |   |
|   |   |-- HistoryService.js  # BUSINESS LOGIC MODULE (History Lifecycle)
|   |   |                    # The only module that knows about `active_conversation.json` and `/conversation_archives`.
|   |   |                    # USES FileSystemService.
|   |   |                    # `loadHistory()`: Checks date (via `FileSystemService.stat`). If > 4 days, calls `FileSystemService.archive()` and returns `[]`. Else, calls `FileSystemService.read()`.
|   |   |                    # `saveHistory(history)`: Calls `FileSystemService.write('active_conversation.json', ...)`.
|   |   |
|   |   |-- SanitizerService.js # SECURITY MODULE
|   |   |                    # Cleans user input to prevent injection attacks (e.g., strips <script> tags).
|   |   |                    # Often uses a library like **DOMPurify**.
|
|-- /agent_logs/           # (Untracked) Generated log files (e.g., agent.log).
|
|-- /conversation_archives/ # (Untracked) Old conversations (> 4 days) are moved here.
|
|-- /tests/
|   |-- FileSystemService.test.js # Your TDD tests for the FileSystemService.
|   |-- HistoryService.test.js # Tests for the expiration logic (by "mocking" FileSystemService).
|   |-- SanitizerService.test.js # Tests to ensure inputs are cleaned correctly.
```