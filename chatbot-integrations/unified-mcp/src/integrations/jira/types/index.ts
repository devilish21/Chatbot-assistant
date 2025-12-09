import { z } from 'zod';

export const InstanceConfigSchema = z.object({
    name: z.string(),
    baseUrl: z.string(),
    username: z.string(),
    apiToken: z.string(),
    allowedProjectKey: z.string().describe("The ONLY project key this instance is allowed to access"),
});

export const ConfigSchema = z.object({
    instances: z.array(InstanceConfigSchema),
});

export type InstanceConfig = z.infer<typeof InstanceConfigSchema>;
export type Config = z.infer<typeof ConfigSchema>;

// Generic Jira Types
export interface JiraIssue {
    key: string;
    fields: {
        summary: string;
        description?: string;
        status: { name: string };
        assignee?: { displayName: string };
        reporter?: { displayName: string };
        priority?: { name: string };
        created: string;
        updated: string;
        comment?: {
            comments: Array<{
                body: string;
                author: { displayName: string };
                created: string;
            }>;
        };
        attachment?: Array<{
            filename: string;
            size: number;
            created: string;
        }>;
    };
}

export interface JiraProject {
    key: string;
    name: string;
    id: string;
}
