import { z } from 'zod';

export const InstanceConfigSchema = z.object({
    name: z.string(),
    baseUrl: z.string(),
    apiToken: z.string(), // Service Account Token or API Key
});

export const ConfigSchema = z.object({
    instances: z.array(InstanceConfigSchema),
});

export type InstanceConfig = z.infer<typeof InstanceConfigSchema>;
export type Config = z.infer<typeof ConfigSchema>;

// Generic Grafana Types
export interface GrafanaDashboardSearchHit {
    id: number;
    uid: string;
    title: string;
    uri: string;
    url: string;
    slug: string;
    type: string;
    tags: string[];
    isStarred: boolean;
    folderId?: number;
    folderUid?: string;
    folderTitle?: string;
    folderUrl?: string;
}

export interface GrafanaDashboard {
    meta: {
        type: string;
        canSave: boolean;
        canEdit: boolean;
        canAdmin: boolean;
        canStar: boolean;
        slug: string;
        url: string;
        expires: string;
        created: string;
        updated: string;
        updatedBy: string;
        createdBy: string;
        version: number;
    };
    dashboard: {
        id: number;
        uid: string;
        title: string;
        description?: string;
        tags: string[];
        panels: any[];
    };
}

export interface GrafanaDataSource {
    id: number;
    uid: string;
    name: string;
    type: string;
    url: string;
    access: string;
    database?: string;
}
