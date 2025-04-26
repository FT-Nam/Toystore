import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authFetch } from '../../utils/authFetch';

const Checkout = () => {
  console.log('Checkout component mounted');
  
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherApplied, setVoucherApplied] = useState(false);
  const [voucherDiscount, setVoucherDiscount] = useState(0);
  const [shippingCost, setShippingCost] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const navigate = useNavigate();

  // Fetch user data and cart data
  useEffect(() => {
    console.log('Fetching initial data...');
    const fetchData = async () => {
      try {
        // Fetch user data
        const userId = localStorage.getItem('userId');
        const username = localStorage.getItem('username');
        
        console.log('Current userId:', userId);
        console.log('Current username:', username);
        
        if (userId || username) {
          console.log('Fetching user data...');
          const userResponse = await authFetch(
            userId 
              ? `http://localhost:8080/api/v1/user/id/${userId}`
              : `http://localhost:8080/api/v1/user/email-provider?email=${encodeURIComponent(username)}&provider=${localStorage.getItem('loginProvider') || 'LOCAL'}`
          );
          const userData = await userResponse.json();
          console.log('User data received:', userData);
          
          if (userData.code === 1000 && userData.value) {
            const userAddress = userData.value.address || 
                              userData.value.userAddress || 
                              userData.value.shippingAddress || 
                              '';
            const userPhone = userData.value.phone || 
                            userData.value.userPhone || 
                            userData.value.contactPhone || 
                            '';

            console.log('Setting address:', userAddress);
            console.log('Setting phone:', userPhone);
            
            setAddress(userAddress);
            setPhone(userPhone);
          }
        }

        // Fetch cart data
        console.log('Fetching cart data...');
        const cartResponse = await authFetch('http://localhost:8080/api/v1/cart');
        const cartData = await cartResponse.json();
        console.log('Cart data received:', cartData);
        
        if (cartData.code === 1000) {
          setCart(cartData.value);
          setTotalPrice(cartData.value.totalPrice);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Có lỗi xảy ra khi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handlePayment = async () => {
    if (!address || !phone) {
      setError('Vui lòng nhập đầy đủ thông tin giao hàng');
      return;
    }

    try {
      // Lưu thông tin giao hàng vào localStorage
      localStorage.setItem('shippingAddress', address);
      localStorage.setItem('shippingPhone', phone);
      localStorage.setItem('shippingCost', shippingCost.toString());

      // Lấy thông tin giỏ hàng và lưu vào localStorage
      const cartResponse = await authFetch('http://localhost:8080/api/v1/cart');
      const cartData = await cartResponse.json();
      localStorage.setItem('cartItems', JSON.stringify(cartData.value));

      if (paymentMethod === 'VNPAY') {
        // Tạo đơn hàng tạm thời
        const orderRequestData = {
          userId: parseInt(localStorage.getItem('userId')),
          status: "PENDING",
          shippingFee: shippingCost,
          address: address,
          phone: phone,
          paymentMethod: "VNPAY"
        };

        const orderResponse = await authFetch('http://localhost:8080/api/v1/order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(orderRequestData)
        });

        if (!orderResponse.ok) {
          const errorData = await orderResponse.json();
          throw new Error(errorData.message || 'Failed to create order');
        }

        const orderData = await orderResponse.json();
        const orderId = orderData.value.id;

        // Gọi API thanh toán VNPay
        const paymentResponse = await authFetch(`http://localhost:8080/api/v1/payments/create-payment/${orderId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!paymentResponse.ok) {
          const errorData = await paymentResponse.json();
          throw new Error(errorData.message || 'Failed to create payment');
        }

        const paymentData = await paymentResponse.json();
        window.location.href = paymentData.value;
      } else {
        // Xử lý thanh toán COD
        const orderRequestData = {
          userId: parseInt(localStorage.getItem('userId')),
          status: "PENDING",
          shippingFee: shippingCost,
          address: address,
          phone: phone,
          paymentMethod: "COD"
        };

        const orderResponse = await authFetch('http://localhost:8080/api/v1/order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(orderRequestData)
        });

        if (!orderResponse.ok) {
          const errorData = await orderResponse.json();
          throw new Error(errorData.message || 'Failed to create order');
        }

        const orderData = await orderResponse.json();
        setOrderId(orderData.value.id);
        setShowSuccessModal(true);
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'Có lỗi xảy ra khi xử lý thanh toán');
    }
  };

  // Xử lý callback từ VNPay
  useEffect(() => {
    const handleVNPayCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const vnp_ResponseCode = urlParams.get('vnp_ResponseCode');
      
      if (vnp_ResponseCode) {
        try {
          const response = await authFetch(`http://localhost:8080/api/v1/payments/payment-callback?${window.location.search}`);
          const data = await response.json();
          
          if (data.message === 'Payment successful') {
            // Tạo order sau khi thanh toán thành công
            const userId = localStorage.getItem('userId');
            const orderRequestData = {
              userId: parseInt(userId),
              status: "PAID",
              shippingFee: shippingCost,
              address: address
            };

            const orderResponse = await authFetch('http://localhost:8080/api/v1/order', {
              method: 'POST',
              body: JSON.stringify(orderRequestData)
            });

            if (!orderResponse.ok) {
              throw new Error('Failed to create order after payment');
            }

            const orderResponseData = await orderResponse.json();
            setOrderId(orderResponseData.value.id);
            setShowSuccessModal(true);
          } else {
            alert('Thanh toán thất bại');
          }
        } catch (error) {
          console.error('Callback error:', error);
          alert('Có lỗi xảy ra khi xử lý kết quả thanh toán');
        }
      }
    };

    handleVNPayCallback();
  }, []);

  return (
    <div className="checkout-container">
      <div className="checkout-shipping">
        <h2>Thông tin giao hàng</h2>
        <div className="shipping-form">
          <div className="form-group">
            <label htmlFor="address">Địa chỉ</label>
            {address ? (
              <div className="address-display">
                <p>{address}</p>
                <button 
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => setAddress('')}
                >
                  Thay đổi
                </button>
              </div>
            ) : (
              <input
                type="text"
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Nhập địa chỉ giao hàng"
              />
            )}
          </div>
          <div className="form-group">
            <label htmlFor="phone">Số điện thoại</label>
            {phone ? (
              <div className="phone-display">
                <p>{phone}</p>
                <button 
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => setPhone('')}
                >
                  Thay đổi
                </button>
              </div>
            ) : (
              <input
                type="text"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Nhập số điện thoại"
              />
            )}
          </div>
        </div>
      </div>

      <div className="checkout-payment">
        <h2>Phương thức thanh toán</h2>
        <div className="payment-methods">
          <div className="payment-method">
            <input
              type="radio"
              id="cod"
              name="payment"
              value="COD"
              checked={paymentMethod === 'COD'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            <label htmlFor="cod">Thanh toán khi nhận hàng (COD)</label>
          </div>
          <div className="payment-method">
            <input
              type="radio"
              id="vnpay"
              name="payment"
              value="VNPAY"
              checked={paymentMethod === 'VNPAY'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            <label htmlFor="vnpay">Thanh toán qua VNPay</label>
          </div>
        </div>
      </div>

      <div className="checkout-summary">
        <h2>Tổng thanh toán</h2>
        <div className="summary-details">
          <div className="summary-row">
            <span>Tạm tính:</span>
            <span>{totalPrice.toLocaleString('vi-VN')}đ</span>
          </div>
          {voucherDiscount > 0 && (
            <div className="summary-row">
              <span>Giảm giá:</span>
              <span>-{voucherDiscount.toLocaleString('vi-VN')}đ</span>
            </div>
          )}
          <div className="summary-row">
            <span>Phí vận chuyển:</span>
            <span>{shippingCost.toLocaleString('vi-VN')}đ</span>
          </div>
          <div className="summary-row total">
            <span>Tổng cộng:</span>
            <span>{(totalPrice + shippingCost - voucherDiscount).toLocaleString('vi-VN')}đ</span>
          </div>
        </div>
        <button 
          className="btn btn-primary btn-lg w-100"
          onClick={handlePayment}
        >
          Đặt hàng
        </button>
      </div>

      {showSuccessModal && (
        <div className="success-modal">
          <div className="success-content">
            <div className="success-icon">✓</div>
            <h2>Đặt hàng thành công!</h2>
            <p>Mã đơn hàng của bạn là: {orderId}</p>
            <div className="success-actions">
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/orders')}
              >
                Xem đơn hàng
              </button>
              <button 
                className="btn btn-outline-primary"
                onClick={() => navigate('/')}
              >
                Tiếp tục mua sắm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout; 