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

export interface JenkinsJob {
    _class?: string;
    name: string;
    url: string;
    color?: string;
    jobs?: JenkinsJob[]; // For folders
}

export interface JenkinsBuild {
    _class?: string;
    number: number;
    url: string;
    result: string | null;
    building: boolean;
    timestamp: number;
    duration: number;
    estimatedDuration: number;
    fullDisplayName: string;
    actions?: any[];
}

export interface JenkinsNode {
    displayName: string;
    offline: boolean;
    idle: boolean;
    jnlpAgent: boolean;
    launchSupported: boolean;
    manualLaunchAllowed: boolean;
    numExecutors: number;
}
