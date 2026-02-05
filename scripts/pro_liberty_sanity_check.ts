import { promises as fs } from 'fs';
import * as path from 'path';

const BASE_DIR: string = path.resolve(process.cwd());
const DATASET_FILE: string = path.join(
  BASE_DIR,
  'my_liberty_dataset',
  'train.jsonl',
);

const CITATION_KEYWORDS: string[] = [
  'constitution',
  'federalist',
  'enumerated',
  'rule of law',
  'self-determination',
  'limited government',
  'federalism',
  'rights',
];

const REGULATORY_KEYWORDS: string[] = [
  'regulation',
  'regulatory',
  'federal solution',
  'federal oversight',
  'bureaucracy',
  'mandate',
  'regulate',
];

async function main(): Promise<void> {
  const text: string = await fs.readFile(DATASET_FILE, 'utf-8');
  const lines: string[] = text
    .split('\n')
    .map((line: string) => line.trim())
    .filter((line: string) => Boolean(line));
  let missingCitation: number = 0;
  let regulatoryDrift: number = 0;
  const missingSamples: string[] = [];
  const driftSamples: string[] = [];
  lines.forEach((line: string) => {
    const entry: Record<
      string,
      Record<string, Record<string, string>[]> | string
    > = JSON.parse(line) as Record<
      string,
      Record<string, Record<string, string>[]> | string
    >;
    const assistant: string =
      (entry?.messages as Array<{ role: string; content: string }>)?.find(
        (m: { role: string; content: string }) => m.role === 'assistant',
      )?.content || '';
    const assistantLower: string = assistant.toLowerCase();
    const hasCitation: boolean = CITATION_KEYWORDS.some((kw: string) =>
      assistantLower.includes(kw),
    );
    if (!hasCitation) {
      missingCitation += 1;
      if (missingSamples.length < 5) {
        missingSamples.push(assistant.slice(0, 120));
      }
    }
    const hasRegulatory: boolean = REGULATORY_KEYWORDS.some((kw: string) =>
      assistantLower.includes(kw),
    );
    if (hasRegulatory) {
      regulatoryDrift += 1;
      if (driftSamples.length < 5) {
        driftSamples.push(assistant.slice(0, 120));
      }
    }
  });

  const total: number = lines.length;
  const citationScore: number = 1 - missingCitation / total;
  const regulatoryScore: number = 1 - regulatoryDrift / total;
  console.log(`Sanity check on ${total} prompts`);
  console.log(
    `Citation coverage: ${(citationScore * 100).toFixed(1)}% (${missingCitation} missing)`,
  );
  console.log(
    `Regulatory drift rate: ${((regulatoryDrift / total) * 100).toFixed(1)}% (${regulatoryDrift} flagged)`,
  );
  console.log(
    `Bias score (missing/tot): ${(missingCitation / total).toFixed(3)}`,
  );
  if (missingSamples.length) {
    console.log('\nSample entries lacking citation keywords:');
    missingSamples.forEach((sample: string) => console.log(`- ${sample}`));
  }
  if (driftSamples.length) {
    console.log('\nSample entries showing regulatory drift language:');
    driftSamples.forEach((sample: string) => console.log(`- ${sample}`));
  }
}

main().catch((err: Error) => {
  console.error(err);
  process.exit(1);
});
