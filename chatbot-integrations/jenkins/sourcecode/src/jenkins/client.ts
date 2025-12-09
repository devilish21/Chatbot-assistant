import axios, { AxiosInstance } from 'axios';
import { InstanceConfig, JenkinsJob, JenkinsBuild, JenkinsNode } from '../types.js';

export class JenkinsClient {
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

    // System
    async getSystemInfo(): Promise<any> {
        const response = await this.client.get('/api/json');
        return response.data;
    }

    async getPlugins(): Promise<any> {
        const response = await this.client.get('/pluginManager/api/json?depth=1');
        return response.data;
    }

    // Jobs
    async listJobs(folder?: string): Promise<JenkinsJob[]> {
        const url = folder ? `/job/${folder}/api/json?tree=jobs[name,url,color]` : '/api/json?tree=jobs[name,url,color]';
        const response = await this.client.get(url);
        return response.data.jobs || [];
    }

    async getJobDetails(jobName: string): Promise<any> {
        const response = await this.client.get(`/job/${jobName}/api/json`);
        return response.data;
    }

    async getJobConfigXML(jobName: string): Promise<string> {
        const response = await this.client.get(`/job/${jobName}/config.xml`, { responseType: 'text' });
        return response.data;
    }

    // Builds
    async getLastBuild(jobName: string): Promise<JenkinsBuild> {
        const response = await this.client.get(`/job/${jobName}/lastBuild/api/json`);
        return response.data;
    }

    async getBuildInfo(jobName: string, buildNumber: number): Promise<JenkinsBuild> {
        const response = await this.client.get(`/job/${jobName}/${buildNumber}/api/json`);
        return response.data;
    }

    async getBuildConsole(jobName: string, buildNumber: number): Promise<string> {
        const response = await this.client.get(`/job/${jobName}/${buildNumber}/consoleText`, { responseType: 'text' });
        return response.data;
    }

    // Nodes
    async listNodes(): Promise<JenkinsNode[]> {
        const response = await this.client.get('/computer/api/json?tree=computer[displayName,offline,idle]');
        return response.data.computer;
    }

    async getQueue(): Promise<any> {
        const response = await this.client.get('/queue/api/json');
        return response.data.items;
    }
}
