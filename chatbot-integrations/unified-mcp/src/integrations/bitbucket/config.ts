import fs from 'fs/promises';
import path from 'path';
import { Config, ConfigSchema } from './types/index.js';

export class ConfigLoader {
    private static readonly CONFIG_PATH = process.env.BITBUCKET_CONFIG_PATH || path.resolve(process.cwd(), 'bitbucket.config.json');

    static async load(): Promise<Config> {
        try {
            const configData = await fs.readFile(this.CONFIG_PATH, 'utf-8');
            const json = JSON.parse(configData);
            return ConfigSchema.parse(json);
        } catch (error) {
            console.error(`Failed to load config from ${this.CONFIG_PATH}:`, error);
            throw new Error('Invalid or missing configuration file.');
        }
    }
}
