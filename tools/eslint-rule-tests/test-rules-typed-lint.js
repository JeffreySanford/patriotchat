const { ESLint } = require('eslint');

async function run() {
  // Create an ESLint instance that enables type-aware rules using the shared lib tsconfig
  const eslint = new ESLint({
    cwd: process.cwd(),
    overrideConfig: {
      languageOptions: {
        parserOptions: {
          project: ['./libs/shared/tsconfig.lib.json'],
        },
      },
    },
  });

  const fs = require('fs');
  const path = require('path');
  const tmpDir = path.resolve(
    process.cwd(),
    'libs/shared/src/eslint-typed-tests',
  );

  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

  const cases = [
    {
      name: 'no-floating-promises',
      code: `async function f() { Promise.resolve(1); }
export {};
`,
      filename: path.join(tmpDir, 'test-no-floating.ts'),
      expectMessage: 'promises', // message mentions promises
    },
    {
      name: 'no-unsafe-assignment',
      code: `declare const x: any; const y: number = x; export {};
`,
      filename: path.join(tmpDir, 'test-no-unsafe.ts'),
      expectMessage: 'unsafe', // message mentions unsafe
    },
    {
      name: 'no-unsafe-call',
      code: `declare const f: any; f(); export {};
`,
      filename: path.join(tmpDir, 'test-no-unsafe-call.ts'),
      expectMessage: 'unsafe', // message mentions unsafe
    },
  ];

  // Write temp files
  for (const c of cases) {
    fs.writeFileSync(c.filename, c.code);
  }

  let failed = false;

  for (const c of cases) {
    const results = await eslint.lintFiles([c.filename]);
    const messages = results[0].messages.map((m) => m.message).join('\n');
    if (!messages.toLowerCase().includes(c.expectMessage)) {
      console.error(
        `Case ${c.name} did NOT find expected message. Found:\n${messages || '<no messages>'}`,
      );
      failed = true;
    } else {
      console.log(`Case ${c.name} OK: found expected message.`);
    }
  }

  // Clean up temp files directory
  try {
    const files = fs.readdirSync(tmpDir);
    for (const f of files) fs.unlinkSync(path.join(tmpDir, f));
    fs.rmdirSync(tmpDir);
  } catch {
    // ignore cleanup errors
  }

  if (failed) {
    console.error('ESLint typed rule tests failed');
    process.exit(1);
  }

  console.log('All ESLint typed rule tests passed');
}

run().catch((err) => {
  console.error(err);
  process.exit(2);
});
