const mongoose = require('mongoose');

/**
 * Establishes a connection to the MongoDB database.
 */
const connectDB = async () => {
  try {
    console.log('Using MONGO_URI:', process.env.MONGO_URI);
    // Mongoose.connect returns a promise. Provide some sensible options and a timeout so failures are reported quickly.
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000, // 10s timeout for faster failure
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    if (error.stack) console.error(error.stack);
    // Provide a hint about common Atlas issues
    console.error('Common causes: incorrect URI, network/IP not whitelisted in Atlas, or incorrect credentials.');
    // Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;