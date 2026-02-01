import React, { useState, useEffect } from 'react';
import Layout from '../../components/user/Layout';
import api from '../../services/api'; 
import { Loader2, Check, Copy, Globe, Lock, Play } from 'lucide-react';
import Toast from '../../components/common/Toast';

const Dashboard: React.FC = () => {
  const [boxName, setBoxName] = useState('');
  const [securityMode, setSecurityMode] = useState('Public');
  const [loading, setLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [generatedBoxName, setGeneratedBoxName] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error', show: boolean}>({
    message: '',
    type: 'success',
    show: false
  });


  const handleStartStreaming = async () => {
    if (loading) return;
    
    if (!boxName.trim()) {
      setToast({
        message: "Please enter a box name",
        type: 'error',
        show: true
      });
      return;
    }
    
    setLoading(true);
    try {
     
      const response = await api.post('/box/create', {
        boxName: boxName.trim()
      });
      
      if (response.data.success) {
        setGeneratedCode(response.data.data.boxCode);
        setGeneratedBoxName(response.data.data.boxName);
        setToast({
          message: `Box "${response.data.data.boxName}" created successfully!`,
          type: 'success',
          show: true
        });
      }
    } catch (error: any) {
      console.error("Creation Error:", error);
      setToast({
        message: error.response?.data?.message || "Failed to create box. Please try again.",
        type: 'error',
        show: true
      });
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    if (!generatedCode) return;
    const link = `streamdrop.com/box/${generatedCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setToast({
      message: "Box link copied to clipboard!",
      type: 'success',
      show: true
    });
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(()=>{
    const resumeSession = async ()=>{
      try {
        const response = await api.get('/box/latest');
        console.log("response",response)
        if(response.data.success){
          setGeneratedCode(response.data.data.boxCode)
          setGeneratedBoxName(response.data.data.boxName)
        }
      } catch (error) {
        console.log("No active session to resume.");
      }
    }
    resumeSession()
  },[])
  return (
    <Layout>
      <div className="bg-gray-900 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Left Side - Quick Create Box */}
            <div className="lg:col-span-1">
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 sticky top-8">
                <div className="flex items-center space-x-2 mb-6">
                  <div className="w-5 h-5 bg-blue-500 rounded flex items-center justify-center">
                    <Play className="w-3 h-3 text-white fill-current" />
                  </div>
                  <h2 className="text-white font-semibold uppercase tracking-tight text-sm">Quick Create Box</h2>
                </div>

                {/* Box Name */}
                <div className="mb-6">
                  <label className="block text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-widest">
                    BOX NAME
                  </label>
                  <input
                    type="text"
                    value={boxName}
                    onChange={(e) => setBoxName(e.target.value)}
                    placeholder="e.g. Design Assets Q4"
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>

                {/* Security Mode */}
                <div className="mb-6">
                  <label className="block text-[10px] font-bold text-gray-500 mb-3 uppercase tracking-widest">
                    SECURITY MODE
                  </label>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setSecurityMode('Public')}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                        securityMode === 'Public' ? 'bg-blue-600 text-white' : 'bg-gray-700/30 text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      <Globe size={14} /> Public
                    </button>
                    <button
                      onClick={() => setSecurityMode('Private')}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                        securityMode === 'Private' ? 'bg-blue-600 text-white' : 'bg-gray-700/30 text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      <Lock size={14} /> Private
                    </button>
                  </div>
                </div>

                {/* Share Link Preview */}
                <div className="mb-6">
                  <label className="block text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-widest">
                    SHARE LINK PREVIEW
                  </label>
                  <div 
                    onClick={copyLink}
                    className="bg-gray-900/80 border border-gray-700/50 rounded-lg p-3 cursor-pointer group hover:border-blue-500/50 transition-all"
                  >
                    <div className="flex justify-between items-center">
                      <div className={`${generatedCode ? 'text-green-400' : 'text-yellow-500/70'} text-[10px] font-bold flex items-center gap-1`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${generatedCode ? 'bg-green-400 animate-pulse' : 'bg-yellow-500'}`}></div>
                        {generatedCode ? 'LIVE' : 'PENDING GENERATION'}
                      </div>
                      {generatedCode && (
                         copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} className="text-gray-500 group-hover:text-blue-400" />
                      )}
                    </div>
                    <div className="text-gray-400 text-xs mt-1 font-mono truncate">
                      {generatedCode ? `streamdrop.com/box/${generatedCode}` : '---'}
                    </div>
                    
                  </div>
                
                </div>

                {/* Start Streaming Button */}
                <button 
                  onClick={handleStartStreaming}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white py-4 px-4 rounded-xl font-bold transition-all flex items-center justify-center space-x-2 shadow-lg hover:shadow-blue-500/20 mb-4"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      <span>{generatedCode ? 'Regenerate Code' : 'Start Streaming'}</span>
                    </>
                  )}
                </button>

                {/* Go Pro Banner */}
                <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl p-4 mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center">
                      <span className="text-yellow-500 text-xs font-black">PRO</span>
                    </div>
                    <div>
                      <div className="text-yellow-500 font-bold text-[11px] uppercase">Upgrade to Pro</div>
                      <div className="text-gray-500 text-[10px]">Unlimited cloud backup & no limits</div>
                    </div>
                  </div>
                </div>

                {/* Join Box Section */}
                <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-4">
                  <h3 className="text-white font-semibold text-sm mb-3 uppercase tracking-tight">Join Existing Box</h3>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Enter box code..."
                      className="flex-1 px-3 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-600 text-sm focus:outline-none focus:border-blue-500 transition-all"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const target = e.target as HTMLInputElement;
                          if (target.value.trim()) {
                            window.location.href = `/box/${target.value.trim()}`;
                          }
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        const input = document.querySelector('input[placeholder="Enter box code..."]') as HTMLInputElement;
                        if (input?.value.trim()) {
                          window.location.href = `/box/${input.value.trim()}`;
                        }
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors text-sm font-medium"
                    >
                      Join
                    </button>
                  </div>
                  <p className="text-gray-500 text-xs mt-2">Enter a box code to join an existing file sharing session</p>
                </div>
              </div>
            </div>

            {/* Right Side - Active Boxes */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-black text-white mb-1">Active Boxes</h1>
                  <p className="text-gray-500 text-sm">Real-time P2P streams linked to your account.</p>
                </div>
              </div>

                {/* Active Boxes List */}
              <div className="space-y-4">
                {/* Logic Tip: You would map over a 'boxes' state array here */}
                <div className="bg-gray-800/30 border border-gray-800 rounded-2xl p-5 hover:border-blue-500/30 transition-all cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                        <Globe className="text-blue-500 w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-lg">
                          {generatedBoxName ? generatedBoxName : 'Waiting for first stream...'}
                        </h3>
                        <div className="flex items-center space-x-3 mt-1">
                          <span className="text-[10px] font-bold text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded uppercase">
                            {generatedCode ? `Code: ${generatedCode}` : 'Encrypted'}
                          </span>
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">0 Watchers Joined</span>
                        </div>
                      </div>
                    </div>
                    {generatedCode && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => window.location.href = `/box/${generatedCode}`}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors text-sm font-medium"
                        >
                          Enter Box
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats Section */}
              <div className="grid grid-cols-3 gap-6 mt-12 border-t border-gray-800 pt-12">
                <div className="text-center">
                  <div className="text-3xl font-black text-white mb-1">0.0</div>
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">GB Transferred</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-black text-white mb-1">0</div>
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Live Connections</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-black text-white mb-1">--</div>
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Active Latency</div>
                </div>
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

export default Dashboard;