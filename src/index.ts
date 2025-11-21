#!/usr/bin/env node

/**
 * Fabric AI MCP Server - Integrate Fabric AI patterns with Model Context Protocol
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// Logging configuration - log to stderr
const logger = {
  info: (...args: unknown[]) => console.error("[INFO]", ...args),
  error: (...args: unknown[]) => console.error("[ERROR]", ...args),
  warn: (...args: unknown[]) => console.error("[WARN]", ...args),
};

// === UTILITY FUNCTIONS ===

/**
 * Format error message for user display
 */
function formatError(error: unknown): string {
  if (error instanceof Error) {
    return `❌ Error: ${error.message}`;
  }
  return `❌ Error: ${String(error)}`;
}

/**
 * Validate required parameter
 */
function validateRequired(value: string | undefined, name: string): string {
  if (!value || value.trim() === "") {
    throw new Error(`${name} is required`);
  }
  return value.trim();
}

/**
 * Check if fabric CLI is installed
 */
async function checkFabricInstalled(): Promise<boolean> {
  try {
    await execAsync("which fabric");
    return true;
  } catch {
    return false;
  }
}

// === TOOL IMPLEMENTATIONS ===

/**
 * Execute a Fabric pattern on input text
 */
async function executePattern(
  inputText: string = "",
  patternName: string = "",
  model: string = ""
): Promise<string> {
  logger.info(`Executing pattern: ${patternName}`);

  try {
    // Validate inputs
    const validPattern = validateRequired(patternName, "pattern_name");
    const validInput = validateRequired(inputText, "input_text");

    // Build command
    let command = `echo ${JSON.stringify(validInput)} | fabric --pattern ${validPattern}`;
    if (model) {
      command += ` --model ${model}`;
    }

    const { stdout, stderr } = await execAsync(command, {
      timeout: 60000, // 60 second timeout
      maxBuffer: 5 * 1024 * 1024, // 5MB buffer
    });

    if (stderr) {
      logger.warn("Pattern stderr:", stderr);
    }

    return `✅ Pattern Result:\n\n${stdout}`;
  } catch (error) {
    logger.error("Error in executePattern:", error);
    return formatError(error);
  }
}

/**
 * List all available Fabric patterns
 */
async function listPatterns(search: string = ""): Promise<string> {
  logger.info("Listing available patterns");

  try {
    const { stdout } = await execAsync("fabric --listpatterns", {
      timeout: 10000,
      maxBuffer: 1024 * 1024, // 1MB
    });

    const patterns = stdout
      .split("\n")
      .filter((p) => p.trim())
      .filter((p) => !search || p.toLowerCase().includes(search.toLowerCase()));

    if (patterns.length === 0) {
      return search
        ? `❌ No patterns found matching: ${search}`
        : "❌ No patterns available";
    }

    return `📋 Available Patterns (${patterns.length}):\n\n${patterns.join("\n")}`;
  } catch (error) {
    logger.error("Error in listPatterns:", error);
    return formatError(error);
  }
}

/**
 * Get detailed information about a specific pattern
 */
async function getPatternDetails(patternName: string = ""): Promise<string> {
  logger.info(`Getting details for pattern: ${patternName}`);

  try {
    const validPattern = validateRequired(patternName, "pattern_name");

    // Try to get pattern system prompt
    const { stdout, stderr } = await execAsync(
      `fabric --pattern ${validPattern} --help || echo "Pattern: ${validPattern}"`,
      {
        timeout: 5000,
      }
    );

    if (stderr && !stdout) {
      return `📄 Pattern: ${validPattern}\n\nNo additional details available. Use execute_pattern to run this pattern.`;
    }

    return `📄 Pattern Details: ${validPattern}\n\n${stdout || "No description available"}`;
  } catch (error) {
    logger.error("Error in getPatternDetails:", error);
    return formatError(error);
  }
}

/**
 * Process a URL with a Fabric pattern
 */
async function processUrl(
  url: string = "",
  patternName: string = "",
  model: string = ""
): Promise<string> {
  logger.info(`Processing URL with pattern: ${patternName}`);

  try {
    const validUrl = validateRequired(url, "url");
    const validPattern = validateRequired(patternName, "pattern_name");

    // Build command
    let command = `fabric -u ${JSON.stringify(validUrl)} --pattern ${validPattern}`;
    if (model) {
      command += ` --model ${model}`;
    }

    const { stdout, stderr } = await execAsync(command, {
      timeout: 120000, // 2 minute timeout for URL fetching
      maxBuffer: 5 * 1024 * 1024,
    });

    if (stderr) {
      logger.warn("URL processing stderr:", stderr);
    }

    return `✅ URL Processing Result:\n\n${stdout}`;
  } catch (error) {
    logger.error("Error in processUrl:", error);
    return formatError(error);
  }
}

/**
 * Process a YouTube video with a Fabric pattern
 */
async function processYoutube(
  youtubeUrl: string = "",
  patternName: string = "",
  model: string = ""
): Promise<string> {
  logger.info(`Processing YouTube video with pattern: ${patternName}`);

  try {
    const validUrl = validateRequired(youtubeUrl, "youtube_url");
    const validPattern = validateRequired(patternName, "pattern_name");

    // Build command
    let command = `fabric -y ${JSON.stringify(validUrl)} --pattern ${validPattern}`;
    if (model) {
      command += ` --model ${model}`;
    }

    const { stdout, stderr } = await execAsync(command, {
      timeout: 180000, // 3 minute timeout for YouTube processing
      maxBuffer: 5 * 1024 * 1024,
    });

    if (stderr) {
      logger.warn("YouTube processing stderr:", stderr);
    }

    return `✅ YouTube Processing Result:\n\n${stdout}`;
  } catch (error) {
    logger.error("Error in processYoutube:", error);
    return formatError(error);
  }
}

