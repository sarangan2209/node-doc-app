import fs from "fs";
import path from "path";
import { OpenAI } from "openai";
import { marked } from "marked";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Polyfill __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Init OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Source and output directories
const src = path.join(__dirname, "../src");
const docsDir = path.join(__dirname, "../docs/generated");

// Create docs output dir if needed
if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
}

// Prompt templates by file type
const PROMPT_TEMPLATES = {
  ".js": `Generate JavaScript documentation including:
- Function purposes
- Parameters (types, defaults)
- Return values
- Usage examples

For this file:\n\n`,
  ".ts": `Generate TypeScript documentation including:
- Function purposes
- Parameters (types, defaults)
- Return values
- Types and interfaces
- Usage examples

For this file:\n\n`,
  default: `Generate developer documentation for this file:\n\n`,
};

// Recursively get all JS/TS files
function getAllFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory() && !filePath.includes("node_modules")) {
      results = results.concat(getAllFiles(filePath));
    } else if (/\.(js|ts)$/.test(filePath)) {
      results.push(filePath);
    }
  }
  return results;
}

// Convert Markdown to HTML and save
function convertMarkdownToHtml(mdPath) {
  const mdContent = fs.readFileSync(mdPath, "utf-8");

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${path.basename(mdPath)}</title>
  <style>
    body { font-family: sans-serif; padding: 2rem; max-width: 800px; margin: auto; }
    h1, h2, h3 { color: #333; }
    pre { background: #f4f4f4; padding: 1em; overflow-x: auto; }
    code { background: #f9f9f9; padding: 0.2em 0.4em; border-radius: 3px; }
  </style>
</head>
<body>
  ${marked(mdContent)}
</body>
</html>
`;

  const htmlPath = mdPath.replace(/\.md$/, ".html");
  fs.writeFileSync(htmlPath, htmlContent);
  console.log(`🌐 HTML generated: ${htmlPath}`);
}

// Generate index.html linking to all HTML files
function generateIndexHtml(docsDir) {
  const files = fs.readdirSync(docsDir)
    .filter(file => file.endsWith(".html") && file !== "index.html");

  const links = files.map(file =>
    `<li><a href="./${file}">${file}</a></li>`
  ).join("\n");

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Documentation Index</title>
  <style>
    body { font-family: sans-serif; padding: 2rem; max-width: 800px; margin: auto; }
    h1 { color: #333; }
    ul { line-height: 1.8; }
    a { color: #0366d6; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <h1>📚 Auto-generated Documentation</h1>
  <ul>
    ${links}
  </ul>
</body>
</html>
`;

  const indexPath = path.join(docsDir, "index.html");
  fs.writeFileSync(indexPath, html);
  console.log(`📄 Index generated: ${indexPath}`);
}

// Generate doc for a single file
async function generateDoc(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const fileExt = path.extname(filePath);
    const prompt = (PROMPT_TEMPLATES[fileExt] || PROMPT_TEMPLATES.default) + content;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    });

    const doc = response.choices[0].message.content;
    const mdOutput = path.join(docsDir, `${path.basename(filePath)}.md`);
    fs.writeFileSync(mdOutput, doc);
    console.log(`✅ Markdown generated: ${mdOutput}`);

    convertMarkdownToHtml(mdOutput);
  } catch (err) {
    console.error(`❌ Error processing ${filePath}:`, err.message);
  }
}

// Main runner
(async () => {
  if (!fs.existsSync(src)) {
    console.error(`❌ Source directory does not exist: ${src}`);
    process.exit(1);
  }

  const allFiles = getAllFiles(src);
  if (allFiles.length === 0) {
    console.log("ℹ️ No JS/TS files found in", src);
    return;
  }

  for (const file of allFiles) {
    await generateDoc(file);
  }

  generateIndexHtml(docsDir);
})();
