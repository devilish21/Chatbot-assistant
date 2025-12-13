
import { AppConfig, SlashCommand } from './types';

export const DEFAULT_CONFIG: AppConfig = {
  // Endpoint for Ollama
  endpoint: 'http://localhost:11434',
  model: 'qwen3:8b',
  temperature: 0.7,
  systemInstruction: 'You are an advanced DevOps Omni-Assistant. Your expertise spans the entire software development lifecycle (SDLC): Planning, Coding (Git, Best Practices), Building (CI/CD), Testing, Releasing, Deploying (IaC, Containers, Cloud), Operating, and Monitoring (Observability, SRE). You are not limited to infrastructure; you help with scripts, debugging applications, system architecture, security (DevSecOps), and automation strategy. Be precise, technical, and concise.',
  enableSuggestions: false,
  enableVisualEffects: true,
  toolSafety: false,
  activeCategories: [],
  // Versioning for snippets to force updates
  snippetVersion: 2,
  // Admin Defaults
  maxOutputTokens: 10000,
  contextWindowSize: 10000, // Default context window
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

import { Snippet } from './types';

export const DEFAULT_SNIPPETS: Snippet[] = [
  // --- JENKINS (3) ---
  {
    id: 'jenkins-list-jobs',
    title: 'Jenkins: List Jobs',
    content: 'List all Jenkins jobs in the root directory using `list_jobs`.',
    category: 'jenkins'
  },
  {
    id: 'jenkins-build',
    title: 'Jenkins: Build Job',
    content: 'Trigger a build for job [JOB_NAME] using `build_job`.',
    category: 'jenkins'
  },
  {
    id: 'jenkins-status',
    title: 'Jenkins: Build Status',
    content: 'Get the status of the last build for job [JOB_NAME] using `get_build_status`.',
    category: 'jenkins'
  },

  // --- JIRA (5) ---
  {
    id: 'jira-instances',
    title: 'Jira: List Instances',
    content: 'List all configured Jira instances using `list_instances`.',
    category: 'jira'
  },
  {
    id: 'jira-project',
    title: 'Jira: Project Details',
    content: 'Get details for Jira project [PROJECT_KEY] using `get_project_details`.',
    category: 'jira'
  },
  {
    id: 'jira-issue',
    title: 'Jira: Get Issue',
    content: 'Get full details for Jira issue [ISSUE_KEY] using `get_issue`.',
    category: 'jira'
  },
  {
    id: 'jira-summary',
    title: 'Jira: Summarize Issue',
    content: 'Summarize the context and status of Jira issue [ISSUE_KEY] using `summarize_issue`.',
    category: 'jira'
  },
  {
    id: 'jira-comments',
    title: 'Jira: Get Comments',
    content: 'Fetch recent comments for Jira issue [ISSUE_KEY] using `get_issue_comments`.',
    category: 'jira'
  },

  // --- SONARQUBE (6) ---
  {
    id: 'sonar-instances',
    title: 'Sonar: List Instances',
    content: 'List all configured SonarQube instances using `list_instances`.',
    category: 'sonarqube'
  },
  {
    id: 'sonar-projects',
    title: 'Sonar: List Projects',
    content: 'List all SonarQube projects using `list_projects`.',
    category: 'sonarqube'
  },
  {
    id: 'sonar-overview',
    title: 'Sonar: Project Overview',
    content: 'Get the overview and metrics for SonarQube project [PROJECT_KEY] using `get_project_overview`.',
    category: 'sonarqube'
  },
  {
    id: 'sonar-gate',
    title: 'Sonar: Quality Gate',
    content: 'Check the quality gate status for project [PROJECT_KEY] using `get_quality_gate_status`.',
    category: 'sonarqube'
  },
  {
    id: 'sonar-smells',
    title: 'Sonar: Code Smells',
    content: 'Search for major code smells in project [PROJECT_KEY] using `search_code_smells`.',
    category: 'sonarqube'
  },
  {
    id: 'sonar-vulns',
    title: 'Sonar: Vulnerabilities',
    content: 'Search for security vulnerabilities in project [PROJECT_KEY] using `search_vulnerabilities`.',
    category: 'sonarqube'
  },

  // --- NEXUS (7) ---
  {
    id: 'nexus-instances',
    title: 'Nexus: List Instances',
    content: 'List all configured Nexus instances using `list_instances`.',
    category: 'nexus'
  },
  {
    id: 'nexus-repos',
    title: 'Nexus: List Repos',
    content: 'List all repositories in Nexus using `list_repositories`.',
    category: 'nexus'
  },
  {
    id: 'nexus-repo-detail',
    title: 'Nexus: Repo Details',
    content: 'Get configuration details for repository [REPO_Id] using `get_repository_details`.',
    category: 'nexus'
  },
  {
    id: 'nexus-search',
    title: 'Nexus: Search Artifacts',
    content: 'Search for artifacts matching [QUERY] using `search_artifacts`.',
    category: 'nexus'
  },
  {
    id: 'nexus-list-arts',
    title: 'Nexus: List Artifacts',
    content: 'List artifacts in repository [REPO_ID] using `list_artifacts`.',
    category: 'nexus'
  },
  {
    id: 'nexus-component',
    title: 'Nexus: Get Component',
    content: 'Get details for component [COMPONENT_ID] using `get_component`.',
    category: 'nexus'
  },
  {
    id: 'nexus-status',
    title: 'Nexus: System Status',
    content: 'Check the health and status of the Nexus server using `get_system_status`.',
    category: 'nexus'
  },

  // --- BITBUCKET (5) ---
  {
    id: 'bb-instances',
    title: 'Bitbucket: Instances',
    content: 'List all configured Bitbucket instances using `list_instances`.',
    category: 'bitbucket'
  },
  {
    id: 'bb-projects',
    title: 'Bitbucket: Projects',
    content: 'List all projects in Bitbucket using `list_projects`.',
    category: 'bitbucket'
  },
  {
    id: 'bb-repos',
    title: 'Bitbucket: Repos',
    content: 'List repositories in project [PROJECT_KEY] using `list_repositories`.',
    category: 'bitbucket'
  },
  {
    id: 'bb-prs',
    title: 'Bitbucket: Pull Requests',
    content: 'List open pull requests for repo [REPO_SLUG] in project [PROJECT_KEY] using `get_pull_requests`.',
    category: 'bitbucket'
  },
  {
    id: 'bb-file',
    title: 'Bitbucket: File Content',
    content: 'Get content of file [FILE_PATH] from repo [REPO_SLUG] using `get_file_content`.',
    category: 'bitbucket'
  },

  // --- ELASTICSEARCH (4) ---
  {
    id: 'es-instances',
    title: 'Elastic: Instances',
    content: 'List configured Elasticsearch instances using `list_instances`.',
    category: 'elasticsearch'
  },
  {
    id: 'es-health',
    title: 'Elastic: Cluster Health',
    content: 'Get the health status of the Elasticsearch cluster using `get_cluster_health`.',
    category: 'elasticsearch'
  },
  {
    id: 'es-indices',
    title: 'Elastic: List Indices',
    content: 'List all indices in the Elasticsearch cluster using `list_indices`.',
    category: 'elasticsearch'
  },
  {
    id: 'es-search',
    title: 'Elastic: Search Logs',
    content: 'Search for log entries matching [QUERY] in index [INDEX] using `search_logs`.',
    category: 'elasticsearch'
  },

  // --- GRAFANA (4) ---
  {
    id: 'graf-instances',
    title: 'Grafana: Instances',
    content: 'List configured Grafana instances using `list_instances`.',
    category: 'grafana'
  },
  {
    id: 'graf-search',
    title: 'Grafana: Dashboards',
    content: 'Search for dashboards matching [QUERY] using `search_dashboards`.',
    category: 'grafana'
  },
  {
    id: 'graf-details',
    title: 'Grafana: Dashboard Detail',
    content: 'Get full details for dashboard [UID] using `get_dashboard_details`.',
    category: 'grafana'
  },
  {
    id: 'graf-sources',
    title: 'Grafana: Data Sources',
    content: 'List available data sources using `list_datasources`.',
    category: 'grafana'
  }
];
