
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const JENKINS_URL = "http://chatbot-assistant-jenkins-1:8080";
const JENKINS_USER = "admin";
const JENKINS_TOKEN = "1145887e02edabd66d1ef00f2c5acdb67a";

// Basic validation
if (!JENKINS_URL || !JENKINS_USER || !JENKINS_TOKEN) {
    console.error("Missing Jenkins credentials in .env file (JENKINS_URL, JENKINS_USER, JENKINS_TOKEN)");
}

const authHeader = {
    Authorization: `Basic ${Buffer.from(`${JENKINS_USER}:${JENKINS_TOKEN}`).toString('base64')}`
};

const server = new Server(
    {
        name: "jenkins-server",
        version: "1.0.0",
    },
    {
        capabilities: {
            tools: {},
        },
    }
);

async function getJenkinsJobs() {
    if (!JENKINS_URL) throw new Error("Jenkins URL not configured");
    const response = await axios.get(`${JENKINS_URL}/api/json?tree=jobs[name,color,url]`, { headers: authHeader });
    return response.data.jobs;
}

async function triggerBuild(jobName) {
    if (!JENKINS_URL) throw new Error("Jenkins URL not configured");
    // Crumb issuer handling might be needed for some Jenkins setups, simplified here for Token auth
    const response = await axios.post(`${JENKINS_URL}/job/${jobName}/build`, {}, { headers: authHeader });
    return response.status;
}

async function getBuildStatus(jobName, buildId) {
    if (!JENKINS_URL) throw new Error("Jenkins URL not configured");
    const response = await axios.get(`${JENKINS_URL}/job/${jobName}/${buildId}/api/json`, { headers: authHeader });
    return response.data.result || (response.data.building ? "BUILDING" : "UNKNOWN");
}


server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "list_jobs",
                description: "List all Jenkins jobs with their status",
                inputSchema: {
                    type: "object",
                    properties: {},
                },
            },
            {
                name: "build_job",
                description: "Trigger a build for a specific Jenkins job",
                inputSchema: {
                    type: "object",
                    properties: {
                        jobName: {
                            type: "string",
                            description: "Name of the job to build",
                        },
                    },
                    required: ["jobName"],
                },
            },
            {
                name: "get_build_status",
                description: "Get the status (SUCCESS, FAILURE, etc.) of a specific build",
                inputSchema: {
                    type: "object",
                    properties: {
                        jobName: { type: "string" },
                        buildId: { type: "string" }
                    },
                    required: ["jobName", "buildId"]
                }
            }
        ],
    };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
        switch (request.params.name) {
            case "list_jobs": {
                const jobs = await getJenkinsJobs();
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(jobs, null, 2),
                        },
                    ],
                };
            }
            case "build_job": {
                const jobName = String(request.params.arguments?.jobName);
                await triggerBuild(jobName);
                return {
                    content: [
                        {
                            type: "text",
                            text: `Successfully triggered build for job: ${jobName}`,
                        },
                    ],
                };
            }
            case "get_build_status": {
                const jobName = String(request.params.arguments?.jobName);
                const buildId = String(request.params.arguments?.buildId);
                const status = await getBuildStatus(jobName, buildId);
                return {
                    content: [
                        {
                            type: "text",
                            text: status
                        }
                    ]
                }
            }
            default:
                throw new Error("Unknown tool");
        }
    } catch (error) {
        console.error(`Error executing tool ${request.params.name}:`, error.message);
        return {
            content: [
                {
                    type: "text",
                    text: `Error: ${error.message}. Please check Jenkins connection and credentials.`
                }
            ],
            isError: true
        }
    }
});

const transport = new StdioServerTransport();
await server.connect(transport);
