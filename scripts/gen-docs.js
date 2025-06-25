const fs = require("fs");
const path = require("path");
const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const changedFiles = fs
  .readFileSync("changed-files.txt", "utf-8")
  .split("\n")
  .filter(file => file.trim())
  .filter(file => /\.(js|ts)$/.test(file) && 
                 !file.includes('node_modules'));

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
  default: `Generate developer documentation for this file:\n\n`
};

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
  for (const file of changedFiles) {
    if (fs.existsSync(file)) {
      await generateDoc(file);
    }
  }
})();