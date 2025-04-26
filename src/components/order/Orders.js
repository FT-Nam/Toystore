import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { authFetch } from '../../utils/authFetch';
import './Orders.scss';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [orderDetails, setOrderDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
          setError('User ID not found');
          setLoading(false);
          return;
        }

        const response = await authFetch(`http://localhost:8080/api/v1/order/user/${userId}`);
        const data = await response.json();

        console.log('✅ Orders API response:', data);
        
        if (data.code === 1000) {
          setOrders(data.value || []);
        } else {
          setError('Failed to fetch orders');
        }
      } catch (err) {
        setError('Error fetching orders');
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const fetchOrderDetails = async (orderId) => {
    if (orderDetails[orderId]) {
      // Đã có chi tiết đơn hàng, chỉ cần toggle hiển thị
      setExpandedOrder(expandedOrder === orderId ? null : orderId);
      return;
    }

    try {
      setLoading(true);
      const response = await authFetch(`http://localhost:8080/api/v1/order-detail/${orderId}`);
      const data = await response.json();
      
      if (data.code === 1000) {
        setOrderDetails(prev => ({
          ...prev,
          [orderId]: data.value || []
        }));
        setExpandedOrder(orderId);
      } else {
        console.error('Failed to fetch order details:', data.message);
      }
    } catch (err) {
      console.error('Error fetching order details:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Không có thông tin';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price) => {
    return (price || 0).toLocaleString('vi-VN') + 'đ';
  };

  const getStatusBadge = (status) => {
    if (!status) return <span className="badge badge-secondary">Không có thông tin</span>;
    
    switch (status) {
      case 'PENDING':
        return <span className="badge badge-warning">Đang xử lý</span>;
      case 'CONFIRMED':
        return <span className="badge badge-info">Đã xác nhận</span>;
      case 'SHIPPING':
        return <span className="badge badge-primary">Đang giao hàng</span>;
      case 'DELIVERED':
        return <span className="badge badge-success">Đã giao hàng</span>;
      case 'CANCELLED':
        return <span className="badge badge-danger">Đã hủy</span>;
      case 'PAID':
        return <span className="badge badge-success">Đã thanh toán</span>;
      default:
        return <span className="badge badge-secondary">{status}</span>;
    }
  };

  const getPaymentMethodLabel = (method) => {
    if (!method) return 'Thanh toán khi nhận hàng';
    
    switch (method) {
      case 'COD':
        return 'Thanh toán khi nhận hàng';
      case 'VNPAY':
        return 'Thanh toán qua VNPay';
      default:
        return method;
    }
  };

  if (loading && orders.length === 0) {
    return <div className="orders-loading">Loading...</div>;
  }

  if (error) {
    return <div className="orders-error">{error}</div>;
  }

  return (
    <div className="orders-container">
      <h1 className="orders-title">Lịch sử đơn hàng</h1>
      
      {orders.length === 0 ? (
        <div className="orders-empty">
          <p>Bạn chưa có đơn hàng nào.</p>
          <Link to="/product" className="btn btn-primary">
            Tiếp tục mua sắm
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <div className="order-info">
                  <h3>Đơn hàng #{order.id}</h3>
                  <p className="order-date">Ngày đặt: {formatDate(order.createdAt)}</p>
                  <p className="order-payment">
                    Phương thức thanh toán: {getPaymentMethodLabel(order.paymentMethod)}
                  </p>
                </div>
                <div className="order-status">
                  {getStatusBadge(order.status)}
                </div>
              </div>
              
              <div className="order-address">
                <div>
                  <strong>Địa chỉ giao hàng:</strong> {order.address || 'Không có thông tin'}
                </div>
                <div>
                  <strong>Số điện thoại:</strong> {order.phone || 'Không có thông tin'}
                </div>
              </div>

              <div className="order-footer">
                <div className="order-total">
                  <div className="total-row">
                    <span>Tổng tiền hàng:</span>
                    <span>{formatPrice(order.totalPrice - (order.shippingFee || 0))}</span>
                  </div>
                  <div className="total-row">
                    <span>Phí vận chuyển:</span>
                    <span>{formatPrice(order.shippingFee || 0)}</span>
                  </div>
                  <div className="total-row total-final">
                    <span>Tổng cộng:</span>
                    <span className="total-price">{formatPrice(order.totalPrice)}</span>
                  </div>
                </div>
                <Link 
                  to={`/order/${order.id}`}
                  className="btn btn-primary"
                >
                  Xem chi tiết
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders; 