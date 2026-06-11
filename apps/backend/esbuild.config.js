import esbuild from "esbuild";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse command line arguments
const args = process.argv.slice(2).reduce((acc, arg) => {
  const [key, value] = arg.replace(/^--/, "").split("=");
  acc[key] = value;
  return acc;
}, {});

const mode = args.mode || "production"; // Default to 'production' if no mode is provided
const isBuildMode = mode === "production"; // If build mode is enabled, proceed with writing files
const isCheckMode = mode === "check";
// Configuration paths
const entry = path.resolve(__dirname, "src/index.ts"); // Use TypeScript entry point
const outputDir = path.resolve(__dirname, "build");
const envFile = isBuildMode ? ".env.production" : ".env"; // Use .env.production for build mode, otherwise use .env

// Ensure build directory exists
if (isBuildMode && !fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, {recursive: true});
}

// Copy .env file if in build mode
// if (isBuildMode) {
//   if (fs.existsSync(envFile)) {
//     fs.copyFileSync(envFile, path.join(outputDir, ".env"));
//   } else {
//     console.warn(`Warning: ${envFile} does not exist.`);
//   }
// }

// ESBuild configuration
const esbuildConfig = {
  entryPoints: [entry],
  outfile: path.join(outputDir, "index.cjs"),
  tsconfig: path.resolve(__dirname, "tsconfig.json"),
  bundle: true,
  platform: "node",
  format: "cjs",
  minify: isBuildMode,
  sourcemap: !isBuildMode,
  target: "node18", // You can adjust this depending on your Node.js version
  resolveExtensions: [".ts", ".tsx", ".js", ".json"], // Resolve TypeScript and other extensions
  loader: {
    ".ts": "ts", // Use TypeScript loader for `.ts` files
    ".tsx": "tsx", // Use TypeScript loader for `.tsx` files (if using JSX)
    ".js": "js", // Use JavaScript loader for `.js` files
  },
  write: !isCheckMode,
  logLevel: "info",
  define: {
    "process.env.NODE_ENV": `"${mode}"`,
  },
  external: [
    "kerberos",
    "@mongodb-js/zstd",
    "@aws-sdk/credential-providers",
    "gcp-metadata",
    "snappy",
    "socks",
    "aws4",
    "mongodb-client-encryption",
  ], // Ignore the listed packages
};

// Execute the build process
esbuild.build(esbuildConfig).catch((err) => {
  console.error(err);
  process.exit(1);
});

if (isBuildMode) {
  console.log("Build complete.");
} else {
  console.log("Check mode is enabled, skipping file write.");
}
