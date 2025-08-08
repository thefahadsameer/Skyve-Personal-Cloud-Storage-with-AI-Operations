const fs = require('fs');
const path = require('path');
const File = require('../models/fileModel');
const { aiQueue } = require('../config/queue');

// POST /upload
const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { originalname, filename, mimetype, size, path: filePath } = req.file;

    // Save file metadata to DB
    const fileDoc = await File.create({
      originalName: originalname,
      fileName: filename,
      mimeType: mimetype,
      filePath: filePath,
      fileSize: size,
      ownerId: req.user ? req.user._id : null,
    });

    // Add AI task to Redis queue
    await aiQueue.add('analyzeFile', {
      fileId: fileDoc._id,
      filePath: filePath,
      mimeType: mimetype,
    });

    res.status(201).json({
      message: 'File uploaded and task queued for AI analysis',
      fileId: fileDoc._id,
      fileName: filename,
    });
  } catch (err) {
    console.error('Upload Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  uploadFile,
};
