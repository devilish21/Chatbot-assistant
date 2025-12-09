import axios, { AxiosInstance } from 'axios';
import { InstanceConfig, GrafanaDashboardSearchHit, GrafanaDashboard, GrafanaDataSource } from '../types/index.js';

export class GrafanaClient {
    private client: AxiosInstance;
    public readonly name: string;
    private readonly baseUrl: string;

    constructor(config: InstanceConfig) {
        this.name = config.name;
        this.baseUrl = config.baseUrl;
        this.client = axios.create({
            baseURL: config.baseUrl,
            headers: {
                'Authorization': `Bearer ${config.apiToken}`,
                'Content-Type': 'application/json',
            },
        });
    }

    async searchDashboards(query: string): Promise<GrafanaDashboardSearchHit[]> {
        const response = await this.client.get(`/api/search?query=${encodeURIComponent(query)}&type=dash-db&limit=20`);
        // Enrich with full URLs
        return response.data.map((hit: GrafanaDashboardSearchHit) => ({
            ...hit,
            url: `${this.baseUrl}${hit.url}`
        }));
    }

    async getDashboard(uid: string): Promise<GrafanaDashboard> {
        const response = await this.client.get(`/api/dashboards/uid/${uid}`);
        const dashboard = response.data;
        // Ensure URL is absolute
        if (dashboard.meta && dashboard.meta.url) {
            dashboard.meta.url = `${this.baseUrl}${dashboard.meta.url}`;
        }
        return dashboard;
    }

    async listDataSources(): Promise<GrafanaDataSource[]> {
        const response = await this.client.get('/api/datasources');
        return response.data;
    }
}
