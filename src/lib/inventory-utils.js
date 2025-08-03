import supabase from './supabase';

// Function to reduce stock when a user purchases an item
export const reduceStockOnPurchase = async (itemId, quantity = 1) => {
    try {
        // First, get the current stock information
        const { data: currentItem, error: fetchError } = await supabase
            .from('inventory')
            .select('stock_available, stock_constant')
            .eq('id', itemId)
            .single();

        if (fetchError) {
            console.error('Error fetching item stock:', fetchError);
            return { success: false, error: fetchError.message };
        }

        if (!currentItem) {
            return { success: false, error: 'Item not found' };
        }

        const newAvailableStock = Math.max(0, currentItem.stock_available - quantity);

        // Update the available stock
        const { error: updateError } = await supabase
            .from('inventory')
            .update({ stock_available: newAvailableStock })
            .eq('id', itemId);

        if (updateError) {
            console.error('Error updating stock:', updateError);
            return { success: false, error: updateError.message };
        }

        return { 
            success: true, 
            newStock: newAvailableStock,
            previousStock: currentItem.stock_available
        };
    } catch (error) {
        console.error('Error in reduceStockOnPurchase:', error);
        return { success: false, error: error.message };
    }
};

// Function to check if item is in stock
export const checkItemStock = async (itemId, requiredQuantity = 1) => {
    try {
        const { data, error } = await supabase
            .from('inventory')
            .select('stock_available, item_name')
            .eq('id', itemId)
            .single();

        if (error) {
            return { available: false, error: error.message };
        }

        return {
            available: data.stock_available >= requiredQuantity,
            currentStock: data.stock_available,
            itemName: data.item_name
        };
    } catch (error) {
        return { available: false, error: error.message };
    }
};

// Function to get all inventory items with stock information
export const getInventoryWithStock = async () => {
    try {
        const { data, error } = await supabase
            .from('inventory')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        return data || [];
    } catch (error) {
        console.error('Error fetching inventory:', error);
        return [];
    }
}; 