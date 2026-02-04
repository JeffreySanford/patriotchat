import { promises as fs } from "fs";
import * as path from "path";

const BASE_DIR = path.resolve(process.cwd());
const DATA_DIR = path.join(BASE_DIR, "data", "founding");
const OUTPUT_FILE = path.join(BASE_DIR, "my_liberty_dataset", "train.jsonl");

const THEMES = [
  "enumerated federal powers",
  "limited government and subsidiarity",
  "due process and equal protection",
  "state sovereignty and the 10th Amendment",
  "separation of powers",
  "self-determination and civic virtue",
  "constitutional checks and balances",
  "natural rights and property",
  "constitutional republicanism vs. faction",
  "local constitutional guardrails and civic autonomy",
];

function chunkText(text: string, chunkSize = 180): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const chunks: string[] = [];
  for (let i = 0; i < words.length; i += chunkSize) {
    chunks.push(words.slice(i, i + chunkSize).join(" "));
  }
  return chunks;
}

async function loadSources(): Promise<Array<[string, string]>> {
  const paths = await fs.readdir(DATA_DIR);
  const sources: Array<[string, string]> = [];
  for (const file of paths.sort()) {
    const fullPath = path.join(DATA_DIR, file);
    const content = await fs.readFile(fullPath, "utf-8");
    if (content.trim()) {
      sources.push([path.parse(file).name, content]);
    }
  }
  if (!sources.length) {
    throw new Error("No source files found in data/founding/");
  }
  return sources;
}

function buildEntries(sources: Array<[string, string]>, limit = 1000): Array<Record<string, unknown>> {
  const entries: Array<Record<string, unknown>> = [];
  for (const [sourceLabel, text] of sources) {
    const prefix = `From ${sourceLabel.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}:`;
    const chunks = chunkText(text);
    for (const chunk of chunks) {
      const theme = THEMES[Math.floor(Math.random() * THEMES.length)];
      const entry = {
        messages: [
          {
            role: "system",
            content:
              "You are a constitutionalist assistant. Prioritize limited federal government, equality under law, self-determination, and rule of law.",
          },
          {
            role: "user",
            content: `${prefix}\n\n${chunk}\n\nQuestion: Explain how this passage supports ${theme} while citing the provided text and noting any trade-offs.`,
          },
          {
            role: "assistant",
            content: `This excerpt defends ${theme} by highlighting enumerated powers and local self-determination from ${sourceLabel}. The response references the passage to show how constitutional limits constrain federal reach.`,
          },
        ],
        source: sourceLabel,
        category: theme,
        priority: +(7 + Math.random() * 3).toFixed(1),
        source_text: chunk.slice(0, 400) + (chunk.length > 400 ? "..." : ""),
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
  const sources = await loadSources();
  const entries = buildEntries(sources, 1000);
  const writer = await fs.open(OUTPUT_FILE, "w");
  try {
    for (const entry of entries) {
      await writer.writeFile(JSON.stringify(entry, null, 0) + "\n", { encoding: "utf-8" });
    }
  } finally {
    await writer.close();
  }
  console.log(`Wrote ${entries.length} prompt entries to ${OUTPUT_FILE}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
