import axios, { AxiosInstance } from 'axios';
import { InstanceConfig, JiraIssue } from '../types/index.js';

export class JiraClient {
    private client: AxiosInstance;
    public readonly name: string;
    private readonly allowedProjectKey: string;

    constructor(config: InstanceConfig) {
        this.name = config.name;
        this.allowedProjectKey = config.allowedProjectKey;
        this.client = axios.create({
            baseURL: config.baseUrl,
            auth: {
                username: config.username,
                password: config.apiToken,
            },
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        });
    }

    private validateProjectAccess(keyOrId: string) {
        if (!keyOrId.startsWith(this.allowedProjectKey)) {
            throw new Error(`Access Denied: This instance is restricted to project '${this.allowedProjectKey}'. Requested: '${keyOrId}'`);
        }
    }

    // DevOps Tools
    async getDevOpsProjectDetails(): Promise<any> {
        const response = await this.client.get(`/rest/api/2/project/${this.allowedProjectKey}`);
        return response.data;
    }

    async getDevOpsComponents(): Promise<any> {
        const response = await this.client.get(`/rest/api/2/project/${this.allowedProjectKey}/components`);
        return response.data;
    }

    async getDevOpsVersions(): Promise<any> {
        const response = await this.client.get(`/rest/api/2/project/${this.allowedProjectKey}/versions`);
        return response.data;
    }

    // Issue Tools
    async getIssue(issueKey: string): Promise<JiraIssue> {
        this.validateProjectAccess(issueKey);
        const response = await this.client.get(`/rest/api/2/issue/${issueKey}`);
        return response.data;
    }

    async getIssueComments(issueKey: string): Promise<any> {
        this.validateProjectAccess(issueKey);
        const response = await this.client.get(`/rest/api/2/issue/${issueKey}/comment`);
        return response.data;
    }

    // Summarization
    async summarizeIssue(issueKey: string): Promise<string> {
        const issue = await this.getIssue(issueKey);
        const fields = issue.fields;

        let summary = `Ticket: ${issue.key}\n`;
        summary += `Summary: ${fields.summary}\n`;
        summary += `Status: ${fields.status.name}\n`;
        summary += `Priority: ${fields.priority?.name || 'None'}\n`;
        summary += `Assignee: ${fields.assignee?.displayName || 'Unassigned'}\n`;
        summary += `Reporter: ${fields.reporter?.displayName || 'Unknown'}\n`;
        summary += `Created: ${fields.created}\n`;
        summary += `Updated: ${fields.updated}\n`;

        if (fields.description) {
            summary += `\nDescription:\n${fields.description.substring(0, 500)}${fields.description.length > 500 ? '...' : ''}\n`;
        }

        if (fields.comment && fields.comment.comments && fields.comment.comments.length > 0) {
            const lastComment = fields.comment.comments[fields.comment.comments.length - 1];
            summary += `\nLatest Comment (${lastComment.author.displayName}):\n${lastComment.body}\n`;
        }

        return summary;
    }
}
