import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.resolve(__dirname, "src");

function updateFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const fileDir = path.dirname(filePath);
  let updated = content;

  // Match from "..."
  updated = updated.replace(/from\s+"([^"]+)"/g, (match, importPath) => {
    if (importPath.startsWith("./") || importPath.startsWith("../")) {
      const resolved = resolveImport(importPath, fileDir);
      if (resolved) {
        return `from "${resolved}"`;
      }
    }
    return match;
  });

  // Match from '...'
  updated = updated.replace(/from\s+'([^']+)'/g, (match, importPath) => {
    if (importPath.startsWith("./") || importPath.startsWith("../")) {
      const resolved = resolveImport(importPath, fileDir);
      if (resolved) {
        return `from '${resolved}'`;
      }
    }
    return match;
  });

  // Match import("...")
  updated = updated.replace(/import\s*\(\s*"([^"]+)"\s*\)/g, (match, importPath) => {
    if (importPath.startsWith("./") || importPath.startsWith("../")) {
      const resolved = resolveImport(importPath, fileDir);
      if (resolved) {
        return `import("${resolved}")`;
      }
    }
    return match;
  });

  if (updated !== content) {
    fs.writeFileSync(filePath, updated, "utf8");
    console.log(`Updated: ${path.relative(__dirname, filePath)}`);
  }
}

function resolveImport(importPath, currentDir) {
  const absoluteBase = path.resolve(currentDir, importPath);
  
  // Check possible extensions
  const extensions = [".ts", ".tsx", ".js", ".jsx"];
  for (const ext of extensions) {
    if (fs.existsSync(absoluteBase + ext)) {
      return toAlias(absoluteBase + ext);
    }
  }

  // Check if it's a directory with index
  for (const ext of extensions) {
    const indexPath = path.join(absoluteBase, `index${ext}`);
    if (fs.existsSync(indexPath)) {
      return toAlias(indexPath);
    }
  }

  return null;
}

function toAlias(absolutePath) {
  const relative = path.relative(srcDir, absolutePath).replace(/\\/g, "/");
  // Remove extension
  const noExt = relative.replace(/\.(ts|tsx|js|jsx)$/, "");
  return `@/${noExt}`;
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
    } else if (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) {
      updateFile(full);
    }
  }
}

walk(srcDir);
console.log("Done!");
