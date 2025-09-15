/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");

// Load DATABASE_URL from .env if not already set (without printing it)
(function loadEnv() {
  try {
    if (!process.env.DATABASE_URL) {
      const envPath = path.join(process.cwd(), ".env");
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, "utf8");
        for (const line of content.split(/\r?\n/)) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith("#")) continue;
          const m = trimmed.match(/^DATABASE_URL=(.*)$/);
          if (m) {
            let v = m[1];
            if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
              v = v.slice(1, -1);
            }
            process.env.DATABASE_URL = v;
            break;
          }
        }
      }
    }
  } catch (_) {}
})();

const { PrismaClient } = require("@prisma/client");

async function main() {
  const prisma = new PrismaClient({
    log: ["error"],
  });
  // safety timeout
  const timeout = setTimeout(() => {
    console.error("DB connection timeout after 15s");
    process.exit(1);
  }, 15000);

  try {
    const result = await prisma.$queryRaw`SELECT 1 as ok`;
    clearTimeout(timeout);
    // Expect something like [{ ok: 1 }]
    const ok = Array.isArray(result) && result.length > 0;
    if (ok) {
      console.log("✔ Database connection OK");
      process.exit(0);
    } else {
      console.error("✖ Unexpected DB response", result);
      process.exit(1);
    }
  } catch (e) {
    clearTimeout(timeout);
    console.error("✖ Database connection FAILED:", e?.message || e);
    process.exit(1);
  }
}

main();
