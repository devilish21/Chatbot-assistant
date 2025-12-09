import { GrafanaClient } from '../clients/grafana.js';
import { Config } from '../types/index.js';

export class ToolsManager {
    private clients: Map<string, GrafanaClient> = new Map();

    constructor(config: Config) {
        for (const instance of config.instances) {
            this.clients.set(instance.name, new GrafanaClient(instance));
        }
    }

    private getClient(instanceName: string): GrafanaClient {
        const client = this.clients.get(instanceName);
        if (!client) {
            throw new Error(`Grafana instance '${instanceName}' not found. Available: ${Array.from(this.clients.keys()).join(', ')}`);
        }
        return client;
    }

    getToolDefinitions() {
        return [
            {
                name: 'list_instances',
                description: 'List all configured Grafana instances',
                inputSchema: { type: 'object', properties: {} },
            },
            {
                name: 'search_dashboards',
                description: 'Search for Grafana dashboards',
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
                name: 'get_dashboard_details',
                description: 'Get dashboard details by UID',
                inputSchema: {
                    type: 'object',
                    properties: {
                        instance: { type: 'string' },
                        uid: { type: 'string' },
                    },
                    required: ['instance', 'uid'],
                },
            },
            {
                name: 'list_datasources',
                description: 'List available data sources',
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

            case 'search_dashboards':
                const dashboards = await this.getClient(args.instance).searchDashboards(args.query);
                return { content: [{ type: 'text', text: JSON.stringify(dashboards, null, 2) }] };

            case 'get_dashboard_details':
                const dashboard = await this.getClient(args.instance).getDashboard(args.uid);
                return { content: [{ type: 'text', text: JSON.stringify(dashboard, null, 2) }] };

            case 'list_datasources':
                const sources = await this.getClient(args.instance).listDataSources();
                return { content: [{ type: 'text', text: JSON.stringify(sources, null, 2) }] };

            default:
                throw new Error(`Unknown tool: ${name}`);
        }
    }
}
