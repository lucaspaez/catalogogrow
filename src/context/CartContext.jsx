import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const stored = localStorage.getItem('cart');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Price logic considering volume discounts
  const getEffectivePrice = (product, quantity) => {
    if (!product.volumeDiscounts || product.volumeDiscounts.length === 0) return product.price;
    // Sort discounts descending by threshold
    const sorted = [...product.volumeDiscounts].sort((a, b) => b.threshold - a.threshold);
    // Find the highest threshold met
    const discount = sorted.find(d => quantity >= d.threshold);
    return discount ? discount.price : product.price;
  };

  const addToCart = (product, quantity) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + quantity } 
            : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    setCart(prev => prev.map(item => 
      item.id === productId ? { ...item, quantity: newQuantity } : item
    ));
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((sum, item) => {
    const price = getEffectivePrice(item, item.quantity);
    return sum + (price * item.quantity);
  }, 0);

  const cartCount = cart.length;

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart, 
      cartTotal, 
      cartCount,
      isCartOpen,
      setIsCartOpen,
      getEffectivePrice
    }}>
      {children}
    </CartContext.Provider>
  );
};
