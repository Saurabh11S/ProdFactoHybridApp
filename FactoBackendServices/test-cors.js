// Simple CORS test script
const express = require('express');
const cors = require('cors');

const app = express();

// CORS configuration
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://localhost:5173", 
    "http://localhost:8080",
    "https://admin.facto.org.in",
    "https://facto.org.in",
    "*"
  ],
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.use(express.json());

// Test endpoint
app.post('/api/v1/test-cors', (req, res) => {
  res.json({
    success: true,
    message: 'CORS test successful',
    data: req.body
  });
});

app.get('/api/v1/test-cors', (req, res) => {
  res.json({
    success: true,
    message: 'CORS GET test successful',
    origin: req.headers.origin
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`CORS test server running on port ${PORT}`);
  console.log(`Test URL: http://localhost:${PORT}/api/v1/test-cors`);
});
