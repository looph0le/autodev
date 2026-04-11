import { z } from 'zod';
/**
 * TaskState tracks the lifecycle of an autonomous task.
 */
export var TaskState;
(function (TaskState) {
    TaskState["BACKLOG"] = "BACKLOG";
    TaskState["SCAFFOLDING"] = "SCAFFOLDING";
    TaskState["IMPLEMENTATION"] = "IMPLEMENTATION";
    TaskState["VERIFICATION"] = "VERIFICATION";
    TaskState["REVIEW"] = "REVIEW";
    TaskState["COMPLETED"] = "COMPLETED";
    TaskState["FAILED"] = "FAILED";
})(TaskState || (TaskState = {}));
/**
 * The Architect Agent creates this plan during the 'Ingestion' phase.
 */
export const DevelopmentPlanSchema = z.object({
    filesToModify: z.array(z.string()).default([]),
    filesToCreate: z.array(z.string()).default([]),
    steps: z.array(z.string()).default([]),
});
/**
 * AgentLog records the actions taken by various agents during the SDLC.
 */
export const AgentLogSchema = z.object({
    timestamp: z.date().default(() => new Date()),
    agent: z.enum(['Architect', 'GitManager', 'Developer', 'QA', 'Reviewer', 'Orchestrator']),
    message: z.string(),
    level: z.enum(['INFO', 'ERROR', 'WARN']).default('INFO'),
});
/**
 * TaskSchema is the central state object for a development task.
 */
export const TaskSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(1),
    description: z.string(),
    state: z.nativeEnum(TaskState).default(TaskState.BACKLOG),
    branch: z.string().nullable().optional(),
    plan: DevelopmentPlanSchema.optional(),
    logs: z.array(AgentLogSchema).default([]),
    createdAt: z.date().default(() => new Date()),
    updatedAt: z.date().default(() => new Date()),
});
//# sourceMappingURL=task-schema.js.map