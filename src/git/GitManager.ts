import { simpleGit } from 'simple-git';
import type { SimpleGit, SimpleGitOptions } from 'simple-git';

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
    
    // Try to get the current branch, if none exists (unborn repo), this might throw or return empty.
    const currentBranch = await this.getCurrentBranch();

    if (currentBranch !== 'unknown') {
      try {
        await this.git.checkout(this.config.baseBranch);
      } catch (e) {
        console.warn(`Could not checkout base branch '${this.config.baseBranch}'. Falling back to current branch '${currentBranch}'.`);
      }
    }
    
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
