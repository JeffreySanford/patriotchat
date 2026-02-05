/* eslint-disable no-restricted-syntax */
import { promises as fs } from 'fs';
import * as path from 'path';

interface ChatMessage {
  role: string;
  content: string;
}

interface DatasetEntry {
  messages?: ChatMessage[];
  [key: string]: unknown;
}

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

function isChatMessages(value: unknown): value is ChatMessage[] {
  if (!Array.isArray(value)) return false;
  return value.every(
    (item: unknown): boolean =>
      typeof item === 'object' &&
      item !== null &&
      typeof (item as ChatMessage).role === 'string' &&
      typeof (item as ChatMessage).content === 'string',
  );
}

async function main(): Promise<void> {
  const text: string = await fs.readFile(DATASET_FILE, 'utf-8');
  const lines: string[] = text
    .split('\n')
    .map((line: string): string => line.trim())
    .filter((line: string): boolean => Boolean(line));
  let missingCitation: number = 0;
  let regulatoryDrift: number = 0;
  const missingSamples: string[] = [];
  const driftSamples: string[] = [];

  lines.forEach((line: string): void => {
    const entry: DatasetEntry = JSON.parse(line) as DatasetEntry;
    const messages: ChatMessage[] | undefined = entry?.messages;
    const assistant: string = isChatMessages(messages)
      ? messages.find((m: ChatMessage): boolean => m.role === 'assistant')
          ?.content || ''
      : '';
    const assistantLower: string = assistant.toLowerCase();
    const hasCitation: boolean = CITATION_KEYWORDS.some((kw: string): boolean =>
      assistantLower.includes(kw),
    );
    if (!hasCitation) {
      missingCitation += 1;
      if (missingSamples.length < 5) {
        missingSamples.push(assistant.slice(0, 120));
      }
    }
    const hasRegulatory: boolean = REGULATORY_KEYWORDS.some(
      (kw: string): boolean => assistantLower.includes(kw),
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
    missingSamples.forEach((sample: string): void =>
      console.log(`- ${sample}`),
    );
  }
  if (driftSamples.length) {
    console.log('\nSample entries showing regulatory drift language:');
    driftSamples.forEach((sample: string): void => console.log(`- ${sample}`));
  }
}

main().catch((err: Error): void => {
  console.error(err);
  process.exit(1);
});
