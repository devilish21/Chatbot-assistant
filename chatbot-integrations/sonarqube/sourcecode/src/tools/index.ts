import { SonarClient } from '../clients/sonarqube.js';
import { Config } from '../types/index.js';

export class ToolsManager {
    private clients: Map<string, SonarClient> = new Map();

    constructor(config: Config) {
        for (const instance of config.instances) {
            this.clients.set(instance.name, new SonarClient(instance));
        }
    }

    private getClient(instanceName: string): SonarClient {
        const client = this.clients.get(instanceName);
        if (!client) {
            throw new Error(`SonarQube instance '${instanceName}' not found. Available: ${Array.from(this.clients.keys()).join(', ')}`);
        }
        return client;
    }

    getToolDefinitions() {
        return [
            {
                name: 'list_instances',
                description: 'List all configured SonarQube instances',
                inputSchema: { type: 'object', properties: {} },
            },
            {
                name: 'list_projects',
                description: 'List accessible projects',
                inputSchema: {
                    type: 'object',
                    properties: {
                        instance: { type: 'string' },
                    },
                    required: ['instance'],
                },
            },
            {
                name: 'get_project_overview',
                description: 'Get project overview metrics and dashboard URL',
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
                name: 'get_quality_gate_status',
                description: 'Get Quality Gate status for a project',
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
                name: 'search_code_smells',
                description: 'Search for Code Smells',
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
                name: 'search_vulnerabilities',
                description: 'Search for Vulnerabilities',
                inputSchema: {
                    type: 'object',
                    properties: {
                        instance: { type: 'string' },
                        projectKey: { type: 'string' },
                    },
                    required: ['instance', 'projectKey'],
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

            case 'get_project_overview':
                const overview = await this.getClient(args.instance).getProjectOverview(args.projectKey);
                return { content: [{ type: 'text', text: JSON.stringify(overview, null, 2) }] };

            case 'get_quality_gate_status':
                const status = await this.getClient(args.instance).getQualityGateStatus(args.projectKey);
                return { content: [{ type: 'text', text: JSON.stringify(status, null, 2) }] };

            case 'search_code_smells':
                const smells = await this.getClient(args.instance).searchCodeSmells(args.projectKey);
                return { content: [{ type: 'text', text: JSON.stringify(smells, null, 2) }] };

            case 'search_vulnerabilities':
                const vulns = await this.getClient(args.instance).searchVulnerabilities(args.projectKey);
                return { content: [{ type: 'text', text: JSON.stringify(vulns, null, 2) }] };

            default:
                throw new Error(`Unknown tool: ${name}`);
        }
    }
}
