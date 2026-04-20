const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Disable buffering - immediately fail if connection not available
    mongoose.set('bufferCommands', false);
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 5000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    console.warn('⚠️  Running in offline mode with mock database.');
    // Disable Mongoose entirely - we'll use mock DB instead
    mongoose.set('bufferCommands', false);
    return false;
  }
};

module.exports = connectDB;
