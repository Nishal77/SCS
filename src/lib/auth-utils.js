import supabase from './supabase';

// Check if user is authenticated as staff
export const checkStaffAuth = async () => {
    try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
            return { isAuthenticated: false, error: 'No active session' };
        }

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
            return { isAuthenticated: false, error: 'User not found' };
        }

        // Check if user has staff role (customize based on your auth setup)
        const userRole = user.user_metadata?.role || 'staff';
        
        return {
            isAuthenticated: true,
            user,
            role: userRole,
            userId: user.id
        };
    } catch (error) {
        return { isAuthenticated: false, error: error.message };
    }
};

// Set user role as staff (call this after login)
export const setStaffRole = async () => {
    try {
        const { data, error } = await supabase.auth.updateUser({
            data: { role: 'staff' }
        });
        
        if (error) {
            console.error('Error setting staff role:', error);
            return false;
        }
        
        console.log('Staff role set successfully');
        return true;
    } catch (error) {
        console.error('Error setting staff role:', error);
        return false;
    }
};

// Get current user info
export const getCurrentUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
};

// Check if user is authenticated (for custom auth system)
export const checkAuthStatus = () => {
    const userSession = localStorage.getItem('user_session');
    if (userSession) {
        try {
            const sessionData = JSON.parse(userSession);
            return sessionData && sessionData.id ? true : false;
        } catch (error) {
            console.error('Error parsing user session:', error);
            return false;
        }
    }
    return false;
};

// Redirect to login page
export const redirectToLogin = (navigate) => {
    navigate('/auth/login');
};

// Handle add to cart with authentication check
export const handleAddToCart = (navigate) => {
    if (!checkAuthStatus()) {
        redirectToLogin(navigate);
        return false;
    }
    return true;
}; 