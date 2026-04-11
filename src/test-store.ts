import { TaskStore } from './store/TaskStore.js';
import { TaskState } from './types/task-schema.js';
import { v4 as uuidv4 } from 'uuid';

async function main() {
  const store = new TaskStore(':memory:'); // Use in-memory for testing

  const taskId = uuidv4();
  console.log(`Creating task: ${taskId}`);

  const task = store.createTask({
    id: taskId,
    name: 'Implement TaskStore',
    description: 'Create a persistent storage layer for tasks and logs.',
    state: TaskState.BACKLOG,
  });

  console.log('Task created:', task.name);

  store.addLog(taskId, {
    agent: 'Architect',
    message: 'Task created and added to backlog.',
    level: 'INFO',
  });

  store.updateTaskState(taskId, TaskState.IMPLEMENTATION);
  console.log('Task state updated to IMPLEMENTATION');

  const retrievedTask = store.getTask(taskId);
  if (retrievedTask) {
    console.log('Retrieved task state:', retrievedTask.state);
    console.log('Retrieved logs count:', retrievedTask.logs.length);
    console.log('First log message:', retrievedTask.logs[0]?.message);
  } else {
    console.error('Failed to retrieve task!');
  }
}

main().catch(console.error);
