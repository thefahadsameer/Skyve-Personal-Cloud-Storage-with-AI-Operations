const { aiQueue } = require('../queues/aiQueue');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const File = require('../models/File'); // your file model

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/skyve', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('MongoDB connected in worker');
}).catch(err => {
    console.error('MongoDB connection error in worker:', err);
});

// Process AI jobs
aiQueue.process(async (job) => {
    try {
        console.log('Processing AI job:', job.id, job.data);

        const fileId = job.data.fileId;
        const fileDoc = await File.findById(fileId);
        if (!fileDoc) {
            throw new Error('File not found in DB');
        }

        // Simulate AI processing
        console.log(`Analyzing file: ${fileDoc.fileName}`);

        // Example: Add AI tags or summary
        const aiTags = ['example-tag', 'another-tag']; // replace with AI logic
        const aiSummary = `This is a sample AI-generated summary for ${fileDoc.fileName}`;

        fileDoc.ai_tags = aiTags;
        fileDoc.ai_summary = aiSummary;
        await fileDoc.save();

        console.log(`AI analysis complete for file: ${fileDoc.fileName}`);
        return { status: 'done', fileId };

    } catch (err) {
        console.error('AI Worker error:', err);
        throw err;
    }
});
