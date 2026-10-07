import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { projectRoot } from "./sites-env.mjs";

const workerConfig = new URL("../dist/server/wrangler.json", import.meta.url);

if (!existsSync(workerConfig)) {
  console.log("Production build is missing. Building before starting...");
  const result = spawnSync(process.execPath, [
    fileURLToPath(new URL("./run-framework.mjs", import.meta.url)), "build",
  ], { cwd: projectRoot, stdio: "inherit" });

  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);

  if (!existsSync(workerConfig)) {
    console.error("The build did not create dist/server/wrangler.json. Check the build configuration before starting.");
    process.exit(1);
  }
}
