import express, { Application } from "express";
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import cookieParser from "cookie-parser";
import { Server } from "socket.io";
import connectDB from './src/config/db';
import authRoutes from './src/routes/auth/authRoutes';
import boxRoutes from './src/routes/box/box.routes';
import profileRoutes from './src/routes/auth/profile.routes'
import adminRoutes from './src/routes/admin/adminRoutes';
import { setupSocketHandlers } from './src/socket/socketHandler';
import { ErrorHandler } from './src/middlewares/errorHandler.middleware';

dotenv.config();

const app: Application = express();
const httpServer = createServer(app); 

const io = new Server(httpServer, {
    cors: {
        origin: [
            process.env.FRONTEND_URL || 'http://localhost:5173',
            process.env.FRONTEND_URL_ALT || 'http://localhost:5174'
        ], 
        methods: ['GET', 'POST'],
        credentials: true
    },
    allowEIO3: true
});

const PORT = process.env.PORT || 5000;

connectDB();

// Middleware
app.use(cookieParser())
app.use(cors({
    origin: [
        process.env.FRONTEND_URL || 'http://localhost:5173',
        process.env.FRONTEND_URL_ALT || 'http://localhost:5174'
    ],
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(express.json());

// Routes
app.get('/', (_req, res) => {
    res.send('StreamDrop API is running....');
});

app.use('/api/auth', authRoutes);
app.use('/api/box', boxRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/profile', profileRoutes);

// 404 Handler - Must be after all routes
app.use(ErrorHandler.notFound);

// Global Error Handler - Must be last
app.use(ErrorHandler.handle);

setupSocketHandlers(io);

httpServer.listen(PORT, () => {
    console.log(` Server is running on http://localhost:${PORT}`);
});