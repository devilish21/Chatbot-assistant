import { ElasticClient } from '../clients/elastic.js';
import { Config } from '../types/index.js';

export class ToolsManager {
    private clients: Map<string, ElasticClient> = new Map();

    constructor(config: Config) {
        for (const instance of config.instances) {
            this.clients.set(instance.name, new ElasticClient(instance));
        }
    }

    private getClient(instanceName: string): ElasticClient {
        const client = this.clients.get(instanceName);
        if (!client) {
            throw new Error(`Elasticsearch instance '${instanceName}' not found. Available: ${Array.from(this.clients.keys()).join(', ')}`);
        }
        return client;
    }

    getToolDefinitions() {
        return [
            {
                name: 'list_instances',
                description: 'List all configured Elasticsearch instances',
                inputSchema: { type: 'object', properties: {} },
            },
            {
                name: 'get_cluster_health',
                description: 'Get cluster health status',
                inputSchema: {
                    type: 'object',
                    properties: {
                        instance: { type: 'string' },
                    },
                    required: ['instance'],
                },
            },
            {
                name: 'list_indices',
                description: 'List all indices',
                inputSchema: {
                    type: 'object',
                    properties: {
                        instance: { type: 'string' },
                    },
                    required: ['instance'],
                },
            },
            {
                name: 'search_logs',
                description: 'Search logs using Lucene query syntax',
                inputSchema: {
                    type: 'object',
                    properties: {
                        instance: { type: 'string' },
                        index: { type: 'string', description: 'Index pattern (e.g. logs-*)' },
                        query: { type: 'string', description: 'Lucene query (e.g. level:ERROR AND message:failed)' },
                    },
                    required: ['instance', 'index', 'query'],
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

            case 'get_cluster_health':
                const health = await this.getClient(args.instance).getClusterHealth();
                return { content: [{ type: 'text', text: JSON.stringify(health, null, 2) }] };

            case 'list_indices':
                const indices = await this.getClient(args.instance).listIndices();
                return { content: [{ type: 'text', text: JSON.stringify(indices, null, 2) }] };

            case 'search_logs':
                const hits = await this.getClient(args.instance).searchLogs(args.index, args.query);
                return { content: [{ type: 'text', text: JSON.stringify(hits, null, 2) }] };

            default:
                throw new Error(`Unknown tool: ${name}`);
        }
    }
}
