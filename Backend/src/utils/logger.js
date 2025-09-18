const winston = require("winston");

const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: winston.format.combine(
    winston.format.timestamp(), //enables timestamp
    winston.format.errors({ stack: true }), //enables stack trace
    //     Without stack: true → Only logs the error message (harder to debug).
    // With stack: true → Logs the full stack trace (shows where the error happened).

    winston.format.splat(), // Enables string interpolation (like printf)
    // ✅ splat() → Allows formatted logs like logger.info("User %s logged in", userId).
    winston.format.json() //enables json output
  ),
  defaultMeta: { service: "LMS-service" },
  transports: [
    new winston.transports.Console({
      //for terminal
      format: winston.format.combine(
        winston.format.colorize(), //enables colorful output
        winston.format.simple() //enables simple output
      ),
    }),
    //for Files log
    new winston.transports.File({
      filename: "error.log",
      level: "error",
    }),
    new winston.transports.File({
      filename: "info.log",
      level: "info",
    }),

    new winston.transports.File({
      filename: "combined.log",
    }),
  ],
});

module.exports = logger;
