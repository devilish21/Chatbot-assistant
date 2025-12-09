import { BitbucketClient } from '../clients/bitbucket.js';
import { Config } from '../types/index.js';

export class ToolsManager {
    private clients: Map<string, BitbucketClient> = new Map();

    constructor(config: Config) {
        for (const instance of config.instances) {
            this.clients.set(instance.name, new BitbucketClient(instance));
        }
    }

    private getClient(instanceName: string): BitbucketClient {
        const client = this.clients.get(instanceName);
        if (!client) {
            throw new Error(`Bitbucket instance '${instanceName}' not found. Available: ${Array.from(this.clients.keys()).join(', ')}`);
        }
        return client;
    }

    getToolDefinitions() {
        return [
            {
                name: 'list_instances',
                description: 'List all configured Bitbucket instances',
                inputSchema: { type: 'object', properties: {} },
            },
            {
                name: 'list_projects',
                description: 'List projects in a Bitbucket instance',
                inputSchema: {
                    type: 'object',
                    properties: {
                        instance: { type: 'string' },
                    },
                    required: ['instance'],
                },
            },
            {
                name: 'list_repositories',
                description: 'List repositories in a project',
                inputSchema: {
                    type: 'object',
                    properties: {
                        instance: { type: 'string' },
                        projectKey: { type: 'string' },
                    },
                    required: ['instance', 'projectKey'],
                },
            },
            {
                name: 'get_pull_requests',
                description: 'Get pull requests for a repository',
                inputSchema: {
                    type: 'object',
                    properties: {
                        instance: { type: 'string' },
                        projectKey: { type: 'string' },
                        repoSlug: { type: 'string' },
                        state: { type: 'string', enum: ['OPEN', 'DECLINED', 'MERGED', 'ALL'], description: 'Default: OPEN' },
                    },
                    required: ['instance', 'projectKey', 'repoSlug'],
                },
            },
            {
                name: 'get_file_content',
                description: 'Get the content of a file (read-only)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        instance: { type: 'string' },
                        projectKey: { type: 'string' },
                        repoSlug: { type: 'string' },
                        filePath: { type: 'string' },
                        at: { type: 'string', description: 'Commit or tag ref' },
                    },
                    required: ['instance', 'projectKey', 'repoSlug', 'filePath'],
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

            case 'list_projects':
                const projects = await this.getClient(args.instance).listProjects();
                return { content: [{ type: 'text', text: JSON.stringify(projects, null, 2) }] };

            case 'list_repositories':
                const repos = await this.getClient(args.instance).listRepositories(args.projectKey);
                return { content: [{ type: 'text', text: JSON.stringify(repos, null, 2) }] };

            case 'get_pull_requests':
                const prs = await this.getClient(args.instance).getPullRequests(args.projectKey, args.repoSlug, args.state);
                return { content: [{ type: 'text', text: JSON.stringify(prs, null, 2) }] };

            case 'get_file_content':
                const content = await this.getClient(args.instance).getFileContent(args.projectKey, args.repoSlug, args.filePath, args.at);
                return { content: [{ type: 'text', text: content }] };

            default:
                throw new Error(`Unknown tool: ${name}`);
        }
    }
}
