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

dotenv.config();

const app: Application = express();
const httpServer = createServer(app); 

const io = new Server(httpServer, {
    cors: {
        origin: "*", 
        methods: ['GET', 'POST'],
        credentials: true
    },
    allowEIO3: true
});

const PORT = process.env.PORT || 5000;

connectDB();
app.use(cookieParser())
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/box', boxRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/profile', profileRoutes);

app.get('/', (_req, res) => {
    res.send('StreamDrop API is running....');
});

setupSocketHandlers(io);

httpServer.listen(PORT, () => {
    console.log(` Server is running on http://localhost:${PORT}`);
});