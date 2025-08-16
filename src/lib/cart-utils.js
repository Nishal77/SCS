import supabase, { supabaseService } from './supabase';

// Cart table name
const CART_TABLE = 'user_cart';

// Helper function to get the appropriate client
const getClient = () => {
    // Always use the regular client since RLS is disabled
    return supabase;
};

// Debug function to test cart operations
export const debugCartOperation = async (userId, productId) => {
    try {
        console.log('=== DEBUG CART OPERATION ===');
        console.log('User ID:', userId);
        console.log('Product ID:', productId);
        
        const client = getClient();
        
        // Test 1: Check if user exists in auth.users
        console.log('Test 1: Checking user in auth.users...');
        const { data: userData, error: userError } = await client
            .from('auth.users')
            .select('id, email')
            .eq('id', userId)
            .maybeSingle();
        
        console.log('User data:', userData);
        console.log('User error:', userError);
        
        // Test 2: Check if product exists in inventory
        console.log('Test 2: Checking product in inventory...');
        const { data: productData, error: productError } = await client
            .from('inventory')
            .select('id, item_name, price')
            .eq('id', productId)
            .maybeSingle();
        
        console.log('Product data:', productData);
        console.log('Product error:', productError);
        
        // Test 3: Check existing cart items
        console.log('Test 3: Checking existing cart items...');
        const { data: cartData, error: cartError } = await client
            .from(CART_TABLE)
            .select('*')
            .eq('user_id', userId)
            .eq('product_id', productId);
        
        console.log('Cart data:', cartData);
        console.log('Cart error:', cartError);
        
        console.log('=== END DEBUG ===');
        
        return {
            user: userData,
            product: productData,
            cart: cartData,
            errors: { userError, productError, cartError }
        };
    } catch (error) {
        console.error('Debug error:', error);
        return { error };
    }
};

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
        const client = getClient();
        
        const { data, error } = await client
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
        
        if (error) {
            console.error('Error fetching cart items:', error);
            throw error;
        }
        
        return data.map(item => ({
            id: item.id,
            productId: item.product_id,
            name: item.item_name || item.inventory?.item_name || 'Unknown Product',
            description: item.inventory?.description || '',
            price: item.price || item.inventory?.price || 0,
            image: item.image_url || item.inventory?.image_url || '',
            category: item.category || item.inventory?.category || '',
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
            .select('stock_available, item_name, price, image_url, category')
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
            requestedQuantity: requestedQuantity,
            productData: data // Include full product data
        };
    } catch (error) {
        console.error('Error checking stock:', error);
        return {
            available: false,
            stockAvailable: 0,
            canAdd: false,
            productName: 'Unknown Product',
            requestedQuantity: requestedQuantity,
            productData: null
        };
    }
};

// Add item to cart with stock validation
export const addToCart = async (userId, productId, quantity = 1) => {
    try {
        console.log('=== ADD TO CART START ===');
        console.log('Parameters:', { userId, productId, quantity });
        
        // First check stock availability and get product details
        const stockCheck = await checkStockAvailability(productId, quantity);
        console.log('Stock check result:', stockCheck);
        
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
        const client = getClient();
        
        console.log('Checking for existing cart item:', { userId, productId });
        
        const { data: existingItem, error: checkError } = await client
            .from(CART_TABLE)
            .select('id, quantity')
            .eq('user_id', userId)
            .eq('product_id', productId)
            .maybeSingle(); // Use maybeSingle() instead of single() to avoid errors
        
        if (checkError) {
            console.error('Error checking existing cart item:', checkError);
            console.error('Error details:', {
                code: checkError.code,
                message: checkError.message,
                details: checkError.details,
                hint: checkError.hint
            });
            throw checkError;
        }
        
        console.log('Existing cart item:', existingItem);
        
        if (existingItem) {
            // Update existing item quantity
            const newQuantity = existingItem.quantity + quantity;
            
            console.log('Updating existing cart item:', { itemId: existingItem.id, newQuantity });
            
            // Check if new total quantity exceeds stock
            if (newQuantity > stockCheck.stockAvailable) {
                return {
                    success: false,
                    error: `Cannot add more ${stockCheck.productName}. Total quantity would exceed available stock (${stockCheck.stockAvailable}).`,
                    stockAvailable: stockCheck.stockAvailable
                };
            }
            
            const client = getClient();
            
            const { data: updatedItem, error: updateError } = await client
                .from(CART_TABLE)
                .update({ quantity: newQuantity })
                .eq('id', existingItem.id)
                .select()
                .single();
            
            if (updateError) {
                console.error('Error updating cart item:', updateError);
                console.error('Update error details:', {
                    code: updateError.code,
                    message: updateError.message,
                    details: updateError.details,
                    hint: updateError.hint
                });
                throw updateError;
            }
            
            console.log('Successfully updated cart item:', updatedItem);
            
            return {
                success: true,
                message: `Cart updated successfully. ${stockCheck.productName} quantity: ${newQuantity}`,
                stockAvailable: stockCheck.stockAvailable
            };
        } else {
            // Add new item to cart with product details
            const client = getClient();
            
            const cartItemData = {
                user_id: userId,
                product_id: productId,
                quantity: quantity,
                price: stockCheck.productData.price,
                image_url: stockCheck.productData.image_url,
                item_name: stockCheck.productData.item_name,
                category: stockCheck.productData.category
            };
            
            console.log('Inserting new cart item:', cartItemData);
            
            const { data: insertedItem, error: insertError } = await client
                .from(CART_TABLE)
                .insert(cartItemData)
                .select()
                .single();
            
            if (insertError) {
                console.error('Error inserting cart item:', insertError);
                console.error('Insert error details:', {
                    code: insertError.code,
                    message: insertError.message,
                    details: insertError.details,
                    hint: insertError.hint
                });
                throw insertError;
            }
            
            console.log('Successfully inserted cart item:', insertedItem);
            
            return {
                success: true,
                message: `${stockCheck.productName} added to cart successfully`,
                stockAvailable: stockCheck.stockAvailable
            };
        }
    } catch (error) {
        console.error('=== ADD TO CART ERROR ===');
        console.error('Error adding to cart:', error);
        console.error('Error details:', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
        });
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
        const client = getClient();
        
        const { data: cartItem, error: fetchError } = await client
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
        const { error: updateError } = await client
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
        const client = getClient();
        
        const { error } = await client
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
        const client = getClient();
        
        const { error } = await client
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
        const client = getClient();
        
        const { count, error } = await client
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