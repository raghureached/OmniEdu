const mongoose = require("mongoose");
const logger = require("../utils/logger");
const MONGO_URL = process.env.MONGO_URL;

const options = {
  // useNewUrlParser: true,
  // useUnifiedTopology: true,

  // Connection Pooling: Maintain a pool of socket connections
  //maxPoolSize: 50, // default is 100, adjust based on your app's concurrency

  // Retry logic: retry connection on failure
  // serverSelectionTimeoutMS: 5000, // Timeout after 5s if server not found
  // socketTimeoutMS: 45000, // Close socket after 45s of inactivity

  // Compression for large payloads
  compressors: "zlib",
  zlibCompressionLevel: 6,

  // Write Concern: Confirm that writes are acknowledged by MongoDB
  // w: 'majority',
  // wtimeoutMS: 2500,

  // Auto index creation can be turned off in production to avoid overhead
  // autoIndex: false,

  // TLS/SSL support (enable only if your cluster requires it)
  // ssl: true,
};

mongoose
  .connect(MONGO_URL, options)
  .then(() => {
    console.log("MongoDB Successfully connected");
  })
  .catch((err) => {
    console.log("Error while connecting to the MONGODB");
  });

const connectDB = mongoose.connection;

connectDB.on("connected", () => {
    logger.info(`MongoDB successfully Connected`);
  });
  connectDB.on("disconnected", () => {
    logger.info(`MongoDB successfully Disconnected`);
  });
  connectDB.on("error", (err) => {
    logger.warn("MongoDB connection error", err);
  });

module.exports = connectDB;
