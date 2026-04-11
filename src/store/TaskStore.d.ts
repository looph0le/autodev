import { TaskState } from '../types/task-schema.js';
import type { Task, AgentLog } from '../types/task-schema.js';
export declare class TaskStore {
    private db;
    constructor(dbPath?: string);
    private init;
    createTask(task: Omit<Task, 'logs' | 'createdAt' | 'updatedAt'>): Task;
    getTask(id: string): Task | null;
    updateTaskState(id: string, state: TaskState): void;
    updateTaskPlan(id: string, plan: Task['plan']): void;
    addLog(taskId: string, log: Omit<AgentLog, 'timestamp'>): AgentLog;
    getAllTasks(): Task[];
}
//# sourceMappingURL=TaskStore.d.ts.map