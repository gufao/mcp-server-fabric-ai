# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an MCP (Model Context Protocol) server implementation for Fabric AI integration. MCP is Anthropic's protocol for connecting AI assistants to external data sources and tools.

## Architecture

**MCP Server Structure**: This server will implement the MCP protocol to expose Fabric AI capabilities as resources and tools that can be consumed by MCP clients (like Claude Desktop, IDEs, etc.).

Key architectural components for MCP servers:
- **Server Implementation**: Handles MCP protocol communication (typically using `@modelcontextprotocol/sdk`)
- **Tool Definitions**: Exposes Fabric AI operations as callable tools
- **Resource Handlers**: Provides access to Fabric AI data/content as MCP resources
- **Transport Layer**: Typically stdio-based for local execution

## Development

### Project Setup
```bash
# Install dependencies (when package.json exists)
npm install

# Build the server
npm run build

# Run in development mode
npm run dev
```

### Testing
```bash
# Run tests
npm test

# Run a single test file
npm test -- <test-file-path>
```

### MCP Server Testing
```bash
# Test the MCP server locally using the MCP inspector
npx @modelcontextprotocol/inspector node dist/index.js

# Or test with Claude Desktop by adding to config:
# macOS: ~/Library/Application Support/Claude/claude_desktop_config.json
# Windows: %APPDATA%/Claude/claude_desktop_config.json
```

## Fabric AI Integration

Fabric AI is an open-source framework with 234+ AI patterns for augmenting humans. This server exposes Fabric's capabilities through MCP:

### Implemented Tools

1. **execute_pattern** (src/index.ts:56) - Execute any Fabric pattern on text input
2. **list_patterns** (src/index.ts:94) - List all available patterns with optional search
3. **get_pattern_details** (src/index.ts:120) - Get information about a specific pattern
4. **process_url** (src/index.ts:146) - Fetch and process web content with a pattern
5. **process_youtube** (src/index.ts:178) - Extract YouTube transcripts and process with a pattern
6. **update_patterns** (src/index.ts:210) - Update to latest patterns from repository

### Key Implementation Details

- **Fabric CLI Integration**: Uses `child_process.exec` to call the Fabric CLI
- **Timeouts**: Pattern execution (60s), URL processing (120s), YouTube (180s)
- **Buffer Sizes**: 5MB for pattern results to handle large outputs
- **Error Handling**: All operations wrapped in try-catch with formatted error messages
- **Validation**: Required parameters validated before execution

### Popular Patterns

- `extract_wisdom` - Extract insights from any content
- `summarize` - Create comprehensive summaries
- `improve_writing` - Enhance text quality
- `explain_code` - Explain code clearly
- `youtube_summary` - Summarize YouTube videos
- `analyze_presentation` - Analyze presentation quality

### Fabric CLI Requirements

- Fabric must be installed (handled in Dockerfile)
- Fabric requires API keys for AI models (OpenAI, Anthropic, etc.)
- Configure with: `fabric --setup`
- Update patterns with: `fabric --update`
- List patterns with: `fabric --listpatterns`

## MCP Protocol Implementation Notes

- **Capabilities**: Declare server capabilities in the initialization response (tools, resources, prompts)
- **Error Handling**: Return proper MCP error codes and messages
- **Lifecycle**: Implement proper initialization and shutdown handlers
- **Transport**: Use stdio transport for compatibility with standard MCP clients
