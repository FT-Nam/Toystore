import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authFetch } from '../../utils/authFetch';
import './PaymentSuccess.scss';

const PaymentSuccess = () => {
  const [paymentStatus, setPaymentStatus] = useState('processing');
  const [orderData, setOrderData] = useState(null);
  const [error, setError] = useState(null);
  const hasCreatedOrderRef = useRef(false);
  const navigate = useNavigate();
  const location = useLocation();

  console.log("== Debug localStorage ==");
console.log("cartItems:", localStorage.getItem('cartItems'));
console.log("shippingAddress:", localStorage.getItem('shippingAddress'));
console.log("shippingPhone:", localStorage.getItem('shippingPhone'));
console.log("shippingCost:", localStorage.getItem('shippingCost'));
console.log("userId:", localStorage.getItem('userId'));

  useEffect(() => {
    const handlePaymentCallback = async () => {
      if (hasCreatedOrderRef.current) return;
      hasCreatedOrderRef.current = true;
      try {
        // Gọi API xác thực kết quả thanh toán
        const response = await authFetch(`http://localhost:8080/api/v1/payments/payment-callback${location.search}`);
        const data = await response.json();
  
        console.log('Payment verification response:', data);
  
        if (data.code === 1000 && data.message === 'Payment successful') {
          setPaymentStatus('success');
  
          // Lấy thông tin đơn hàng từ sessionStorage
          const orderInfoStr = sessionStorage.getItem('orderInfo');
          console.log('Order info from sessionStorage:', orderInfoStr);
          
          if (!orderInfoStr) {
            throw new Error('Không tìm thấy thông tin đơn hàng');
          }
          const orderInfo = JSON.parse(orderInfoStr);
          console.log('Parsed order info:', orderInfo);

          // Kiểm tra thông tin giỏ hàng từ sessionStorage
          if (!orderInfo.items || orderInfo.items.length === 0) {
            throw new Error('Giỏ hàng trống');
          }
  
          // Tạo đơn hàng với thông tin từ sessionStorage
          const orderRequestData = {
            userId: parseInt(orderInfo.userId),
            status: "PAID",
            shippingFee: parseFloat(orderInfo.shippingFee || '0'),
            address: orderInfo.address || '',
            phone: orderInfo.phone || '',
            paymentMethod: "VNPAY",
            orderItems: orderInfo.items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
              cartId: item.cartId
            }))
          };
  
          console.log('Creating order with data:', JSON.stringify(orderRequestData, null, 2));
  
          const orderResponse = await authFetch('http://localhost:8080/api/v1/order', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderRequestData)
          });
  
          if (!orderResponse.ok) {
            const errorData = await orderResponse.json();
            console.error('Order creation failed:', errorData);
            throw new Error(`Failed to create order: ${errorData.message || 'Unknown error'}`);
          }
  
          const orderResponseData = await orderResponse.json();
          console.log('Order created:', orderResponseData);
          
          setOrderData({
            id: orderResponseData.value.id,
            totalAmount: orderInfo.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) + parseFloat(orderInfo.shippingFee || '0'),
            itemCount: orderInfo.items.reduce((sum, item) => sum + item.quantity, 0),
            address: orderInfo.address,
            phone: orderInfo.phone,
            date: new Date().toLocaleDateString('vi-VN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })
          });
  
          // Xoá thông tin đơn hàng khỏi sessionStorage
          sessionStorage.removeItem('orderInfo');
          localStorage.removeItem('shippingAddress');
          localStorage.removeItem('shippingPhone');
          localStorage.removeItem('shippingCost');
        } else {
          setPaymentStatus('failed');
          setError(data.message || 'Thanh toán thất bại');
        }
      } catch (err) {
        console.error('Payment verification error:', err);
        setPaymentStatus('failed');
        setError(err.message || 'Có lỗi xảy ra khi xác thực thanh toán');
      }
    };
  
    handlePaymentCallback();
  }, [location.search]);
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="payment-result-container">
      {paymentStatus === 'processing' && (
        <div className="payment-processing">
          <div className="loader"></div>
          <h2>Đang xử lý thanh toán...</h2>
          <p>Vui lòng không đóng trang này trong khi chúng tôi xác nhận giao dịch của bạn.</p>
        </div>
      )}

      {paymentStatus === 'success' && orderData && (
        <div className="payment-success">
          <div className="success-header">
            <div className="success-icon">
              <svg viewBox="0 0 24 24" width="90" height="90">
                <path fill="currentColor" d="M12,0A12,12,0,1,0,24,12,12,12,0,0,0,12,0Zm6.25,8.5L11.53,15.61l-3.79-3.79a1,1,0,0,0-1.42,1.42l4.5,4.5a1,1,0,0,0,1.42,0l7.5-7.5a1,1,0,0,0-1.42-1.42Z"></path>
              </svg>
            </div>
            <h1>Thanh toán thành công!</h1>
            <p>Cảm ơn bạn đã mua sắm tại ToyStore</p>
          </div>
          
          <div className="order-details">
            <div className="order-info">
              <div className="info-row">
                <span>Mã đơn hàng:</span>
                <strong>#{orderData.id}</strong>
              </div>
              <div className="info-row">
                <span>Ngày đặt hàng:</span>
                <strong>{orderData.date}</strong>
              </div>
              <div className="info-row">
                <span>Số sản phẩm:</span>
                <strong>{orderData.itemCount}</strong>
              </div>
              <div className="info-row">
                <span>Địa chỉ giao hàng:</span>
                <strong>{orderData.address}</strong>
              </div>
              <div className="info-row">
                <span>Số điện thoại:</span>
                <strong>{orderData.phone}</strong>
              </div>
              <div className="info-row total">
                <span>Tổng thanh toán:</span>
                <strong>{formatCurrency(orderData.totalAmount)}</strong>
              </div>
            </div>
            
            <div className="order-status">
              <div className="status-timeline">
                <div className="status-step completed">
                  <div className="step-icon">
                    <i className="fa fa-check-circle"></i>
                  </div>
                  <div className="step-label">Đặt hàng</div>
                </div>
                <div className="status-step completed">
                  <div className="step-icon">
                    <i className="fa fa-credit-card"></i>
                  </div>
                  <div className="step-label">Thanh toán</div>
                </div>
                <div className="status-step">
                  <div className="step-icon">
                    <i className="fa fa-box"></i>
                  </div>
                  <div className="step-label">Đóng gói</div>
                </div>
                <div className="status-step">
                  <div className="step-icon">
                    <i className="fa fa-truck"></i>
                  </div>
                  <div className="step-label">Vận chuyển</div>
                </div>
              </div>
            </div>
          </div>
          
        
          <div className="success-actions">
            <button 
              className="btn-primary"
              onClick={() => navigate('/orders')}
            >
              <i className="fa fa-list-alt"></i> Xem đơn hàng của tôi
            </button>
            <button 
              className="btn-outline"
              onClick={() => navigate('/')}
            >
              <i className="fa fa-shopping-bag"></i> Tiếp tục mua sắm
            </button>
          </div>
        </div>
      )}

      {paymentStatus === 'failed' && (
        <div className="payment-failed">
          <div className="failed-icon">
            <svg viewBox="0 0 24 24" width="90" height="90">
              <path fill="currentColor" d="M12,0A12,12,0,1,0,24,12,12,12,0,0,0,12,0Zm4.71,15.29a1,1,0,0,1-1.42,1.42L12,13.41,8.71,16.71a1,1,0,0,1-1.42-1.42L10.59,12,7.29,8.71A1,1,0,0,1,8.71,7.29L12,10.59l3.29-3.3a1,1,0,0,1,1.42,1.42L13.41,12Z"></path>
            </svg>
          </div>
          <h1>Thanh toán thất bại</h1>
          <p className="error-message">{error}</p>
          <div className="failed-description">
            <p>Đã xảy ra lỗi trong quá trình thanh toán. Vui lòng kiểm tra thông tin thanh toán của bạn và thử lại.</p>
          </div>
          <div className="failed-actions">
            <button 
              className="btn-primary"
              onClick={() => navigate('/checkout')}
            >
              <i className="fa fa-refresh"></i> Thử lại
            </button>
            <button 
              className="btn-outline"
              onClick={() => navigate('/cart')}
            >
              <i className="fa fa-shopping-cart"></i> Quay lại giỏ hàng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentSuccess; 