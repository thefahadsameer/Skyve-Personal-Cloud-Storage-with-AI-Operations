const fs = require("fs").promises;
const path = require("path");
const { Worker } = require("bullmq");
const { connection } = require("../config/queue");
const File = require('../models/fileModel');
const { Configuration, OpenAIApi } = require("openai");

// Load OpenAI API key
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Define AI Worker
const aiWorker = new Worker(
  "aiTasks",
  async (job) => {
    console.log("Processing job:", job.id, job.data);

    const { fileId, filePath, mimeType } = job.data;

    try {
      // Only process plain text files for now
      if (!mimeType.includes("text")) {
        console.log("Skipping non-text file:", mimeType);
        return;
      }

      // Read file content
      const absolutePath = path.resolve(filePath);
      const content = await fs.readFile(absolutePath, "utf-8");

      // Summarize using OpenAI
      const response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "Summarize the following user-uploaded text file.",
          },
          {
            role: "user",
            content,
          },
        ],
      });

      const summary = response.data.choices[0].message.content;

      // Save summary in DB
      await File.findByIdAndUpdate(fileId, {
        ai_tags: ["summary"],
        ai_summary: summary,
      });

      console.log("✅ Summary saved to DB for file:", fileId);
    } catch (err) {
      console.error("❌ Error processing job:", err);
    }
  },
  { connection }
);

// Worker events
aiWorker.on("completed", (job) => {
  console.log(`✅ Job ${job.id} completed`);
});
aiWorker.on("failed", (job, err) => {
  console.error(`❌ Job ${job.id} failed`, err);
});
