
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

const MCP_SERVERS = [
    { name: 'jenkins', url: 'http://localhost:3897' },
    { name: 'jira', url: 'http://localhost:3898' },
    { name: 'sonarqube', url: 'http://localhost:3899' },
    { name: 'nexus', url: 'http://localhost:3900' },
    { name: 'bitbucket', url: 'http://localhost:3901' },
    { name: 'elasticsearch', url: 'http://localhost:3902' },
    { name: 'grafana', url: 'http://localhost:3903' },
];

export const mcpService = {
    getTools: async (): Promise<Tool[]> => {
        const allTools: Tool[] = [];
        await Promise.all(MCP_SERVERS.map(async (server) => {
            try {
                const response = await fetch(`${server.url}/tools`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.tools) {
                        allTools.push(...data.tools);
                    }
                } else {
                    console.warn(`Failed to fetch tools from ${server.name}: ${response.statusText}`);
                }
            } catch (error) {
                console.error(`Error fetching tools from ${server.name}:`, error);
            }
        }));
        return allTools;
    },

    callTool: async (name: string, args: any): Promise<CallToolResult> => {
        let targetServerUrl = '';

        // Quick scan to find who owns the tool
        for (const server of MCP_SERVERS) {
            try {
                const response = await fetch(`${server.url}/tools`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.tools && data.tools.some((t: Tool) => t.name === name)) {
                        targetServerUrl = server.url;
                        break;
                    }
                }
            } catch (e) { /* ignore offline servers */ }
        }

        if (!targetServerUrl) {
            throw new Error(`Tool '${name}' not found on any active MCP server.`);
        }

        try {
            const response = await fetch(`${targetServerUrl}/call-tool`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, arguments: args }),
            });

            if (!response.ok) {
                throw new Error(`Failed to call tool on ${targetServerUrl}: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error calling tool ${name}:`, error);
            throw error;
        }
    }
};
