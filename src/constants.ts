
import { AppConfig, SlashCommand } from './types';

export const DEFAULT_CONFIG: AppConfig = {
  // Endpoint for Ollama
  endpoint: 'http://localhost:11434',
  model: 'qwen3:8b',
  temperature: 0.7,
  systemInstruction: 'You are an advanced DevOps Omni-Assistant. Your expertise spans the entire software development lifecycle (SDLC): Planning, Coding (Git, Best Practices), Building (CI/CD), Testing, Releasing, Deploying (IaC, Containers, Cloud), Operating, and Monitoring (Observability, SRE). You are not limited to infrastructure; you help with scripts, debugging applications, system architecture, security (DevSecOps), and automation strategy. Be precise, technical, and concise.',
  enableSuggestions: true,
  enableVisualEffects: true,
  // Admin Defaults
  maxOutputTokens: 1024,
  contextWindowSize: 1000, // Default context window
  botName: 'DevOps Assistant',
  welcomeMessage: "DevOps Assistant Online.\nReady for Code, Pipeline, Security, and Infrastructure operations...",
  systemAlert: "This is a beta version, please expect lag",
};

export const SLASH_COMMANDS: SlashCommand[] = [
  {
    key: '/audit',
    label: '/audit',
    description: 'Perform a security & best-practice audit',
    prompt: 'Review the following code/configuration for security vulnerabilities, performance bottlenecks, and DevOps best practices:'
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
