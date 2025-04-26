import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cartService } from '../../services/api';
import './Cart.scss';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalDiscount, setTotalDiscount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchCartData();
  }, [navigate]);

  const fetchCartData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const userId = localStorage.getItem('userId');
      console.log('=== CART DATA FETCHING START ===');
      console.log('Token:', token);
      console.log('UserId:', userId);
      
      if (!token || !userId) {
        console.log('Missing token or userId for cart fetch');
        setCartItems([]);
        return;
      }

      // Lấy cart ID từ userId
      console.log('Fetching cart ID for userId:', userId);
      const cartResponse = await fetch(`http://localhost:8080/api/v1/cart/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      const cartData = await cartResponse.json();
      console.log('=== CART ID API RESPONSE ===');
      console.log('Full cart data:', cartData);
      console.log('Cart data code:', cartData?.code);
      console.log('Cart data value:', cartData?.value);
      
      // Kiểm tra cấu trúc dữ liệu trả về
      if (cartData && cartData.code === 1000) {
        // Nếu không có value, có thể là giỏ hàng trống
        if (!cartData.value) {
          console.log('Cart is empty - no value in response');
          setCartItems([]);
          return;
        }
        
        const cartId = cartData.value.id;
        console.log('Cart ID found:', cartId);
        
        // Lấy cart items từ cart ID
        console.log('Fetching cart items for cartId:', cartId);
        const itemsResponse = await fetch(`http://localhost:8080/api/v1/cart/${cartId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
    
        const itemsData = await itemsResponse.json();
        console.log('=== CART ITEMS API RESPONSE ===');
        console.log('Full items data:', itemsData);
        console.log('Items data code:', itemsData?.code);
        console.log('Items data value:', itemsData?.value);
    
        // Kiểm tra cấu trúc dữ liệu trả về
        if (itemsData && itemsData.code === 1000) {
          // Nếu không có value, có thể là giỏ hàng trống
          if (!itemsData.value || !Array.isArray(itemsData.value)) {
            console.log('Cart items is empty - no value in response or not an array');
            setCartItems([]);
            return;
          }
          
          // Lấy thông tin sản phẩm cho mỗi item trong giỏ hàng
          const items = itemsData.value;
          console.log('=== CART ITEMS PROCESSED ===');
          console.log('Number of items:', items.length);
          console.log('Items array:', items);
          
          // Lấy thông tin chi tiết sản phẩm cho mỗi item
          const itemsWithDetails = await Promise.all(
            items.map(async (item) => {
              try {
                const productResponse = await fetch(`http://localhost:8080/api/v1/product/${item.productId}`, {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                });
                const productData = await productResponse.json();
                
                if (productData && productData.code === 1000 && productData.value) {
                  return {
                    ...item,
                    name: productData.value.name,
                    image_url: productData.value.thumbnail || `http://localhost:8080/api/v1/product-img/thumbnail/${item.productId}`,
                    discount_percentage: productData.value.discount_percentage || 0
                  };
                }
                return item;
              } catch (error) {
                console.error(`Error fetching product details for productId ${item.productId}:`, error);
                return item;
              }
            })
          );
          
          console.log('Items with product details:', itemsWithDetails);
          setCartItems(itemsWithDetails);
          
          const total = itemsWithDetails.reduce((total, item) => {
            const price = item.discount_percentage > 0
              ? item.price * (1 - item.discount_percentage / 100)
              : item.price;
            return total + price * item.quantity;
          }, 0);
          console.log('Calculated total price:', total);
          setTotalPrice(total);
        } else {
          console.error('Invalid cart items data:', itemsData);
          setCartItems([]);
        }
      } else {
        console.warn('Invalid cart data:', cartData);
        setCartItems([]);
      }
      console.log('=== CART DATA FETCHING END ===');
    } catch (error) {
      console.error('Error fetching cart:', error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCartUpdate = async (action, data) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        navigate('/login');
        return;
      }

      if (action === 'delete') {
        const response = await fetch(`http://localhost:8080/api/v1/cart/cart-detail/${data.cart_item_id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          fetchCartData();
        }
      } else if (action === 'update') {
        const response = await fetch(`http://localhost:8080/api/v1/cart/cart-detail/${data.cart_item_id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ quantity: data.quantity }),
        });
        if (response.ok) {
          fetchCartData();
        }
      }
    } catch (error) {
      console.error('Error updating cart:', error);
    }
  };

  if (loading) {
    return <div className="loading">Đang tải giỏ hàng...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="cart-page">
      <div className="container">
        <header className="cart-page__header">
          <h1 className="cart-page__title">Giỏ hàng (<span className="cart-page__quantity-title">{cartItems.length}</span>)</h1>
        </header>
        <div className="row">
          <div className="col-8">
            <section className="cart-page__items">
              <div className="cart-page__section">
                {cartItems.map((item, index) => (
                  <div key={`cart-item-${item.id || index}`} className="cart-page__item" data-cart-item-id={item.id}>
                    <div className="cart-page__image-wrapper">
                      <Link to={`/product/${item.productId}`} className="cart-page__link">
                        <img className="cart-page__image" alt={item.name} src={item.image_url} />
          </Link>
        </div>
                    <div className="cart-page__details">
                      <div className="row cart-page__row-1">
                        <Link to={`/product/${item.productId}`} className="cart-page__product-link">
                          <h3 className="cart-page__product-title">{item.name}</h3>
                        </Link>
                </div>
                      <div className="row cart-page__row-2">
                        <span className="cart-page__price">
                    {item.discount_percentage > 0 ? (
                      <>
                              <span className="original-price">
                                {(Number(item.price) || 0).toLocaleString()}đ
                              </span>
                              <span className="discounted-price">
                                {((Number(item.price) || 0) * (1 - (Number(item.discount_percentage) || 0) / 100)).toLocaleString()}đ
                        </span>
                      </>
                    ) : (
                            <span>{(Number(item.price) || 0).toLocaleString()}đ</span>
                          )}
                        </span>
                        <div className="cart-page__quantity">
                          <button 
                            className="cart-page__quantity-decrease" 
                            aria-label="Decrease Quantity"
                            onClick={() => handleCartUpdate('update', { cart_item_id: item.id, quantity: Math.max(1, item.quantity - 1) })}
                            disabled={item.quantity <= 1}
                          >
                            <svg className="cart-page__icon-minus" width="14px" height="2px" viewBox="0 0 14 2" aria-hidden="true">
                              <polygon fill="black" points="14 2 0 2 0 0 14 0"></polygon>
                            </svg>
                          </button>
                          <input 
                            className="cart-page__quantity-value" 
                            type="number" 
                            value={item.quantity} 
                            aria-label="Quantity" 
                            min="1"
                            onChange={(e) => handleCartUpdate('update', { cart_item_id: item.id, quantity: Math.max(1, parseInt(e.target.value)) })}
                          />
                    <button
                            className="cart-page__quantity-increase" 
                            aria-label="Increase Quantity"
                            onClick={() => handleCartUpdate('update', { cart_item_id: item.id, quantity: item.quantity + 1 })}
                    >
                            <svg className="cart-page__icon-plus" width="14px" height="14px" viewBox="0 0 14 14" aria-hidden="true">
                              <polygon fill="black" points="14 8 0 8 0 6 14 6"></polygon>
                              <rect fill="black" x="6" y="0" width="2" height="14"></rect>
                            </svg>
                    </button>
                        </div>
                      </div>
                    </div>
                    <button
                      className="cart-page__remove" 
                      title="Remove from cart" 
                      aria-label="Remove from cart"
                      onClick={() => handleCartUpdate('delete', { cart_item_id: item.id })}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18"></path>
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>
          <div className="col-4">
            <div className="cart-page__summary">
              <div className="cart-page__summary-title">
                <h3>Chi tiết khuyến mãi</h3>
              </div>
              <div className="cart-page__summary-total">
                <span className="cart-page__summary-total-title">Tổng tiền hàng</span>
                <span className="cart-page__summary-total-price">{totalPrice.toLocaleString()}đ</span>
              </div>
              <div className="cart-page__summary-sale">
                <span className="cart-page__summary-sale-title">Giảm giá sản phẩm</span>
                <span className="cart-page__summary-sale-price">-{totalDiscount.toLocaleString()}đ</span>
              </div>
              <div className="cart-page__summary-detail">
                <div className="cart-page__summary-detail-sale">
                  <span>Tiết kiệm</span>
                  <span>-{totalDiscount.toLocaleString()}đ</span>
                </div>
                <div className="cart-page__summary-detail-total">
                  <span>Tổng số tiền</span>
                  <span>{(totalPrice - totalDiscount).toLocaleString()}đ</span>
                </div>
              </div>
              <Link to="/checkout" className="cart-page__summary-btn-order">Mua hàng</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart; 