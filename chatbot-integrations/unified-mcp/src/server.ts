import express from 'express';
import cors from 'cors';
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import dotenv from 'dotenv';

// Import ToolsManagers from integrations
import { ToolsManager as JiraManager } from './integrations/jira/tools/index.js';
import { ConfigLoader as JiraConfig } from './integrations/jira/config.js';

import { ToolsManager as SonarManager } from './integrations/sonarqube/tools/index.js';
import { ConfigLoader as SonarConfig } from './integrations/sonarqube/config.js';

import { ToolsManager as NexusManager } from './integrations/nexus/tools/index.js';
import { ConfigLoader as NexusConfig } from './integrations/nexus/config.js';

import { ToolsManager as BitbucketManager } from './integrations/bitbucket/tools/index.js';
import { ConfigLoader as BitbucketConfig } from './integrations/bitbucket/config.js';

import { ToolsManager as ElasticManager } from './integrations/elasticsearch/tools/index.js';
import { ConfigLoader as ElasticConfig } from './integrations/elasticsearch/config.js';

import { ToolsManager as GrafanaManager } from './integrations/grafana/tools/index.js';
import { ConfigLoader as GrafanaConfig } from './integrations/grafana/config.js';

// Jenkins
import { JENKINS_TOOLS } from './integrations/jenkins/tools/index.js';
import { JenkinsClient } from './integrations/jenkins/clients/jenkins.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3009;

app.use(cors());
app.use(express.json());

// Categories
const CATEGORIES = {
    JIRA: 'jira',
    SONARQUBE: 'sonarqube',
    NEXUS: 'nexus',
    BITBUCKET: 'bitbucket',
    ELASTIC: 'elasticsearch',
    GRAFANA: 'grafana',
    JENKINS: 'jenkins',
};

// Initialize Managers
interface ManagerEntry {
    category: string;
    instance: any;
}

const managers: ManagerEntry[] = [];
let jenkinsClient: JenkinsClient;

async function initManagers() {
    try {
        // Jira
        const jiraConfig = await JiraConfig.load();
        managers.push({ category: CATEGORIES.JIRA, instance: new JiraManager(jiraConfig) });

        // SonarQube
        const sonarConfig = await SonarConfig.load();
        managers.push({ category: CATEGORIES.SONARQUBE, instance: new SonarManager(sonarConfig) });

        // Nexus
        const nexusConfig = await NexusConfig.load();
        managers.push({ category: CATEGORIES.NEXUS, instance: new NexusManager(nexusConfig) });

        // Bitbucket
        const bitbucketConfig = await BitbucketConfig.load();
        managers.push({ category: CATEGORIES.BITBUCKET, instance: new BitbucketManager(bitbucketConfig) });

        // Elasticsearch
        const elasticConfig = await ElasticConfig.load();
        managers.push({ category: CATEGORIES.ELASTIC, instance: new ElasticManager(elasticConfig) });

        // Grafana
        const grafanaConfig = await GrafanaConfig.load();
        managers.push({ category: CATEGORIES.GRAFANA, instance: new GrafanaManager(grafanaConfig) });

        // Jenkins
        jenkinsClient = new JenkinsClient({
            url: process.env.JENKINS_URL || "http://jenkins:8080",
            user: process.env.JENKINS_USER || "admin",
            token: process.env.JENKINS_TOKEN || "admin"
        });

        console.log("All integration managers initialized.");
    } catch (e) {
        console.error("Failed to initialize some managers:", e);
    }
}

async function getAllTools(categories?: string[]) {
    let allTools: any[] = [];
    const requestedCategories = categories ? new Set(categories) : null;
    const shouldInclude = (cat: string) => !requestedCategories || requestedCategories.has(cat);

    // Add Tools from Managers
    for (const entry of managers) {
        if (shouldInclude(entry.category)) {
            allTools = allTools.concat(entry.instance.getToolDefinitions());
        }
    }

    // Add Jenkins Tools
    if (shouldInclude(CATEGORIES.JENKINS)) {
        allTools = allTools.concat(JENKINS_TOOLS);
    }

    return allTools;
}

async function handleToolCall(name: string, args: any) {
    // Check Jenkins first
    if (JENKINS_TOOLS.find(t => t.name === name)) {
        switch (name) {
            case "list_jobs":
                const jobs = await jenkinsClient.getJobs();
                return { content: [{ type: "text", text: JSON.stringify(jobs, null, 2) }] };
            case "build_job":
                await jenkinsClient.triggerBuild(String(args?.jobName));
                return { content: [{ type: "text", text: `Build triggered for ${args?.jobName}` }] };
            case "get_build_status":
                const status = await jenkinsClient.getBuildStatus(String(args?.jobName), String(args?.buildId));
                return { content: [{ type: "text", text: status }] };
        }
    }

    // Check Managers
    for (const entry of managers) {
        const definitions = entry.instance.getToolDefinitions();
        if (definitions.find((t: any) => t.name === name)) {
            return await entry.instance.handleToolCall(name, args);
        }
    }

    throw new Error(`Tool ${name} not found`);
}

// MCP Server Logic
const mcpServer = new Server({
    name: 'unified-devops-mcp',
    version: '1.0.0',
}, {
    capabilities: {
        tools: {},
    },
});

mcpServer.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools: await getAllTools() };
});

mcpServer.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
        return await handleToolCall(request.params.name, request.params.arguments);
    } catch (error: any) {
        return {
            content: [{ type: 'text', text: `Error: ${error.message}` }],
            isError: true,
        };
    }
});

// Express Routes
app.get('/tools', async (req, res) => {
    const categoriesParams = req.query.categories as string;
    const categories = categoriesParams ? categoriesParams.split(',') : undefined;
    const tools = await getAllTools(categories);
    res.json({ tools });
});

app.get('/categories', (req, res) => {
    res.json(Object.values(CATEGORIES));
});

app.post('/call-tool', async (req, res) => {
    try {
        const { name, arguments: args } = req.body;
        const result = await handleToolCall(name, args);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/health', (req, res) => {
    res.json({ status: 'healthy', service: 'unified-mcp' });
});

// Initialize and Start
initManagers().then(() => {
    app.listen(PORT, () => {
        console.log(`Unified DevOps MCP Server running on port ${PORT}`);
    });
});
