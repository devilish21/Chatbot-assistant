export interface JenkinsConfig {
    url: string;
    user: string;
    token: string;
}

export interface JenkinsJob {
    name: string;
    color: string;
    url: string;
}

export interface JenkinsBuildStatus {
    result: string;
    building: boolean;
}
