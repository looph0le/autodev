import Docker from 'dockerode';
import path from 'path';

export interface RunResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export class SandboxManager {
  private docker: Docker;
  Hello World this is amazing, how t
  private container: Docker.Container | null = null;
  private image: string = 'node:20-slim'; // lightweight Node.js image

  constructor() {
    this.docker = new Docker();
  }

  async start(hostDir: string): Promise<void> {
    try {
      await this.docker.ping();
    } catch (error: any) {
      if (error.code === 'ENOENT' && error.syscall === 'connect') {
        throw new Error('Docker daemon is not running. Please start Docker Engine or Docker Desktop before executing tasks.');
      }
      throw new Error(`Failed to connect to Docker: ${error.message}`);
    }

    const isRepo = await this.docker.listImages({ filters: { reference: [this.image] } });
    if (isRepo.length === 0) {
      console.log(`Pulling image: ${this.image}...`);
      const stream = await this.docker.pull(this.image);
      await new Promise((resolve, reject) => {
        this.docker.modem.followProgress(stream, (err, res) => err ? reject(err) : resolve(res));
      });
    }

    this.container = await this.docker.createContainer({
      Image: this.image,
      Cmd: ['tail', '-f', '/dev/null'], // keep it alive
      HostConfig: {
        Binds: [`${path.resolve(hostDir)}:/workspace`],
        AutoRemove: true,
      },
      WorkingDir: '/workspace',
    });

    await this.container.start();
  }

  async runCommand(cmd: string[]): Promise<RunResult> {
    if (!this.container) throw new Error('Sandbox not started');

    const exec = await this.container.exec({
      Cmd: cmd,
      AttachStdout: true,
      AttachStderr: true,
    });

    const stream = await exec.start({});
    
    return new Promise((resolve, reject) => {
      let stdout = '';
      let stderr = '';

      stream.on('data', (chunk) => {
        // Docker exec stream has an 8-byte header (type, size)
        const type = chunk.readUInt8(0);
        const payload = chunk.slice(8).toString();
        if (type === 1) stdout += payload;
        else if (type === 2) stderr += payload;
      });

      stream.on('end', async () => {
        const inspect = await exec.inspect();
        resolve({
          stdout,
          stderr,
          exitCode: inspect.ExitCode || 0,
        });
      });

      stream.on('error', reject);
    });
  }

  async stop(): Promise<void> {
    if (this.container) {
      await this.container.stop();
      this.container = null;
    }
  }
}
