const File = require('../models/File');

// GET all files from the database
const getAllFiles = async (req, res) => {
  try {
    const files = await File.find().sort({ uploadDate: -1 });
    res.status(200).json(files);
  } catch (error) {
    console.error("Error fetching files:", error);
    res.status(500).json({ error: 'Failed to fetch files' });
  }
};

module.exports = {
  getAllFiles,
};
