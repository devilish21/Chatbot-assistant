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

// Generic SonarQube Types
export interface SonarProject {
    key: string;
    name: string;
    qualifier: string;
    lastAnalysisDate?: string;
}

export interface SonarMeasure {
    metric: string;
    value: string;
    component: string;
}

export interface QualityGateStatus {
    status: string;
    cayndidate: boolean;
    conditions: Array<{
        metric: string;
        status: string;
        comparator: string;
        errorThreshold: string;
        actualValue: string;
    }>;
}

export interface SonarIssue {
    key: string;
    rule: string;
    severity: string;
    component: string;
    line: number;
    message: string;
    type: string;
    author: string;
}
