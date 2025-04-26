import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authFetch } from '../../../utils/authFetch';
import './Checkout.scss';

const Checkout = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [userAddress, setUserAddress] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [shippingFee, setShippingFee] = useState(16500);
  const [freeShipping, setFreeShipping] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState('cod');
  const [showModal, setShowModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const freeShippingThreshold = 100000;

  useEffect(() => {
    fetchCartData();
    fetchUserData();
  }, []);

  const fetchCartData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const userId = localStorage.getItem('userId');

      if (!token || !userId) {
        navigate('/login');
        return;
      }

      const cartResponse = await authFetch(`http://localhost:8080/api/v1/cart/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const cartData = await cartResponse.json();

      if (cartData && cartData.code === 1000 && cartData.value) {
        const cartId = cartData.value.id;
        const itemsResponse = await authFetch(`http://localhost:8080/api/v1/cart/${cartId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const itemsData = await itemsResponse.json();

        if (itemsData && itemsData.code === 1000 && itemsData.value) {
          const items = itemsData.value;
          const itemsWithDetails = await Promise.all(
            items.map(async (item) => {
              const productResponse = await authFetch(`http://localhost:8080/api/v1/product/${item.productId}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              const productData = await productResponse.json();

              if (productData && productData.code === 1000 && productData.value) {
                return {
                  ...item,
                  name: productData.value.name,
                  image_url: productData.value.thumbnail || `http://localhost:8080/api/v1/product-img/thumbnail/${item.productId}`,
                  discount_percentage: productData.value.discount_percentage || 0,
                  price: productData.value.price
                };
              }
              return item;
            })
          );

          setCartItems(itemsWithDetails);
          const total = itemsWithDetails.reduce((total, item) => {
            const price = item.discount_percentage > 0
              ? item.price * (1 - item.discount_percentage / 100)
              : item.price;
            return total + price * item.quantity;
          }, 0);
          setTotalPrice(total);
        }
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        navigate('/login');
        return;
      }
      const userId = localStorage.getItem('userId');
      const userResponse = await authFetch(`http://localhost:8080/api/v1/user/id/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userData = await userResponse.json();
      if (userData && userData.code === 1000 && userData.value) {
        setUserAddress({
          name: `${userData.value.firstname} ${userData.value.lastname}`,
          phone: userData.value.phone,
          address: userData.value.address
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
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
        const response = await authFetch(`http://localhost:8080/api/v1/cart/cart-detail/${data.cart_item_id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          fetchCartData();
        }
      } else if (action === 'update') {
        const response = await authFetch(`http://localhost:8080/api/v1/cart/cart-detail/${data.cart_item_id}`, {
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

  const calculateShipping = () => {
    if (freeShipping && totalPrice >= freeShippingThreshold) {
      return 0;
    }
    return shippingFee;
  };

  const calculateTotal = () => {
    return totalPrice + calculateShipping();
  };

  const handlePlaceOrder = async () => {
    if (!userAddress || !userAddress.address) {
      setShowAddressModal(true);
      return;
    }
  
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('accessToken');
      const userId = localStorage.getItem('userId');
  
      if (!token || !userId) {
        navigate('/login');
        return;
      }
  
      const shipping = calculateShipping();
  
      if (selectedPayment === 'vnpay') {
        // 👉 Lưu thông tin order vào localStorage trước khi redirect
        sessionStorage.setItem('orderInfo', JSON.stringify({
          userId,
          status: 'PENDING',
          paymentMethod: 'VNPAY',
          shippingFee: shipping,
          address: userAddress.address,
          total: calculateTotal(),
          items: cartItems
        }));
      
        const paymentResponse = await authFetch('http://localhost:8080/api/v1/payments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            amount: calculateTotal(),
            language: 'vn',
          }),
        });
      
        const result = await paymentResponse.json();
      
        if (result && result.code === 1000 && result.value) {
          window.location.href = result.value; // ✅ Redirect tới VNPay
        } else {
          console.error('Lỗi tạo thanh toán VNPay:', result);
          alert('Không thể chuyển sang VNPay');
        }
      } else {
        // 🛒 Thanh toán COD – tạo đơn hàng trực tiếp
        const orderData = {
          userId: parseInt(userId),
          status: 'PENDING',
          paymentMethod: 'COD',
          shippingFee: shipping,
          address: userAddress.address,
          cartItems: cartItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price
          }))
        };
  
        console.log('Sending order data:', orderData);

        try {
          const response = await authFetch('http://localhost:8080/api/v1/order', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(orderData),
          });
          
          console.log('Order response status:', response.status);
          
          if (response.ok) {
            console.log('Order created successfully');
            setShowModal(true); // 🎉 Hiển thị modal đặt hàng thành công
            
            // Automatically clear cart after order is successful
            // Note: You may want to add this functionality later
          } else {
            const errorData = await response.json();
            console.error('Order failed:', errorData);
            alert(`Đặt hàng thất bại: ${errorData.message || 'Vui lòng thử lại sau'}`);
          }
        } catch (error) {
          console.error('Error submitting order:', error);
          alert('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet và thử lại.');
        }
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Đã xảy ra lỗi khi đặt hàng. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  

  return (
    <div className="checkout">
      {/* Địa chỉ nhận hàng */}
      <section className="checkout__section checkout__section--address">
        <div className="checkout__address-header">
          <span className="checkout__icon">📍</span>
          <span className="checkout__address-text">Địa Chỉ Nhận Hàng</span>
        </div>
        <div className="checkout__address-content">
          {userAddress ? (
            <>
              <p className="checkout__recipient">
                {userAddress.name} (+84) {userAddress.phone}
              </p>
              <p className="checkout__address-detail">{userAddress.address}</p>
            </>
          ) : (
            <p className="checkout__address-text">
              Vui lòng cập nhật địa chỉ nhận hàng trong hồ sơ cá nhân.
            </p>
          )}
          <a className="checkout__btn checkout__btn--change" href="/profile">
            Thay Đổi
          </a>
        </div>
      </section>

      {/* Phương thức vận chuyển */}
      <section className="checkout__section checkout__section--shipping">
        <h2 className="checkout__section-title">Phương Thức Vận Chuyển</h2>
        <div className="checkout__shipping-method">
          <input
            type="radio"
            id="standard"
            name="shipping"
            className="checkout__shipping-option"
            checked
            readOnly
          />
          <label htmlFor="standard" className="checkout__shipping-label">
            Giao Hàng Tiêu Chuẩn - ₫{shippingFee.toLocaleString()}
          </label>
        </div>
      </section>

      {/* Thông tin sản phẩm */}
      <section className="checkout__section checkout__section--product">
        <h2 className="checkout__section-title">Sản phẩm</h2>
        <div className="checkout__product-list">
          {cartItems.map((item) => (
            <div key={item.id} className="checkout__product-item">
              <img src={item.image_url} alt={item.name} className="checkout__product-image" />
              <div className="checkout__product-info">
                <p className="checkout__product-desc">{item.name}</p>
                <div className="checkout__price-info">
                  <span className="checkout__price">
                    ₫{item.price.toLocaleString()}
                  </span>
                  <span className="checkout__quantity">
                    Số lượng: {item.quantity}
                  </span>
                  <span className="checkout__total-price">
                    ₫{(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Voucher và tổng thanh toán */}
      <section className="checkout__section checkout__section--summary">
        <div className="checkout__voucher">
          <span className="checkout__voucher-label">Voucher của Shop</span>
          <div className="checkout__voucher-card">
            <div className="checkout__voucher-icon">🚚</div>
            <div className="checkout__voucher-details">
              <p className="checkout__voucher-title">Miễn phí vận chuyển</p>
              <p className="checkout__voucher-condition">
                Áp dụng cho đơn hàng từ ₫{freeShippingThreshold.toLocaleString()}
              </p>
            </div>
            <input
              type="checkbox"
              id="freeShipping"
              className="checkout__voucher-checkbox"
              checked={freeShipping}
              onChange={(e) => setFreeShipping(e.target.checked)}
            />
          </div>
        </div>

        {/* Phương thức thanh toán */}
        <section className="checkout__section checkout__section--payment">
          <h2 className="checkout__section-title">Phương Thức Thanh Toán</h2>
          <div className="checkout__payment-method">
            <input
              type="radio"
              id="paymentOnDelivery"
              name="payment"
              className="checkout__payment-option"
              checked={selectedPayment === 'cod'}
              onChange={() => setSelectedPayment('cod')}
            />
            <label htmlFor="paymentOnDelivery" className="checkout__payment-label">
              <div className="checkout__payment-method-content">
                <span className="checkout__payment-method-name">Thanh toán khi nhận hàng (COD)</span>
                <span className="checkout__payment-method-desc">Thanh toán bằng tiền mặt khi nhận hàng</span>
              </div>
            </label>
          </div>
          <div className="checkout__payment-method">
            <input
              type="radio"
              id="paymentVNPay"
              name="payment"
              className="checkout__payment-option"
              checked={selectedPayment === 'vnpay'}
              onChange={() => setSelectedPayment('vnpay')}
            />
            <label htmlFor="paymentVNPay" className="checkout__payment-label">
              <div className="checkout__payment-method-content">
                <div className="checkout__payment-method-header">
                  <img src="https://sandbox.vnpayment.vn/paymentv2/Images/brands/logo-en.svg" alt="VNPay" className="checkout__payment-method-logo" />
                  <span className="checkout__payment-method-name">VNPay</span>
                </div>
                <span className="checkout__payment-method-desc">Thanh toán qua cổng thanh toán VNPay</span>
              </div>
            </label>
          </div>
        </section>

        <div className="checkout__total">
          <p>
            Tổng tiền hàng:{' '}
            <span className="checkout__amount">
              ₫{totalPrice.toLocaleString()}
            </span>
          </p>
          <p>
            Phí vận chuyển:{' '}
            <span className="checkout__amount">
              ₫{calculateShipping().toLocaleString()}
            </span>
          </p>
          <p>
            Tổng thanh toán:{' '}
            <span className="checkout__total-amount">
              ₫{calculateTotal().toLocaleString()}
            </span>
          </p>
        </div>

        <button 
          className="checkout__btn checkout__btn--order" 
          onClick={handlePlaceOrder}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Đang xử lý...' : 'Đặt hàng'}
        </button>
      </section>

      {/* Success Modal */}
      {showModal && (
        <div className="modal-checkout" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>✅ Đặt hàng thành công!</h2>
            <p>Đơn hàng đã được xác nhận. {selectedPayment === 'cod' ? 'Bạn sẽ thanh toán khi nhận hàng (COD).' : 'Thanh toán của bạn đã được xử lý.'} Cảm ơn bạn đã mua sắm tại cửa hàng chúng tôi!</p>
            <div className="modal-buttons">
              <button className="btn" onClick={() => {
                setShowModal(false);
                navigate('/orders');
              }}>
                Xem đơn hàng của tôi
              </button>
              <button className="btn" onClick={() => {
                setShowModal(false);
                navigate('/');
              }}>
                Tiếp tục mua sắm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Address Modal */}
      {showAddressModal && (
        <div className="modal" onClick={() => setShowAddressModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Yêu cầu cập nhật địa chỉ giao hàng</h2>
            <p>Vui lòng cập nhật địa chỉ nhận hàng trong hồ sơ cá nhân trước khi đặt hàng.</p>
            <a href="/profile" className="btn">
              Cập nhật địa chỉ
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout; 