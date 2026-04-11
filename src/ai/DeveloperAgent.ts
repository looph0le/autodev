import { GeminiAgent } from './GeminiAgent.js';
import type { DevelopmentPlan } from '../types/task-schema.js';

const DEVELOPER_SYSTEM_PROMPT = `
You are an expert Senior Software Engineer. Your job is to implement code based on an "Architect Plan".
You MUST follow these rules:
1. Only modify or create files specified in the plan.
2. Provide FULL file content for every file you create or modify.
3. Use Markdown code blocks to separate your outputs.
4. Each code block MUST have a comment on the first line with the file path (e.g., // path/to/file.ts).
5. Explain your changes briefly BEFORE the code blocks.

Example output:
I'll implement the new class as requested.
\`\`\`typescript
// src/new-class.ts
export class NewClass {
  // ...
}
\`\`\`
`;

export class DeveloperAgent extends GeminiAgent {
  constructor() {
    super('gemini-1.5-flash', DEVELOPER_SYSTEM_PROMPT); // Use Flash for faster/cheaper coding
  }

  async implementPlan(plan: DevelopmentPlan, context?: string): Promise<string> {
    const prompt = `
Plan: ${JSON.stringify(plan)}
Context: ${context || 'No additional context provided.'}
Implement the plan now.
`;
    return this.generateText(prompt);
  }

  async fixError(plan: DevelopmentPlan, errorLog: string): Promise<string> {
    const prompt = `
I previously tried to implement this plan: ${JSON.stringify(plan)}
But the tests failed with the following error:
${errorLog}

Please analyze the error and provide corrected code for the files that need fixing.
Follow the same format (Markdown blocks with file path comments).
`;
    return this.generateText(prompt);
  }
}
