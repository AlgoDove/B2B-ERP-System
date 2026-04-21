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
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
<<<<<<< HEAD
<<<<<<< HEAD
    console.warn('⚠️  Running in offline mode with mock database.');
    // Disable Mongoose entirely - we'll use mock DB instead
    mongoose.set('bufferCommands', false);
    return false;
=======
    process.exit(1);
>>>>>>> parent of be8bcda (feat: integrate inventory module with stronger form validations)
=======
    process.exit(1);
>>>>>>> parent of 8302d31 (merge: inventory integration and validation improvements)
  }
};

module.exports = connectDB;
