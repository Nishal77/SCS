import supabase from './supabase';

// Cart table name
const CART_TABLE = 'user_cart';

// Initialize cart table if it doesn't exist
export const initializeCartTable = async () => {
    try {
        // Check if cart table exists, if not create it
        const { error } = await supabase
            .from(CART_TABLE)
            .select('id')
            .limit(1);
        
        if (error && error.code === '42P01') { // Table doesn't exist
            console.log('Cart table does not exist, creating...');
            // You would need to create the table via migration
            // For now, we'll use localStorage as fallback
            return false;
        }
        return true;
    } catch (error) {
        console.error('Error checking cart table:', error);
        return false;
    }
};

// Get cart items for a user
export const getCartItems = async (userId) => {
    try {
        const { data, error } = await supabase
            .from(CART_TABLE)
            .select(`
                *,
                inventory:product_id (
                    id,
                    item_name,
                    description,
                    price,
                    image_url,
                    stock_available,
                    category
                )
            `)
            .eq('user_id', userId);
        
        if (error) throw error;
        
        return data.map(item => ({
            id: item.id,
            productId: item.product_id,
            name: item.inventory?.item_name || 'Unknown Product',
            description: item.inventory?.description || '',
            price: item.inventory?.price || 0,
            image: item.inventory?.image_url || '',
            category: item.inventory?.category || '',
            quantity: item.quantity,
            stockAvailable: item.inventory?.stock_available || 0
        }));
    } catch (error) {
        console.error('Error fetching cart items:', error);
        return [];
    }
};

// Check if product has sufficient stock
export const checkStockAvailability = async (productId, requestedQuantity = 1) => {
    try {
        const { data, error } = await supabase
            .from('inventory')
            .select('stock_available, item_name')
            .eq('id', productId)
            .single();
        
        if (error) throw error;
        
        const availableStock = data?.stock_available || 0;
        const productName = data?.item_name || 'Product';
        
        return {
            available: availableStock >= requestedQuantity,
            stockAvailable: availableStock,
            canAdd: availableStock > 0,
            productName: productName,
            requestedQuantity: requestedQuantity
        };
    } catch (error) {
        console.error('Error checking stock:', error);
        return {
            available: false,
            stockAvailable: 0,
            canAdd: false,
            productName: 'Unknown Product',
            requestedQuantity: requestedQuantity
        };
    }
};

// Add item to cart with stock validation
export const addToCart = async (userId, productId, quantity = 1) => {
    try {
        // First check stock availability
        const stockCheck = await checkStockAvailability(productId, quantity);
        
        if (!stockCheck.canAdd) {
            return {
                success: false,
                error: `${stockCheck.productName} is out of stock`,
                stockAvailable: stockCheck.stockAvailable
            };
        }
        
        if (!stockCheck.available) {
            return {
                success: false,
                error: `Insufficient stock for ${stockCheck.productName}. Only ${stockCheck.stockAvailable} available, but you requested ${stockCheck.requestedQuantity}.`,
                stockAvailable: stockCheck.stockAvailable
            };
        }
        
        // Check if item already exists in cart
        const { data: existingItem, error: checkError } = await supabase
            .from(CART_TABLE)
            .select('id, quantity')
            .eq('user_id', userId)
            .eq('product_id', productId)
            .single();
        
        if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
            throw checkError;
        }
        
        if (existingItem) {
            // Update existing item quantity
            const newQuantity = existingItem.quantity + quantity;
            
            // Check if new total quantity exceeds stock
            if (newQuantity > stockCheck.stockAvailable) {
                return {
                    success: false,
                    error: `Cannot add more ${stockCheck.productName}. Total quantity would exceed available stock (${stockCheck.stockAvailable}).`,
                    stockAvailable: stockCheck.stockAvailable
                };
            }
            
            const { error: updateError } = await supabase
                .from(CART_TABLE)
                .update({ quantity: newQuantity })
                .eq('id', existingItem.id);
            
            if (updateError) throw updateError;
            
            return {
                success: true,
                message: `Cart updated successfully. ${stockCheck.productName} quantity: ${newQuantity}`,
                stockAvailable: stockCheck.stockAvailable
            };
        } else {
            // Add new item to cart
            const { error: insertError } = await supabase
                .from(CART_TABLE)
                .insert({
                    user_id: userId,
                    product_id: productId,
                    quantity: quantity
                });
            
            if (insertError) throw insertError;
            
            return {
                success: true,
                message: `${stockCheck.productName} added to cart successfully`,
                stockAvailable: stockCheck.stockAvailable
            };
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
        return {
            success: false,
            error: 'Failed to add item to cart. Please try again.',
            stockAvailable: 0
        };
    }
};

