import React from 'react';
import { Link } from 'react-router-dom';
import './CartOverlay.scss';

const CartOverlay = ({ cartItems, onClose, onUpdateQuantity, onRemoveItem, onCheckout }) => {
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.is_sale 
        ? item.price * (1 - item.discount_percentage / 100)
        : item.price;
      return total + (price * item.quantity);
    }, 0);
  };

  return (
    <div className="cart-overlay">
      <div className="cart-overlay__content">
        <div className="cart-overlay__header">
          <h3>Giỏ hàng</h3>
          <button className="close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        {cartItems.length === 0 ? (
          <div className="cart-empty">
            <i className="fas fa-shopping-cart"></i>
            <p>Giỏ hàng trống</p>
            <button onClick={onClose}>Tiếp tục mua sắm</button>
          </div>
        ) : (
          <>
            <div className="cart-overlay__items">
              <table className="cart-items">
                <tbody>
                  {cartItems.map(item => {
                    const price = item.is_sale 
                      ? item.price * (1 - item.discount_percentage / 100)
                      : item.price;
                    const totalItemPrice = price * item.quantity;

                    return (
                      <tr key={item.cart_item_id} className="cart-item">
                        <td className="cart-item__media">
                          <img src={item.image_url} alt={item.name} width="100" height="100" />
                        </td>
                        <td className="cart-item__details">
                          <div className="cart-item__name-container">
                            <Link to={`/ToyStore/product/${item.product_id}`} className="cart-item__name">
                              {item.name}
                            </Link>
                            <button 
                              className="cart-item__delete"
                              onClick={() => onRemoveItem(item.cart_item_id)}
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                        <td className="cart-item cart-item__quantity-price">
                          <div className="cart-item__quantity">
                            <button 
                              className="quantity-btn decrease-btn"
                              onClick={() => onUpdateQuantity(item.cart_item_id, item.quantity - 1)}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" className="icon icon-minus" fill="none" viewBox="0 0 10 2">
                                <path fillRule="evenodd" clipRule="evenodd" d="M.5 1C.5.7.7.5 1 .5h8a.5.5 0 110 1H1A.5.5 0 01.5 1z" fill="currentColor"/>
                              </svg>
                            </button>
                            <input
                              type="number"
                              className="cart-quantity__input"
                              value={item.quantity}
                              onChange={(e) => onUpdateQuantity(item.cart_item_id, parseInt(e.target.value))}
                              min="1"
                            />
                            <button 
                              className="quantity-btn increase-btn"
                              onClick={() => onUpdateQuantity(item.cart_item_id, item.quantity + 1)}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" className="icon icon-plus" fill="none" viewBox="0 0 10 10">
                                <path fillRule="evenodd" clipRule="evenodd" d="M1 4.51a.5.5 0 000 1h3.5l.01 3.5a.5.5 0 001-.01V5.5l3.5-.01a.5.5 0 00-.01-1H5.5L5.49.99a.5.5 0 00-1 .01v3.5l-3.5.01H1z" fill="currentColor"/>
                              </svg>
                            </button>
                          </div>
                          <div className="cart-item__price">
                            <span>{totalItemPrice.toLocaleString()} Đ</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="cart-overlay__footer">
              <div className="check-box">
                <input type="checkbox" id="save-cart" />
                <label htmlFor="save-cart">
                  Lưu giỏ hàng cho lần sau
                </label>
              </div>
              <div className="totals">
                <p className="totals__subtotal">Tổng cộng</p>
                <p className="totals__subtotal-value">{calculateTotal().toLocaleString()} Đ</p>
              </div>
              <div className="cart__ctas">
                <Link to="/ToyStore/cart" className="cart__go-cart button">
                  Xem giỏ hàng
                </Link>
                <button className="cart__checkout button" onClick={onCheckout}>
                  Thanh toán ngay
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CartOverlay; 