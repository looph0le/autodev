import { simpleGit, SimpleGit, SimpleGitOptions } from 'simple-git';

export interface GitConfig {
  baseBranch: string;
  authorName: string;
  authorEmail: string;
}

export class GitManager {
  private git: SimpleGit;
  private config: GitConfig;

  constructor(repoPath: string, config: GitConfig) {
    const options: Partial<SimpleGitOptions> = {
      baseDir: repoPath,
      binary: 'git',
      maxConcurrentProcesses: 6,
      trimmed: false,
    };

    this.git = simpleGit(options);
    this.config = config;
  }

  async initRepo() {
    const isRepo = await this.git.checkIsRepo();
    if (!isRepo) {
      await this.git.init();
      // Configure local user for the repo
      await this.git.addConfig('user.name', this.config.authorName);
      await this.git.addConfig('user.email', this.config.authorEmail);
    }
  }

  async createBranch(taskId: string): Promise<string> {
    const branchName = `feature/task-${taskId}`;
    
    // Ensure we are on the base branch and it's clean (optional, but safer)
    await this.git.checkout(this.config.baseBranch);
    
    // Create and checkout new branch
    await this.git.checkoutLocalBranch(branchName);
    
    return branchName;
  }

  async commit(message: string, files: string[] = ['.']) {
    await this.git.add(files);
    await this.git.commit(message);
  }

  async getCurrentBranch(): Promise<string> {
    const status = await this.git.status();
    return status.current || 'unknown';
  }

  async checkoutBase() {
    await this.git.checkout(this.config.baseBranch);
  }
}
