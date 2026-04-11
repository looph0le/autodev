import Database from 'better-sqlite3';
import { TaskSchema, TaskState, AgentLogSchema } from '../types/task-schema.js';
import type { Task, AgentLog } from '../types/task-schema.js';

export class TaskStore {
  private static instance: TaskStore;
  private db: Database.Database;

  constructor(dbPath: string = 'autodev.db') {
    this.db = new Database(dbPath);
    this.init();
  }

  public static getInstance(dbPath?: string): TaskStore {
    if (!TaskStore.instance) {
      TaskStore.instance = new TaskStore(dbPath);
    }
    return TaskStore.instance;
  }

  private init() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        state TEXT NOT NULL,
        branch TEXT,
        plan TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        taskId TEXT NOT NULL,
        agent TEXT NOT NULL,
        message TEXT NOT NULL,
        level TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        FOREIGN KEY (taskId) REFERENCES tasks(id) ON DELETE CASCADE
      );
    `);
  }

  createTask(task: Omit<Task, 'logs' | 'createdAt' | 'updatedAt'>): Task {
    const now = new Date().toISOString();
    const newTask: Task = {
      ...task,
      logs: [],
      createdAt: new Date(now),
      updatedAt: new Date(now),
    };

    const stmt = this.db.prepare(`
      INSERT INTO tasks (id, name, description, state, branch, plan, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      newTask.id,
      newTask.name,
      newTask.description,
      newTask.state,
      newTask.branch || null,
      newTask.plan ? JSON.stringify(newTask.plan) : null,
      now,
      now
    );

    return newTask;
  }

  getTask(id: string): Task | null {
    const taskRow = this.db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as any;
    if (!taskRow) return null;

    const logRows = this.db.prepare('SELECT * FROM logs WHERE taskId = ? ORDER BY timestamp ASC').all(id) as any[];

    const taskData = {
      ...taskRow,
      plan: taskRow.plan ? JSON.parse(taskRow.plan) : undefined,
      logs: logRows.map(log => ({
        agent: log.agent,
        message: log.message,
        level: log.level,
        timestamp: new Date(log.timestamp),
      })),
      createdAt: new Date(taskRow.createdAt),
      updatedAt: new Date(taskRow.updatedAt),
    };

    const result = TaskSchema.safeParse(taskData);
    if (!result.success) {
      console.error('Failed to parse task from database:', result.error);
      return null;
    }

    return result.data;
  }

  updateTaskState(id: string, state: TaskState): void {
    const now = new Date().toISOString();
    this.db.prepare('UPDATE tasks SET state = ?, updatedAt = ? WHERE id = ?').run(state, now, id);
  }

  updateTaskPlan(id: string, plan: Task['plan']): void {
    const now = new Date().toISOString();
    this.db.prepare('UPDATE tasks SET plan = ?, updatedAt = ? WHERE id = ?').run(
      JSON.stringify(plan),
      now,
      id
    );
  }

  addLog(taskId: string, log: Omit<AgentLog, 'timestamp'>): AgentLog {
    const timestamp = new Date().toISOString();
    const newLog: AgentLog = {
      ...log,
      timestamp: new Date(timestamp),
    };

    const stmt = this.db.prepare(`
      INSERT INTO logs (taskId, agent, message, level, timestamp)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(taskId, newLog.agent, newLog.message, newLog.level, timestamp);

    return newLog;
  }

  getAllTasks(): Task[] {
    const rows = this.db.prepare('SELECT id FROM tasks').all() as { id: string }[];
    return rows.map(row => this.getTask(row.id)).filter((t): t is Task => t !== null);
  }
}
