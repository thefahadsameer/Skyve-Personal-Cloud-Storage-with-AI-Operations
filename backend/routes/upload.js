const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const File = require('../models/File');
const { aiQueue } = require('../queues/aiQueue');

const router = express.Router();

// ensure uploads dir exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

/**
 * POST /api/upload
 * body: form-data -> key=file (File), ownerId (Text optional)
 */
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const newFile = new File({
      fileName: req.file.originalname,
      filePathOnServer: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      ownerId: req.body.ownerId || 'anonymous',
      uploadDate: new Date()
    });

    const savedFile = await newFile.save();

    // compute public URL
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    const fileNameOnDisk = path.basename(savedFile.filePathOnServer);
    savedFile.publicUrl = `${baseUrl}/uploads/${fileNameOnDisk}`;
    await savedFile.save();

    // enqueue AI job (non-blocking)
    await aiQueue.add('analyze-file', { fileId: savedFile._id });

    res.status(201).json({ message: 'File uploaded successfully', file: savedFile });
  } catch (err) {
    console.error('UPLOAD_ERROR:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

/**
 * GET /api/files
 * List all files (latest first)
 */
router.get('/files', async (_req, res) => {
  try {
    const files = await File.find().sort({ uploadDate: -1 });
    res.json(files);
  } catch (err) {
    console.error('GET_FILES_ERROR:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

/**
 * GET /api/files/:id
 * Get single file doc
 */
router.get('/files/:id', async (req, res) => {
  try {
    const doc = await File.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

module.exports = router;
