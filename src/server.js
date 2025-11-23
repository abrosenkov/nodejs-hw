import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import helmet from 'helmet';
import { connectMongoDB } from './db/connectMongoDB.js';
import notesRoutes from './routes/notesRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { logger } from './middleware/logger.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { errorHandler } from './middleware/errorHandler.js';
import { errors } from 'celebrate';
import cookieParser from 'cookie-parser';

const app = express();
const PORT = process.env.PORT ?? 3000;

// Helmet  Middleware
app.use(helmet());

// Pino  Middleware
app.use(logger);

// JSON  Middleware
app.use(express.json());

// CORS  Middleware
app.use(cors());
app.use(cookieParser());

// Time log  Middleware
app.use((req, res, next) => {
  console.log(`Time: ${new Date().toLocaleString()}`);
  next();
});

// Routers Middleware
app.use(authRoutes);
app.use(notesRoutes);

// Not found Middleware
app.use(notFoundHandler);

// validation errors
app.use(errors());

// Any errors Middleware
app.use(errorHandler);

await connectMongoDB();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
