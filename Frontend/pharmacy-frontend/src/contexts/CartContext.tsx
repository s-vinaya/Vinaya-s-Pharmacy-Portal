import React, { createContext, useContext, useState, useEffect } from 'react';
import type { CartItem, CartContextType } from '../types';

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCartItems(parsedCart);

      } catch (error) {
        console.error('Error parsing cart from localStorage:', error);
        localStorage.removeItem('cart');
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('cart', JSON.stringify(cartItems));

    }
  }, [cartItems, isLoaded]);

  const addToCart = (medicine: any) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.medicineId === medicine.medicineId);
      
      if (existingItem) {
        return prev.map(item =>
          item.medicineId === medicine.medicineId
            ? { ...item, quantity: Math.min(item.quantity + 1, medicine.stock || 0) }
            : item
        );
      } else {
        return [...prev, {
          medicineId: medicine.medicineId,
          name: medicine.name,
          price: medicine.price,
          quantity: 1,
          stock: medicine.stock,
          requiresPrescription: medicine.requiresPrescription
        }];
      }
    });
  };

  const removeFromCart = (medicineId: number) => {
    setCartItems(prev => prev.filter(item => item.medicineId !== medicineId));
  };

  const updateQuantity = (medicineId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(medicineId);
      return;
    }

    setCartItems(prev =>
      prev.map(item =>
        item.medicineId === medicineId
          ? { ...item, quantity: Math.min(quantity, item.stock || 0) }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemsCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getUniqueItemsCount = () => {
    return cartItems.length;
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartTotal,
      getCartItemsCount,
      getUniqueItemsCount
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};