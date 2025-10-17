import React, { createContext, useContext, useState, useEffect } from 'react';
import cartService from '../services/cartService';
import authService from '../services/authService';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const user = authService.getCurrentUser();
    const userId = user?._id;

    const fetchCart = async () => {
        setLoading(true);
        setError(null);
        try {
            if (!userId) {
                setCart({
                    items: [],
                    status: 'ACTIVE',
                    currency: 'VND',
                    subtotal: 0,
                    estimatedTotal: 0
                });
                return;
            }
            const cartData = await cartService.getCart(userId);
            setCart(cartData);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, [userId]);

    const addToCart = async (item) => {
        if (!userId) {
            setError('Please login to add items to cart');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const updatedCart = await cartService.addToCart(userId, item);
            setCart(updatedCart);
            return updatedCart;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = async (productId, quantity) => {
        if (!userId || !cart) return;

        setLoading(true);
        setError(null);
        try {
            const updatedCart = await cartService.updateQuantity(userId, productId, quantity);
            setCart(updatedCart);
            return updatedCart;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const removeItem = async (productId) => {
        if (!userId || !cart) return;

        setLoading(true);
        setError(null);
        try {
            const updatedCart = await cartService.removeItem(userId, productId);
            setCart(updatedCart);
            return updatedCart;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const getCartTotal = () => {
        if (!cart?.items?.length) return 0;
        return cart.items.reduce((total, item) => total + (item.priceAtAdd * item.quantity), 0);
    };

    const getCartItemsCount = () => {
        if (!cart?.items?.length) return 0;
        return cart.items.reduce((count, item) => count + item.quantity, 0);
    };

    const value = {
        cart,
        loading,
        error,
        addToCart,
        updateQuantity,
        removeItem,
        getCartTotal,
        getCartItemsCount,
        refreshCart: fetchCart
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
