import axios, { AxiosInstance } from 'axios';
import { InstanceConfig, SonarProject, SonarIssue, QualityGateStatus } from '../types/index.js';

export class SonarClient {
    private client: AxiosInstance;
    public readonly name: string;
    private readonly baseUrl: string;

    constructor(config: InstanceConfig) {
        this.name = config.name;
        this.baseUrl = config.baseUrl;
        this.client = axios.create({
            baseURL: config.baseUrl,
            auth: {
                username: config.apiToken,
                password: '', // SonarQube uses token as username
            },
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    // Project Tools
    async listProjects(): Promise<SonarProject[]> {
        const response = await this.client.get('/api/components/search?qualifiers=TRK');
        return response.data.components;
    }

    async getProjectOverview(projectKey: string): Promise<any> {
        const response = await this.client.get(`/api/measures/component?component=${projectKey}&metricKeys=bugs,vulnerabilities,code_smells,coverage,duplicated_lines_density`);

        // Construct Dashboard URL
        const dashboardUrl = `${this.baseUrl}/dashboard?id=${projectKey}`;

        return {
            projectKey,
            dashboardUrl,
            measures: response.data.component.measures
        };
    }

    // Quality Gate Tools
    async getQualityGateStatus(projectKey: string): Promise<QualityGateStatus | any> {
        const response = await this.client.get(`/api/qualitygates/project_status?projectKey=${projectKey}`);
        return response.data.projectStatus;
    }

    async listQualityGates(): Promise<any> {
        const response = await this.client.get('/api/qualitygates/list');
        return response.data.qualitygates;
    }

    // Issue Category Tools
    async searchCodeSmells(projectKey: string): Promise<SonarIssue[]> {
        const response = await this.client.get(`/api/issues/search?componentKeys=${projectKey}&types=CODE_SMELL&ps=10`);
        return response.data.issues;
    }

    async searchVulnerabilities(projectKey: string): Promise<SonarIssue[]> {
        const response = await this.client.get(`/api/issues/search?componentKeys=${projectKey}&types=VULNERABILITY&ps=10`);
        return response.data.issues;
    }

    async searchHotspots(projectKey: string): Promise<any> {
        // Hotspots API structure differs slightly in newer versions
        const response = await this.client.get(`/api/hotspots/search?projectKey=${projectKey}&ps=10`);
        return response.data.hotspots;
    }
}
