import { JenkinsClient } from '../jenkins/client.js';
import { Config } from '../types.js';

export class ToolsManager {
    private clients: Map<string, JenkinsClient> = new Map();

    constructor(config: Config) {
        for (const instance of config.instances) {
            this.clients.set(instance.name, new JenkinsClient(instance));
        }
    }

    private getClient(instanceName: string): JenkinsClient {
        const client = this.clients.get(instanceName);
        if (!client) {
            throw new Error(`Jenkins instance '${instanceName}' not found. Available: ${Array.from(this.clients.keys()).join(', ')}`);
        }
        return client;
    }

    getToolDefinitions() {
        return [
            {
                name: 'list_instances',
                description: 'List all configured Jenkins instances',
                inputSchema: { type: 'object', properties: {} },
            },
            {
                name: 'list_jobs',
                description: 'List jobs in a Jenkins instance',
                inputSchema: {
                    type: 'object',
                    properties: {
                        instance: { type: 'string', description: 'Name of the Jenkins instance' },
                        folder: { type: 'string', description: 'Optional folder path' },
                    },
                    required: ['instance'],
                },
            },
            {
                name: 'get_job_details',
                description: 'Get details of a specific job',
                inputSchema: {
                    type: 'object',
                    properties: {
                        instance: { type: 'string' },
                        jobName: { type: 'string' },
                    },
                    required: ['instance', 'jobName'],
                },
            },
            {
                name: 'get_last_build',
                description: 'Get the last build of a job',
                inputSchema: {
                    type: 'object',
                    properties: {
                        instance: { type: 'string' },
                        jobName: { type: 'string' },
                    },
                    required: ['instance', 'jobName'],
                },
            },
            {
                name: 'get_build_console',
                description: 'Get console logs for a build',
                inputSchema: {
                    type: 'object',
                    properties: {
                        instance: { type: 'string' },
                        jobName: { type: 'string' },
                        buildNumber: { type: 'number' },
                    },
                    required: ['instance', 'jobName', 'buildNumber'],
                },
            },
            {
                name: 'get_queue',
                description: 'Get current build queue',
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

            case 'list_jobs':
                const jobs = await this.getClient(args.instance).listJobs(args.folder);
                return { content: [{ type: 'text', text: JSON.stringify(jobs, null, 2) }] };

            case 'get_job_details':
                const details = await this.getClient(args.instance).getJobDetails(args.jobName);
                return { content: [{ type: 'text', text: JSON.stringify(details, null, 2) }] };

            case 'get_last_build':
                const build = await this.getClient(args.instance).getLastBuild(args.jobName);
                return { content: [{ type: 'text', text: JSON.stringify(build, null, 2) }] };

            case 'get_build_console':
                const logs = await this.getClient(args.instance).getBuildConsole(args.jobName, args.buildNumber);
                return { content: [{ type: 'text', text: logs }] };

            case 'get_queue':
                const queue = await this.getClient(args.instance).getQueue();
                return { content: [{ type: 'text', text: JSON.stringify(queue, null, 2) }] };

            default:
                throw new Error(`Unknown tool: ${name}`);
        }
    }
}
