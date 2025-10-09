const mongoose = require('mongoose');

/**
 * Establishes a connection to the MongoDB database.
 */
const connectDB = async () => {
  try {
    // Mongoose.connect returns a promise. We await it to ensure the connection is established.
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    // Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;