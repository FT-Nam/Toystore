import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { authFetch } from '../../utils/authFetch';
import './OrderDetail.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft, 
  faShippingFast, 
  faCheckCircle, 
  faSpinner, 
  faTimes, 
  faMoneyBillWave,
  faUser,
  faMapMarkerAlt,
  faPhone,
  faCalendarAlt,
  faCreditCard,
  faBox,
  faTag
} from '@fortawesome/free-solid-svg-icons';

// Default placeholder image (data URI of a simple gray square with image icon)
const DEFAULT_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48cGF0aCBmaWxsPSIjZjBmMGYwIiBkPSJNMCAwaDEwMHYxMDBIMHoiLz48cGF0aCBkPSJNNTAgMzcuNWMtNC4xNDIgMC03LjUgMy4zNTgtNy41IDcuNXMzLjM1OCA3LjUgNy41IDcuNSA3LjUtMy4zNTggNy41LTcuNS0zLjM1OC03LjUtNy41LTcuNXptMTcuNSAyNWgtMzVjLS45NiAwLTEuNzU0LS42OTMtMS45Mi0xLjY0TDI1LjAwNiA0NGMtLjE4My0xLjA3LjU0OC0yLjA3OCAxLjY0LTIuMjZhMS45OSAxLjk5IDAgMDEuMzEyLS4wMjVoNDYuMDhjMS4xMDQgMCAxLjk5OS44OTUgMS45OTkgMiAwIC4xMDQtLjAwOC4yMDktLjAyNS4zMWwtNS41NzQgMTYuODZjLS4xNjYuOTQ3LS45NiAxLjY0LTEuOTIgMS42NHoiIGZpbGw9IiM5OTkiIGZpbGwtcnVsZT0ibm9uemVybyIvPjwvZz48L3N2Zz4=';

const OrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState([]);
  const [orderInfo, setOrderInfo] = useState(null);
  const [productImages, setProductImages] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        
        // Get user ID from localStorage
        const userId = localStorage.getItem('userId');
        if (!userId) {
          throw new Error('User ID not found. Please login again.');
        }
        
        // Fetch order details
        const response = await authFetch(`http://localhost:8080/api/v1/order/order-detail/${orderId}`);
        const data = await response.json();
        
        if (data.code === 1000 && data.value) {
          setOrderDetails(data.value);
          
          // Fetch all user orders
          const orderResponse = await authFetch(`http://localhost:8080/api/v1/order/user/${userId}`);
          const orderData = await orderResponse.json();
          
          if (orderData.code === 1000 && orderData.value) {
            // Find the specific order by ID
            const specificOrder = orderData.value.find(order => order.id.toString() === orderId.toString());
            
            if (specificOrder) {
              setOrderInfo(specificOrder);
              
              // Fetch product details for images
              await fetchProductImages(data.value);
            } else {
              throw new Error('Order not found for this user');
            }
          } else {
            throw new Error('Failed to fetch order information');
          }
        } else {
          throw new Error('Failed to fetch order details');
        }
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError(err.message || 'Error fetching order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  // Fetch product images for each product in the order
  const fetchProductImages = async (orderItems) => {
    try {
      console.log('Order items to fetch images for:', orderItems);
      
      const productIds = orderItems
        .map(item => item.productId || (item.product && item.product.id))
        .filter(id => id !== undefined);
      
      console.log('Product IDs to fetch:', productIds);
      
      const imagePromises = productIds.map(async (productId) => {
        try {
          const response = await fetch(`http://localhost:8080/api/v1/product/${productId}`);
          if (!response.ok) return null;
          
          const productData = await response.json();
          console.log(`Product data for ID ${productId}:`, productData);
          
          // Handle different response structures
          let imageUrl = null;
          let productName = null;
          
          if (productData && productData.value) {
            // Try different possible paths for the thumbnail
            imageUrl = productData.value.thumbnail ||
                      productData.value.images?.[0] ||
                      (productData.value.imageUrls && productData.value.imageUrls[0]);
                      
            // Get product name
            productName = productData.value.name || productData.value.productName;
          }
          
          return { 
            productId, 
            imageUrl,
            productName
          };
        } catch (error) {
          console.error(`Error fetching product ${productId}:`, error);
          return null;
        }
      });
      
      const imageResults = await Promise.all(imagePromises);
      
      // Create maps for both images and names
      const imageMap = {};
      const nameMap = {};
      
      imageResults
        .filter(result => result !== null)
        .forEach(result => {
          if (result.imageUrl) imageMap[result.productId] = result.imageUrl;
          if (result.productName) nameMap[result.productId] = result.productName;
        });
      
      setProductImages(imageMap);
      
      // Update orderDetails with product names from API
      if (Object.keys(nameMap).length > 0) {
        setOrderDetails(prevDetails => 
          prevDetails.map(item => {
            const productId = item.productId || (item.product && item.product.id);
            if (productId && nameMap[productId]) {
              return {
                ...item,
                product: {
                  ...(item.product || {}),
                  id: productId,
                  name: nameMap[productId]
                }
              };
            }
            return item;
          })
        );
      }
      
    } catch (error) {
      console.error('Error fetching product images:', error);
    }
  };

  const formatDate = (dateString) => {
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING':
        return <FontAwesomeIcon icon={faSpinner} className="order-detail__status-icon pending" />;
      case 'CONFIRMED':
        return <FontAwesomeIcon icon={faCheckCircle} className="order-detail__status-icon confirmed" />;
      case 'SHIPPING':
        return <FontAwesomeIcon icon={faShippingFast} className="order-detail__status-icon shipping" />;
      case 'DELIVERED':
        return <FontAwesomeIcon icon={faCheckCircle} className="order-detail__status-icon delivered" />;
      case 'CANCELLED':
        return <FontAwesomeIcon icon={faTimes} className="order-detail__status-icon cancelled" />;
      case 'PAID':
        return <FontAwesomeIcon icon={faMoneyBillWave} className="order-detail__status-icon paid" />;
      default:
        return <FontAwesomeIcon icon={faSpinner} className="order-detail__status-icon" />;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'PENDING':
        return 'Đang xử lý';
      case 'CONFIRMED':
        return 'Đã xác nhận';
      case 'SHIPPING':
        return 'Đang giao hàng';
      case 'DELIVERED':
        return 'Đã giao hàng';
      case 'CANCELLED':
        return 'Đã hủy';
      case 'PAID':
        return 'Đã thanh toán';
      default:
        return status;
    }
  };

  const getPaymentMethodLabel = (method) => {
    switch (method) {
      case 'COD':
        return 'Thanh toán khi nhận hàng';
      case 'VNPAY':
        return 'Thanh toán qua VNPay';
      default:
        return method;
    }
  };

  const getProductImage = (item) => {
    if (!item) return DEFAULT_IMAGE;
    
    // Try different possible structures for product ID
    const productId = item.productId || (item.product && item.product.id);
    
    if (!productId) return DEFAULT_IMAGE;
    
    if (productImages[productId]) {
      return productImages[productId];
    }
    
    // Try different paths for thumbnails
    if (item.product) {
      if (item.product.thumbnail) return item.product.thumbnail;
      if (item.product.images && item.product.images.length > 0) return item.product.images[0];
      if (item.product.imageUrls && item.product.imageUrls.length > 0) return item.product.imageUrls[0];
    }
    
    return DEFAULT_IMAGE;
  };

  if (loading) {
    return (
      <div className="order-detail__loading">
        <div className="order-detail__spinner"></div>
        <p>Đang tải thông tin đơn hàng...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-detail__error">
        <h2>Có lỗi xảy ra</h2>
        <p>{error}</p>
        <button 
          className="order-detail__back-btn" 
          onClick={() => navigate('/orders')}
        >
          <FontAwesomeIcon icon={faArrowLeft} /> Quay lại danh sách đơn hàng
        </button>
      </div>
    );
  }

  if (!orderInfo) {
    return (
      <div className="order-detail__not-found">
        <h2>Không tìm thấy đơn hàng</h2>
        <p>Đơn hàng với mã #{orderId} không tồn tại hoặc bạn không có quyền truy cập.</p>
        <button 
          className="order-detail__back-btn" 
          onClick={() => navigate('/orders')}
        >
          <FontAwesomeIcon icon={faArrowLeft} /> Quay lại danh sách đơn hàng
        </button>
      </div>
    );
  }

  return (
    <div className="order-detail__container">
      <div className="order-detail__header">
        <button 
          className="order-detail__back-btn" 
          onClick={() => navigate('/orders')}
        >
          <FontAwesomeIcon icon={faArrowLeft} /> Quay lại danh sách đơn hàng
        </button>
        <h1 className="order-detail__title">Chi tiết đơn hàng #{orderId}</h1>
      </div>

      <div className="order-detail__content">
        <div className="order-detail__info-panel">
          <div className="order-detail__status-card">
            <div className="order-detail__status-header">
              <h2><FontAwesomeIcon icon={faBox} className="order-detail__header-icon" /> Trạng thái đơn hàng</h2>
            </div>
            <div className="order-detail__status-content">
              {orderInfo && orderInfo.status ? (
                <>
                  {getStatusIcon(orderInfo.status)}
                  <span className={`order-detail__status-text ${orderInfo.status ? orderInfo.status.toLowerCase() : ''}`}>
                    {getStatusLabel(orderInfo.status)}
                  </span>
                  
                  <div className="order-detail__order-date">
                    <FontAwesomeIcon icon={faCalendarAlt} /> Ngày đặt: {formatDate(orderInfo.createdAt)}
                  </div>
                </>
              ) : (
                <span className="order-detail__status-text">Không có thông tin trạng thái</span>
              )}
            </div>
          </div>

          <div className="order-detail__customer-card">
            <div className="order-detail__customer-header">
              <h2><FontAwesomeIcon icon={faUser} className="order-detail__header-icon" /> Thông tin đơn hàng</h2>
            </div>
            <div className="order-detail__customer-content">
              <div className="order-detail__info-row">
                <FontAwesomeIcon icon={faUser} className="order-detail__info-icon" />
                <div className="order-detail__info-text">
                  <span className="order-detail__info-label">Người đặt hàng:</span>
                  <span className="order-detail__info-value">
                    {localStorage.getItem('username') || 'Khách hàng'}
                  </span>
                </div>
              </div>
              
              <div className="order-detail__info-row">
                <FontAwesomeIcon icon={faPhone} className="order-detail__info-icon" />
                <div className="order-detail__info-text">
                  <span className="order-detail__info-label">Số điện thoại:</span>
                  <span className="order-detail__info-value">
                    {orderInfo.phone || 'Không có thông tin'}
                  </span>
                </div>
              </div>
              
              <div className="order-detail__info-row">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="order-detail__info-icon" />
                <div className="order-detail__info-text">
                  <span className="order-detail__info-label">Địa chỉ giao hàng:</span>
                  <span className="order-detail__info-value">{orderInfo.address || 'Không có thông tin'}</span>
                </div>
              </div>
              
              <div className="order-detail__info-row">
                <FontAwesomeIcon icon={faCreditCard} className="order-detail__info-icon" />
                <div className="order-detail__info-text">
                  <span className="order-detail__info-label">Phương thức thanh toán:</span>
                  <span className="order-detail__info-value">
                    {orderInfo.paymentMethod ? getPaymentMethodLabel(orderInfo.paymentMethod) : 'Thanh toán khi nhận hàng'}
                  </span>
                </div>
              </div>
              
              {orderInfo.note && (
                <div className="order-detail__info-row">
                  <FontAwesomeIcon icon={faTag} className="order-detail__info-icon" />
                  <div className="order-detail__info-text">
                    <span className="order-detail__info-label">Ghi chú:</span>
                    <span className="order-detail__info-value order-detail__note">{orderInfo.note}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="order-detail__summary-panel">
            <div className="order-detail__summary-header">
              <h2><FontAwesomeIcon icon={faMoneyBillWave} className="order-detail__header-icon" /> Tổng thanh toán</h2>
            </div>
            <div className="order-detail__summary-content">
              <div className="order-detail__summary-row">
                <span>Tổng tiền hàng:</span>
                <span>{formatPrice(orderInfo.totalPrice - (orderInfo.shippingFee || 0))}</span>
              </div>
              <div className="order-detail__summary-row">
                <span>Phí vận chuyển:</span>
                <span>{formatPrice(orderInfo.shippingFee || 0)}</span>
              </div>
              {orderInfo.discountAmount > 0 && (
                <div className="order-detail__summary-row discount">
                  <span>Giảm giá:</span>
                  <span>-{formatPrice(orderInfo.discountAmount)}</span>
                </div>
              )}
              <div className="order-detail__summary-row total">
                <span>Tổng thanh toán:</span>
                <span>{formatPrice(orderInfo.totalPrice)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="order-detail__products-section">
          <h2 className="order-detail__products-title">
            <FontAwesomeIcon icon={faBox} className="order-detail__header-icon" /> 
            Sản phẩm đã đặt
          </h2>
          <div className="order-detail__products-list">
            {orderDetails.length > 0 ? (
              orderDetails.map((item) => {
                const productId = item.productId || (item.product && item.product.id);
                const productName = (item.product && item.product.name) || 
                                    `Sản phẩm #${productId || ''}`;
                
                return (
                  <div key={item.id || `item-${productId}`} className="order-detail__product-item">
                    <div className="order-detail__product-image">
                      <img 
                        src={getProductImage(item)} 
                        alt={productName}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = DEFAULT_IMAGE;
                        }}
                      />
                    </div>
                    
                    <div className="order-detail__product-info">
                      <h3 className="order-detail__product-name">
                        {productId ? (
                          <Link to={`/product/${productId}`}>
                            {productName}
                          </Link>
                        ) : (
                          <span>{productName}</span>
                        )}
                      </h3>
                      <div className="order-detail__product-price">
                        <span>Đơn giá: {formatPrice(item.price)}</span>
                      </div>
                    </div>
                    
                    <div className="order-detail__product-quantity">
                      <span>Số lượng: {item.quantity}</span>
                    </div>
                    
                    <div className="order-detail__product-total">
                      <span>Thành tiền: </span>
                      <span className="order-detail__product-amount">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="order-detail__no-products">
                <p>Không có sản phẩm nào trong đơn hàng này.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail; 