const { aiQueue } = require('../config/queue');

const triggerAIJob = async (fileData) => {
  try {
    await aiQueue.add('analyze-file', fileData, {
      attempts: 3,
      backoff: 5000, // retry in 5 seconds on failure
    });
    console.log(`✅ AI job added for file: ${fileData.fileName}`);
  } catch (error) {
    console.error('❌ Failed to add AI job:', error);
  }
};

module.exports = { triggerAIJob };
