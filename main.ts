// The Velvet Vault — entry program for make.fun's "Make the best heist game".
// Copies game/ and screenshots/ into the output directory and writes
// dossier.json with buildDossier from vendor/makefun-game.ts.
// Runs on Node 22, standard library only. Deterministic: the same input
// always produces the same output bytes (the grader runs it twice and the
// two runs must agree).
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const REPO_ROOT = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The competition's own caps, from its rules: dossier text 160 KiB, at most
// 4 screenshots of 256 KiB each, game/ at most 993 files and 48 MiB, paths
// at most 1,000 bytes. The game here is far inside every cap, so the caps
// only guard against accidents.
const CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 48 * 1024 * 1024,
  game_path_max_bytes: 1000,
};

function copyTree(src: string, dst: string): number {
  let files = 0;
  mkdirSync(dst, { recursive: true });
  for (const name of readdirSync(src).sort()) {
    const from = join(src, name);
    const to = join(dst, name);
    const st = statSync(from);
    if (st.isDirectory()) {
      files += copyTree(from, to);
    } else if (st.isFile()) {
      cpSync(from, to);
      files += 1;
    }
  }
  return files;
}

function main(): void {
  const gameSrc = join(REPO_ROOT, 'game');
  const shotsSrc = join(REPO_ROOT, 'screenshots');
  if (!existsSync(gameSrc)) throw new Error('game/ is missing from the repository');
  if (!existsSync(shotsSrc)) throw new Error('screenshots/ is missing from the repository');
  if (OUTPUT_DIR === '/' || OUTPUT_DIR === REPO_ROOT) {
    throw new Error(`refusing to use ${OUTPUT_DIR} as the output directory`);
  }
  mkdirSync(OUTPUT_DIR, { recursive: true });
  // Start clean so a stale file can never leak into the output.
  for (const name of readdirSync(OUTPUT_DIR)) {
    rmSync(join(OUTPUT_DIR, name), { recursive: true, force: true });
  }
  const gameFiles = copyTree(gameSrc, join(OUTPUT_DIR, 'game'));
  const shotFiles = copyTree(shotsSrc, join(OUTPUT_DIR, 'screenshots'));
  const dossier = buildDossier(OUTPUT_DIR, CAPS);
  writeFileSync(join(OUTPUT_DIR, 'dossier.json'), dossier);
  console.log(
    `velvet-vault: copied ${gameFiles} game files and ${shotFiles} screenshots; ` +
      `dossier.json ${dossier.length} bytes -> ${OUTPUT_DIR}`,
  );
}

main();
