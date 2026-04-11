import { z } from 'zod';
/**
 * TaskState tracks the lifecycle of an autonomous task.
 */
export declare enum TaskState {
    BACKLOG = "BACKLOG",
    SCAFFOLDING = "SCAFFOLDING",
    IMPLEMENTATION = "IMPLEMENTATION",
    VERIFICATION = "VERIFICATION",
    REVIEW = "REVIEW",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED"
}
/**
 * The Architect Agent creates this plan during the 'Ingestion' phase.
 */
export declare const DevelopmentPlanSchema: z.ZodObject<{
    filesToModify: z.ZodDefault<z.ZodArray<z.ZodString>>;
    filesToCreate: z.ZodDefault<z.ZodArray<z.ZodString>>;
    steps: z.ZodDefault<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
export type DevelopmentPlan = z.infer<typeof DevelopmentPlanSchema>;
/**
 * AgentLog records the actions taken by various agents during the SDLC.
 */
export declare const AgentLogSchema: z.ZodObject<{
    timestamp: z.ZodDefault<z.ZodDate>;
    agent: z.ZodEnum<{
        Architect: "Architect";
        GitManager: "GitManager";
        Developer: "Developer";
        QA: "QA";
        Reviewer: "Reviewer";
        Orchestrator: "Orchestrator";
    }>;
    message: z.ZodString;
    level: z.ZodDefault<z.ZodEnum<{
        INFO: "INFO";
        ERROR: "ERROR";
        WARN: "WARN";
    }>>;
}, z.core.$strip>;
export type AgentLog = z.infer<typeof AgentLogSchema>;
/**
 * TaskSchema is the central state object for a development task.
 */
export declare const TaskSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodString;
    state: z.ZodDefault<z.ZodEnum<typeof TaskState>>;
    branch: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    plan: z.ZodOptional<z.ZodObject<{
        filesToModify: z.ZodDefault<z.ZodArray<z.ZodString>>;
        filesToCreate: z.ZodDefault<z.ZodArray<z.ZodString>>;
        steps: z.ZodDefault<z.ZodArray<z.ZodString>>;
    }, z.core.$strip>>;
    logs: z.ZodDefault<z.ZodArray<z.ZodObject<{
        timestamp: z.ZodDefault<z.ZodDate>;
        agent: z.ZodEnum<{
            Architect: "Architect";
            GitManager: "GitManager";
            Developer: "Developer";
            QA: "QA";
            Reviewer: "Reviewer";
            Orchestrator: "Orchestrator";
        }>;
        message: z.ZodString;
        level: z.ZodDefault<z.ZodEnum<{
            INFO: "INFO";
            ERROR: "ERROR";
            WARN: "WARN";
        }>>;
    }, z.core.$strip>>>;
    createdAt: z.ZodDefault<z.ZodDate>;
    updatedAt: z.ZodDefault<z.ZodDate>;
}, z.core.$strip>;
export type Task = z.infer<typeof TaskSchema>;
//# sourceMappingURL=task-schema.d.ts.map