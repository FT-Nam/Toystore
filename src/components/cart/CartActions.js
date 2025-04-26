import React from 'react';
import axios from 'axios';

const CartActions = {
  addToCart: async (productId, quantity = 1) => {
    try {
      const response = await axios.post('/ToyStore/cart/cart_actions.php', {
        action: 'add',
        product_id: productId,
        quantity: quantity
      });
      return response.data;
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  },

  updateQuantity: async (cartItemId, quantity) => {
    try {
      const response = await axios.post('/ToyStore/cart/cart_actions.php', {
        action: 'update',
        cart_item_id: cartItemId,
        quantity: quantity
      });
      return response.data;
    } catch (error) {
      console.error('Error updating cart quantity:', error);
      throw error;
    }
  },

  removeFromCart: async (cartItemId) => {
    try {
      const response = await axios.post('/ToyStore/cart/cart_actions.php', {
        action: 'delete',
        cart_item_id: cartItemId
      });
      return response.data;
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  },

  getCartItems: async () => {
    try {
      const response = await axios.get('/ToyStore/cart/index.php');
      return response.data;
    } catch (error) {
      console.error('Error getting cart items:', error);
      throw error;
    }
  },

  getCartCount: async () => {
    try {
      const response = await axios.post('/ToyStore/cart/cart_actions.php', {
        action: 'get_count'
      });
      return response.data;
    } catch (error) {
      console.error('Error getting cart count:', error);
      throw error;
    }
  },

  clearCart: async () => {
    try {
      const response = await axios.delete('/api/cart/clear');
      return response.data;
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  },

  saveCart: async () => {
    try {
      const response = await axios.post('/api/cart/save');
      return response.data;
    } catch (error) {
      console.error('Error saving cart:', error);
      throw error;
    }
  }
};

export default CartActions; 