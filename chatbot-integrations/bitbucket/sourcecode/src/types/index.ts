import { z } from 'zod';

export const InstanceConfigSchema = z.object({
    name: z.string(),
    baseUrl: z.string(),
    username: z.string(),
    apiToken: z.string(),
});

export const ConfigSchema = z.object({
    instances: z.array(InstanceConfigSchema),
});

export type InstanceConfig = z.infer<typeof InstanceConfigSchema>;
export type Config = z.infer<typeof ConfigSchema>;

// Generic Bitbucket Types
export interface BitbucketProject {
    key: string;
    id: number;
    name: string;
    public: boolean;
    type: string;
}

export interface BitbucketRepository {
    slug: string;
    id: number;
    name: string;
    scmId: string;
    state: string;
    statusMessage: string;
    forkable: boolean;
    project: BitbucketProject;
    public: boolean;
}

export interface BitbucketPullRequest {
    id: number;
    version: number;
    title: string;
    description: string;
    state: string;
    open: boolean;
    closed: boolean;
    createdDate: number;
    updatedDate: number;
    fromRef: {
        id: string;
        displayId: string;
        latestCommit: string;
        repository: BitbucketRepository;
    };
    toRef: {
        id: string;
        displayId: string;
        latestCommit: string;
        repository: BitbucketRepository;
    };
    author: {
        user: {
            name: string;
            displayName: string;
        }
    };
}