/**
 * Update Fabric patterns
 */
async function updatePatterns(): Promise<string> {
  logger.info("Updating Fabric patterns");

  try {
    const { stdout, stderr } = await execAsync("fabric --update", {
      timeout: 60000, // 1 minute timeout
    });

    if (stderr) {
      logger.warn("Update stderr:", stderr);
    }

    return `✅ Patterns Updated:\n\n${stdout}`;
  } catch (error) {
    logger.error("Error in updatePatterns:", error);
    return formatError(error);
  }
}

// === MCP SERVER SETUP ===

const server = new Server(
  {
    name: "fabric-ai",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define available tools
const TOOLS: Tool[] = [
  {
    name: "execute_pattern",
    description:
      "Execute a Fabric AI pattern on input text. Fabric has 234+ patterns for tasks like extracting wisdom, summarizing, analyzing, improving writing, etc.",
    inputSchema: {
      type: "object",
      properties: {
        input_text: {
          type: "string",
          description: "The text content to process with the pattern",
        },
        pattern_name: {
          type: "string",
          description:
            "Name of the Fabric pattern to use (e.g., 'extract_wisdom', 'summarize', 'improve_writing')",
        },
        model: {
          type: "string",
          description: "Optional AI model to use (e.g., 'gpt-4', 'claude-3-opus')",
        },
      },
      required: ["input_text", "pattern_name"],
    },
  },
  {
    name: "list_patterns",
    description:
      "List all available Fabric AI patterns. Optionally filter by search term.",
    inputSchema: {
      type: "object",
      properties: {
        search: {
          type: "string",
          description: "Optional search term to filter patterns",
        },
      },
    },
  },
  {
    name: "get_pattern_details",
    description:
      "Get detailed information about a specific Fabric pattern",
    inputSchema: {
      type: "object",
      properties: {
        pattern_name: {
          type: "string",
          description: "Name of the pattern to get details for",
        },
      },
      required: ["pattern_name"],
    },
  },
  {
    name: "process_url",
    description:
      "Fetch content from a URL and process it with a Fabric pattern",
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "The URL to fetch and process",
        },
        pattern_name: {
          type: "string",
          description: "Name of the Fabric pattern to use",
        },
        model: {
          type: "string",
          description: "Optional AI model to use",
        },
      },
      required: ["url", "pattern_name"],
    },
  },
  {
    name: "process_youtube",
    description:
      "Extract transcript from a YouTube video and process it with a Fabric pattern",
    inputSchema: {
      type: "object",
      properties: {
        youtube_url: {
          type: "string",
          description: "The YouTube video URL",
        },
        pattern_name: {
          type: "string",
          description:
            "Name of the Fabric pattern to use (e.g., 'youtube_summary', 'extract_wisdom')",
        },
        model: {
          type: "string",
          description: "Optional AI model to use",
        },
      },
      required: ["youtube_url", "pattern_name"],
    },
  },
  {
    name: "update_patterns",
    description:
      "Update Fabric patterns to the latest version from the repository",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
];

// Handle tool listing
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: TOOLS };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "execute_pattern": {
        const inputText = (args?.input_text as string) || "";
        const patternName = (args?.pattern_name as string) || "";
        const model = (args?.model as string) || "";
        return {
          content: [
            {
              type: "text",
              text: await executePattern(inputText, patternName, model),
            },
          ],
        };
      }

      case "list_patterns": {
        const search = (args?.search as string) || "";
        return {
          content: [
            {
              type: "text",
              text: await listPatterns(search),
            },
          ],
        };
      }

      case "get_pattern_details": {
        const patternName = (args?.pattern_name as string) || "";
        return {
          content: [
            {
              type: "text",
              text: await getPatternDetails(patternName),
            },
          ],
        };
      }

      case "process_url": {
        const url = (args?.url as string) || "";
        const patternName = (args?.pattern_name as string) || "";
        const model = (args?.model as string) || "";
        return {
          content: [
            {
              type: "text",
              text: await processUrl(url, patternName, model),
            },
          ],
        };
      }

      case "process_youtube": {
        const youtubeUrl = (args?.youtube_url as string) || "";
        const patternName = (args?.pattern_name as string) || "";
        const model = (args?.model as string) || "";
        return {
          content: [
            {
              type: "text",
              text: await processYoutube(youtubeUrl, patternName, model),
            },
          ],
        };
      }

      case "update_patterns": {
        return {
          content: [
            {
              type: "text",
              text: await updatePatterns(),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    logger.error(`Error executing tool ${name}:`, error);
    return {
      content: [
        {
          type: "text",
          text: formatError(error),
        },
      ],
      isError: true,
    };
  }
});

// === SERVER STARTUP ===

async function main() {
  logger.info("Starting Fabric AI MCP server...");

  // Check if fabric is installed
  const fabricInstalled = await checkFabricInstalled();
  if (!fabricInstalled) {
    logger.error(
      "Fabric CLI is not installed! Please install it from: https://github.com/danielmiessler/fabric"
    );
    process.exit(1);
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);

  logger.info("Fabric AI MCP server running on stdio");
}

main().catch((error) => {
  logger.error("Fatal error:", error);
  process.exit(1);
});
