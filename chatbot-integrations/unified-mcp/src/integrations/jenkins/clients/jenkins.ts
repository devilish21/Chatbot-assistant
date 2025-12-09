import axios from 'axios';
import { JenkinsConfig, JenkinsJob, JenkinsBuildStatus } from '../types/index.js';

export class JenkinsClient {
    private config: JenkinsConfig;

    constructor(config: JenkinsConfig) {
        this.config = config;
    }

    private getAuthHeader() {
        return {
            Authorization: `Basic ${Buffer.from(`${this.config.user}:${this.config.token}`).toString('base64')}`
        };
    }

    async getJobs(): Promise<JenkinsJob[]> {
        const response = await axios.get(`${this.config.url}/api/json?tree=jobs[name,color,url]`, {
            headers: this.getAuthHeader()
        });
        return response.data.jobs;
    }

    async triggerBuild(jobName: string): Promise<number> {
        const response = await axios.post(`${this.config.url}/job/${jobName}/build`, {}, {
            headers: this.getAuthHeader()
        });
        return response.status;
    }

    async getBuildStatus(jobName: string, buildId: string): Promise<string> {
        const response = await axios.get(`${this.config.url}/job/${jobName}/${buildId}/api/json`, {
            headers: this.getAuthHeader()
        });
        return response.data.result || (response.data.building ? "BUILDING" : "UNKNOWN");
    }
}
