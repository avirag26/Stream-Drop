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

const rooms: Map<string, Room> = new Map();

export const setupSocketHandlers = (io: Server) => {
    io.on("connection", (socket: Socket) => {
        console.log(`📡 Device connected: ${socket.id}`);

        socket.on("join_room", (data: { roomId: string, userName: string }) => {
            const { roomId, userName } = data;
            socket.join(roomId);

            if (!rooms.has(roomId)) {
                rooms.set(roomId, { id: roomId, users: [], messages: [] });
            }

            const room = rooms.get(roomId)!;
            const newUser: User = { id: socket.id, name: userName, socketId: socket.id };
            room.users.push(newUser);

            // Notify others
            socket.to(roomId).emit("user_joined_notice", {
                message: `${userName} has entered the drop zone`,
                userName: userName,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            });

            // Sync user list
            io.to(roomId).emit("users_updated", {
                users: room.users.map(u => ({ id: u.id, name: u.name, status: 'online' })),
                count: room.users.length
            });
        });

        socket.on("send_message", (data: { roomId: string, message: string, sender: string }) => {
            const messageData = {
                id: Date.now().toString(),
                message: data.message,
                sender: data.sender,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            io.to(data.roomId).emit("receive_message", messageData);
        });

        socket.on("file_shared", (data: { roomId: string, fileName: string, fileSize: string, sender: string }) => {
            // Broadcast to everyone else in the room
            socket.to(data.roomId).emit("file_notification", {
                message: `${data.sender} shared a file`,
                fileName: data.fileName,
                fileSize: data.fileSize,
                sender: data.sender,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            });
        });

        socket.on("typing_start", (data: { roomId: string, userName: string }) => {
            socket.to(data.roomId).emit("user_typing", { userName: data.userName, isTyping: true });
        });

        socket.on("typing_stop", (data: { roomId: string, userName: string }) => {
            socket.to(data.roomId).emit("user_typing", { userName: data.userName, isTyping: false });
        });

        socket.on('disconnect', () => {
            rooms.forEach((room, roomId) => {
                const userIndex = room.users.findIndex(u => u.socketId === socket.id);
                if (userIndex !== -1) {
                    const user = room.users[userIndex];
                    room.users.splice(userIndex, 1);
                    io.to(roomId).emit("user_left_notice", {
                        message: `${user.name} left`,
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    });
                    io.to(roomId).emit("users_updated", { users: room.users, count: room.users.length });
                    if (room.users.length === 0) rooms.delete(roomId);
                }
            });
        });

        // --- WEBRTC SIGNALING HANDLERS ---

        
        socket.on("p2p_offer", (data: { to: string, offer: any }) => {

            socket.to(data.to).emit("p2p_offer", {
                from: socket.id,
                offer: data.offer
            });
        });

        socket.on("p2p_answer", (data: { to: string, answer: any }) => {
            socket.to(data.to).emit("p2p_answer", {
                from: socket.id,
                answer: data.answer
            });
        });

        socket.on("p2p_ice_candidate", (data: { to: string, candidate: any }) => {
            socket.to(data.to).emit("p2p_ice_candidate", {
                from: socket.id,
                candidate: data.candidate
            });
        });
    });
};