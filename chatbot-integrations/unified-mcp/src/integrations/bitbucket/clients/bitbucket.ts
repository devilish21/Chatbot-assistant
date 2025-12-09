import axios, { AxiosInstance } from 'axios';
import { InstanceConfig, BitbucketProject, BitbucketRepository, BitbucketPullRequest } from '../types/index.js';

export class BitbucketClient {
    private client: AxiosInstance;
    public readonly name: string;

    constructor(config: InstanceConfig) {
        this.name = config.name;
        this.client = axios.create({
            baseURL: config.baseUrl,
            headers: {
                'Authorization': `Bearer ${config.apiToken}`,
                'Content-Type': 'application/json',
            },
        });
    }

    // Projects
    async listProjects(): Promise<BitbucketProject[]> {
        const response = await this.client.get('/rest/api/1.0/projects?limit=100');
        return response.data.values;
    }

    // Repositories
    async listRepositories(projectKey: string): Promise<BitbucketRepository[]> {
        const response = await this.client.get(`/rest/api/1.0/projects/${projectKey}/repos?limit=100`);
        return response.data.values;
    }

    async getRepository(projectKey: string, repoSlug: string): Promise<BitbucketRepository> {
        const response = await this.client.get(`/rest/api/1.0/projects/${projectKey}/repos/${repoSlug}`);
        return response.data;
    }

    // Pull Requests
    async getPullRequests(projectKey: string, repoSlug: string, state: string = 'OPEN'): Promise<BitbucketPullRequest[]> {
        const response = await this.client.get(`/rest/api/1.0/projects/${projectKey}/repos/${repoSlug}/pull-requests?state=${state}&limit=50`);
        return response.data.values;
    }

    // Raw Content
    async getFileContent(projectKey: string, repoSlug: string, filePath: string, at?: string): Promise<string> {
        // Bitbucket Server raw API: /projects/{projectKey}/repos/{repositorySlug}/raw/{path}
        let url = `/projects/${projectKey}/repos/${repoSlug}/raw/${filePath}`;
        if (at) {
            url += `?at=${at}`;
        }
        // Note: This endpoint is usually mounted on the root, not under /rest/api
        // Adjusting base URL assumption or using relative path if the baseURL includes /rest (which it shouldn't for this call)
        // Assuming baseURL is e.g., https://bitbucket.company.com

        // However, typical Bitbucket Server allows Raw content via: 
        // /rest/api/1.0/projects/{projectKey}/repos/{repositorySlug}/raw/{path} 
        // IS NOT STANDARD. Standard is usually /projects/.../raw or via a plugin.
        // Let's rely on the Browse API which returns lines, or use the /browse endpoint if raw isn't available easily via JSON APIs.
        // Better approach for standard API: /rest/api/1.0/projects/{projectKey}/repos/{repositorySlug}/browse/{path}
        // This returns a JSON with lines.

        const response = await this.client.get(`/rest/api/1.0/projects/${projectKey}/repos/${repoSlug}/browse/${filePath}?limit=10000`);
        // Reconstruct content from lines
        if (response.data.lines) {
            return response.data.lines.map((l: any) => l.text).join('\n');
        }
        return "";
    }
}
