import express from 'express';
import cors from 'cors';
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import EventSource from "eventsource";
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3009;

app.use(cors());
app.use(express.json());

let mcpClient = null;
let mcpTransport = null;
async function initMcpClient() {
    if (mcpClient) return mcpClient;

    const sseUrl = process.env.MCP_SERVER_URL || "http://jenkins-mcp-enterprise:8000/mcp";

    console.log(`Connecting to MCP Server via SSE: ${sseUrl}`);

    // Create SSE Transport
    // Note: ensure we pass EventSource polyfill if needed by the SDK version, 
    // usually handled by global or constructor options. 
    // Checking SDK source is hard, so we'll try setting global first or passing as option if available.
    global.EventSource = EventSource;

    mcpTransport = new SSEClientTransport(new URL(sseUrl), {
        eventSourceInit: {
            withCredentials: false
        }
    });

    mcpClient = new Client({
        name: "chatbot-client",
        version: "1.0.0",
    }, {
        capabilities: {
            tools: {},
        },
    });

    await mcpClient.connect(mcpTransport);
    console.log("Connected to MCP Server");
    return mcpClient;
}

// REST Endpoints for Frontend

app.get('/tools', async (req, res) => {
    try {
        const client = await initMcpClient();
        const result = await client.listTools();
        res.json(result);
    } catch (error) {
        console.error("Error listing tools:", error);
        res.status(500).json({ error: "Failed to list tools", details: error.message });
    }
});

app.post('/call-tool', async (req, res) => {
    const { name, arguments: args } = req.body;

    if (!name) {
        return res.status(400).json({ error: "Tool name is required" });
    }

    try {
        const client = await initMcpClient();
        const result = await client.callTool({
            name,
            arguments: args || {},
        });
        res.json(result);
    } catch (error) {
        console.error(`Error calling tool ${name}:`, error);
        res.status(500).json({ error: "Failed to execute tool", details: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`MCP Proxy Server running on http://localhost:${PORT}`);
});
