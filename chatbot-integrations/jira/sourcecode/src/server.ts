import express from 'express';
import cors from 'cors';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { ConfigLoader } from './config.js';
import { ToolsManager } from './tools/index.js';

async function main() {
    // Load Config
    const config = await ConfigLoader.load();
    const toolsManager = new ToolsManager(config);

    // Setup MCP Server
    const mcpServer = new Server({
        name: 'jira-mcp-restricted',
        version: '1.0.0',
    }, {
        capabilities: {
            tools: {},
        },
    });

    // Register Tools
    mcpServer.setRequestHandler(ListToolsRequestSchema, async () => {
        return { tools: toolsManager.getToolDefinitions() };
    });

    mcpServer.setRequestHandler(CallToolRequestSchema, async (request) => {
        try {
            return await toolsManager.handleToolCall(request.params.name, request.params.arguments);
        } catch (error: any) {
            console.error("Tool execution error:", error);
            return {
                content: [{ type: 'text', text: `Error: ${error.message}` }],
                isError: true,
            };
        }
    });

    // Setup Express
    const app = express();
    app.use(cors());
    app.use(express.json()); // Essential for POST /call-tool
    const PORT = process.env.PORT || 3898;

    // SSE Transport Logic
    let transport: SSEServerTransport;

    app.get('/sse', async (req, res) => {
        transport = new SSEServerTransport('/messages', res);
        await mcpServer.connect(transport);
    });

    app.post('/messages', async (req, res) => {
        if (transport) {
            await transport.handlePostMessage(req, res);
        } else {
            res.status(400).send("No active connection");
        }
    });

    // REST Compatibility Endpoints (for existing Frontend)
    app.get('/tools', async (req, res) => {
        try {
            const tools = toolsManager.getToolDefinitions();
            res.json({ tools });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

    app.post('/call-tool', async (req, res) => {
        const { name, arguments: args } = req.body;
        if (!name) return res.status(400).json({ error: "Tool name required" });

        try {
            const result = await toolsManager.handleToolCall(name, args || {});
            res.json(result);
        } catch (error: any) {
            console.error(`Error calling tool ${name}:`, error);
            res.status(500).json({ error: error.message });
        }
    });

    app.get('/health', (req, res) => {
        res.json({ status: 'ok', instances: config.instances.map(i => i.name) });
    });

    app.listen(PORT, () => {
        console.log(`Jira MCP Restricted Server running on port ${PORT}`);
        console.log(`Configured instances: ${config.instances.map(i => i.name).join(', ')}`);
    });
}

main().catch(console.error);
