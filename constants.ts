
import { AppConfig, SlashCommand } from './types';
import { Schema, Type } from "@google/genai";

export const DEFAULT_CONFIG: AppConfig = {
  // Endpoint is not used for Gemini SDK but kept for type compatibility
  endpoint: 'https://generativelanguage.googleapis.com', 
  model: 'gemini-2.5-flash', 
  temperature: 0.7,
  systemInstruction: `You are an advanced DevOps Omni-Assistant. 
  
  CORE BEHAVIORS:
  1. **Chain of Thought**: When solving complex problems, wrap your reasoning in <thought>...</thought> tags before your final answer.
  2. **Agentic Coding**: When writing Python, ensure it is self-contained. If the user asks to fix code, output ONLY the fixed code block.
  3. **Visual Diffs**: If asked to compare code or show changes, return a JSON object with this exact structure:
     \`\`\`json
     { "type": "diff", "original": "...", "modified": "..." }
     \`\`\`
  4. **Mermaid Diagrams**: When generating diagrams, use valid Mermaid syntax.
  
  Your expertise spans the entire software development lifecycle (SDLC): Planning, Coding (Git, Best Practices), Building (CI/CD), Testing, Releasing, Deploying (IaC, Containers, Cloud), Operating, and Monitoring (Observability, SRE).`,
  enableSuggestions: true,
  enableVisualEffects: true,
  // Admin Defaults
  apiKey: '',
  maxOutputTokens: 1024,
  contextWindowSize: 1000, // Default context window
  botName: 'DevOps Assistant',
  welcomeMessage: "DevOps Assistant Online.\nReady for Code, Pipeline, Security, and Infrastructure operations...",
  systemAlert: "This is a beta version, please expect lag",
  agentMode: true, // Default to enabled for the demo
};

// --- GRAMMAR CONSTRAINTS (GBNF & SCHEMAS) ---
// These define the strict structure models MUST follow.
// GBNF is for Local LLMs (Llama.cpp/Ollama). Schemas are for Gemini/OpenAI.

export const GRAMMARS = {
    // 1. Strict Diff Grammar
    diff: {
        // Future-proof: GBNF string for Llama.cpp
        gbnf: `root ::= "{" space "\\"original\\":" space string "," space "\\"modified\\":" space string "}" space
               string ::= "\\"" ( [^"\\\\] | "\\\\" (["\\\\/bfnrt] | "u" [0-9a-fA-F] [0-9a-fA-F] [0-9a-fA-F] [0-9a-fA-F]) )* "\\"" space`,
        
        // Current: Gemini Schema
        schema: {
            type: Type.OBJECT,
            properties: {
                original: { type: Type.STRING, description: "The original code snippet before changes." },
                modified: { type: Type.STRING, description: "The new code snippet after changes." }
            },
            required: ["original", "modified"]
        } as Schema
    },

    // 2. Analysis Grammar (Structured Audit)
    audit: {
        schema: {
            type: Type.OBJECT,
            properties: {
                score: { type: Type.INTEGER, description: "Security score from 0-100" },
                issues: { 
                    type: Type.ARRAY, 
                    items: { 
                        type: Type.OBJECT,
                        properties: {
                            severity: { type: Type.STRING, enum: ["CRITICAL", "HIGH", "MEDIUM", "LOW"] },
                            description: { type: Type.STRING },
                            fix: { type: Type.STRING }
                        }
                    }
                }
            }
        } as Schema
    }
};

export const SLASH_COMMANDS: SlashCommand[] = [
  { 
    key: '/audit', 
    label: '/audit', 
    description: 'Perform a security & best-practice audit', 
    prompt: 'Review the following code/configuration for security vulnerabilities, performance bottlenecks, and DevOps best practices. Wrap your analysis in <thought> tags.' 
  },
  { 
    key: '/docker', 
    label: '/docker', 
    description: 'Generate a production Dockerfile', 
    prompt: 'Generate a multi-stage, optimized production Dockerfile for a [LANGUAGE] application. Include comments explaining layer caching and security decisions.' 
  },
  { 
    key: '/k8s', 
    label: '/k8s', 
    description: 'Generate K8s Deployment & Service', 
    prompt: 'Write a standard Kubernetes deployment.yaml and service.yaml for a stateless application. Include resource limits, liveness probes, and readiness probes.' 
  },
  { 
    key: '/diff',
    label: '/diff',
    description: 'Generate a Code Diff (Agentic)',
    prompt: 'I want to refactor some code. \nOriginal Code:\n[PASTE HERE]\n\nRequirement:\n[DESCRIBE CHANGE]\n\n'
  },
  { 
    key: '/ci', 
    label: '/ci', 
    description: 'Create a CI/CD Pipeline structure', 
    prompt: 'Outline a robust CI/CD pipeline (using GitHub Actions or Jenkins) that includes linting, unit testing, docker build, security scan, and deployment to staging.' 
  },
  { 
    key: '/regex', 
    label: '/regex', 
    description: 'Explain or generate Regex', 
    prompt: 'I need a Regular Expression to match: ' 
  },
  { 
    key: '/explain', 
    label: '/explain', 
    description: 'Explain this code/log in simple terms', 
    prompt: 'Explain the following code or log snippet in simple, technical terms. Highlight key logic and potential errors:' 
  },
  // Internal Tool Simulations
  {
    key: '/jira',
    label: '/jira [ID]',
    description: 'Fetch Jira ticket status (Simulated)',
    prompt: '' // Handled specially in ChatInterface
  },
  {
    key: '/bitbucket',
    label: '/bitbucket [PR]',
    description: 'Check PR status (Simulated)',
    prompt: ''
  },
  {
    key: '/sonar',
    label: '/sonar [PROJ]',
    description: 'Check Quality Gate (Simulated)',
    prompt: ''
  }
];
