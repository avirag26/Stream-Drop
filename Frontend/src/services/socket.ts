import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

class SocketService {
    public socket: Socket | null = null;
    private currentRoom: string | null = null;
    private currentUser: string | null = null;
    private isConnected: boolean = false;

    connect() {
        if (this.socket && this.isConnected) {
            return; // Already connected
        }

        this.socket = io(SOCKET_URL, {
            withCredentials: true,
            transports: ['websocket', 'polling']
        });
        
        this.socket.on('connect', () => {
            console.log('Connected to StreamDrop:', this.socket?.id);
            this.isConnected = true;
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from StreamDrop');
            this.isConnected = false;
        });

        this.socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            this.isConnected = false;
        });

        // Wait for connection before proceeding
        return new Promise<void>((resolve) => {
            if (this.socket) {
                this.socket.on('connect', () => {
                    resolve();
                });
            }
        });
    }

    joinRoom(roomId: string, userName: string) {
        if (this.socket && this.isConnected) {
            this.currentRoom = roomId;
            this.currentUser = userName;
            console.log(`Joining room ${roomId} as ${userName}`);
            this.socket.emit('join_room', { roomId, userName });
        } else {
            console.warn('Socket not connected, cannot join room');
        }
    }

    sendMessage(roomId: string, message: string, sender: string) {
        if (this.socket && this.isConnected) {
            console.log(`Sending message to room ${roomId}:`, message);
            this.socket.emit('send_message', { roomId, message, sender });
        } else {
            console.warn('Socket not connected, cannot send message');
        }
    }

    startTyping(roomId: string, userName: string) {
        if (this.socket && this.isConnected) {
            this.socket.emit('typing_start', { roomId, userName });
        }
    }

    stopTyping(roomId: string, userName: string) {
        if (this.socket && this.isConnected) {
            this.socket.emit('typing_stop', { roomId, userName });
        }
    }

    getRoomInfo(roomId: string) {
        if (this.socket && this.isConnected) {
            this.socket.emit('get_room_info', roomId);
        }
    }

    onMessage(callback: (data: any) => void) {
        if (this.socket) {
            console.log('👂 Setting up message listener');
            this.socket.on('receive_message', (data) => {
                console.log('📥 Received message:', data);
                callback(data);
            });
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
            this.isConnected = false;
        }
    }

    getCurrentRoom() {
        return this.currentRoom;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    isSocketConnected() {
        return this.isConnected;
    }
}

const socketService = new SocketService();

export { socketService };
export default socketService;