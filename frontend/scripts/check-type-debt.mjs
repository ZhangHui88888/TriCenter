import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const sourceRoot = fileURLToPath(new URL('../src/', import.meta.url));
const files = [];
const visit = (dir) => {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) visit(path);
    else if (/\.tsx?$/.test(name)) files.push(path);
  }
};
visit(sourceRoot);

let nocheck = 0;
let explicitAny = 0;
for (const file of files) {
  const text = readFileSync(file, 'utf8');
  nocheck += (text.match(/@ts-nocheck/g) ?? []).length;
  explicitAny += (text.match(/\bany\b/g) ?? []).length;
}

// Ratchet only: this branch removed every whole-file opt-out; remaining adapter debt may decrease but never grow.
const existingAnyCeiling = 417;
if (nocheck > 0 || explicitAny > existingAnyCeiling) {
  console.error(`Type debt gate failed: @ts-nocheck=${nocheck}, explicit any=${explicitAny} (ceiling ${existingAnyCeiling}).`);
  process.exit(1);
}
console.log(`Type debt gate passed: @ts-nocheck=0, explicit any=${explicitAny}/${existingAnyCeiling}.`);
