import { promises as fs } from 'fs';
import * as path from 'path';

const BASE_DIR: string = path.resolve(process.cwd());
const DATA_DIR: string = path.join(BASE_DIR, 'data', 'founding');
const OUTPUT_FILE: string = path.join(
  BASE_DIR,
  'my_liberty_dataset',
  'train.jsonl',
);

const THEMES: string[] = [
  'enumerated federal powers',
  'limited government and subsidiarity',
  'due process and equal protection',
  'state sovereignty and the 10th Amendment',
  'separation of powers',
  'self-determination and civic virtue',
  'constitutional checks and balances',
  'natural rights and property',
  'constitutional republicanism vs. faction',
  'local constitutional guardrails and civic autonomy',
];

interface Message {
  role: string;
  content: string;
}

interface DataEntry {
  messages: Message[];
  source: string;
  category: string;
  priority: number;
  source_text: string;
}

function chunkText(text: string, chunkSize: number = 180): string[] {
  const words: string[] = text
    .split(/\s+/)
    .filter((word: string) => Boolean(word));
  const chunks: string[] = [];
  for (let i: number = 0; i < words.length; i += chunkSize) {
    chunks.push(words.slice(i, i + chunkSize).join(' '));
  }
  return chunks;
}

async function loadSources(): Promise<Array<[string, string]>> {
  const paths: string[] = await fs.readdir(DATA_DIR);
  const sources: Array<[string, string]> = [];
  for (const file of paths.sort()) {
    const fullPath: string = path.join(DATA_DIR, file);
    const content: string = await fs.readFile(fullPath, 'utf-8');
    if (content.trim()) {
      sources.push([path.parse(file).name, content]);
    }
  }
  if (!sources.length) {
    throw new Error('No source files found in data/founding/');
  }
  return sources;
}

function buildEntries(
  sources: Array<[string, string]>,
  limit: number = 1000,
): DataEntry[] {
  const entries: DataEntry[] = [];
  for (const [sourceLabel, text] of sources) {
    const prefix: string = `From ${sourceLabel.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}:`;
    const chunks: string[] = chunkText(text);
    for (const chunk of chunks) {
      const theme: string = THEMES[Math.floor(Math.random() * THEMES.length)];
      const entry: DataEntry = {
        messages: [
          {
            role: 'system',
            content:
              'You are a constitutionalist assistant. Prioritize limited federal government, equality under law, self-determination, and rule of law.',
          },
          {
            role: 'user',
            content: `${prefix}\n\n${chunk}\n\nQuestion: Explain how this passage supports ${theme} while citing the provided text and noting any trade-offs.`,
          },
          {
            role: 'assistant',
            content: `This excerpt defends ${theme} by highlighting enumerated powers and local self-determination from ${sourceLabel}. The response references the passage to show how constitutional limits constrain federal reach.`,
          },
        ],
        source: sourceLabel,
        category: theme,
        priority: +(7 + Math.random() * 3).toFixed(1),
        source_text: chunk.slice(0, 400) + (chunk.length > 400 ? '...' : ''),
      };
      entries.push(entry);
      if (entries.length >= limit) {
        return entries;
      }
    }
  }
  return entries;
}

async function main(): Promise<void> {
  await fs.mkdir(path.dirname(OUTPUT_FILE), { recursive: true });
  const sources: Array<[string, string]> = await loadSources();
  const entries: DataEntry[] = buildEntries(sources, 1000);
  const writer: Awaited<ReturnType<typeof fs.open>> = await fs.open(
    OUTPUT_FILE,
    'w',
  );
  try {
    for (const entry of entries) {
      await writer.writeFile(JSON.stringify(entry, null, 0) + '\n', {
        encoding: 'utf-8',
      });
    }
  } finally {
    await writer.close();
  }
  console.log(`Wrote ${entries.length} prompt entries to ${OUTPUT_FILE}`);
}

main().catch((err: Error) => {
  console.error(err);
  process.exit(1);
});
