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

// Generic Nexus Types
export interface NexusRepository {
    name: string;
    format: string;
    type: string;
    url: string;
}

export interface NexusComponent {
    id: string;
    repository: string;
    format: string;
    group: string;
    name: string;
    version: string;
    assets: Array<{
        downloadUrl: string;
        path: string;
        id: string;
        checksum: {
            sha1: string;
            md5: string;
        };
        fileSize?: number; // Nexus API might call it size or fileSize
        lastModified?: string;
    }>;
}
