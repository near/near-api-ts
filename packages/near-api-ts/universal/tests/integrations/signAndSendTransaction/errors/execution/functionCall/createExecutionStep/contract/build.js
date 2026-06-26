import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Build the contract and copy the resulting wasm into the sibling `wasm` folder.
// Run from anywhere — paths are resolved relative to this script.

const sourcesDir = dirname(fileURLToPath(import.meta.url));

execFileSync('cargo', ['near', 'build', 'non-reproducible-wasm'], {
  cwd: sourcesDir,
  stdio: 'inherit',
});

const wasmDir = join(sourcesDir, './wasm');
mkdirSync(wasmDir, { recursive: true });

copyFileSync(
  join(sourcesDir, 'target/near/contract_with_errors.wasm'),
  join(wasmDir, 'contract_with_errors.wasm'),
);

console.log(`Copied sources.wasm -> ${join(wasmDir, 'contract_with_errors.wasm')}`);
