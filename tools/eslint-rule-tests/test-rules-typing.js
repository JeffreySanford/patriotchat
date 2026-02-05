const { ESLint } = require('eslint');

async function run() {
  const eslint = new ESLint({
    cwd: process.cwd(),
    overrideConfig: { languageOptions: { parserOptions: { project: false } } },
  });

  const cases = [
    {
      name: 'ban-any',
      code: `let x: any = 1;`,
      filename: 'libs/shared/src/test-any.ts',
      expectMessage: 'Use explicit types or shared DTOs',
    },
    {
      name: 'ban-unknown',
      code: `let u: unknown = 1;`,
      filename: 'libs/shared/src/test-unknown.ts',
      expectMessage: 'Avoid unknown; prefer concrete types',
    },
    {
      name: 'typedef-parameter',
      code: `export function f(a) { return a }`,
      filename: 'libs/shared/src/test-typedef-param.ts',
      expectMessage: 'have a type annotation', // message mentions missing type annotation
    },
    {
      name: 'typedef-return',
      code: `export function g(): any { return 1 }`,
      filename: 'libs/shared/src/test-typedef-return.ts',
      expectMessage: 'Use explicit types or shared DTOs',
    },
  ];

  let failed = false;

  for (const c of cases) {
    const results = await eslint.lintText(c.code, { filePath: c.filename });
    const messages = results[0].messages.map((m) => m.message).join('\n');
    if (!messages.includes(c.expectMessage)) {
      console.error(
        `Case ${c.name} did NOT find expected message. Found:\n${messages || '<no messages>'}`,
      );
      failed = true;
    } else {
      console.log(`Case ${c.name} OK: found expected message.`);
    }
  }

  if (failed) {
    console.error('ESLint typing rule tests failed');
    process.exit(1);
  }

  console.log('All ESLint typing rule tests passed');
}

run().catch((err) => {
  console.error(err);
  process.exit(2);
});
