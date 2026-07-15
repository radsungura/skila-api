require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { connectToMongo, getDb } = require("./db");
const authRoutes = require('./router/auth');
const serviceRoutes = require('./router/service');
const provRoute = require('./router/providers');
const errorHandler = require('./middleware/error');
const app = express();
const port = process.env.PORT || 4000

// second exemple of cors config
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:4200',
  // origin: 'http://skila.vercel.app',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`, res);
    next();
  });
}

// Attach DB once
app.use((req, res, next) => {
  try {
    req.db = getDb();
    next();
  } catch (err) {
    next(err);
  }
});

// Routes
app.use('/', authRoutes);
app.use('/', serviceRoutes);
app.use('/', provRoute);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} non trouvée`
  });
});

// Error handler
// app.use(errorHandler);

module.exports = app;

// Start server AFTER Mongo connects
connectToMongo()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch(err => {
    console.error("Mongo connection failed:", err);
    process.exit(1);
  });
