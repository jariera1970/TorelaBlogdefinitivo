import { execFileSync, execSync, spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';

const PORT = 4321;
const HOST = '127.0.0.1';

function getListeningPidsWindows(port) {
  const output = execSync(`netstat -ano -p tcp | findstr :${port}`, {
    encoding: 'utf8',
  });

  return output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => line.includes(`:${port}`) && line.includes('LISTENING'))
    .map((line) => line.split(/\s+/).at(-1))
    .filter(Boolean)
    .filter((pid, index, pids) => pids.indexOf(pid) === index);
}

function getListeningPidsPosix(port) {
  const output = execSync(`lsof -ti tcp:${port}`, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  });

  return output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((pid, index, pids) => pids.indexOf(pid) === index);
}

function getListeningPids(port) {
  try {
    if (process.platform === 'win32') {
      return getListeningPidsWindows(port);
    }

    return getListeningPidsPosix(port);
  } catch {
    return [];
  }
}

function killPid(pid) {
  if (process.platform === 'win32') {
    execFileSync('taskkill', ['/PID', String(pid), '/F'], {
      stdio: 'ignore',
    });
    return;
  }

  process.kill(Number(pid), 'SIGTERM');
}

for (const pid of getListeningPids(PORT)) {
  try {
    killPid(pid);
    console.log(`Freed port ${PORT} from PID ${pid}`);
  } catch {
    console.warn(`Could not stop PID ${pid} on port ${PORT}`);
  }
}

const astroBin = path.join(process.cwd(), 'node_modules', 'astro', 'bin', 'astro.mjs');

if (!existsSync(astroBin)) {
  console.error('Astro CLI not found. Run npm install first.');
  process.exit(1);
}

const child = spawn(process.execPath, [astroBin, 'dev', '--host', HOST, '--port', String(PORT), '--strictPort'], {
  stdio: 'inherit',
  shell: false,
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
