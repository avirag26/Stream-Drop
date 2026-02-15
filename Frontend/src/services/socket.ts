import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class SocketService {
    public socket: Socket | null = null;
    private currentRoom: string | null = null;
    private currentUser: string | null = null;
    private isConnected: boolean = false;
    private peers: Map<string, RTCPeerConnection> = new Map();
    private dataChannels: Map<string, RTCDataChannel> = new Map();

    private createPeerConnection(remoteSocketId: string) {
        const pc = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });


        pc.onicecandidate = (event) => {
            if (event.candidate && this.socket) {
                this.socket.emit('p2p_ice_candidate', {
                    to: remoteSocketId,
                    candidate: event.candidate
                });
            }
        };


        pc.ondatachannel = (event) => {
            this.setupDataChannel(remoteSocketId, event.channel);
        };

        this.peers.set(remoteSocketId, pc);
        return pc;
    }


    private setupDataChannel(remoteSocketId: string, channel: RTCDataChannel) {
        channel.onopen = () => console.log(`Data Channel open with ${remoteSocketId} `);
        channel.onmessage = (event) => {
            console.log(`P2P Message from ${remoteSocketId}:`, event.data);
            alert(`P2P says: ${event.data}`);
        };
        this.dataChannels.set(remoteSocketId, channel);
    }


    public async initiateP2P(remoteSocketId: string) {
        const pc = this.createPeerConnection(remoteSocketId);

        const channel = pc.createDataChannel("streamDropData");
        this.setupDataChannel(remoteSocketId, channel);

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        this.socket?.emit('p2p_offer', { to: remoteSocketId, offer });
    }

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

        this.socket.on('p2p_offer', async ({ from, offer }) => {
            const pc = this.createPeerConnection(from);
            await pc.setRemoteDescription(new RTCSessionDescription(offer));

            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            this.socket?.emit('p2p_answer', { to: from, answer });
        });


        this.socket.on('p2p_answer', async ({ from, answer }) => {
            const pc = this.peers.get(from);
            if (pc) {
                await pc.setRemoteDescription(new RTCSessionDescription(answer));
            }
        });

        this.socket.on('p2p_ice_candidate', async ({ from, candidate }) => {
            const pc = this.peers.get(from);
            if (pc) {
                await pc.addIceCandidate(new RTCIceCandidate(candidate));
            }
        });
        
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



public sendDirectMessage(remoteSocketId: string, message: string) {
    const channel = this.dataChannels.get(remoteSocketId);
    if (channel && channel.readyState === 'open') {
        channel.send(message);
        console.log(` P2P Sent to ${remoteSocketId}:`, message);
    } else {
        console.warn(` Data Channel to ${remoteSocketId} is not open.`);
    }
}
}

const socketService = new SocketService();

export { socketService };
export default socketService;