import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load cart from localStorage on initial render
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const calculateCustomizedPrice = (basePrice, customization) => {
    let price = parseFloat(basePrice);
    
    // Add logo price if selected
    if (customization?.logo) {
      price += parseFloat(customization.logo.price) || 0;
    }
    
    // Add size premium
    if (customization?.size === 'medium') price += 1;
    else if (customization?.size === 'large') price += 2;
    else if (customization?.size === 'xlarge') price += 3;
    
    // Add text premium if custom text exists
    if (customization?.text && customization.text.trim() !== '') {
      price += 2.99; // Base text customization fee
      if (customization.text.length > 15) price += 1.99; // Additional for long text
    }
    
    return price;
  };

  const addToCart = (product, selectedColor, selectedSize, quantity, customization = null) => {
    setCart((prevCart) => {
      // Check if item already exists in cart
      const existingItem = prevCart.find(
        (item) =>
          item.id === product.id &&
          item.selectedColor === selectedColor &&
          item.selectedSize === selectedSize &&
          JSON.stringify(item.customization) === JSON.stringify(customization)
      );

      if (existingItem) {
        // Update quantity if item exists
        return prevCart.map((item) =>
          item.id === product.id &&
          item.selectedColor === selectedColor &&
          item.selectedSize === selectedSize &&
          JSON.stringify(item.customization) === JSON.stringify(customization)
            ? { 
                ...item, 
                quantity: item.quantity + quantity,
                price: calculateCustomizedPrice(item.basePrice, customization) * (item.quantity + quantity)
              }
            : item
        );
      } else {
        // Add new item to cart
        return [
          ...prevCart,
          {
            ...product,
            selectedColor,
            selectedSize,
            quantity,
            customization,
            basePrice: product.price, // Store original price
            price: calculateCustomizedPrice(product.price, customization) * quantity
          },
        ];
      }
    });
    setIsCartOpen(true);
  };

  // Specifically for adding customized products
  const addCustomizedToCart = (customizedProduct) => {
    const { selectedColor, selectedSize, quantity, customization } = customizedProduct;
    addToCart(customizedProduct, selectedColor, selectedSize, quantity, customization);
  };

  const removeFromCart = (itemId, selectedColor, selectedSize, customization = null) => {
    setCart((prevCart) =>
      prevCart.filter(
        (item) =>
          !(
            item.id === itemId &&
            item.selectedColor === selectedColor &&
            item.selectedSize === selectedSize &&
            JSON.stringify(item.customization) === JSON.stringify(customization)
          )
      )
    );
  };

  const updateQuantity = (itemId, selectedColor, selectedSize, newQuantity, customization = null) => {
    if (newQuantity < 1) return;

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === itemId &&
        item.selectedColor === selectedColor &&
        item.selectedSize === selectedSize &&
        JSON.stringify(item.customization) === JSON.stringify(customization)
          ? { 
              ...item, 
              quantity: newQuantity,
              price: calculateCustomizedPrice(item.basePrice, customization) * newQuantity
            }
          : item
      )
    );
  };

  const updateCartItemCustomization = (itemId, selectedColor, selectedSize, customization, quantity) => {
    setCart((prevCart) => {
      return prevCart.map(item => {
        if (item.id === itemId && 
            item.selectedColor === selectedColor && 
            item.selectedSize === selectedSize) {
          return { 
            ...item, 
            customization,
            quantity,
            price: calculateCustomizedPrice(item.basePrice, customization) * quantity
          };
        }
        return item;
      });
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce(
    (total, item) => total + parseFloat(item.price || 0),
    0
  );

  const cartItemCount = cart.reduce((count, item) => count + (item.quantity || 0), 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        addCustomizedToCart, // Added this function
        removeFromCart,
        updateQuantity,
        updateCartItemCustomization,
        clearCart,
        cartTotal,
        cartItemCount,
        isCartOpen,
        setIsCartOpen,
      }}
    >
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