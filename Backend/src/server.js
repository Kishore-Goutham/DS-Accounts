import { env } from "./config/env.js";
import { connectDB, disconnectDB } from "./config/db.js";
import { createApp } from "./app.js";

const app = createApp();

await connectDB();

const server = app.listen(env.port, () => {
  console.log(`Server running on http://localhost:${env.port} [${env.nodeEnv}]`);
});

// --- graceful shutdown -------------------------------------------------------
async function shutdown(signal) {
  console.log(`\n[server] ${signal} received, shutting down...`);
  server.close(async () => {
    await disconnectDB();
    console.log("[server] closed cleanly");
    process.exit(0);
  });
  // Safety net: force-exit if close hangs.
  setTimeout(() => {
    console.error("[server] forced shutdown after timeout");
    process.exit(1);
  }, 10000).unref();
}

for (const sig of ["SIGINT", "SIGTERM"]) {
  process.on(sig, () => shutdown(sig));
}
