import { promises as fs } from "fs";
import * as path from "path";

const BASE_DIR = path.resolve(process.cwd());
const DATASET_FILE = path.join(BASE_DIR, "my_liberty_dataset", "train.jsonl");

const CITATION_KEYWORDS = [
  "constitution",
  "federalist",
  "enumerated",
  "rule of law",
  "self-determination",
  "limited government",
  "federalism",
  "rights",
];

const REGULATORY_KEYWORDS = [
  "regulation",
  "regulatory",
  "federal solution",
  "federal oversight",
  "bureaucracy",
  "mandate",
  "regulate",
];

async function main(): Promise<void> {
  const text = await fs.readFile(DATASET_FILE, "utf-8");
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  let missingCitation = 0;
  let regulatoryDrift = 0;
  const missingSamples: string[] = [];
  const driftSamples: string[] = [];
  lines.forEach((line, index) => {
    const entry = JSON.parse(line);
    const assistant = entry?.messages?.find((m: any) => m.role === "assistant")?.content || "";
    const assistantLower = assistant.toLowerCase();
    const hasCitation = CITATION_KEYWORDS.some((kw) => assistantLower.includes(kw));
    if (!hasCitation) {
      missingCitation += 1;
      if (missingSamples.length < 5) {
        missingSamples.push(assistant.slice(0, 120));
      }
    }
    const hasRegulatory = REGULATORY_KEYWORDS.some((kw) => assistantLower.includes(kw));
    if (hasRegulatory) {
      regulatoryDrift += 1;
      if (driftSamples.length < 5) {
        driftSamples.push(assistant.slice(0, 120));
      }
    }
  });

  const total = lines.length;
  const citationScore = 1 - missingCitation / total;
  const regulatoryScore = 1 - regulatoryDrift / total;
  console.log(`Sanity check on ${total} prompts`);
  console.log(`Citation coverage: ${(citationScore * 100).toFixed(1)}% (${missingCitation} missing)`);
  console.log(`Regulatory drift rate: ${(regulatoryDrift / total * 100).toFixed(1)}% (${regulatoryDrift} flagged)`);
  console.log(`Bias score (missing/tot): ${(missingCitation / total).toFixed(3)}`);
  if (missingSamples.length) {
    console.log("\nSample entries lacking citation keywords:");
    missingSamples.forEach((sample) => console.log(`- ${sample}`));
  }
  if (driftSamples.length) {
    console.log("\nSample entries showing regulatory drift language:");
    driftSamples.forEach((sample) => console.log(`- ${sample}`));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
