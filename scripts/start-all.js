const { spawn } = require('child_process');
const fs = require('fs');

const procs = [];

function run(cmd, args, label) {
  console.log(`Starting ${label}: ${cmd} ${args.join(' ')}`);
  const p = spawn(cmd, args, { stdio: 'inherit', shell: true });
  procs.push(p);
  p.on('exit', (code, signal) => {
    console.log(`${label} exited with ${code ?? signal}`);
  });
}

// Start Docker deps if docker-compose.yml exists
if (fs.existsSync('docker-compose.yml')) {
  run('docker', ['compose', 'up', '--build'], 'deps');
} else {
  console.log('No docker-compose.yml found; skipping deps.');
}

// Start NX projects if present
if (fs.existsSync('apps/frontend') || fs.existsSync('apps/web')) {
  run('pnpm', ['nx', 'serve', 'frontend'], 'frontend');
} else {
  console.log('No frontend project found; skipping frontend serve.');
}

if (fs.existsSync('apps/api') || fs.existsSync('apps/server')) {
  run('pnpm', ['nx', 'serve', 'api'], 'api');
} else {
  console.log('No api project found; skipping api serve.');
}

if (fs.existsSync('services/heavy') || fs.existsSync('apps/heavy')) {
  run('pnpm', ['nx', 'serve', 'heavy'], 'heavy');
} else {
  console.log('No heavy service found; skipping heavy serve.');
}

// build watch if frontend exists
if (fs.existsSync('apps/frontend') || fs.existsSync('apps/web')) {
  run('pnpm', ['nx', 'build', 'frontend', '--watch'], 'build:watch');
}

function shutdown() {
  console.log('Shutting down children...');
  procs.forEach((p) => {
    try {
      p.kill('SIGINT');
    } catch (err) {
      console.error('Error killing child process', err);
    }
  });
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// keep the process alive
process.stdin.resume();
