import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllUsers, toggleBlockUser } from '../../store/slice/adminSlice';
import type { AppDispatch, RootState } from '../../store/store';
import Layout from '../../components/admin/Layout';
import Toast from '../../components/common/Toast';
import ErrorBoundary from '../../components/common/ErrorBoundary';

const UserList: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { users, pagination, loading } = useSelector((state: RootState) => state.admin);
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('ALL PLANS');
    const [selectedStatus, setSelectedStatus] = useState('ALL STATUS');
    const [toast, setToast] = useState({ show: false, message: '', type: 'info' as 'success' | 'error' | 'info' });
    const [toggleLoading, setToggleLoading] = useState<string | null>(null);
    const limit = 8;

    // Debounced search function
    const debouncedFetchUsers = useCallback(
        debounce((search: string, status: string, currentPage: number) => {
            dispatch(fetchAllUsers({ 
                page: currentPage, 
                limit, 
                search: search.trim() || undefined, 
                status: status !== 'ALL STATUS' ? status : undefined 
            }));
        }, 500),
        [dispatch, limit]
    );

    useEffect(() => {
        debouncedFetchUsers(searchTerm, selectedStatus, page);
    }, [searchTerm, selectedStatus, page, debouncedFetchUsers]);

    // Reset to page 1 when search or filter changes
    useEffect(() => {
        if (page !== 1) {
            setPage(1);
        }
    }, [searchTerm, selectedStatus]);

    // Debounce utility function
    function debounce<T extends (...args: any[]) => any>(func: T, delay: number): T {
        let timeoutId: ReturnType<typeof setTimeout>;
        return ((...args: any[]) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(null, args), delay);
        }) as T;
    }

    // Updated to include Blocked/Suspended logic
    const getStatusColor = (user: any) => {
        if (user.is_blocked) return 'text-red-400 bg-red-400/10';
        return user.is_verified 
            ? 'text-green-400 bg-green-400/10' 
            : 'text-yellow-400 bg-yellow-400/10';
    };

    const getStatusText = (user: any) => {
        if (user.is_blocked) return 'SUSPENDED';
        return user.is_verified ? 'ACTIVE' : 'PENDING';
    };

    const getUserInitials = (name: string) => {
        try {
            return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '??';
        } catch (error) {
            return '??';
        }
    };

    const handleToggleBlock = async (userId: string, userName: string, isBlocked: boolean) => {
        setToggleLoading(userId);
        try {
            console.log('Attempting to toggle user:', { userId, userName, isBlocked });
            console.log('API endpoint:', `/admin/users/${userId}/block`);
            
            const result = await dispatch(toggleBlockUser(userId)).unwrap();
            console.log('Toggle result:', result);
            
            // Refresh the users list with current search and filter parameters
            dispatch(fetchAllUsers({ 
                page, 
                limit, 
                search: searchTerm.trim() || undefined, 
                status: selectedStatus !== 'ALL STATUS' ? selectedStatus : undefined 
            }));
            
            const action = isBlocked ? 'unblocked' : 'blocked';
            setToast({
                show: true,
                message: `User ${userName} has been ${action} successfully`,
                type: 'success'
            });
        } catch (error: any) {
            console.error('Toggle error details:', error);
            
            let errorMessage = 'Failed to update user status';
            
            // Check if it's a network error
            if (error.message && error.message.includes('ERR_FAILED')) {
                errorMessage = 'Backend server is not responding. Please check if the server is running.';
            } else if (error.message && error.message.includes('404')) {
                errorMessage = 'API endpoint not found. Please check the backend routes.';
            } else if (error.message && error.message.includes('500')) {
                errorMessage = 'Server error occurred. Please check the backend logs.';
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            setToast({
                show: true,
                message: errorMessage,
                type: 'error'
            });
        } finally {
            setToggleLoading(null);
        }
    };

    const closeToast = () => {
        setToast({ show: false, message: '', type: 'info' });
    };

    return (
        <ErrorBoundary>
            <Layout>
            <div className="p-8 space-y-8">
                {/* Header Section */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-white mb-2 uppercase tracking-tighter">Admin User Directory</h1>
                        <p className="text-gray-500 text-sm font-mono">SYSTEM_CONTROL // USER_MANAGEMENT_v1.0</p>
                    </div>
                    <div className="flex space-x-3">
                        {/* Search Bar */}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="px-4 py-2 pl-10 bg-gray-900 text-gray-300 rounded-lg text-sm border border-gray-800 focus:outline-none focus:border-cyan-500 transition-all w-64"
                            />
                            <svg 
                                className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>
                        
                        <select 
                            value={selectedFilter}
                            onChange={(e) => setSelectedFilter(e.target.value)}
                            className="px-4 py-2 bg-gray-900 text-gray-400 rounded-lg text-xs font-bold border border-gray-800 focus:outline-none focus:border-cyan-500 transition-all cursor-pointer"
                        >
                            <option>ALL PLANS</option>
                            <option>ENTERPRISE</option>
                            <option>PRO</option>
                            <option>FREE</option>
                        </select>
                        <select 
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="px-4 py-2 bg-gray-900 text-gray-400 rounded-lg text-xs font-bold border border-gray-800 focus:outline-none focus:border-cyan-500 transition-all cursor-pointer"
                        >
                            <option>ALL STATUS</option>
                            <option>ACTIVE</option>
                            <option>PENDING</option>
                            <option>SUSPENDED</option>
                        </select>
                    </div>
                </div>

                {/* Table Section */}
                <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-800 bg-black/20">
                                    <th className="text-left text-gray-500 text-[10px] font-bold py-5 px-6 uppercase tracking-[0.2em]">User Profile</th>
                                    <th className="text-left text-gray-500 text-[10px] font-bold py-5 px-6 uppercase tracking-[0.2em]">Network Address</th>
                                    <th className="text-left text-gray-500 text-[10px] font-bold py-5 px-6 uppercase tracking-[0.2em]">Service Tier</th>
                                    <th className="text-left text-gray-500 text-[10px] font-bold py-5 px-6 uppercase tracking-[0.2em]">Protocol Status</th>
                                    <th className="text-left text-gray-500 text-[10px] font-bold py-5 px-6 uppercase tracking-[0.2em]">Last Access</th>
                                    <th className="text-left text-gray-500 text-[10px] font-bold py-5 px-6 uppercase tracking-[0.2em]">Operations</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800/50">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-20">
                                            <div className="flex flex-col items-center justify-center space-y-4">
                                                <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                                                <span className="text-gray-500 text-xs font-mono tracking-widest">SYNCHRONIZING_DATABASE...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    users && users.length > 0 ? users.map((user) => {
                                        // Safety check for user object
                                        if (!user || !user._id) return null;
                                        
                                        return (
                                        <tr key={user._id} className="group hover:bg-cyan-500/[0.02] transition-colors">
                                            <td className="py-5 px-6">
                                                <div className="flex items-center space-x-4">
                                                    <div className="relative">
                                                        <div className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg flex items-center justify-center border border-gray-700 group-hover:border-cyan-500/50 transition-colors">
                                                            <span className="text-white text-xs font-bold">{getUserInitials(user.name)}</span>
                                                        </div>
                                                        {user.is_verified && (
                                                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-500 rounded-full border-2 border-gray-900"></div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="text-gray-200 font-semibold text-sm tracking-tight">{user.name}</div>
                                                        <div className="text-gray-500 text-[11px] font-mono uppercase">UID_{user._id.slice(-6)}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-5 px-6">
                                                <div className="text-gray-400 text-sm font-mono">{user.email}</div>
                                            </td>
                                            <td className="py-5 px-6">
                                                <span className="px-2 py-1 rounded text-[10px] font-black border border-blue-500/20 text-blue-400 bg-blue-400/5">
                                                    {user.tier ? String(user.tier).toUpperCase() : 'FREE_TIER'}
                                                </span>
                                            </td>
                                            <td className="py-5 px-6">
                                                <span className={`px-2 py-1 rounded text-[10px] font-black border ${getStatusColor(user)}`}>
                                                    {getStatusText(user)}
                                                </span>
                                            </td>
                                            <td className="py-5 px-6">
                                                <div className="text-gray-500 text-xs font-mono">
                                                    {new Date(user.createdAt).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="py-5 px-6">
                                                <div className="flex items-center space-x-2">
                                                    <button title="View Details" className="p-2 text-gray-500 hover:text-cyan-400 transition-colors">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                    </button>
                                                    
                                                    {/* Toggle Switch */}
                                                    <div className="flex items-center">
                                                        <button
                                                            onClick={() => handleToggleBlock(user._id, user.name, user.is_blocked)}
                                                            disabled={toggleLoading === user._id}
                                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 ${
                                                                user.is_blocked 
                                                                    ? 'bg-red-600 focus:ring-red-500' 
                                                                    : 'bg-green-600 focus:ring-green-500'
                                                            }`}
                                                            title={user.is_blocked ? "Click to unblock user" : "Click to block user"}
                                                        >
                                                            {toggleLoading === user._id ? (
                                                                <div className="absolute inset-0 flex items-center justify-center">
                                                                    <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                                                                </div>
                                                            ) : (
                                                                <span
                                                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                                        user.is_blocked ? 'translate-x-1' : 'translate-x-6'
                                                                    }`}
                                                                />
                                                            )}
                                                        </button>
                                                        <span className={`ml-2 text-xs font-medium ${
                                                            user.is_blocked ? 'text-red-400' : 'text-green-400'
                                                        }`}>
                                                            {user.is_blocked ? 'BLOCKED' : 'ACTIVE'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                        );
                                    }) : (
                                        <tr>
                                            <td colSpan={6} className="text-center py-20">
                                                <div className="flex flex-col items-center justify-center space-y-4">
                                                    <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                    </svg>
                                                    <div className="text-gray-500 text-sm">
                                                        {searchTerm || selectedStatus !== 'ALL STATUS' 
                                                            ? 'No users match your search criteria' 
                                                            : 'No users found in system'
                                                        }
                                                    </div>
                                                    {(searchTerm || selectedStatus !== 'ALL STATUS') && (
                                                        <button
                                                            onClick={() => {
                                                                setSearchTerm('');
                                                                setSelectedStatus('ALL STATUS');
                                                            }}
                                                            className="px-4 py-2 bg-cyan-600 text-white rounded-lg text-xs hover:bg-cyan-500 transition-colors"
                                                        >
                                                            Clear Filters
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer / Pagination */}
                    <div className="px-6 py-5 bg-black/20 border-t border-gray-800 flex items-center justify-between">
                        <div className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">
                            Showing {((page - 1) * limit) + 1} - {Math.min(page * limit, pagination?.totalUsers || 0)} of {pagination?.totalUsers || 0} 
                            {(searchTerm || selectedStatus !== 'ALL STATUS') ? ' filtered' : ''} units
                        </div>
                        
                        <div className="flex items-center space-x-2">
                            <button 
                                disabled={page === 1}
                                onClick={() => setPage(p => p - 1)}
                                className="p-2 bg-gray-900 border border-gray-800 text-gray-400 hover:text-cyan-400 disabled:opacity-20 rounded transition-all"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <div className="flex space-x-1">
                                {pagination.totalPages > 0 && [...Array(Math.min(pagination.totalPages, 10))].map((_, i) => (
                                    <button
                                        key={i + 1}
                                        onClick={() => setPage(i + 1)}
                                        className={`w-8 h-8 rounded text-[11px] font-bold transition-all ${page === i + 1 ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20' : 'text-gray-500 hover:text-white'}`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                            <button 
                                disabled={page === (pagination?.totalPages || 1)}
                                onClick={() => setPage(p => p + 1)}
                                className="p-2 bg-gray-900 border border-gray-800 text-gray-400 hover:text-cyan-400 disabled:opacity-20 rounded transition-all"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* User Distribution */}
                    <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
                        <h3 className="text-white font-bold mb-4">USER DISTRIBUTION</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400 text-sm">Enterprise</span>
                                <span className="text-white font-medium">142 (10%)</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '10%' }}></div>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400 text-sm">Pro</span>
                                <span className="text-white font-medium">654 (46%)</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '46%' }}></div>
                            </div>
                        </div>
                    </div>

                    {/* Activity Chart */}
                    <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
                        <h3 className="text-white font-bold mb-4">ACTIVITY TREND</h3>
                        <div className="flex items-end space-x-2 h-24">
                            {[40, 65, 45, 80, 60, 90, 75, 85, 70, 95, 80, 85].map((height, index) => (
                                <div
                                    key={index}
                                    className="bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-t flex-1"
                                    style={{ height: `${height}%` }}
                                ></div>
                            ))}
                        </div>
                    </div>

                    {/* Access Control */}
                    <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-white font-bold">ACCESS CONTROL</h3>
                            <button className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs hover:bg-red-500 transition-colors">
                                AUDIT
                            </button>
                        </div>
                        <div className="text-gray-400 text-sm">
                            <p>All systems operational</p>
                            <p className="text-cyan-400 mt-2">Security protocols active</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Toast Notification */}
            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.show}
                onClose={closeToast}
            />
        </Layout>
        </ErrorBoundary>
    );
};

export default UserList;