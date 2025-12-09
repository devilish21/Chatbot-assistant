import { Tool } from "@modelcontextprotocol/sdk/types.js";

export const JENKINS_TOOLS: Tool[] = [
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
];
