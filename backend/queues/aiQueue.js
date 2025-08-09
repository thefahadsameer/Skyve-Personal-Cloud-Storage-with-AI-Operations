const Queue = require('bull');
const dotenv = require('dotenv');

dotenv.config();

// Create Bull queue
const aiQueue = new Queue('ai-analysis', {
  redis: {
    host: '127.0.0.1',
    port: 6379
  }
});

module.exports = { aiQueue };
