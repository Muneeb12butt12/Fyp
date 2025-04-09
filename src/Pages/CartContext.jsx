// src/context/CartContext.js
import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    // Load cart from localStorage if available
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, quantity, selectedColor, selectedSize) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(
        item => 
          item.id === product.id && 
          item.color === selectedColor && 
          item.size === selectedSize
      );

      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id && 
          item.color === selectedColor && 
          item.size === selectedSize
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [
          ...prevItems,
          {
            id: product.id,
            name: product.title,
            price: product.price,
            image: product.img,
            color: selectedColor,
            size: selectedSize,
            quantity,
          }
        ];
      }
    });
  };

  const removeFromCart = (itemId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider 
      value={{ 
        cartItems, 
        addToCart, 
        removeFromCart, 
        updateQuantity,
        clearCart,
        cartCount: cartItems.reduce((sum, item) => sum + item.quantity, 0),
        cartTotal: cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  return useContext(CartContext);
};