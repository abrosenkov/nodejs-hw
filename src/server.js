import express from 'express';
import cors from 'cors';
import pino from 'pino-http';
import 'dotenv/config';
import helmet from 'helmet';

const app = express();
const PORT = process.env.PORT ?? 3000;

// Helmet  Middleware
app.use(helmet());

// Pino  Middleware
app.use(
  pino({
    level: 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss',
        ignore: 'pid,hostname',
        messageFormat:
          '{req.method} {req.url} {res.statusCode} - {responseTime}ms',
        hideObject: true,
      },
    },
  }),
);

// JSON  Middleware
app.use(express.json());

// CORS  Middleware
app.use(cors());

// Time log  Middleware
app.use((req, res, next) => {
  console.log(`Time: ${new Date().toLocaleString()}`);
  next();
});

// GET / notes
app.get('/notes', (req, res) => {
  res.status(200).json({ message: 'Retrieved all notes' });
});

// GET /notes/:noteId
app.get('/notes/:notesId', (req, res) => {
  const notesId = req.params;
  res.status(200).json({ message: `Retrieved note with ID: ${notesId}` });
});

// Test-error
app.get('/test-error', () => {
  throw new Error('Simulated server error');
});

// Not found Middleware
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Any errors Middleware
app.use((err, req, res, next) => {
  const isProd = process.env.NODE_ENV === 'production';

  res.status(500).json({
    message: isProd
      ? 'Something went wrong. Please try again later.'
      : err.message,
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
