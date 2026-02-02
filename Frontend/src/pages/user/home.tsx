import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Layout from '../../components/user/Layout';
import api from '../../services/api';
import Toast from '../../components/common/Toast';
import type { RootState } from '../../store/store';
import { Loader2, Plus, ArrowRight, ShieldCheck, Zap, Globe } from 'lucide-react';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user, token } = useSelector((state: RootState) => state.auth);
  
  
  const [joinCode, setJoinCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error', show: boolean}>({
    message: '',
    type: 'success',
    show: false
  });


  const handleCreateBox = () => {
    if (user && token) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };


  const handleJoinBox = async (e: React.FormEvent) => {
    e.preventDefault();
    if (joinCode.length < 6) {
      setToast({
        message: "Please enter a 6-digit code",
        type: 'error',
        show: true
      });
      return;
    }

    setIsJoining(true);
    try {
      const response = await api.get(`/box/${joinCode}`);
      if (response.data.success) {
        navigate(`/box/${joinCode.toUpperCase()}`);
      }
    } catch (error: any) {
      setToast({
        message: error.response?.data?.message || "Invalid or expired box code.",
        type: 'error',
        show: true
      });
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <Layout>
      <div className="bg-gray-900 min-h-screen">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto px-4 py-16">
          
          {/* Top Badge */}
          <div className="flex justify-center mb-12">
            <div className="bg-blue-600/10 border border-blue-500/20 rounded-full px-4 py-2 backdrop-blur-sm">
              <span className="text-blue-400 text-[10px] font-black tracking-[0.3em] uppercase">
                ⚡ StreamDrop Command Center
              </span>
            </div>
          </div>

          {/* Main Hero Header */}
          <div className="text-center mb-12">
            <h1 className="text-6xl font-black text-white mb-6 tracking-tight">
              Share Files. <span className="text-blue-500">Instantly.</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
              The high-performance P2P bridge for developers and creators. 
              Stream data directly between devices with zero cloud storage latency.
            </p>

            {/* Main Action Area */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              
              {/* Create Box Button */}
              <button 
                onClick={handleCreateBox}
                className="group relative bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl flex items-center space-x-3 transition-all shadow-xl shadow-blue-600/20 font-bold overflow-hidden"
              >
                <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                <span>Create a Box</span>
              </button>

              {/* Join Box Form */}
              <form 
                onSubmit={handleJoinBox} 
                className="flex items-center space-x-3 bg-gray-800/50 backdrop-blur-md border border-gray-700 p-1.5 pl-5 rounded-2xl focus-within:border-blue-500 transition-all w-full sm:w-auto"
              >
                <input 
                  type="text" 
                  maxLength={6}
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="CODE" 
                  className="bg-transparent text-white py-2 focus:outline-none w-24 font-mono font-bold tracking-[0.2em] placeholder-gray-700"
                />
                <button 
                  type="submit"
                  disabled={isJoining}
                  className="bg-gray-700 hover:bg-blue-600 text-white p-3 rounded-xl transition-all disabled:opacity-50"
                >
                  {isJoining ? (
                    <Loader2 className="animate-spin w-5 h-5" />
                  ) : (
                    <ArrowRight size={20} />
                  )}
                </button>
              </form>
            </div>

            {/* Feature Highlights */}
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div className="bg-gray-800/20 border border-gray-800/50 p-6 rounded-2xl">
                <ShieldCheck className="text-blue-500 mb-4" size={24} />
                <h3 className="text-white font-bold mb-2">P2P Encryption</h3>
                <p className="text-gray-500 text-xs leading-relaxed">
                  Direct device-to-device transfer using AES-256. Files never touch our disks.
                </p>
              </div>
              
              <div className="bg-gray-800/20 border border-gray-800/50 p-6 rounded-2xl">
                <Zap className="text-yellow-500 mb-4" size={24} />
                <h3 className="text-white font-bold mb-2">Zero Latency</h3>
                <p className="text-gray-500 text-xs leading-relaxed">
                  Start downloading the first byte immediately. No waiting for uploads to finish.
                </p>
              </div>

              <div className="bg-gray-800/20 border border-gray-800/50 p-6 rounded-2xl">
                <Globe className="text-green-500 mb-4" size={24} />
                <h3 className="text-white font-bold mb-2">Universal Access</h3>
                <p className="text-gray-500 text-xs leading-relaxed">
                  Receivers join via simple 6-digit codes. No registration or app install required.
                </p>
              </div>
            </div>
          </div>

          {/* Live Status Card */}
          
          <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-3xl p-8 mt-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-left">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                  <span className="text-green-400 text-[10px] font-bold uppercase tracking-widest">Network Active</span>
                </div>
                <h4 className="text-white text-xl font-bold mb-1">Secure P2P Bridge</h4>
                <p className="text-gray-400 text-sm">Join the next generation of data streaming.</p>
              </div>
              <div className="flex items-center gap-8">
                <div className="text-center">
                  <div className="text-white text-2xl font-black font-mono">0.0</div>
                  <div className="text-gray-600 text-[10px] font-bold uppercase tracking-tighter">TB Shared</div>
                </div>
                <div className="h-10 w-[1px] bg-gray-800"></div>
                <button className="bg-white text-black px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors">
                  View Docs
                </button>
              </div>
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
      </div>
    </Layout>
  );
};

export default Home;