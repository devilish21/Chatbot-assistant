
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

const PROXY_URL = 'http://localhost:3897';

export const mcpService = {
    getTools: async (): Promise<Tool[]> => {
        try {
            const response = await fetch(`${PROXY_URL}/tools`);
            if (!response.ok) {
                throw new Error(`Failed to fetch tools: ${response.statusText}`);
            }
            const data = await response.json();
            return data.tools || [];
        } catch (error) {
            console.error("Error fetching tools from MCP Proxy:", error);
            return [];
        }
    },

    callTool: async (name: string, args: any): Promise<CallToolResult> => {
        try {
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
