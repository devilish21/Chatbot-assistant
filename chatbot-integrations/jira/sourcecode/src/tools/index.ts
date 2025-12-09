import { JiraClient } from '../clients/jira.js';
import { Config } from '../types/index.js';

export class ToolsManager {
    private clients: Map<string, JiraClient> = new Map();

    constructor(config: Config) {
        for (const instance of config.instances) {
            this.clients.set(instance.name, new JiraClient(instance));
        }
    }

    private getClient(instanceName: string): JiraClient {
        const client = this.clients.get(instanceName);
        if (!client) {
            throw new Error(`Jira instance '${instanceName}' not found. Available: ${Array.from(this.clients.keys()).join(', ')}`);
        }
        return client;
    }

    getToolDefinitions() {
        return [
            {
                name: 'list_instances',
                description: 'List all configured Jira instances',
                inputSchema: { type: 'object', properties: {} },
            },
            {
                name: 'get_project_details',
                description: 'Get details of the restricted DevOps project',
                inputSchema: {
                    type: 'object',
                    properties: {
                        instance: { type: 'string' },
                    },
                    required: ['instance'],
                },
            },
            {
                name: 'get_issue',
                description: 'Get details of a specific issue',
                inputSchema: {
                    type: 'object',
                    properties: {
                        instance: { type: 'string' },
                        issueKey: { type: 'string' },
                    },
                    required: ['instance', 'issueKey'],
                },
            },
            {
                name: 'summarize_issue',
                description: 'Get a AI-friendly summary of an issue',
                inputSchema: {
                    type: 'object',
                    properties: {
                        instance: { type: 'string' },
                        issueKey: { type: 'string' },
                    },
                    required: ['instance', 'issueKey'],
                },
            },
            {
                name: 'get_issue_comments',
                description: 'Get comments for an issue',
                inputSchema: {
                    type: 'object',
                    properties: {
                        instance: { type: 'string' },
                        issueKey: { type: 'string' },
                    },
                    required: ['instance', 'issueKey'],
                },
            },
        ];
    }

    async handleToolCall(name: string, args: any) {
        switch (name) {
            case 'list_instances':
                return {
                    content: [{ type: 'text', text: JSON.stringify(Array.from(this.clients.keys())) }]
                };

            case 'get_project_details':
                const project = await this.getClient(args.instance).getDevOpsProjectDetails();
                return { content: [{ type: 'text', text: JSON.stringify(project, null, 2) }] };

            case 'get_issue':
                const issue = await this.getClient(args.instance).getIssue(args.issueKey);
                return { content: [{ type: 'text', text: JSON.stringify(issue, null, 2) }] };

            case 'summarize_issue':
                const summary = await this.getClient(args.instance).summarizeIssue(args.issueKey);
                return { content: [{ type: 'text', text: summary }] };

            case 'get_issue_comments':
                const comments = await this.getClient(args.instance).getIssueComments(args.issueKey);
                return { content: [{ type: 'text', text: JSON.stringify(comments, null, 2) }] };

            default:
                throw new Error(`Unknown tool: ${name}`);
        }
    }
}
