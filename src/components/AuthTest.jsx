import React, { useState, useEffect } from 'react';
// No need to import checkStaffAuth since we're using custom auth

const AuthTest = () => {
    const [authStatus, setAuthStatus] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        setLoading(true);
        
        // Check custom auth
        const userSession = localStorage.getItem('user_session');
        if (userSession) {
            try {
                const userData = JSON.parse(userSession);
                setAuthStatus({
                    type: 'custom',
                    user: userData,
                    isStaff: userData.role === 'staff'
                });
            } catch (error) {
                setAuthStatus({
                    type: 'error',
                    error: 'Invalid session data'
                });
            }
        } else {
            setAuthStatus({
                type: 'none',
                message: 'No session found'
            });
        }
        
        setLoading(false);
    };

    if (loading) {
        return <div className="p-4">Checking authentication...</div>;
    }

    return (
        <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Authentication Status</h2>
            
            {authStatus?.type === 'custom' && (
                <div className="space-y-2">
                    <p><strong>Type:</strong> Custom Authentication</p>
                    <p><strong>Email:</strong> {authStatus.user.email}</p>
                    <p><strong>Role:</strong> {authStatus.user.role}</p>
                    <p><strong>Staff Access:</strong> {authStatus.isStaff ? '✅ Yes' : '❌ No'}</p>
                    <p><strong>User ID:</strong> {authStatus.user.id}</p>
                </div>
            )}
            
            {authStatus?.type === 'error' && (
                <div className="text-red-600">
                    <p><strong>Error:</strong> {authStatus.error}</p>
                </div>
            )}
            
            {authStatus?.type === 'none' && (
                <div className="text-gray-600">
                    <p>{authStatus.message}</p>
                </div>
            )}
            
            <button 
                onClick={checkAuth}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
                Refresh Status
            </button>
        </div>
    );
};

export default AuthTest; 