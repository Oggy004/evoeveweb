/**
 * Reads .env and writes js/supabase-config.js for the static site.
 * Run: npm run config
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const envPath = path.join(root, ".env");
const outPath = path.join(root, "js", "supabase-config.js");

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const env = {};
  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

function escapeJsString(value) {
  return String(value)
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\r/g, "\\r")
    .replace(/\n/g, "\\n");
}

const fileEnv = parseEnvFile(envPath);
const env = { ...process.env, ...fileEnv };
const url = env.SUPABASE_URL?.trim() || "";
const anonKey = env.SUPABASE_ANON_KEY?.trim() || "";

if (!fs.existsSync(envPath)) {
  console.warn("No .env file found. Using process.env values if provided.");
}
if (!url || !anonKey) {
  console.warn("SUPABASE_URL or SUPABASE_ANON_KEY is missing in .env or process.env.");
}

const output = `/* AUTO-GENERATED — do not edit. Edit .env and run: npm run config */
window.EVOEVE_SUPABASE = {
  url: "${escapeJsString(url)}",
  anonKey: "${escapeJsString(anonKey)}",
};
`;

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, output, "utf8");
console.log("Wrote js/supabase-config.js from .env");
