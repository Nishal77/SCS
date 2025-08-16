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
            return sessionData && sessionData.id ? sessionData : false;
        } catch (error) {
            console.error('Error parsing user session:', error);
            return false;
        }
    }
    return false;
};

// Get current user data (for custom auth system)
export const getCurrentUserData = () => {
    const userSession = localStorage.getItem('user_session');
    if (userSession) {
        try {
            const sessionData = JSON.parse(userSession);
            return sessionData && sessionData.id ? sessionData : null;
        } catch (error) {
            console.error('Error parsing user session:', error);
            return null;
        }
    }
    return null;
};

// Redirect to login page
export const redirectToLogin = (navigate) => {
    navigate('/auth/login');
};

// Handle add to cart with authentication check
export const handleAddToCart = async (productId, quantity = 1) => {
    if (!checkAuthStatus()) {
        return { success: false, error: 'Authentication required' };
    }
    
    try {
        // Get current user ID from session
        const userSession = localStorage.getItem('user_session');
        if (!userSession) {
            return { success: false, error: 'Session expired' };
        }
        
        const sessionData = JSON.parse(userSession);
        const userId = sessionData.id;
        
        console.log('Adding to cart:', { userId, productId, quantity });
        
        // Import cart utilities dynamically to avoid circular dependencies
        const { addToCart, debugCartOperation } = await import('./cart-utils');
        
        // Add item to cart with stock validation
        const result = await addToCart(userId, productId, quantity);
        
        if (!result.success) {
            console.log('Cart operation failed, running debug...');
            // Run debug function to identify the issue
            await debugCartOperation(userId, productId);
        }
        
        return result;
    } catch (error) {
        console.error('Error in handleAddToCart:', error);
        
        // Get user ID for debugging
        const userSession = localStorage.getItem('user_session');
        if (userSession) {
            const sessionData = JSON.parse(userSession);
            const userId = sessionData.id;
            
            // Run debug function to identify the issue
            const { debugCartOperation } = await import('./cart-utils');
            await debugCartOperation(userId, productId);
        }
        
        return { success: false, error: 'Failed to add item to cart' };
    }
}; 