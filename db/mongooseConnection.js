const mongoose = require('mongoose');
const config = require("../config.js")

const connectDB = async () => {
  try {
    await mongoose.connect(config.MONGODB_URL);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
};

module.exports = connectDB;
