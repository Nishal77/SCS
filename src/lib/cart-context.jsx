import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCartItems, getCartCount } from './cart-utils';
import { checkAuthStatus } from './auth-utils';
import supabase from './supabase';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);

  const fetchCartData = async () => {
    if (!checkAuthStatus()) {
      setCartItems([]);
      setCartCount(0);
      setUserId(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const userSession = localStorage.getItem('user_session');
      if (!userSession) {
        setCartItems([]);
        setCartCount(0);
        setUserId(null);
        return;
      }

      const sessionData = JSON.parse(userSession);
      const currentUserId = sessionData.id;
      setUserId(currentUserId);

      // Fetch cart items and count in parallel
      const [items, count] = await Promise.all([
        getCartItems(currentUserId),
        getCartCount(currentUserId)
      ]);

      setCartItems(items);
      setCartCount(count);
    } catch (err) {
      setError('Failed to load cart data');
      console.error('Error fetching cart data:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshCart = () => {
    fetchCartData();
  };

  const clearCartState = () => {
    setCartItems([]);
    setCartCount(0);
  };

  useEffect(() => {
    fetchCartData();
  }, []);

  // Set up real-time subscription for cart changes
  useEffect(() => {
    if (!userId) return;

    const subscription = supabase
      .channel('cart_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_cart',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('Cart change detected:', payload);
          // Refresh cart data when changes occur
          fetchCartData();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  const value = {
    cartItems,
    cartCount,
    loading,
    error,
    refreshCart,
    clearCartState
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
