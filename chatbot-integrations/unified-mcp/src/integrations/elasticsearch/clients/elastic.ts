import { Client } from '@elastic/elasticsearch';
import { InstanceConfig } from '../types/index.js';

export class ElasticClient {
    private client: Client;
    public readonly name: string;

    constructor(config: InstanceConfig) {
        this.name = config.name;
        this.client = new Client({
            node: config.node,
            auth: {
                username: config.username,
                password: config.apiToken,
            },
            tls: {
                rejectUnauthorized: false // Allow self-signed certs for internal ELK
            }
        });
    }

    async getClusterHealth(): Promise<any> {
        const response = await this.client.cluster.health();
        return response;
    }

    async listIndices(): Promise<any> {
        const response = await this.client.cat.indices({ format: 'json' });
        return response;
    }

    async searchLogs(index: string, query: string): Promise<any> {
        const response = await this.client.search({
            index: index,
            q: query,
            size: 20,
            sort: ['@timestamp:desc']
        });
        return response.hits.hits;
    }
}
