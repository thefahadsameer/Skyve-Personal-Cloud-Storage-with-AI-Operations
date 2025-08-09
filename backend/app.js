const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
require('./db'); // connect API server to Mongo

const app = express();
app.use(express.json());
app.use(cors({ origin: '*' })); // adjust origin for your React app

// serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// health
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// routes
const uploadRoutes = require('./routes/upload');
app.use('/api', uploadRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
