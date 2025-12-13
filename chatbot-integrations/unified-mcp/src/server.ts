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

// Request Logging Middleware
app.use((req, res, next) => {
    // Skip noisy admin polling
    if (req.url.startsWith('/admin') || req.url.startsWith('/api/admin')) {
        return next();
    }

    const start = Date.now();
    const { method, url } = req;

    res.on('finish', () => {
        const durationMs = Date.now() - start;
        const status = res.statusCode;
        const level = status >= 400 ? 'ERROR' : 'INFO';
        const logMessage = `${method} ${url} ${status} ${durationMs}ms`;

        // Log to DB
        logEvent(level, logMessage, 'api-gateway', {
            method,
            url,
            status,
            durationMs,
            userAgent: req.headers['user-agent'],
            ip: req.ip
        });
    });
    next();
});

// General Logging Endpoint (for Frontend)
app.post('/logs', async (req, res) => {
    try {
        const { level, message, service, metadata } = req.body;
        await logEvent(level || 'INFO', message, service || 'frontend', metadata);
        res.json({ status: 'ok' });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

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

import { initDB, query, logEvent } from './db.js';

// ... imports ...

// Initialize DB before Managers
initDB().then(() => {
    initManagers().then(() => {
        app.listen(PORT, () => {
            console.log(`Unified DevOps MCP Server running on port ${PORT}`);
            logEvent('INFO', 'Server started successfully');
        });
    });
});

// APIs for Metrics & Logs

// 1. Ingest Metrics (From Frontend)
app.post('/metrics/llm', async (req, res) => {
    try {
        const { id, model, durationMs, ttftMs, inputTokens, outputTokens, success, error, timestamp, sessionId } = req.body;
        await query(
            `INSERT INTO llm_metrics (id, model, duration_ms, ttft_ms, input_tokens, output_tokens, success, error_msg, timestamp, session_id) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
             ON CONFLICT (id) DO NOTHING`,
            [id, model, durationMs || 0, ttftMs || 0, inputTokens || 0, outputTokens || 0, success, error, timestamp, sessionId]
        );
        res.json({ status: 'ok' });
    } catch (e: any) {
        console.error("Error saving LLM metric", e);
        res.status(500).json({ error: e.message });
    }
});

app.post('/metrics/tool', async (req, res) => {
    try {
        const { id, toolName, service, args, success, error, durationMs, timestamp, sessionId } = req.body;
        await query(
            `INSERT INTO tool_usage (id, tool_name, service, args, success, error_msg, duration_ms, timestamp, session_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             ON CONFLICT (id) DO NOTHING`,
            [id, toolName, service || 'unknown', JSON.stringify(args), success, error, durationMs || 0, timestamp, sessionId]
        );
        res.json({ status: 'ok' });
    } catch (e: any) {
        console.error("Error saving Tool metric", e);
        res.status(500).json({ error: e.message });
    }
});

app.post('/feedback', async (req, res) => {
    try {
        const { messageId, rating, comment } = req.body;
        await query(
            `INSERT INTO user_feedback (message_id, rating, comment) VALUES ($1, $2, $3)`,
            [messageId, rating, comment]
        );
        res.json({ status: 'ok' });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/security/event', async (req, res) => {
    try {
        const { eventType, severity, description, metadata } = req.body;
        await query(
            `INSERT INTO security_events (event_type, severity, description, metadata) VALUES ($1, $2, $3, $4)`,
            [eventType, severity, description, metadata]
        );
        res.json({ status: 'ok' });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/metrics/session', async (req, res) => {
    try {
        const { sessionId, userId, startTime, platform, userAgent, loadTime } = req.body;
        await query(
            `INSERT INTO user_sessions (session_id, user_id, start_time, last_active, platform, user_agent) 
             VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT (session_id) DO NOTHING`,
            [sessionId, userId, startTime, startTime, platform, userAgent]
        );

        // Use logs to track loadTime which is a point-in-time metric, not a session property in this schema
        if (loadTime) {
            await query(
                `INSERT INTO system_logs (level, message, service, metadata) VALUES ($1, $2, $3, $4)`,
                ['INFO', 'UI_LOAD_PERFORMANCE', 'frontend', JSON.stringify({ sessionId, loadTime })]
            );
        }

        res.json({ status: 'ok' });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});


// 2. Admin Ops (Read)
app.get('/admin/stats/golden', async (req, res) => {
    try {
        // Aggregation for Executive View
        // Cost Assumption: $5.00 / 1M Input Tokens, $15.00 / 1M Output Tokens (Approximation)
        const INPUT_COST_PER_MILLION = 5.00;
        const OUTPUT_COST_PER_MILLION = 15.00;

        const [llmStats, toolStats, errorStats, sessionStats, costStats, toolUserStats, sessionDepthStats, retentionStats, groundednessStats, uiStats, feedbackStats, securityStats] = await Promise.all([
            query(`SELECT 
                COUNT(*) as total_requests,
                AVG(duration_ms) as avg_latency,
                AVG(ttft_ms) as avg_ttft,
                SUM(CASE WHEN success = true THEN 1 ELSE 0 END)::float / NULLIF(COUNT(*),0) as success_rate
                FROM llm_metrics`),
            query(`SELECT 
                COUNT(*) as total_tools,
                AVG(duration_ms) as avg_tool_latency,
                SUM(CASE WHEN success = true THEN 1 ELSE 0 END)::float / NULLIF(COUNT(*),0) as success_rate,
                SUM(CASE WHEN error_msg LIKE '%Timeout%' OR duration_ms > 30000 THEN 1 ELSE 0 END)::float / NULLIF(COUNT(*),0) as timeout_rate
                FROM tool_usage`),
            query(`SELECT 
                level, COUNT(*) as count 
                FROM system_logs 
                WHERE level IN ('ERROR', 'WARN') 
                GROUP BY level`),
            query(`SELECT 
                COUNT(DISTINCT user_id) as dau,
                COUNT(*) as total_sessions 
                FROM user_sessions 
                WHERE start_time > (EXTRACT(EPOCH FROM NOW()) * 1000 - 86400000)`),
            query(`SELECT 
                SUM(input_tokens) as total_input,
                SUM(output_tokens) as total_output,
                COUNT(DISTINCT session_id) as affected_sessions
                FROM llm_metrics`),
            query(`SELECT tool_name, COUNT(DISTINCT session_id) as unique_users FROM tool_usage GROUP BY tool_name`),
            query(`SELECT 
                AVG(request_count) as avg_prompts_per_session
                FROM (SELECT session_id, COUNT(*) as request_count FROM llm_metrics GROUP BY session_id) as sub`),
            query(`WITH UserHistory AS (
                    SELECT user_id, COUNT(DISTINCT DATE(to_timestamp(start_time/1000))) as active_days 
                    FROM user_sessions 
                    GROUP BY user_id
                )
                SELECT 
                    (SUM(CASE WHEN active_days > 1 THEN 1 ELSE 0 END)::float / NULLIF(COUNT(*),0)) as returning_user_rate
                FROM UserHistory`),
            query(`SELECT 
                SUM(CASE WHEN metadata->>'grounded' = 'true' THEN 1 ELSE 0 END)::float / NULLIF(COUNT(*),0) as grounded_rate
                FROM llm_metrics WHERE metadata->>'grounded' IS NOT NULL`),
            query(`SELECT AVG((metadata->>'loadTime')::float) as avg_load_time FROM system_logs WHERE message = 'UI_LOAD_PERFORMANCE'`),
            query(`SELECT 
                SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END)::float / NULLIF(COUNT(*),0) as positive_feedback_rate
                FROM user_feedback`),
            query(`SELECT COUNT(*) as security_incidents FROM security_events`)
        ]);

        const inputTokens = parseFloat(costStats.rows[0].total_input || '0');
        const outputTokens = parseFloat(costStats.rows[0].total_output || '0');
        const totalCost = (inputTokens / 1000000 * INPUT_COST_PER_MILLION) + (outputTokens / 1000000 * OUTPUT_COST_PER_MILLION);
        const dau = parseInt(sessionStats.rows[0].dau || '1'); // Avoid DBZ

        // Format errors
        const errorMap = errorStats.rows.reduce((acc: any, row: any) => {
            acc[row.level] = row.count;
            return acc;
        }, { ERROR: 0, WARN: 0 });

        res.json({
            llm: llmStats.rows[0],
            tools: {
                ...toolStats.rows[0],
                avg_tool_latency: toolStats.rows[0].avg_tool_latency || 0
            },
            systemErrors: errorMap,
            users: {
                dau: sessionStats.rows[0].dau,
                sessions: sessionStats.rows[0].total_sessions,
                avg_sessions_per_user: 'N/A', // Deprecated in favor of prompts/session
                avg_prompts_per_session: parseFloat(sessionDepthStats.rows[0].avg_prompts_per_session || '0').toFixed(1),
                returning_user_rate: parseFloat(retentionStats.rows[0].returning_user_rate || '0').toFixed(2),
                avg_ui_load_time: Math.round(parseFloat(uiStats.rows[0].avg_load_time || '0'))
            },
            cost: {
                total_usd: totalCost,
                cost_per_user: (totalCost / dau).toFixed(4),
                input_tokens: inputTokens,
                output_tokens: outputTokens
            },
            quality: {
                grounded_rate: groundednessStats.rows[0].grounded_rate,
                satisfaction_score: parseFloat(feedbackStats.rows[0].positive_feedback_rate || '0').toFixed(2)
            },
            security: {
                incidents: securityStats.rows[0].security_incidents
            },
            toolAdoption: toolUserStats.rows
        });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/admin/logs', async (req, res) => {
    try {
        const result = await query('SELECT * FROM system_logs ORDER BY timestamp DESC LIMIT 100');
        res.json(result.rows);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/admin/security/events', async (req, res) => {
    try {
        const result = await query(`SELECT * FROM security_events ORDER BY timestamp DESC LIMIT 50`);
        res.json(result.rows);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/admin/metrics/llm', async (req, res) => {
    try {
        const result = await query('SELECT * FROM llm_metrics ORDER BY timestamp DESC LIMIT 100');
        res.json(result.rows);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/admin/metrics/tools', async (req, res) => {
    try {
        const result = await query('SELECT * FROM tool_usage ORDER BY timestamp DESC LIMIT 100');
        res.json(result.rows);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});
