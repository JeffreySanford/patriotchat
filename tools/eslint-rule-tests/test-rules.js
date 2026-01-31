const { ESLint } = require('eslint');

async function run() {
  const eslint = new ESLint({ cwd: process.cwd() });

  const cases = [
    {
      name: 'standalone-component',
      code: `import { Component } from '@angular/core';
@Component({
  selector: 'app-x',
  template: '',
  standalone: true
})
export class X {}`,
      filename: 'test-standalone.ts',
      expectMessage: 'Standalone components are forbidden'
    },
    {
      name: 'angular-signal-import',
      code: `import { signal } from '@angular/core'; const s = signal(0);`,
      filename: 'test-signal.ts',
      expectMessage: 'Angular Signals are forbidden'
    },
    {
      name: 'new-promise',
      code: `export function test() { return new Promise((res) => res(1)); }`,
      filename: 'test-promise.ts',
      expectMessage: 'Creating Promises directly is forbidden'
    },
    {
      name: 'then-usage',
      code: `const p = Promise.resolve(1); p.then(x => console.log(x));`,
      filename: 'test-then.ts',
      expectMessage: 'Using .then indicates Promise usage'
    }
  ];

  let failed = false;

  for (const c of cases) {
    const results = await eslint.lintText(c.code, { filePath: c.filename });
    const messages = results[0].messages.map(m => m.message).join('\n');
    if (!messages.includes(c.expectMessage)) {
      console.error(`Case ${c.name} did NOT find expected message. Found:\n${messages || '<no messages>'}`);
      failed = true;
    } else {
      console.log(`Case ${c.name} OK: found expected message.`);
    }
  }

  if (failed) {
    console.error('ESLint rule tests failed');
    process.exit(1);
  }

  console.log('All ESLint rule tests passed');
}

run().catch(err => {
  console.error(err);
  process.exit(2);
});