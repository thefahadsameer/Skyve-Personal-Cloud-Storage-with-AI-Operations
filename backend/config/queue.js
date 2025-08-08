const { Queue } = require("bullmq");
const IORedis = require("ioredis");

// Create a SINGLE Redis connection instance
const connection = new IORedis({
  host: '127.0.0.1',
  port: 6379,
  maxRetriesPerRequest: null,
});

// Export the queue with the shared Redis connection
const aiQueue = new Queue("aiTasks", { connection });

module.exports = {
  aiQueue,
  connection, // Exported in case worker or other services need it
};
