import axios, { AxiosInstance } from 'axios';
import { InstanceConfig, NexusRepository, NexusComponent } from '../types/index.js';

export class NexusClient {
    private client: AxiosInstance;
    public readonly name: string;

    constructor(config: InstanceConfig) {
        this.name = config.name;
        this.client = axios.create({
            baseURL: config.baseUrl,
            auth: {
                username: config.username,
                password: config.apiToken,
            },
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    // Repository Tools
    async listRepositories(): Promise<NexusRepository[]> {
        const response = await this.client.get('/service/rest/v1/repositories');
        return response.data;
    }

    async getRepositoryDetails(repoName: string): Promise<NexusRepository> {
        const repositories = await this.listRepositories();
        const repo = repositories.find(r => r.name === repoName);
        if (!repo) {
            throw new Error(`Repository '${repoName}' not found.`);
        }
        return repo;
    }

    // Artifact Tools
    async searchArtifacts(query: string): Promise<NexusComponent[]> {
        const response = await this.client.get(`/service/rest/v1/search?q=${encodeURIComponent(query)}`);
        return response.data.items;
    }

    async listArtifacts(repoName: string, group?: string): Promise<NexusComponent[]> {
        let url = `/service/rest/v1/search?repository=${repoName}`;
        if (group) {
            url += `&group=${encodeURIComponent(group)}`;
        }
        const response = await this.client.get(url);
        return response.data.items;
    }

    // Component Tools
    async getComponent(componentId: string): Promise<NexusComponent> {
        const response = await this.client.get(`/service/rest/v1/components/${componentId}`);
        return response.data;
    }

    // System Info
    async getSystemStatus(): Promise<any> {
        const response = await this.client.get('/service/rest/v1/status');
        return response.data;
    }
}
