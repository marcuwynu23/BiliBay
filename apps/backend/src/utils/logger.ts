import winston from "winston";
import path from "path";
import fs from "fs";

const {combine, timestamp, printf, colorize, errors} = winston.format;

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, {recursive: true});
}

// Custom format for console output
const consoleFormat = printf(({level, message, timestamp, stack, ...metadata}) => {
  let msg = `${timestamp} [${level}]: ${stack || message}`;
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }
  return msg;
});

// Custom format for file output
const fileFormat = printf(({level, message, timestamp, stack, ...metadata}) => {
  const logEntry: any = {
    timestamp,
    level,
    message: stack || message,
  };
  
  if (Object.keys(metadata).length > 0) {
    logEntry.metadata = metadata;
  }
  
  return JSON.stringify(logEntry);
});

// Determine if we're in production
const isProduction = process.env.NODE_ENV === "production";

// Create transports array
const transports: winston.transport[] = [];

// Console transport (always enabled)
transports.push(
  new winston.transports.Console({
    format: combine(
      errors({stack: true}),
      timestamp({format: "YYYY-MM-DD HH:mm:ss"}),
      colorize(),
      consoleFormat
    ),
    level: isProduction ? "info" : "debug",
  })
);

// File transports (only in production)
if (isProduction) {
  // Error log file
  transports.push(
    new winston.transports.File({
      filename: path.join(logsDir, "error.log"),
      level: "error",
      format: combine(errors({stack: true}), timestamp(), fileFormat),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );

  // Combined log file
  transports.push(
    new winston.transports.File({
      filename: path.join(logsDir, "combined.log"),
      format: combine(errors({stack: true}), timestamp(), fileFormat),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );

  // Access log file (for HTTP requests)
  transports.push(
    new winston.transports.File({
      filename: path.join(logsDir, "access.log"),
      level: "info",
      format: combine(timestamp(), fileFormat),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
}

// Create the logger
const logger = winston.createLogger({
  level: isProduction ? "info" : "debug",
  format: combine(
    errors({stack: true}),
    timestamp({format: "YYYY-MM-DD HH:mm:ss"})
  ),
  transports,
  // Don't exit on handled exceptions
  exitOnError: false,
});

// Create a stream for morgan (HTTP request logging)
export const loggerStream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};

export default logger;

