const express = require('express');
const app = express();
const dotenv = require('dotenv');
const connectDB = require('./db/connectDB');
const fileRoutes = require('./routes/fileRoutes');
require('dotenv').config();

dotenv.config();
connectDB();

app.use(express.json());
app.use('/uploads', express.static('uploads')); // Serve uploaded files

// Routes
const uploadRoutes = require('./routes/upload');
app.use('/api', uploadRoutes);

// Mount file routes
app.use('/api', fileRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
