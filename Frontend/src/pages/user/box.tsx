import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import { socketService } from '../../services/socket';
import Layout from '../../components/user/Layout';
import api from '../../services/api';

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

interface FileItem {
  id: string;
  name: string;
  size: string;
  type: 'document' | 'image' | 'video' | 'archive';
  status: 'streaming' | 'available' | 'downloading';
  sender: string;
  preview?: string;
}

interface BoxData {
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
  
  const [boxData, setBoxData] = useState<BoxData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [connectedUsers, setConnectedUsers] = useState<ConnectedUser[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [activeUsers, setActiveUsers] = useState(0);
  const [transferRate, setTransferRate] = useState('0.0');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch box data from backend
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

    if (!boxData) return;

    // Connect to socket and join room
    socketService.connect();
    if (boxCode && user.name) {
      socketService.joinRoom(boxCode, user.name);
    }

    // Set up event listeners
    socketService.onMessage((data: any) => {
      const newMsg: Message = {
        id: data.id || Date.now().toString(),
        sender: data.sender,
        message: data.message,
        time: data.time,
        isOwn: data.sender === user.name
      };
      setMessages(prev => [...prev, newMsg]);
    });

    socketService.onUserJoined((data: any) => {
      const joinMsg: Message = {
        id: Date.now().toString(),
        sender: 'System',
        message: data.message,
        time: data.time,
        isOwn: false
      };
      setMessages(prev => [...prev, joinMsg]);
    });

    socketService.onUserLeft((data: any) => {
      const leaveMsg: Message = {
        id: Date.now().toString(),
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

    socketService.onFileNotification((data: any) => {
      const fileMsg: Message = {
        id: Date.now().toString(),
        sender: 'System',
        message: data.message,
        time: data.time,
        isOwn: false
      };
      setMessages(prev => [...prev, fileMsg]);

      // Add file to files list
      const newFile: FileItem = {
        id: Date.now().toString(),
        name: data.fileName,
        size: data.fileSize,
        type: getFileType(data.fileName),
        status: 'available',
        sender: data.sender
      };
      setFiles(prev => [...prev, newFile]);
    });

    return () => {
      socketService.removeAllListeners();
      socketService.disconnect();
    };
  }, [boxCode, user, navigate, boxData]);

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
    if (!boxCode || !user) return;
    
    if (window.confirm('Are you sure you want to close this box? This will disconnect all users.')) {
      try {
        // Only allow the creator to close the box
        if (boxData?.creatorId === user.id) {
          // In a real implementation, you'd call an API to close the box
          // await api.delete(`/box/${boxCode}`);
          navigate('/dashboard');
        } else {
          // Regular users just leave the box
          socketService.disconnect();
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Error closing box:', error);
      }
    }
  };

  const copyBoxLink = () => {
    const link = `${window.location.origin}/box/${boxCode}`;
    navigator.clipboard.writeText(link);
    // You could add a toast notification here
  };

  const getFileType = (fileName: string): 'document' | 'image' | 'video' | 'archive' => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension || '')) {
      return 'image';
    } else if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'].includes(extension || '')) {
      return 'video';
    } else if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension || '')) {
      return 'archive';
    } else {
      return 'document';
    }
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0 && boxCode && user) {
      Array.from(selectedFiles).forEach(file => {
        const fileSize = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
        const fileType = getFileType(file.name);
        
        const newFile: FileItem = {
          id: Date.now().toString() + Math.random(),
          name: file.name,
          size: fileSize,
          type: fileType,
          status: 'streaming',
          sender: user.name
        };
        
        setFiles(prev => [...prev, newFile]);
        
        // Notify other users about the file
        socketService.shareFile(boxCode, file.name, fileSize, user.name);
        
        // Simulate transfer rate update
        const randomRate = (Math.random() * 2 + 0.5).toFixed(1);
        setTransferRate(randomRate);
      });
    }
  };

  // Loading state
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

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'document':
        return (
          <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'archive':
        return (
          <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
            </svg>
          </div>
        );
      case 'image':
        return (
          <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-12 h-12 bg-gray-500 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
            </svg>
          </div>
        );
    }
  };

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
              <div className="text-lg font-bold text-cyan-400">{transferRate}</div>
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
                onClick={handleCloseBox}
                className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-500 transition-colors"
              >
                {boxData?.creatorId === user?.id ? 'Close Box' : 'Leave Box'}
              </button>
            </div>
          </div>

          {/* Files and Chat Area */}
          <div className="flex-1 flex">
            {/* Files Section */}
            <div className="flex-1 p-6 overflow-y-auto">
              {files.length > 0 ? (
                <div className="space-y-4">
                  {files.map((file) => (
                    <div key={file.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                      <div className="flex items-start space-x-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">
                              {file.sender.split(' ')[0][0]}
                            </span>
                          </div>
                          <span className="text-gray-400 text-sm">{file.sender}</span>
                        </div>
                      </div>
                      
                      <div className="mt-3 flex items-center space-x-4">
                        {getFileIcon(file.type)}
                        <div className="flex-1">
                          <h3 className="text-white font-medium">{file.name}</h3>
                          <p className="text-gray-400 text-sm">{file.size} • {file.type.toUpperCase()} Document</p>
                          
                          <div className="flex items-center mt-2 space-x-2">
                            {file.status === 'streaming' && (
                              <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-500 transition-colors">
                                Streaming
                              </button>
                            )}
                            {file.status === 'available' && (
                              <button className="px-3 py-1 bg-gray-700 text-gray-300 rounded text-sm hover:bg-gray-600 transition-colors flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Download
                              </button>
                            )}
                            <button className="p-1 text-gray-400 hover:text-white transition-colors">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        
                        {file.preview && file.type === 'image' && (
                          <div className="relative">
                            <img 
                              src={file.preview} 
                              alt={file.name}
                              className="w-32 h-20 object-cover rounded-lg"
                            />
                            <button className="absolute bottom-2 right-2 px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-500 transition-colors">
                              View
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <h3 className="text-white font-medium mb-2">No files shared yet</h3>
                    <p className="text-gray-400 text-sm">Upload files to start sharing with connected users</p>
                  </div>
                </div>
              )}

              {/* Drop Zone */}
              <div className="mt-8 border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-gray-500 transition-colors">
                <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <h3 className="text-white font-medium mb-2">Drop files here to stream</h3>
                <p className="text-gray-400 text-sm">Streaming to {activeUsers || connectedUsers.length} users in this box</p>
                <button 
                  onClick={handleFileUpload}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors"
                >
                  Select Files
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            </div>

            {/* Chat Section */}
            <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
              <div className="p-4 border-b border-gray-700">
                <h3 className="text-white font-semibold text-sm">CHAT</h3>
                <p className="text-gray-400 text-xs">Real-time messaging</p>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length > 0 ? (
                  messages.map((message) => (
                    <div key={message.id} className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs ${message.isOwn ? 'bg-blue-600' : message.sender === 'System' ? 'bg-gray-700' : 'bg-gray-700'} rounded-lg p-3`}>
                        {!message.isOwn && message.sender !== 'System' && (
                          <div className="text-xs text-gray-300 mb-1">{message.sender}</div>
                        )}
                        <div className="text-white text-sm">{message.message}</div>
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
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
      </div>
    </Layout>
  );
};

export default BoxPage;