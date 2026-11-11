import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError
} from '@modelcontextprotocol/sdk/types.js';
import { StreamOrchestrator } from './mcp/tools.js';

const server = new Server(
  {
    name: 'stream-hub-mcp',
    version: '0.1.0'
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

const orchestrator = new StreamOrchestrator();

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'list_platforms',
        description: 'Lists all supported streaming platforms (YouTube, Twitch, Kick) and their current authentication status.',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'authenticate_platform',
        description: 'Triggers authentication or sets credentials directly from chat for a platform (youtube, twitch, or kick).',
        inputSchema: {
          type: 'object',
          properties: {
            platform: {
              type: 'string',
              description: 'Platform to authenticate: "youtube", "twitch", or "kick"'
            },
            channelSlug: {
              type: 'string',
              description: 'Kick channel slug / username (e.g. "meucanal")'
            },
            apiKey: {
              type: 'string',
              description: 'Kick API key or token'
            },
            clientId: {
              type: 'string',
              description: 'OAuth Client ID for YouTube or Twitch'
            },
            clientSecret: {
              type: 'string',
              description: 'OAuth Client Secret for YouTube or Twitch'
            }
          },
          required: ['platform']
        }
      },
      {
        name: 'get_templates',
        description: 'Returns available user-editable Markdown templates and their metadata.',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'preview_live_metadata',
        description: 'Generates a preview of live metadata (rendered description, tags, categories) without publishing.',
        inputSchema: {
          type: 'object',
          properties: {
            title: { type: 'string', description: 'Stream title' },
            description: { type: 'string', description: 'Main topic/summary of the stream' },
            partners: { type: 'string', description: 'Sponsors, partners or co-streamers mentions' },
            game: { type: 'string', description: 'Game name for automated category and tag detection' },
            templateName: { type: 'string', description: 'Template to use (default: "default")' },
            customTags: { type: 'array', items: { type: 'string' }, description: 'Additional custom tags' },
            thumbnailPath: { type: 'string', description: 'Local path to the thumbnail image file' }
          },
          required: ['title', 'description']
        }
      },
      {
        name: 'prepare_live',
        description: 'Prepares and updates live broadcast configuration across selected platforms (YouTube, Twitch, Kick).',
        inputSchema: {
          type: 'object',
          properties: {
            platforms: {
              type: 'array',
              items: { type: 'string' },
              description: 'Target platforms (e.g. ["all"] or ["youtube", "twitch", "kick"])'
            },
            title: { type: 'string', description: 'Stream title' },
            description: { type: 'string', description: 'Main topic/summary of the stream' },
            partners: { type: 'string', description: 'Sponsors, partners or co-streamers mentions' },
            game: { type: 'string', description: 'Game name for automated category and tag detection' },
            templateName: { type: 'string', description: 'Template to use (default: "default")' },
            customTags: { type: 'array', items: { type: 'string' }, description: 'Additional custom tags' },
            thumbnailPath: { type: 'string', description: 'Local path to the thumbnail image file' },
            isPrivate: { type: 'boolean', description: 'Whether the stream should be private/unlisted (for tests)' }
          },
          required: ['platforms', 'title', 'description']
        }
      }
    ]
  };
});

server.setRequestHandler(CallToolRequestSchema, async request => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'list_platforms': {
        const platforms = await orchestrator.listPlatforms();
        return {
          content: [{ type: 'text', text: JSON.stringify(platforms, null, 2) }]
        };
      }

      case 'authenticate_platform': {
        const { platform, channelSlug, apiKey, clientId, clientSecret } = args as any;
        const res = await orchestrator.authenticatePlatform(platform, {
          channelSlug,
          apiKey,
          clientId,
          clientSecret
        });
        return {
          content: [{ type: 'text', text: JSON.stringify(res, null, 2) }]
        };
      }

      case 'get_templates': {
        const templates = orchestrator.getTemplates();
        return {
          content: [{ type: 'text', text: JSON.stringify(templates, null, 2) }]
        };
      }

      case 'preview_live_metadata': {
        const preview = await orchestrator.previewLiveMetadata(args as any);
        return {
          content: [{ type: 'text', text: JSON.stringify(preview, null, 2) }]
        };
      }

      case 'prepare_live': {
        const { platforms, ...params } = args as any;
        const result = await orchestrator.prepareLive(platforms || ['all'], params);
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
        };
      }

      default:
        throw new McpError(ErrorCode.MethodNotFound, `Tool not found: ${name}`);
    }
  } catch (error: any) {
    return {
      isError: true,
      content: [{ type: 'text', text: `Error executing tool '${name}': ${error.message || String(error)}` }]
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('StreamHub MCP Server running on stdio');
}

main().catch(err => {
  console.error('Fatal error starting StreamHub MCP:', err);
  process.exit(1);
});
