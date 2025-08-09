const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema(
  {
    fileName: { type: String, required: true },
    filePathOnServer: { type: String, required: true },
    fileSize: { type: Number, required: true },
    mimeType: { type: String, required: true },
    ownerId: { type: String, default: 'anonymous' },
    uploadDate: { type: Date, default: Date.now },
    publicUrl: { type: String, default: '' },   // <-- for React preview/download
    ai_tags: { type: [String], default: [] },
    ai_summary: { type: String, default: '' }
  },
  { collection: 'files' }
);

module.exports = mongoose.model('File', fileSchema);
