import fs from "fs";
import path from "path";
import { OpenAI } from "openai";
import { execSync } from "child_process";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  fetch
});

const SRC_DIR = "src";
const docsDir = "docs/jsdoc";

const dirsToCreate = [docsDir];

dirsToCreate.forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const PROMPT_TEMPLATE = `Generate JavaScript documentation including:
- Function purposes
- Parameters (types, defaults)
- Return values
- Usage examples
For this file:\n\n`;

function getAllFiles(dir, fileList = []) {
  fs.readdirSync(dir).forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      getAllFiles(filePath, fileList);
    } else if (
      /\.(js|ts)$/.test(filePath) &&
      !filePath.includes("node_modules")
    ) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

async function generateJsTsDoc(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const prompt = PROMPT_TEMPLATE + content;
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    });
    const doc = response.choices[0].message.content;
    const outputFile = path.join(docsDir, `${path.basename(filePath)}.md`);
    fs.writeFileSync(outputFile, doc);
    console.log(` JS/TS doc generated at ${outputFile}`);
  } catch (err) {
    console.error(` Error generating docs for ${filePath}:`, err.message);
  }
}

(async () => {
  const allFiles = getAllFiles(SRC_DIR);
  const jsTsFiles = allFiles.filter(f => /\.(js|ts)$/.test(f));
  for (const file of jsTsFiles) {
    await generateJsTsDoc(file);
  }
})();