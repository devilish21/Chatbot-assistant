import { NexusClient } from '../clients/nexus.js';
import { Config } from '../types/index.js';

export class ToolsManager {
    private clients: Map<string, NexusClient> = new Map();

    constructor(config: Config) {
        for (const instance of config.instances) {
            this.clients.set(instance.name, new NexusClient(instance));
        }
    }

    private getClient(instanceName: string): NexusClient {
        const client = this.clients.get(instanceName);
        if (!client) {
            throw new Error(`Nexus instance '${instanceName}' not found. Available: ${Array.from(this.clients.keys()).join(', ')}`);
        }
        return client;
    }

    getToolDefinitions() {
        return [
            {
                name: 'list_instances',
                description: 'List all configured Nexus instances',
                inputSchema: { type: 'object', properties: {} },
            },
            {
                name: 'list_repositories',
                description: 'List all repositories in a Nexus instance',
                inputSchema: {
                    type: 'object',
                    properties: {
                        instance: { type: 'string' },
                    },
                    required: ['instance'],
                },
            },
            {
                name: 'get_repository_details',
                description: 'Get details of a specific repository',
                inputSchema: {
                    type: 'object',
                    properties: {
                        instance: { type: 'string' },
                        repoName: { type: 'string' },
                    },
                    required: ['instance', 'repoName'],
                },
            },
            {
                name: 'search_artifacts',
                description: 'Search for artifacts',
                inputSchema: {
                    type: 'object',
                    properties: {
                        instance: { type: 'string' },
                        query: { type: 'string' },
                    },
                    required: ['instance', 'query'],
                },
            },
            {
                name: 'list_artifacts',
                description: 'List artifacts in a repository, optionally filtered by group',
                inputSchema: {
                    type: 'object',
                    properties: {
                        instance: { type: 'string' },
                        repoName: { type: 'string' },
                        group: { type: 'string' },
                    },
                    required: ['instance', 'repoName'],
                },
            },
            {
                name: 'get_component',
                description: 'Get component details by ID',
                inputSchema: {
                    type: 'object',
                    properties: {
                        instance: { type: 'string' },
                        componentId: { type: 'string' },
                    },
                    required: ['instance', 'componentId'],
                },
            },
            {
                name: 'get_system_status',
                description: 'Get Nexus system status',
                inputSchema: {
                    type: 'object',
                    properties: {
                        instance: { type: 'string' },
                    },
                    required: ['instance'],
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

            case 'list_repositories':
                const repos = await this.getClient(args.instance).listRepositories();
                return { content: [{ type: 'text', text: JSON.stringify(repos, null, 2) }] };

            case 'get_repository_details':
                const repo = await this.getClient(args.instance).getRepositoryDetails(args.repoName);
                return { content: [{ type: 'text', text: JSON.stringify(repo, null, 2) }] };

            case 'search_artifacts':
                const artifacts = await this.getClient(args.instance).searchArtifacts(args.query);
                return { content: [{ type: 'text', text: JSON.stringify(artifacts, null, 2) }] };

            case 'list_artifacts':
                const items = await this.getClient(args.instance).listArtifacts(args.repoName, args.group);
                return { content: [{ type: 'text', text: JSON.stringify(items, null, 2) }] };

            case 'get_component':
                const comp = await this.getClient(args.instance).getComponent(args.componentId);
                return { content: [{ type: 'text', text: JSON.stringify(comp, null, 2) }] };

            case 'get_system_status':
                const status = await this.getClient(args.instance).getSystemStatus();
                return { content: [{ type: 'text', text: JSON.stringify(status, null, 2) }] };

            default:
                throw new Error(`Unknown tool: ${name}`);
        }
    }
}
