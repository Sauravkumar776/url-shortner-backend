require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectMongo = require('./config/db');
const routes = require('./routes');
const helmet = require('helmet');
const corsFunction = require("./middlewares/cors");

const app = express();
app.use(helmet());
app.use(corsFunction);

// Validate essential environment variables
if (!process.env.PORT) {
  console.error("❌ PORT not set in environment variables");
  process.exit(1);
}
// if (!process.env.CLIENT_ORIGIN) {
//   console.error("❌ CLIENT_ORIGIN not set in environment variables");
//   process.exit(1);
// }

// Connect to MongoDB
connectMongo();

// Disable 'x-powered-by' header for security
app.disable('x-powered-by');

// CORS Configuration
app.use(cors({
  origin: process.env.CLIENT_ORIGIN,
  credentials: true
}));

// JSON Body Parser
app.use(express.json());

// Routes
app.use('/', routes);

// 404 Fallback Route
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("🔥 Internal Server Error:", err);
  res.status(500).json({ message: 'Internal Server Error' });
});

// Start the Server
const server = app.listen(process.env.PORT, () => {
  console.log(`✅ Server running at http://localhost:${process.env.PORT}`);
});

// Graceful Shutdown & Error Handling
process.on('unhandledRejection', (err) => {
  console.error("❌ Unhandled Rejection:", err);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
  console.error("❌ Uncaught Exception:", err);
  process.exit(1);
});

process.on('SIGINT', () => {
  console.log("🔌 Server shutting down...");
  server.close(() => {
    console.log("✅ Server shut down gracefully");
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log("🔌 Server shutting down...");
  server.close(() => {
    console.log("✅ Server shut down gracefully");
    process.exit(0);
  });
});
