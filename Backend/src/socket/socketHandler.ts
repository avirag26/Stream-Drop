import { Server, Socket } from 'socket.io';

interface User {
    id: string;
    name: string;
    socketId: string;
}

interface Room {
    id: string;
    users: User[];
    messages: any[];
}

// In-memory store for active rooms
const rooms: Map<string, Room> = new Map();

export const setupSocketHandlers = (io: Server) => {
    io.on("connection", (socket: Socket) => {
        console.log(`📡 Device connected: ${socket.id}`);
        
        // 1. JOIN ROOM
        socket.on("join_room", (data: { roomId: string, userName: string }) => {
            const { roomId, userName } = data;
            socket.join(roomId);
            
            if (!rooms.has(roomId)) {
                rooms.set(roomId, { id: roomId, users: [], messages: [] });
            }
            
            const room = rooms.get(roomId)!;
            const existingUser = room.users.find(u => u.socketId === socket.id);
            
            if (!existingUser) {
                const newUser: User = { id: socket.id, name: userName, socketId: socket.id };
                room.users.push(newUser);
                
                console.log(`👤 ${userName} joined room: ${roomId}`);
                
                // Notify others in room
                socket.to(roomId).emit("user_joined_notice", {
                    message: `${userName} has entered the drop zone`,
                    userName: userName,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                });
                
                // Sync user list to everyone
                io.to(roomId).emit("users_updated", {
                    users: room.users.map(u => ({ id: u.id, name: u.name })),
                    count: room.users.length
                });
            }
        });

        // 2. CHAT MESSAGES
        socket.on("send_message", (data: { roomId: string, message: string, sender: string }) => {
            const { roomId, message, sender } = data;
            const room = rooms.get(roomId);
            
            if (room) {
                const messageData = {
                    id: Date.now().toString(),
                    message,
                    sender,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                };
                room.messages.push(messageData);
                io.to(roomId).emit("receive_message", messageData);
            }
        });

        // 3. TYPING INDICATORS
        socket.on("typing_start", (data: { roomId: string, userName: string }) => {
            socket.to(data.roomId).emit("user_typing", { userName: data.userName, isTyping: true });
        });

        socket.on("typing_stop", (data: { roomId: string, userName: string }) => {
            socket.to(data.roomId).emit("user_typing", { userName: data.userName, isTyping: false });
        });

        // 4. DISCONNECT LOGIC
        socket.on('disconnect', () => {
            rooms.forEach((room, roomId) => {
                const userIndex = room.users.findIndex(u => u.socketId === socket.id);
                if (userIndex !== -1) {
                    const user = room.users[userIndex];
                    room.users.splice(userIndex, 1);
                    
                    io.to(roomId).emit("user_left_notice", { message: `${user.name} left` });
                    io.to(roomId).emit("users_updated", { users: room.users, count: room.users.length });

                    if (room.users.length === 0) rooms.delete(roomId);
                }
            });
            console.log(`🔌 Disconnected: ${socket.id}`);
        });
    });
};