// Update cart item quantity
export const updateCartItemQuantity = async (cartItemId, newQuantity) => {
    try {
        if (newQuantity <= 0) {
            // Remove item if quantity is 0 or negative
            const { error } = await supabase
                .from(CART_TABLE)
                .delete()
                .eq('id', cartItemId);
            
            if (error) throw error;
            
            return {
                success: true,
                message: 'Item removed from cart'
            };
        }
        
        // Get the product to check stock
        const { data: cartItem, error: fetchError } = await supabase
            .from(CART_TABLE)
            .select('product_id')
            .eq('id', cartItemId)
            .single();
        
        if (fetchError) throw fetchError;
        
        // Check stock availability
        const stockCheck = await checkStockAvailability(cartItem.product_id, newQuantity);
        
        if (!stockCheck.available) {
            return {
                success: false,
                error: `Cannot update quantity for ${stockCheck.productName}. Only ${stockCheck.stockAvailable} available, but you requested ${stockCheck.requestedQuantity}.`,
                stockAvailable: stockCheck.stockAvailable
            };
        }
        
        // Update quantity
        const { error: updateError } = await supabase
            .from(CART_TABLE)
            .update({ quantity: newQuantity })
            .eq('id', cartItemId);
        
        if (updateError) throw updateError;
        
        return {
            success: true,
            message: `${stockCheck.productName} quantity updated successfully to ${newQuantity}`,
            stockAvailable: stockCheck.stockAvailable
        };
    } catch (error) {
        console.error('Error updating cart item:', error);
        return {
            success: false,
            error: 'Failed to update cart item. Please try again.'
        };
    }
};

// Remove item from cart
export const removeFromCart = async (cartItemId) => {
    try {
        const { error } = await supabase
            .from(CART_TABLE)
            .delete()
            .eq('id', cartItemId);
        
        if (error) throw error;
        
        return {
            success: true,
            message: 'Item removed from cart'
        };
    } catch (error) {
        console.error('Error removing from cart:', error);
        return {
            success: false,
            error: 'Failed to remove item from cart'
        };
    }
};

// Clear entire cart for a user
export const clearCart = async (userId) => {
    try {
        const { error } = await supabase
            .from(CART_TABLE)
            .delete()
            .eq('user_id', userId);
        
        if (error) throw error;
        
        return {
            success: true,
            message: 'Cart cleared successfully'
        };
    } catch (error) {
        console.error('Error clearing cart:', error);
        return {
            success: false,
            error: 'Failed to clear cart'
        };
    }
};

// Get real-time stock updates for products
export const subscribeToStockUpdates = (productIds, callback) => {
    if (!productIds || productIds.length === 0) return null;
    
    const subscription = supabase
        .channel('stock_updates')
        .on(
            'postgres_changes',
            {
                event: 'UPDATE',
                schema: 'public',
                table: 'inventory',
                filter: `id=in.(${productIds.join(',')})`
            },
            (payload) => {
                console.log('Stock update received:', payload);
                if (callback) {
                    callback(payload);
                }
            }
        )
        .subscribe();
    
    return subscription;
};

// Get cart count for a user
export const getCartCount = async (userId) => {
    try {
        const { count, error } = await supabase
            .from(CART_TABLE)
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);
        
        if (error) throw error;
        
        return count || 0;
    } catch (error) {
        console.error('Error getting cart count:', error);
        return 0;
    }
};
