import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { deleteBox } from '../../store/slice/boxSlice';
import type { RootState, AppDispatch } from '../../store/store';
import { socketService } from '../../services/socket';
import Layout from '../../components/user/Layout';
import api from '../../services/api';
import Toast from '../../components/common/Toast';
import ConfirmModal from '../../components/common/ConfirmModal';

interface Message {
  id: string;
  sender: string;
  message: string;
  time: string;
  isOwn: boolean;
}

interface ConnectedUser {
  id: string;
  name: string;
  status: 'online' | 'streaming';
}

interface BoxData {
  _id: string;
  boxCode: string;
  boxName: string;
  creatorId: string;
  isActive: boolean;
  createdAt: string;
}

const BoxPage: React.FC = () => {
  const { boxCode } = useParams<{ boxCode: string }>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { loading: boxLoading } = useSelector((state: RootState) => state.boxes);
  const dispatch = useDispatch<AppDispatch>();
  const [boxData, setBoxData] = useState<BoxData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [connectedUsers, setConnectedUsers] = useState<ConnectedUser[]>([]);
  const [activeUsers, setActiveUsers] = useState(0);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error', show: boolean}>({
    message: '',
    type: 'success',
    show: false
  });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    const fetchBoxData = async () => {
      if (!boxCode) {
        setError('No box code provided');
        setLoading(false);
        return;
      }

      try {
        const response = await api.get(`/box/${boxCode}`);
        if (response.data.success) {
          setBoxData(response.data.data);
        } else {
          setError('Box not found');
        }
      } catch (error: any) {
        console.error('Error fetching box data:', error);
        setError(error.response?.data?.message || 'Failed to load box');
      } finally {
        setLoading(false);
      }
    };

    fetchBoxData();
  }, [boxCode]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }


    const connectSocket = async () => {
      await socketService.connect();
    };
    
    connectSocket();

    return () => {
      socketService.removeAllListeners();
      socketService.disconnect();
    };
  }, [user, navigate]);

  useEffect(() => {
    if (!boxCode || !user || !boxData) return;

    console.log('🚪 Attempting to join room:', boxCode, 'as user:', user.name);
    

    const joinRoom = async () => {
    
      if (!socketService.isSocketConnected()) {
        await socketService.connect();
      }
      
  
      socketService.joinRoom(boxCode, user.name);
    };
    
    joinRoom();

  
    socketService.onMessage((data: any) => {
      console.log(' Message received in component:', data);
      const newMsg: Message = {
        id: data.id || `${Date.now()}-${Math.random()}`,
        sender: data.sender,
        message: data.message,
        time: data.time,
        isOwn: data.sender === user.name
      };
      console.log('📨 Adding message to state:', newMsg);
      setMessages(prev => [...prev, newMsg]);
    });

    socketService.onUserJoined((data: any) => {
      const joinMsg: Message = {
        id: `join-${Date.now()}-${Math.random()}`,
        sender: 'System',
        message: data.message,
        time: data.time,
        isOwn: false
      };
      setMessages(prev => [...prev, joinMsg]);
    });

    socketService.onUserLeft((data: any) => {
      const leaveMsg: Message = {
        id: `leave-${Date.now()}-${Math.random()}`,
        sender: 'System',
        message: data.message,
        time: data.time,
        isOwn: false
      };
      setMessages(prev => [...prev, leaveMsg]);
    });

    socketService.onUsersUpdated((data: any) => {
      setConnectedUsers(data.users);
      setActiveUsers(data.count);
    });

    
    return () => {
      socketService.removeAllListeners();
    };
  }, [boxCode, user, boxData]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !boxCode || !user) return;

    socketService.sendMessage(boxCode, newMessage, user.name);
    setNewMessage('');
  };

  const handleCloseBox = async () => {
    if (!boxCode || !user || !boxData) return;
    
    try {
      if (boxData?.creatorId === user.id) {
        // Use Redux action to delete the box
        await dispatch(deleteBox(boxData._id)).unwrap();
        setToast({
          message: "Box deleted successfully",
          type: 'success',
          show: true
        });
        navigate('/dashboard');
      } else {
        // Regular users just leave the box
        socketService.disconnect();
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('Error closing box:', error);
      setToast({
        message: error || "Failed to delete box",
        type: 'error',
        show: true
      });
    }
  };

  const handleCloseBoxClick = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmClose = () => {
    setShowConfirmModal(false);
    handleCloseBox();
  };

  const handleCancelClose = () => {
    setShowConfirmModal(false);
  };

  const copyBoxLink = () => {
    const link = `http://localhost:5173/box/${boxCode}`;
    navigator.clipboard.writeText(link);
    setToast({
      message: "Box link copied to clipboard!",
      type: 'success',
      show: true
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white">Loading box...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Error state
  if (error || !boxData) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Box Not Found</h2>
            <p className="text-gray-400 mb-4">{error || 'The requested box could not be found.'}</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-900 flex">
        {/* Left Sidebar - Connected Users */}
        <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-white font-semibold text-sm">CONNECTED PEERS</h2>
            <div className="flex items-center mt-2">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
              <span className="text-gray-400 text-xs">{connectedUsers.length} online</span>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {connectedUsers.length > 0 ? (
              connectedUsers.map((connectedUser) => (
                <div key={connectedUser.id} className="flex items-center p-3 hover:bg-gray-700 transition-colors">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-xs font-bold">
                      {connectedUser.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="text-white text-sm font-medium">{connectedUser.name}</div>
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-1 ${connectedUser.status === 'online' ? 'bg-green-400' : 'bg-blue-400'}`}></div>
                      <span className="text-gray-400 text-xs capitalize">{connectedUser.status}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-32">
                <div className="text-center">
                  <div className="text-gray-500 text-sm">Waiting for users to join...</div>
                  <div className="text-gray-600 text-xs mt-1">Share the box code to invite others</div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-700">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{activeUsers || connectedUsers.length}</div>
              <div className="text-gray-400 text-xs">Active in Box</div>
            </div>
            <div className="mt-2 text-center">
              <div className="text-lg font-bold text-cyan-400">0.0</div>
              <div className="text-gray-400 text-xs">MB/sec</div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-blue-500 rounded mr-3 flex items-center justify-center">
                <span className="text-white text-xs font-bold">#</span>
              </div>
              <div>
                <h1 className="text-white font-semibold">Box #{boxData.boxCode}</h1>
                <div className="flex items-center text-xs text-gray-400">
                  <div className={`w-2 h-2 rounded-full mr-1 ${boxData.isActive ? 'bg-green-400' : 'bg-red-400'}`}></div>
                  {boxData.boxName} • {boxData.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button className="text-gray-400 hover:text-white transition-colors">
                <span className="text-sm">Settings</span>
              </button>
              <button 
                onClick={copyBoxLink}
                className="px-3 py-1 bg-gray-700 text-gray-300 rounded text-sm hover:bg-gray-600 transition-colors"
              >
                Copy Link
              </button>
              <button 
                onClick={handleCloseBoxClick}
                disabled={boxLoading}
                className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {boxLoading ? 'Processing...' : (boxData?.creatorId === user?.id ? 'Close Box' : 'Leave Box')}
              </button>
            </div>
          </div>

          {/* Files and Chat Area */}
          <div className="flex-1 flex">
            {/* Main Content Area */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-4.906-1.405l-3.181 3.181L3.5 20.5L4.914 19.086l3.181-3.181A8.959 8.959 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
                    </svg>
                  </div>
                  <h3 className="text-white font-medium mb-2">StreamDrop Chat Room</h3>
                  <p className="text-gray-400 text-sm">Real-time messaging with connected users</p>
                </div>
              </div>

              {/* Drop Zone */}
              <div className="mt-8 border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-gray-500 transition-colors">
                <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-4.906-1.405l-3.181 3.181L3.5 20.5L4.914 19.086l3.181-3.181A8.959 8.959 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
                  </svg>
                </div>
                <h3 className="text-white font-medium mb-2">Chat Room Active</h3>
                <p className="text-gray-400 text-sm">Connected with {activeUsers || connectedUsers.length} users in this box</p>
              </div>
            </div>

            {/* Chat Section */}
            <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
              <div className="p-4 border-b border-gray-700">
                <h3 className="text-white font-semibold text-sm">CHAT</h3>
                <p className="text-gray-400 text-xs">Real-time messaging</p>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-96">
                {messages.length > 0 ? (
                  messages.map((message) => (
                    <div key={message.id} className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs break-words ${message.isOwn ? 'bg-blue-600' : message.sender === 'System' ? 'bg-gray-700' : 'bg-gray-700'} rounded-lg p-3`}>
                        {!message.isOwn && message.sender !== 'System' && (
                          <div className="text-xs text-gray-300 mb-1 truncate">{message.sender}</div>
                        )}
                        <div className="text-white text-sm break-words whitespace-pre-wrap">{message.message}</div>
                        <div className="text-xs text-gray-300 mt-1">{message.time}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-32">
                    <div className="text-center">
                      <div className="text-gray-500 text-sm">No messages yet</div>
                      <div className="text-gray-600 text-xs mt-1">Start a conversation with connected users</div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700">
                <div className="flex space-x-2">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                    placeholder="Type a message... "
                    className="flex-1 bg-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none min-h-[40px] max-h-[120px] overflow-y-auto"
                    rows={1}
                    style={{
                      height: 'auto',
                      minHeight: '40px',
                      maxHeight: '120px'
                    }}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = 'auto';
                      target.style.height = Math.min(target.scrollHeight, 120) + 'px';
                    }}
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors self-end"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Toast Component */}
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={toast.show}
          onClose={() => setToast(prev => ({ ...prev, show: false }))}
        />

        {/* Confirm Modal */}
        <ConfirmModal
          isOpen={showConfirmModal}
          title={boxData?.creatorId === user?.id ? "Close Box" : "Leave Box"}
          message={
            boxData?.creatorId === user?.id 
              ? "Are you sure you want to close this box? This will permanently delete the box and disconnect all users."
              : "Are you sure you want to leave this box? You can rejoin using the box code."
          }
          confirmText={boxData?.creatorId === user?.id ? "Close Box" : "Leave Box"}
          cancelText="Cancel"
          onConfirm={handleConfirmClose}
          onCancel={handleCancelClose}
          type="danger"
        />
      </div>
    </Layout>
  );
};

export default BoxPage;