import { z } from 'zod';

export const InstanceConfigSchema = z.object({
    name: z.string(),
    node: z.string(),
    username: z.string(),
    apiToken: z.string(), // Or password
});

export const ConfigSchema = z.object({
    instances: z.array(InstanceConfigSchema),
});

export type InstanceConfig = z.infer<typeof InstanceConfigSchema>;
export type Config = z.infer<typeof ConfigSchema>;

// Generic ELK Types
export interface SearchHit {
    _index: string;
    _id: string;
    _score: number;
    _source: any;
}

export interface ClusterHealth {
    cluster_name: string;
    status: string;
    number_of_nodes: number;
    number_of_data_nodes: number;
    active_primary_shards: number;
    active_shards: number;
}
