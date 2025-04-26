import React from 'react';
import { Link } from 'react-router-dom';
import './CartPage.scss';

const CartPage = ({ cartItems, onUpdateQuantity, onRemoveItem, onCheckout, isLoggedIn }) => {
  const calculateTotals = () => {
    let totalPrice = 0;
    let totalDiscount = 0;

    cartItems.forEach(item => {
      const originalPrice = item.price;
      const price = item.is_sale 
        ? originalPrice * (1 - item.discount_percentage / 100)
        : originalPrice;
      const totalItemPrice = price * item.quantity;
      const itemDiscount = (originalPrice - price) * item.quantity;

      totalPrice += totalItemPrice;
      totalDiscount += itemDiscount;
    });

    return { totalPrice, totalDiscount };
  };

  if (!isLoggedIn) {
    return (
      <div className="cart-page cart-page__no-login">
        <div className="container">
          <h1 className="cart-page__title-no-login">Giỏ hàng của bạn đang trống</h1>
          <p className="cart-page__message-no-login">
            Vui lòng <Link to="/login" className="cart-page__login-link-no-login">đăng nhập</Link>
            để sử dụng chức năng này.
          </p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="cart-page__empty">
        <div className="cart-page__empty-title">
          <h2>Giỏ hàng trống</h2>
        </div>
        <div className="cart-page__empty-message">
          <p>Bạn chưa có sản phẩm nào trong giỏ hàng</p>
        </div>
        <Link to="/" className="cart-page__continue-shopping">
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  const { totalPrice, totalDiscount } = calculateTotals();

  return (
    <div className="cart-page">
      <div className="container">
        <header className="cart-page__header">
          <h1 className="cart-page__title">
            Giỏ hàng (<span className="cart-page__quantity-title">{cartItems.length}</span>)
          </h1>
        </header>

        <div className="row">
          <div className="col-8">
            <section className="cart-page__items">
              <div className="cart-page__section">
                {cartItems.map(item => {
                  const price = item.is_sale 
                    ? item.price * (1 - item.discount_percentage / 100)
                    : item.price;
                  const totalItemPrice = price * item.quantity;

                  return (
                    <div key={item.cart_item_id} className="cart-page__item" data-cart-item-id={item.cart_item_id}>
                      <div className="cart-page__image-wrapper">
                        <Link to={`/product/${item.product_id}`} className="cart-page__link">
                          <img className="cart-page__image" alt={item.name} src={item.image_url} />
                        </Link>
                      </div>
                      <div className="cart-page__details">
                        <div className="row cart-page__row-1">
                          <Link to={`/product/${item.product_id}`} className="cart-page__product-link">
                            <h3 className="cart-page__product-title">{item.name}</h3>
                          </Link>
                        </div>
                        <div className="row cart-page__row-2">
                          <span className="cart-page__price">{price.toLocaleString()} Đ</span>
                          <div className="cart-page__quantity">
                            <button 
                              className="cart-page__quantity-decrease" 
                              aria-label="Decrease Quantity"
                              onClick={() => onUpdateQuantity(item.cart_item_id, item.quantity - 1)}
                            >
                              <svg className="cart-page__icon-minus" width="14px" height="2px" viewBox="0 0 14 2" aria-hidden="true">
                                <polygon fill="currentColor" points="14 2 0 2 0 0 14 0"></polygon>
                              </svg>
                            </button>
                            <input 
                              className="cart-page__quantity-value" 
                              type="number"
                              value={item.quantity} 
                              onChange={(e) => onUpdateQuantity(item.cart_item_id, parseInt(e.target.value))}
                              min="1"
                              aria-label="Quantity"
                            />
                            <button 
                              className="cart-page__quantity-increase" 
                              aria-label="Increase Quantity"
                              onClick={() => onUpdateQuantity(item.cart_item_id, item.quantity + 1)}
                            >
                              <svg className="cart-page__icon-plus" width="14px" height="14px" viewBox="0 0 14 14" aria-hidden="true">
                                <polygon fill="currentColor" points="14 8 0 8 0 6 14 6"></polygon>
                                <rect fill="currentColor" x="6" y="0" width="2" height="14"></rect>
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                      <button 
                        className="cart-page__remove" 
                        title="Remove from cart" 
                        aria-label="Remove from cart"
                        onClick={() => onRemoveItem(item.cart_item_id)}
                      >
                        🗑️
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          <div className="col-4">
            <div className="cart-page__summary">
              <div className="cart-page__summary-title">
                <h3>Chi tiết khuyến mãi</h3>
              </div>
              <div className="cart-page__summary-total">
                <span className="cart-page__summary-total-title">
                  Tổng tiền hàng
                </span>
                <span className="cart-page__summary-total-price">
                  {totalPrice.toLocaleString()} Đ
                </span>
              </div>

              <div className="cart-page__summary-sale">
                <span className="cart-page__summary-sale-title">
                  Giảm giá sản phẩm
                </span>
                <span className="cart-page__summary-sale-price">
                  -{totalDiscount.toLocaleString()} Đ
                </span>
              </div>

              <div className="cart-page__summary-detail">
                <div className="cart-page__summary-detail-sale">
                  <span>Tiết kiệm</span>
                  <span>-{totalDiscount.toLocaleString()} Đ</span>
                </div>
                <div className="cart-page__summary-detail-total">
                  <span>Tổng số tiền</span>
                  <span>{(totalPrice - totalDiscount).toLocaleString()} Đ</span>
                </div>
              </div>

              <Link to="/cart/checkout" className="cart-page__summary-btn-order">
                Mua hàng
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage; 