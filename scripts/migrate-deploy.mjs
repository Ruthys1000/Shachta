// Runs `prisma migrate deploy` with retries so a transient failure doesn't sink
// the whole Vercel build.
//
// On serverless Postgres (Neon) the migrate step can fail with P1002 "Timed out
// trying to acquire a postgres advisory lock" when the database is cold
// (scale-to-zero) — the fixed ~10s advisory-lock timeout elapses while the
// compute is still waking. The first attempt wakes the database, so a retry a
// few seconds later hits a warm instance and acquires the lock. We back off
// exponentially and only fail the build if every attempt fails.
//
// (If migrations are still routed through the pooled endpoint — DIRECT_URL unset
// or pointing at the `-pooler` host — the advisory lock can never be acquired and
// retries won't help; fix that in the Vercel env. See prisma.config.ts / README.)

import { spawnSync } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";

const MAX_ATTEMPTS = 5;
const BASE_DELAY_MS = 3000;

function runMigrateDeploy() {
  const result = spawnSync("npx", ["prisma", "migrate", "deploy"], {
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (result.error) throw result.error;
  return result.status ?? 1;
}

for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
  const status = runMigrateDeploy();
  if (status === 0) {
    process.exit(0);
  }

  if (attempt < MAX_ATTEMPTS) {
    const delay = BASE_DELAY_MS * 2 ** (attempt - 1);
    console.warn(
      `\n[migrate-deploy] attempt ${attempt}/${MAX_ATTEMPTS} failed (exit ${status}); ` +
        `retrying in ${delay / 1000}s...\n`
    );
    await sleep(delay);
  } else {
    console.error(`\n[migrate-deploy] all ${MAX_ATTEMPTS} attempts failed.\n`);
    process.exit(status);
  }
}
