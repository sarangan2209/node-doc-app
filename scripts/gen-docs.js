import fs from "fs";
import path from "path";
import { OpenAI } from "openai";
import { execSync } from "child_process";
import fetch, { Headers, Request, Response } from 'node-fetch';
import { Blob } from 'fetch-blob';
import FormData from 'form-data';
import AbortController from 'abort-controller';
globalThis.fetch = fetch;
globalThis.Headers = Headers;
globalThis.Request = Request;
globalThis.Response = Response;
globalThis.Blob = Blob;
globalThis.FormData = FormData;
globalThis.AbortController = AbortController;
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  fetch
});


const src = 'src';
const docsDir = "docs/generated";
if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
}
const PROMPT_TEMPLATES = {
  '.js': `Generate JavaScript documentation including:
  - Function purposes
  - Parameters (types, defaults)
  - Return values
  - Usage examples
  For this file:\n\n`,
  '.ts': `Generate TypeScript documentation including:
  - Function purposes
  - Parameters (types, defaults)
  - Return values
  - Types and interfaces
  - Usage examples
  For this file:\n\n`,
  default: `Generate developer documentation for this file:\n\n`
};
// Recursively get all .js and .ts files
function getAllFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory() && !filePath.includes("node_modules")) {
      results = results.concat(getAllFiles(filePath));
    } else if (/\.(js|ts)$/.test(filePath)) {
      results.push(filePath);
    }
  }
  return results;
}
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
    const outputFile = path.join(docsDir, `${path.basename(filePath)}.md`);
    fs.writeFileSync(outputFile, doc);
    console.log(`✅ Documentation generated for ${filePath}`);
  } catch (err) {
    console.error(`❌ Error generating docs for ${filePath}:`, err.message);
  }
}
(async () => {
  const allFiles = getAllFiles(src);
  for (const file of allFiles) {
    await generateDoc(file);
  }
})();