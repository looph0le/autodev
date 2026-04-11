import { GeminiAgent } from './GeminiAgent.js';
import { DevelopmentPlanSchema } from '../types/task-schema.js';
import type { DevelopmentPlan } from '../types/task-schema.js';

const ARCHITECT_SYSTEM_PROMPT = `
You are an expert Software Architect. Your job is to analyze high-level requirements and create a precise "Development Plan".
Your plan must include:
1. 'filesToModify': An array of existing file paths that need changes.
2. 'filesToCreate': An array of new file paths to be created.
3. 'steps': A logical sequence of actions to implement the feature or fix.

IMPORTANT: You MUST respond ONLY with a valid JSON object matching the following schema:
{
  "filesToModify": ["path/to/file1", "path/to/file2"],
  "filesToCreate": ["path/to/newfile"],
  "steps": ["Step 1: Description", "Step 2: Description"]
}
`;

export class ArchitectAgent extends GeminiAgent {
  constructor() {
    super('gemini-3-flash-preview', ARCHITECT_SYSTEM_PROMPT);
  }

  async createPlan(requirement: string): Promise<DevelopmentPlan> {
    const prompt = `Requirement: ${requirement}`;
    const responseText = await this.generateText(prompt);
    
    // Attempt to extract JSON if the model added markdown blocks
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : responseText;
    
    try {
      const parsed = JSON.parse(jsonStr);
      return DevelopmentPlanSchema.parse(parsed);
    } catch (error) {
      console.error('Failed to parse Architect plan:', error);
      console.error('Raw response:', responseText);
      throw new Error('Architect failed to generate a valid plan.');
    }
  }
}
