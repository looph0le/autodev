import { z } from 'zod';

/**
 * TaskState tracks the lifecycle of an autonomous task.
 */
export enum TaskState {
  BACKLOG = 'BACKLOG',
  SCAFFOLDING = 'SCAFFOLDING',
  IMPLEMENTATION = 'IMPLEMENTATION',
  VERIFICATION = 'VERIFICATION',
  REVIEW = 'REVIEW',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

/**
 * The Architect Agent creates this plan during the 'Ingestion' phase.
 */
export const DevelopmentPlanSchema = z.object({
  filesToModify: z.array(z.string()).default([]),
  filesToCreate: z.array(z.string()).default([]),
  steps: z.array(z.string()).default([]),
});

export type DevelopmentPlan = z.infer<typeof DevelopmentPlanSchema>;

/**
 * AgentLog records the actions taken by various agents during the SDLC.
 */
export const AgentLogSchema = z.object({
  timestamp: z.date().default(() => new Date()),
  agent: z.enum(['Architect', 'GitManager', 'Developer', 'QA', 'Reviewer', 'Orchestrator']),
  message: z.string(),
  level: z.enum(['INFO', 'ERROR', 'WARN']).default('INFO'),
});

export type AgentLog = z.infer<typeof AgentLogSchema>;

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

export type Task = z.infer<typeof TaskSchema>;
