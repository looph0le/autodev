export interface GitConfig {
    baseBranch: string;
    authorName: string;
    authorEmail: string;
}
export declare class GitManager {
    private git;
    private config;
    constructor(repoPath: string, config: GitConfig);
    initRepo(): Promise<void>;
    createBranch(taskId: string): Promise<string>;
    commit(message: string, files?: string[]): Promise<void>;
    getCurrentBranch(): Promise<string>;
    checkoutBase(): Promise<void>;
}
//# sourceMappingURL=GitManager.d.ts.map