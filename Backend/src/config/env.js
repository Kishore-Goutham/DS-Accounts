// Loads environment variables from .env (once) and validates them at startup.
// Importing this module fails fast — with a clear message and a non-zero exit —
// if anything required is missing or malformed, so the app never boots half-configured.
import "dotenv/config";

function fail(message) {
  console.error(`[config] ${message}`);
  console.error(`[config] Fix Backend/.env (see Backend/.env.example) and restart.`);
  process.exit(1);
}

function requireString(name) {
  const value = process.env[name];
  if (typeof value !== "string" || value.trim() === "") {
    fail(`Missing required environment variable: ${name}`);
  }
  return value.trim();
}

function optionalPort(name, fallback) {
  const raw = process.env[name];
  if (raw === undefined || raw.trim() === "") return fallback;
  const n = Number(raw);
  if (!Number.isInteger(n) || n <= 0 || n > 65535) {
    fail(`Invalid ${name}: "${raw}" (expected an integer between 1 and 65535)`);
  }
  return n;
}

export const env = Object.freeze({
  nodeEnv: process.env.NODE_ENV?.trim() || "development",
  port: optionalPort("PORT", 5000),
  mongoUri: requireString("MONGODB_URI"),
  // Frontend origin allowed by CORS. Defaults to "*" for local dev;
  // set CORS_ORIGIN in production to lock it down.
  corsOrigin: process.env.CORS_ORIGIN?.trim() || "*",
});
