import React, { createContext, useContext, useState, useCallback } from 'react';
import API from '../api/axios';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartCount, setCartCount] = useState(0);

  const refreshCartCount = useCallback(async function() {
    const customerToken = localStorage.getItem('customerToken');
    if (!customerToken) {
      setCartCount(0);
      return;
    }
    try {
      const res = await API.get('/cart/cart-details', {
        headers: { Authorization: 'Bearer ' + customerToken }
      });
      const cart = res.data.cart;
      if (cart && cart.items) {
        const totalQty = cart.items.reduce(function(sum, item) {
          return sum + item.quantity;
        }, 0);
        setCartCount(totalQty);
      } else {
        setCartCount(0);
      }
    } catch (err) {
      setCartCount(0);
    }
  }, []);

  return (
    <CartContext.Provider value={{ cartCount, refreshCartCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);