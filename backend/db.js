const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/skyve';

mongoose.set('strictQuery', true);

mongoose.connect(MONGO_URI, {
  // modern drivers ignore these flags but they’re fine
})
.then(() => console.log('[API] MongoDB connected'))
.catch(err => {
  console.error('[API] MongoDB connection error:', err);
  process.exit(1);
});

module.exports = mongoose;
