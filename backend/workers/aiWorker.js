const { Worker } = require("bullmq");
const { connection } = require("../config/queue"); // re-use shared connection
const File = require('../models/fileModel');

const aiWorker = new Worker(
  "aiTasks",
  async (job) => {
    console.log("Processing job:", job.id, job.data);
    // Your AI processing logic here
  },
  { connection }
);

aiWorker.on("completed", (job) => {
  console.log(`Job ${job.id} has completed`);
});

aiWorker.on("failed", (job, err) => {
  console.error(`Job ${job.id} has failed`, err);
});
