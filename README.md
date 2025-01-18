# Obsidian AI Assistant Plugin

A powerful plugin for Obsidian that provides direct access to various AI assistants, each specialized for different types of queries and data handling.

## Features

### Multiple AI Providers

- **Claude**: Primary assistant for coding-related queries
- **ChatGPT**: General-purpose queries and creative tasks
- **Alternative Provider**: Personal data handling with enhanced privacy focus

### Smart Context Management

- Automatically includes relevant code snippets in programming queries
- Maintains conversation history for coherent multi-turn interactions
- Preserves markdown formatting in responses

### Privacy-First Design

- Local storage of conversation history
- No data sharing between different AI providers
- Configurable data retention policies
- Optional anonymization of sensitive information

### Seamless Integration

- Command palette integration
- Customizable hotkeys for each AI provider
- Direct insertion of responses into notes
- Code block syntax highlighting
- Markdown-native formatting

## Installation

1. Open Obsidian Settings
2. Go to Community Plugins and disable Safe Mode
3. Click Browse and search for "AI Assistant Plugin"
4. Install the plugin and enable it
5. Configure your API keys in the settings

## Configuration

### Required API Keys

- Claude API Key (Anthropic)
- OpenAI API Key (ChatGPT)
- Alternative Provider API Key

### Settings Options

- Default AI provider for different query types
- Response formatting preferences
- Context inclusion settings
- Privacy and data retention settings
- Hotkey configurations

## Usage

### Quick Commands

- `Ctrl/Cmd + Shift + C`: Query Claude for code help
- `Ctrl/Cmd + Shift + G`: Query ChatGPT for general questions
- `Ctrl/Cmd + Shift + P`: Query privacy-focused provider

### Context Menu

Right-click on code blocks to:

- Ask for explanations
- Request optimizations
- Debug issues
- Generate documentation

## Technical Architecture

### Core Components

1. **Main Plugin Class (`main.ts`)**

   - Plugin lifecycle management
   - Command registration
   - Context handling

2. **AI Providers (`src/providers/`)**

   - `claude.ts`: Coding assistance
   - `chatgpt.ts`: General queries
   - `privacy.ts`: Sensitive data handling

3. **Context Management (`src/context/`)**

   - Code block extraction
   - Conversation history
   - Context relevance scoring

4. **Privacy Layer (`src/privacy/`)**
   - Data anonymization
   - API key management
   - Request sanitization

## Privacy & Security

- All API keys are stored encrypted
- Conversations are stored locally
- Optional anonymization of code snippets
- Configurable data retention
- No telemetry collection

## Support

For issues or suggestions, please visit our [GitHub repository](https://github.com/yourusername/obsidian-ai-assistant).

## License

This project is licensed under the MIT License - see the LICENSE file for details.
