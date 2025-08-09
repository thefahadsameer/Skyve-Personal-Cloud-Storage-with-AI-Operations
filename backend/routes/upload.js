const express = require('express');
const multer = require('multer');
const path = require('path');           // <- declare ONCE here
const fs = require('fs');               // sync ops (rename)
const fsp = require('fs/promises');     // promise ops (unlink)
const File = require('../models/File');
const { aiQueue } = require('../queues/aiQueue');

const router = express.Router();

// ensure uploads dir exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// multer storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

/** POST /api/upload */
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const newFile = new File({
      fileName: req.file.originalname,
      filePathOnServer: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      ownerId: req.body.ownerId || 'anonymous',
      uploadDate: new Date(),
    });

    const savedFile = await newFile.save();

    // compute public URL
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    const fileNameOnDisk = path.basename(savedFile.filePathOnServer);
    savedFile.publicUrl = `${baseUrl}/uploads/${fileNameOnDisk}`;
    await savedFile.save();

    // enqueue AI job
    await aiQueue.add('analyze-file', { fileId: savedFile._id });

    res.status(201).json({ message: 'File uploaded successfully', file: savedFile });
  } catch (err) {
    console.error('UPLOAD_ERROR:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

/** GET /api/files */
router.get('/files', async (_req, res) => {
  try {
    const files = await File.find().sort({ uploadDate: -1 });
    res.json(files);
  } catch (err) {
    console.error('GET_FILES_ERROR:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

/** GET /api/files/:id */
router.get('/files/:id', async (req, res) => {
  try {
    const doc = await File.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

/** PATCH /api/files/:id  { newName }  — rename+move on disk */
router.patch('/files/:id', async (req, res) => {
  try {
    const { newName } = req.body;
    if (!newName) return res.status(400).json({ error: 'newName is required' });

    const doc = await File.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Not found' });

    const dir = path.dirname(doc.filePathOnServer);
    const newDiskPath = path.join(dir, `${Date.now()}-${newName}`);

    // move file on disk
    fs.renameSync(doc.filePathOnServer, newDiskPath);

    // update db + publicUrl
    doc.fileName = newName;
    doc.filePathOnServer = newDiskPath;
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    doc.publicUrl = `${baseUrl}/uploads/${path.basename(newDiskPath)}`;
    await doc.save();

    res.json(doc);
  } catch (err) {
    console.error('RENAME_FILE_ERROR:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

/** DELETE /api/files/:id */
router.delete('/files/:id', async (req, res) => {
  try {
    const doc = await File.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Not found' });

    // best-effort remove physical file
    try { await fsp.unlink(doc.filePathOnServer); } catch (_) {}

    await doc.deleteOne();
    res.json({ ok: true });
  } catch (err) {
    console.error('DELETE_FILE_ERROR:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

module.exports = router;
