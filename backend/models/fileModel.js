const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  originalName: String,
  serverFilename: String,
  path: String,
  size: Number,
  mimetype: String,
  ai_tags: [String],
  uploadDate: {
    type: Date,
    default: Date.now
  }
});

// ✅ Prevent OverwriteModelError
module.exports = mongoose.models.File || mongoose.model('File', fileSchema);
