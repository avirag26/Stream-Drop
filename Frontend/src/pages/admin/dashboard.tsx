import React from 'react';
import Layout from '../../components/admin/Layout';

const AdminDashboard: React.FC = () => {
  return (
    <Layout>
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">OPERATIONAL INSIGHTS</h1>
            <p className="text-gray-400 text-sm">SYSTEM MONITORING & USER MANAGEMENT</p>
          </div>
          <div className="flex space-x-3">
            <button className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg text-sm hover:bg-gray-700 transition-colors">
              REAL-TIME DATA
            </button>
            <button className="px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm hover:bg-cyan-500 transition-colors">
              EXPORT REPORT
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Transfers */}
          <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-400 text-sm font-medium">TOTAL TRANSFERS</h3>
              <span className="text-green-400 text-xs font-bold">+12%</span>
            </div>
            <div className="text-3xl font-bold text-white mb-2">842,931</div>
            <div className="text-gray-500 text-xs">ALL TIME</div>
          </div>

          {/* Active Users */}
          <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-400 text-sm font-medium">ACTIVE USERS</h3>
              <span className="text-green-400 text-xs font-bold">+5.4%</span>
            </div>
            <div className="text-3xl font-bold text-white mb-2">1,248</div>
            <div className="text-gray-500 text-xs">ONLINE NOW</div>
          </div>

          {/* System Health */}
          <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-400 text-sm font-medium">SYSTEM HEALTH</h3>
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative w-16 h-16">
                <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#374151"
                    strokeWidth="2"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#06b6d4"
                    strokeWidth="2"
                    strokeDasharray="42.8, 100"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-sm font-bold">42.8</span>
                </div>
              </div>
              <div className="text-gray-400 text-xs">
                <div>CPU: 23%</div>
                <div>MEM: 45%</div>
                <div>NET: 12%</div>
              </div>
            </div>
          </div>

          {/* Storage Usage */}
          <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-400 text-sm font-medium">STORAGE</h3>
              <span className="text-cyan-400 text-xs font-bold">OPTIMAL</span>
            </div>
            <div className="text-3xl font-bold text-white mb-2">85.2%</div>
            <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
              <div 
                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: '85.2%' }}
              ></div>
            </div>
            <div className="text-gray-500 text-xs">2.1TB / 2.5TB USED</div>
          </div>
        </div>

        {/* User Activity Table */}
        <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">USERS NEEDING ATTENTION</h2>
              <p className="text-gray-400 text-sm">SECURITY & COMPLIANCE MONITORING</p>
            </div>
            <div className="flex space-x-3">
              <button className="px-3 py-1 bg-gray-700 text-gray-300 rounded-lg text-xs hover:bg-gray-600 transition-colors">
                FILTER
              </button>
              <button className="px-3 py-1 bg-cyan-600 text-white rounded-lg text-xs hover:bg-cyan-500 transition-colors">
                ALL ACTIONS
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left text-gray-400 text-xs font-medium py-3 px-4">USER</th>
                  <th className="text-left text-gray-400 text-xs font-medium py-3 px-4">FLAGGED ACTIVITY</th>
                  <th className="text-left text-gray-400 text-xs font-medium py-3 px-4">LAST ACTIVITY</th>
                  <th className="text-left text-gray-400 text-xs font-medium py-3 px-4">STATUS</th>
                  <th className="text-left text-gray-400 text-xs font-medium py-3 px-4">ACTION</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-800/50 hover:bg-gray-800/20 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">MT</span>
                      </div>
                      <div>
                        <div className="text-white font-medium text-sm">Marcus Thorne</div>
                        <div className="text-gray-400 text-xs">marcus@example.com</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-gray-300 text-sm">Terms of Service Violation (DMCA)</div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-gray-400 text-sm">2024-01-30 14:23</div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-2 py-1 rounded-full text-xs font-medium text-green-400 bg-green-400/10">
                      CONNECTED
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <button className="px-3 py-1 rounded-lg text-xs font-medium border transition-colors text-blue-400 bg-blue-400/10 border-blue-400/30">
                      REVIEW
                    </button>
                  </td>
                </tr>

                <tr className="border-b border-gray-800/50 hover:bg-gray-800/20 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">VP</span>
                      </div>
                      <div>
                        <div className="text-white font-medium text-sm">Victor Petrov</div>
                        <div className="text-gray-400 text-xs">victor@example.com</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-gray-300 text-sm">Multiple Failed Auth Attempts (IP: 192.168.1.1)</div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-gray-400 text-sm">2024-01-30 13:45</div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-2 py-1 rounded-full text-xs font-medium text-yellow-400 bg-yellow-400/10">
                      SECURITY REVIEW
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <button className="px-3 py-1 rounded-lg text-xs font-medium border transition-colors text-yellow-400 bg-yellow-400/10 border-yellow-400/30">
                      ALERT
                    </button>
                  </td>
                </tr>

                <tr className="border-b border-gray-800/50 hover:bg-gray-800/20 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">SJ</span>
                      </div>
                      <div>
                        <div className="text-white font-medium text-sm">Sarah Jenkins</div>
                        <div className="text-gray-400 text-xs">sarah@example.com</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-gray-300 text-sm">Account flagged • 100 Days</div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-gray-400 text-sm">2024-01-29 09:12</div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-2 py-1 rounded-full text-xs font-medium text-red-400 bg-red-400/10">
                      SUSPENDED
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <button className="px-3 py-1 rounded-lg text-xs font-medium border transition-colors text-red-400 bg-red-400/10 border-red-400/30">
                      RESTRICTED
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;