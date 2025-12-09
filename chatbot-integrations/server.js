import express from 'express';
import cors from 'cors';
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
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

// Initialize MCP Client
async function initMcpClient() {
    if (mcpClient) return mcpClient;

    // Use the Jenkins MCP Enterprise (Python)
    const serverCommand = process.env.MCP_SERVER_COMMAND || "/app/venv/bin/python3";
    const serverArgs = process.env.MCP_SERVER_ARGS ? process.env.MCP_SERVER_ARGS.split(' ') : ["-m", "jenkins_mcp_enterprise"];

    console.log(`Connecting to MCP Server: ${serverCommand} ${serverArgs.join(' ')}`);
    console.log("Environment check - JENKINS_URL:", process.env.JENKINS_URL ? "Set" : "Missing");
    console.log("Environment check - JENKINS_USER:", process.env.JENKINS_USER ? "Set" : "Missing");

    mcpTransport = new StdioClientTransport({
        command: serverCommand,
        args: serverArgs,
        env: process.env
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
