// routes/fileRoutes.js

const express = require('express');
const router = express.Router();

const { getAllFiles } = require('../controllers/fileController');

// GET /api/files - Fetch all uploaded file metadata
router.get('/files', getAllFiles);

module.exports = router;
