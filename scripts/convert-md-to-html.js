import fs from 'fs';
import path from 'path';
import { marked } from 'marked';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Polyfill __dirname in ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const outputDir = path.join(__dirname, '../docs/html');
fs.mkdirSync(outputDir, { recursive: true });

// Recursively find all .md files in the given directories
function getMarkdownFiles(dir) {
  const results = [];
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) {
      results.push(...getMarkdownFiles(fullPath));
    } else if (file.isFile() && file.name.endsWith('.md')) {
      results.push(fullPath);
    }
  }
  return results;
}

const mdDirs = [
  path.join(__dirname, '../docs/jsdoc')
];

const mdFiles = mdDirs.flatMap(dir => fs.existsSync(dir) ? getMarkdownFiles(dir) : []);
const htmlFiles = [];

mdFiles.forEach((mdFile) => {
  const content = fs.readFileSync(mdFile, 'utf-8');
  const htmlContent = marked(content);
  const baseName = path.basename(mdFile, '.md') + '.html';
  const outputPath = path.join(outputDir, baseName);
  fs.writeFileSync(outputPath, htmlContent);
  console.log(`Converted: ${mdFile} → ${outputPath}`);
  htmlFiles.push(baseName);
});

const indexHtml = `
<!DOCTYPE html>
<html>
<head>
  <title>Docs Index</title>
</head>
<body>
  <h1>Documentation Index</h1>
  <ul>
    ${htmlFiles.map(file => `<li><a href="${file}">${file}</a></li>`).join('\n')}
  </ul>
</body>
</html>
`;
fs.writeFileSync(path.join(outputDir, 'index.html'), indexHtml);
console.log('Generated: docs/html/index.html');
