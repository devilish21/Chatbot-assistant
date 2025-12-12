
export interface Tool {
    name: string;
    description: string;
    inputSchema: any;
}

export interface CallToolResult {
    content: {
        type: string;
        text: string;
    }[];
    isError?: boolean;
}

const PROXY_URL = '/api';

export const mcpService = {
    getTools: async (categories?: string[]): Promise<Tool[]> => {
        try {
            const url = categories && categories.length > 0
                ? `${PROXY_URL}/tools?categories=${categories.join(',')}`
                : `${PROXY_URL}/tools`;

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch tools: ${response.statusText}`);
            }
            const data = await response.json();
            return data.tools || [];
        } catch (error) {
            console.error("Error fetching tools from Unified MCP:", error);
            // Return empty array for resilience
            return [];
        }
    },

    getCategories: async (): Promise<string[]> => {
        try {
            const response = await fetch(`${PROXY_URL}/categories`);
            if (!response.ok) {
                return [];
            }
            return await response.json();
        } catch (error) {
            console.error("Error fetching categories:", error);
            return [];
        }
    },

    callTool: async (name: string, args: any): Promise<CallToolResult> => {
        try {
            // We just send everything to the unified server, it handles routing.
            const response = await fetch(`${PROXY_URL}/call-tool`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, arguments: args }),
            });

            if (!response.ok) {
                throw new Error(`Failed to call tool: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error calling tool ${name}:`, error);
            throw error;
        }
    }
};
