import { TaskStore } from '../store/TaskStore.js';
import { ArchitectAgent } from '../ai/ArchitectAgent.js';
import { DeveloperAgent } from '../ai/DeveloperAgent.js';
import { GitManager } from '../git/GitManager.js';
import { SandboxManager } from '../sandbox/SandboxManager.js';
import { TaskState } from '../types/task-schema.js';
import type { Task, DevelopmentPlan } from '../types/task-schema.js';
import fs from 'fs';
import path from 'path';

const MAX_RETRIES = 3;

export class TaskOrchestrator {
  private store: TaskStore;
  private architect: ArchitectAgent;
  private developer: DeveloperAgent;
  private git: GitManager;
  private sandbox: SandboxManager;

  constructor(repoPath: string) {
    this.store = TaskStore.getInstance();
    this.architect = new ArchitectAgent();
    this.developer = new DeveloperAgent();
    this.git = new GitManager(repoPath, {
      baseBranch: 'master',
      authorName: 'AutoDev Agent',
      authorEmail: 'agent@autodev.mcp',
    });
    this.sandbox = new SandboxManager();
  }

  async runTask(taskId: string) {
    const task = this.store.getTask(taskId);
    if (!task) throw new Error('Task not found');

    try {
      // 1. Start Sandbox
      await this.updateState(task, TaskState.SCAFFOLDING, 'Starting isolated sandbox...');
      await this.sandbox.start(process.cwd());

      // 2. Ingestion / Planning
      await this.updateState(task, TaskState.SCAFFOLDING, 'Architect is creating a development plan.');
      const plan = await this.architect.createPlan(task.description);
      this.store.updateTaskPlan(task.id, plan);
      this.store.addLog(task.id, { agent: 'Architect', message: `Plan created: ${plan.steps.length} steps.`, level: 'INFO' });

      // 3. Setup (Git Branching)
      await this.updateState(task, TaskState.SCAFFOLDING, 'GitManager is creating a new branch.');
      const branch = await this.git.createBranch(task.id);
      this.store.addLog(task.id, { agent: 'GitManager', message: `Branch created: ${branch}`, level: 'INFO' });

      // 4. Implementation & Self-Healing Loop
      let currentRetries = 0;
      let testsPassed = false;
      let lastErrorLog = '';

      while (currentRetries < MAX_RETRIES && !testsPassed) {
        await this.updateState(task, TaskState.IMPLEMENTATION, `Developer is ${currentRetries === 0 ? 'writing' : 'fixing'} code (Attempt ${currentRetries + 1}).`);
        
        let codeOutput: string;
        if (currentRetries === 0) {
          codeOutput = await this.developer.implementPlan(plan);
        } else {
          codeOutput = await this.developer.fixError(plan, lastErrorLog);
        }

        // Apply changes
        const changes = this.parseDeveloperResponse(codeOutput);
        this.applyChanges(changes);
        this.store.addLog(task.id, { agent: 'Developer', message: `Applied ${changes.length} file changes.`, level: 'INFO' });

        // 5. Verification (In Sandbox)
        await this.updateState(task, TaskState.VERIFICATION, `Running tests in sandbox (Attempt ${currentRetries + 1})...`);
        
        // npm install only on first try or if package.json changed
        if (currentRetries === 0) {
          await this.sandbox.runCommand(['npm', 'install']);
        }

        const testRes = await this.sandbox.runCommand(['npm', 'test']);
        this.store.addLog(task.id, { 
          agent: 'QA', 
          message: `Test exit code: ${testRes.exitCode}\nOutput: ${testRes.stdout.slice(-500)}`,
          level: testRes.exitCode === 0 ? 'INFO' : 'ERROR'
        });

        if (testRes.exitCode === 0) {
          testsPassed = true;
        } else {
          lastErrorLog = `${testRes.stdout}\n${testRes.stderr}`;
          currentRetries++;
          this.store.addLog(task.id, { agent: 'Orchestrator', message: `Tests failed. Self-healing attempt ${currentRetries}/${MAX_RETRIES}`, level: 'WARN' });
        }
      }

      if (!testsPassed) {
        throw new Error('Maximum retries reached. Tests are still failing.');
      }

      // 6. Commit changes
      await this.git.commit(`feat: implement task ${task.id}`);
      this.store.addLog(task.id, { agent: 'GitManager', message: 'Changes committed.', level: 'INFO' });

      // 7. Move to Review State
      await this.updateState(task, TaskState.REVIEW, 'Task ready for human review.');
    } catch (error: any) {
      console.error('Task execution failed:', error);
      this.store.updateTaskState(task.id, TaskState.FAILED);
      this.store.addLog(task.id, { agent: 'Orchestrator', message: `Error: ${error.message}`, level: 'ERROR' });
    } finally {
      await this.sandbox.stop();
    }
  }

  async approveTask(taskId: string) {
    const task = this.store.getTask(taskId);
    if (!task) throw new Error('Task not found');
    if (task.state !== TaskState.REVIEW) throw new Error('Task is not in REVIEW state');

    // In a real app, this might involve merging the branch
    this.store.updateTaskState(taskId, TaskState.COMPLETED);
    this.store.addLog(taskId, { agent: 'Orchestrator', message: 'Task approved and completed.', level: 'INFO' });
  }

  private applyChanges(changes: { filePath: string, content: string }[]) {
    for (const change of changes) {
      const fullPath = path.join(process.cwd(), change.filePath);
      fs.mkdirSync(path.dirname(fullPath), { recursive: true });
      fs.writeFileSync(fullPath, change.content);
    }
  }

  private async updateState(task: Task, state: TaskState, logMessage: string) {
    this.store.updateTaskState(task.id, state);
    this.store.addLog(task.id, { agent: 'Orchestrator', message: logMessage, level: 'INFO' });
  }

  private parseDeveloperResponse(response: string): { filePath: string, content: string }[] {
    const changes: { filePath: string, content: string }[] = [];
    const codeBlockRegex = /```[\w]*\n([\s\S]*?)```/g;
    let match;

    while ((match = codeBlockRegex.exec(response)) !== null) {
      const fullContent = match[1];
      if (!fullContent) continue;

      const lines = fullContent.split('\n');
      const firstLine = lines[0]?.trim();
      if (!firstLine) continue;
      
      const pathMatch = firstLine.match(/\/\/\s*([\w\.\-\/]+)/);
      if (pathMatch && pathMatch[1]) {
        const filePath = pathMatch[1];
        const content = lines.slice(1).join('\n');
        changes.push({ filePath, content });
      }
    }

    return changes;
  }
}
