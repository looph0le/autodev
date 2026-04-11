#!/usr/bin/env node
import { Command } from 'commander';
import { TaskStore } from './store/TaskStore.js';
import { TaskState } from './types/task-schema.js';
import { v4 as uuidv4 } from 'uuid';
import { GitManager } from './git/GitManager.js';
import { TaskOrchestrator } from './orchestrator/TaskOrchestrator.js';
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

const program = new Command();
const store = TaskStore.getInstance();

program
  .name('autodev')
  .description('Autonomous SDLC Orchestration Engine')
  .version(require('../package.json').version);


program
  .command('init')
  .description('Initialize the AutoDev project')
  .action(async () => {
    const git = new GitManager(process.cwd(), {
      baseBranch: 'master',
      authorName: 'AutoDev Agent',
      authorEmail: 'autodev@mitansh.xyz',
    });
    await git.initRepo();
    console.log('AutoDev initialized successfully.');
  });

program
  .command('task:create')
  .description('Create a new development task')
  .argument('<name>', 'Name of the task')
  .option('-d, --description <desc>', 'Description of the task', '')
  .action((name, options) => {
    const task = store.createTask({
      id: uuidv4(),
      name,
      description: options.description,
      state: TaskState.BACKLOG,
    });
    console.log(`Task created: ${task.name} (${task.id})`);
  });

program
  .command('task:list')
  .description('List all tasks')
  .action(() => {
    const tasks = store.getAllTasks();
    if (tasks.length === 0) {
      console.log('No tasks found.');
      return;
    }
    console.table(tasks.map(t => ({
      id: t.id.split('-')[0],
      name: t.name,
      state: t.state,
    })));
  });

program
  .command('task:status')
  .description('Get the status of a task')
  .argument('<id>', 'Task ID')
  .action((id) => {
    const task = store.getTask(id);
    if (!task) {
      console.error(`Task not found: ${id}`);
      return;
    }
    console.log(`Task: ${task.name}`);
    console.log(`State: ${task.state}`);
    console.log(`Description: ${task.description}`);
    console.log('--- Logs ---');
    task.logs.forEach(log => {
      console.log(`[${log.timestamp.toISOString()}] ${log.agent}: ${log.message}`);
    });
  });

program
  .command('task:run')
  .description('Execute a development task autonomously')
  .argument('<id>', 'Task ID')
  .action(async (id) => {
    const orchestrator = new TaskOrchestrator(process.cwd());
    console.log(`Starting task: ${id}`);
    await orchestrator.runTask(id);
    console.log(`Task execution finished. Check task:status ${id} for details.`);
  });

program
  .command('task:approve')
  .description('Approve a task and mark it as completed')
  .argument('<id>', 'Task ID')
  .action(async (id) => {
    const orchestrator = new TaskOrchestrator(process.cwd());
    await orchestrator.approveTask(id);
    console.log(`Task ${id} approved and completed.`);
  });

program.parse();
