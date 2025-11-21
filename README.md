# Fabric AI MCP Server

A Model Context Protocol (MCP) server that integrates Fabric AI framework with AI assistants.

Built with TypeScript for type safety and modern development practices.

## Purpose

This MCP server provides a secure interface for AI assistants to use Fabric AI's 234+ patterns for augmenting human capabilities with AI. Fabric is an open-source framework that provides modular AI prompts for solving specific problems.

## Features

### Current Implementation

- **`execute_pattern`** - Execute any Fabric pattern on input text
- **`list_patterns`** - List all 234+ available patterns with optional search
- **`get_pattern_details`** - Get information about a specific pattern
- **`process_url`** - Fetch and process web content with a pattern
- **`process_youtube`** - Extract YouTube transcripts and process with a pattern
- **`update_patterns`** - Update to the latest Fabric patterns

### Popular Patterns

- `extract_wisdom` - Extract insights and wisdom from content
- `summarize` - Create comprehensive summaries
- `improve_writing` - Enhance text quality
- `explain_code` - Explain code clearly
- `analyze_presentation` - Analyze presentation quality
- `create_summary` - Create structured summaries
- `youtube_summary` - Summarize YouTube videos

## Prerequisites

- Node.js 20 or higher
- Docker Desktop with MCP Toolkit enabled
- Docker MCP CLI plugin (`docker mcp` command)
- Fabric AI CLI installed (installation handled in Docker)

## Installation

### Step 1: Clone and Install Dependencies

```bash
git clone https://github.com/gufao/mcp-server-fabric-ai.git
cd mcp-server-fabric-ai
npm install
```

### Step 2: Build TypeScript

```bash
npm run build
```

### Step 3: Build Docker Image

```bash
docker build -t fabric-ai-mcp-server .
```

### Step 4: Create Custom Catalog

```bash
# Create catalogs directory if it doesn't exist
mkdir -p ~/.docker/mcp/catalogs

# Create or edit custom.yaml
nano ~/.docker/mcp/catalogs/custom.yaml
```

Add this entry to custom.yaml:

```yaml
version: 2
name: custom
displayName: Custom MCP Servers
registry:
  fabric-ai:
    description: "Fabric AI framework integration - 234+ patterns for AI-augmented workflows"
    title: "Fabric AI"
    type: server
    dateAdded: "2025-11-21T00:00:00Z"
    image: fabric-ai-mcp-server:latest
    ref: ""
    readme: ""
    toolsUrl: ""
    source: ""
    upstream: "https://github.com/danielmiessler/fabric"
    icon: ""
    tools:
      - name: execute_pattern
      - name: list_patterns
      - name: get_pattern_details
      - name: process_url
      - name: process_youtube
      - name: update_patterns
    secrets: []
    metadata:
      category: productivity
      tags:
        - ai
        - patterns
        - automation
        - content-processing
      license: GPL-3.0
      owner: local
```

### Step 5: Update Registry

```bash
nano ~/.docker/mcp/registry.yaml
```

Add this entry under the existing `registry:` key:

```yaml
registry:
  # ... existing servers ...
  fabric-ai:
    ref: ""
```

**IMPORTANT**: The entry must be under the `registry:` key, not at the root level.

### Step 6: Configure Claude Desktop

Find your Claude Desktop config file:

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

Edit the file and add your custom catalog to the args array:

```json
{
  "mcpServers": {
    "mcp-toolkit-gateway": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-v", "/var/run/docker.sock:/var/run/docker.sock",
        "-v", "[YOUR_HOME]/.docker/mcp:/mcp",
        "docker/mcp-gateway",
        "--catalog=/mcp/catalogs/docker-mcp.yaml",
        "--catalog=/mcp/catalogs/custom.yaml",
        "--config=/mcp/config.yaml",
        "--registry=/mcp/registry.yaml",
        "--tools-config=/mcp/tools.yaml",
        "--transport=stdio"
      ]
    }
  }
}
```

Replace `[YOUR_HOME]` with:
- **macOS**: `/Users/your_username`
- **Windows**: `C:\\Users\\your_username` (use double backslashes)
- **Linux**: `/home/your_username`

### Step 7: Restart Claude Desktop

1. Quit Claude Desktop completely
2. Start Claude Desktop again
3. Your new tools should appear!

### Step 8: Test Your Server

```bash
# Verify it appears in the list
docker mcp server list
```

## Development

### Local Development

```bash
# Install dependencies
npm install

# Run in development mode with auto-reload
npm run dev

# Type check
npm run typecheck

# Build
npm run build

# Run production build
npm start
```

### Local Testing

```bash
# Install Fabric CLI locally first
go install github.com/danielmiessler/fabric/cmd/fabric@latest

# Set up Fabric (configure API keys)
fabric --setup

# Run the server
npm start
```

## Usage Examples

In Claude Desktop, you can ask:

- "Use Fabric to extract wisdom from this article: [paste text]"
- "Summarize this YouTube video using Fabric: https://youtube.com/watch?v=..."
- "List all available Fabric patterns related to writing"
- "Use the improve_writing pattern on this draft: [paste text]"
- "Analyze this presentation using Fabric patterns"
- "Get details about the extract_wisdom pattern"

## Architecture

```
Claude Desktop -> MCP Gateway -> Fabric AI MCP Server -> Fabric CLI -> AI Models
                       |
            Docker Desktop
            (Fabric installed)
```

## TypeScript Benefits

- **Type Safety**: Catch errors at compile time
- **Better IDE Support**: Enhanced autocomplete and refactoring
- **Modern JavaScript**: Use latest ECMAScript features
- **Maintainability**: Self-documenting code with types

## Adding New Tools

To extend functionality:

1. Add tool function in `src/index.ts`:

```typescript
async function myNewTool(param: string): Promise<string> {
  // Implementation
  const result = await execAsync(`fabric --pattern ${param}`);
  return `Result: ${result.stdout}`;
}
```

2. Add tool definition to `TOOLS` array
3. Add case to tool handler switch statement
4. Rebuild: `npm run build && docker build -t fabric-ai-mcp-server .`

## Troubleshooting

### Tools Not Appearing

- Verify Docker image built successfully
- Check catalog and registry files
- Ensure Claude Desktop config includes custom catalog
- Restart Claude Desktop

### Build Errors

- Check TypeScript version compatibility
- Run `npm run typecheck` to see type errors
- Ensure all dependencies are installed

### Fabric Not Found

- Verify Fabric CLI is installed in the Docker container
- Check Dockerfile installation steps
- Ensure fabric is in PATH

### Pattern Execution Errors

- Verify pattern name is correct: `fabric --listpatterns`
- Check if Fabric is properly configured: `fabric --setup`
- Ensure API keys are set for AI models

## Security Considerations

- Fabric AI requires API keys for AI models (OpenAI, Anthropic, etc.)
- All secrets stored in Docker Desktop secrets
- Never hardcode credentials
- Running as non-root user
- Sensitive data never logged
- Input validation on all parameters
- Timeout protection on external calls

## Fabric AI Resources

- **GitHub**: https://github.com/danielmiessler/Fabric
- **Patterns**: https://github.com/danielmiessler/Fabric/tree/main/patterns
- **Documentation**: https://github.com/danielmiessler/fabric/blob/main/README.md

## License

GPL-3.0 License - See [LICENSE](LICENSE) file for details.
