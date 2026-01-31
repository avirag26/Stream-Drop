import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

class SocketService {
    public socket: Socket | null = null;
    private currentRoom: string | null = null;
    private currentUser: string | null = null;

    connect() {
        this.socket = io(SOCKET_URL, {
            withCredentials: true
        });
        
        this.socket.on('connect', () => {
            console.log('Connected to StreamDrop:', this.socket?.id);
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from StreamDrop');
        });
    }

    joinRoom(roomId: string, userName: string) {
        if (this.socket) {
            this.currentRoom = roomId;
            this.currentUser = userName;
            this.socket.emit('join_room', { roomId, userName });
        }
    }

    sendMessage(roomId: string, message: string, sender: string) {
        if (this.socket) {
            this.socket.emit('send_message', { roomId, message, sender });
        }
    }

    shareFile(roomId: string, fileName: string, fileSize: string, sender: string) {
        if (this.socket) {
            this.socket.emit('file_shared', { roomId, fileName, fileSize, sender });
        }
    }

    startTyping(roomId: string, userName: string) {
        if (this.socket) {
            this.socket.emit('typing_start', { roomId, userName });
        }
    }

    stopTyping(roomId: string, userName: string) {
        if (this.socket) {
            this.socket.emit('typing_stop', { roomId, userName });
        }
    }

    getRoomInfo(roomId: string) {
        if (this.socket) {
            this.socket.emit('get_room_info', roomId);
        }
    }

    // Event listeners
    onMessage(callback: (data: any) => void) {
        if (this.socket) {
            this.socket.on('receive_message', callback);
        }
    }

    onUserJoined(callback: (data: any) => void) {
        if (this.socket) {
            this.socket.on('user_joined_notice', callback);
        }
    }

    onUserLeft(callback: (data: any) => void) {
        if (this.socket) {
            this.socket.on('user_left_notice', callback);
        }
    }

    onUsersUpdated(callback: (data: any) => void) {
        if (this.socket) {
            this.socket.on('users_updated', callback);
        }
    }

    onFileNotification(callback: (data: any) => void) {
        if (this.socket) {
            this.socket.on('file_notification', callback);
        }
    }

    onUserTyping(callback: (data: any) => void) {
        if (this.socket) {
            this.socket.on('user_typing', callback);
        }
    }

    onRoomInfo(callback: (data: any) => void) {
        if (this.socket) {
            this.socket.on('room_info', callback);
        }
    }

    // Clean up listeners
    removeAllListeners() {
        if (this.socket) {
            this.socket.removeAllListeners();
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.currentRoom = null;
            this.currentUser = null;
        }
    }

    getCurrentRoom() {
        return this.currentRoom;
    }

    getCurrentUser() {
        return this.currentUser;
    }
}

const socketService = new SocketService();

export { socketService };
export default socketService;