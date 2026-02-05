const { spawnSync } = require('child_process');
const http = require('http');
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const authHost =
  process.env.AUTH_URL || `http://localhost:${process.env.AUTH_PORT || '4001'}`;
const llmHost =
  process.env.LLM_URL || `http://localhost:${process.env.LLM_PORT || '4004'}`;

const ANSI = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

const projects = [
  { name: 'Frontend (Nx)', url: 'http://localhost:4200/' },
  { name: 'API Gateway (Nest)', url: 'http://localhost:3000/health' },
  { name: 'Auth Service (Go)', url: `${authHost}/health` },
  { name: 'LLM Service (Go)', url: `${llmHost}/health` },
];

const containers = [
  'llm',
  'ollama',
  'postgres',
  'funding',
  'policy',
  'analytics',
];

function colorize(text, color) {
  return `${color}${text}${ANSI.reset}`;
}

function formatStatusLabel(status) {
  if (status === 'healthy' || status === 'Up (healthy)')
    return colorize('healthy', ANSI.green);
  if (status.startsWith('Up') || status.includes('starting'))
    return colorize(status, ANSI.yellow);
  return colorize(status, ANSI.red);
}

function checkProjects() {
  return Promise.all(
    projects.map((project) => {
      // eslint-disable-next-line no-restricted-syntax -- Node.js utility script requires direct Promise usage
      return new Promise((resolve) => {
        const req = http.get(project.url, { timeout: 3000 }, (res) => {
          const code = res.statusCode;
          res.resume();
          const label =
            code && code >= 200 && code < 400
              ? colorize('healthy', ANSI.green)
              : colorize('warning', ANSI.yellow);
          resolve({
            project: project.name,
            status: label,
            detail: `http ${code}`,
          });
        });
        req.on('error', () => {
          resolve({
            project: project.name,
            status: colorize('offline', ANSI.red),
            detail: 'connection failed',
          });
        });
        req.on('timeout', () => {
          req.destroy();
          resolve({
            project: project.name,
            status: colorize('timeout', ANSI.yellow),
            detail: 'request timed out',
          });
        });
      });
    }),
  );
}

function listContainers() {
  const ps = spawnSync(
    'docker',
    [
      'compose',
      'ps',
      '--format',
      '{{.Name}}|{{.Service}}|{{.State}}|{{.Status}}',
    ],
    {
      encoding: 'utf8',
    },
  );
  if (ps.error || ps.status !== 0) {
    console.error(
      colorize('Failed to inspect Compose services', ANSI.red),
      ps.stderr || ps.error,
    );
    return [];
  }
  return ps.stdout
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const [name, service, state, status] = line.split('|');
      return { name, service, state, status };
    })
    .filter((entry) => containers.includes(entry.service));
}

async function main() {
  console.log(
    colorize('\n[Status Report] Docker Compose & Nx projects', ANSI.cyan),
  );
  const containerList = listContainers();
  containerList.forEach((entry) => {
    console.log(
      `${ANSI.bold}${entry.service}${ANSI.reset} (${entry.name}) — ${formatStatusLabel(entry.status || entry.state)}`,
    );
  });

  const projectStatus = await checkProjects();
  console.log(colorize('\n[Nx Projects]', ANSI.cyan));
  projectStatus.forEach((project) => {
    console.log(
      `${ANSI.bold}${project.project}${ANSI.reset} — ${project.status} (${project.detail})`,
    );
  });
  console.log('');
}

if (require.main === module) {
  main().catch((error) => {
    console.error(colorize('Status report failed:', ANSI.red), error);
    process.exit(1);
  });
}
