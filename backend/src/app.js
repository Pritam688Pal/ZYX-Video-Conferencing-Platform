import express from 'express';
import { createServer } from 'http';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import connectSocketServer from './controllers/socketManager.js';
import userRoutes from './routes/users.routes.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Setup app port FIRST
app.set('port', process.env.PORT || 3000);

// Setup CORS config
const corsOptions = {
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
};

// Apply middleware BEFORE Socket.IO
app.use(cors(corsOptions));
app.use(express.json({limit: '100kb'}));
app.use(express.urlencoded({limit: '100kb', extended: true }));
app.use(cookieParser());

// Apply routes BEFORE Socket.IO
app.use('/api/users', userRoutes);

// Initialize Socket.IO AFTER middleware
const io = connectSocketServer(httpServer);

// Verify Socket.IO is working
app.get('/health', (req, res) => {
  res.json({ status: 'ok', socketio: 'connected' });
});

// Start server
httpServer.listen(app.get("port"), () => {
  console.log('Server is running on port ' + app.get("port"));
  console.log('Socket.IO is ready at /', app.get("port"));
  const dbURL = process.env.MONGO_URI;
  mongoose.connect(dbURL)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));
});

export default app;