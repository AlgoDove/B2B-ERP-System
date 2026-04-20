const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    console.warn('⚠️  Running in offline mode. Check your MongoDB connection string and network access.');
    return false;
  }
};

module.exports = connectDB;
