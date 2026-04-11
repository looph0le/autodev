import Database from 'better-sqlite3';
import { TaskSchema, TaskState, AgentLogSchema } from '../types/task-schema.js';
export class TaskStore {
    db;
    constructor(dbPath = 'autodev.db') {
        this.db = new Database(dbPath);
        this.init();
    }
    init() {
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
    createTask(task) {
        const now = new Date().toISOString();
        const newTask = {
            ...task,
            logs: [],
            createdAt: new Date(now),
            updatedAt: new Date(now),
        };
        const stmt = this.db.prepare(`
      INSERT INTO tasks (id, name, description, state, branch, plan, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
        stmt.run(newTask.id, newTask.name, newTask.description, newTask.state, newTask.branch || null, newTask.plan ? JSON.stringify(newTask.plan) : null, now, now);
        return newTask;
    }
    getTask(id) {
        const taskRow = this.db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
        if (!taskRow)
            return null;
        const logRows = this.db.prepare('SELECT * FROM logs WHERE taskId = ? ORDER BY timestamp ASC').all(id);
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
    updateTaskState(id, state) {
        const now = new Date().toISOString();
        this.db.prepare('UPDATE tasks SET state = ?, updatedAt = ? WHERE id = ?').run(state, now, id);
    }
    updateTaskPlan(id, plan) {
        const now = new Date().toISOString();
        this.db.prepare('UPDATE tasks SET plan = ?, updatedAt = ? WHERE id = ?').run(JSON.stringify(plan), now, id);
    }
    addLog(taskId, log) {
        const timestamp = new Date().toISOString();
        const newLog = {
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
    getAllTasks() {
        const rows = this.db.prepare('SELECT id FROM tasks').all();
        return rows.map(row => this.getTask(row.id)).filter((t) => t !== null);
    }
}
//# sourceMappingURL=TaskStore.js.map