import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Link, Routes, Route, useNavigate, useLocation, useParams } from 'react-router-dom';
import './Orders.scss';
import { authFetch } from '../../../utils/authFetch';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faPencilAlt } from '@fortawesome/free-solid-svg-icons';

const OrdersList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDropdownOrderId, setOpenDropdownOrderId] = useState(null);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalPages: 0,
    totalElements: 0
  });
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Parse URL search params for pagination
    const searchParams = new URLSearchParams(location.search);
    const page = parseInt(searchParams.get('page')) || 0;
    const size = parseInt(searchParams.get('size')) || 10;

    setPagination(prev => ({
      ...prev,
      page,
      size
    }));

    fetchOrders(page, size);
  }, [location.search]);

  const fetchOrders = async (page = 0, size = 10) => {
    try {
      const response = await authFetch(`http://localhost:8080/api/v1/order?page=${page}&size=${size}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      // Ensure users is always an array
      const data = await response.json();

      // Ensure products is always an array
      const ordersData = Array.isArray(data.value) ? data.value :
        (data && data.value && Array.isArray(data.value)) ? data.value : [];

      // Set pagination data if available
      if (data.totalPages) {
        setPagination({
          page: data.page || 0,
          size: data.size || 10,
          totalPages: data.totalPages || 1,
          totalElements: data.totalElements || ordersData.length
        });
      }

      console.log('Processed orders data:', ordersData);
      setOrders(ordersData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load orders');
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < pagination.totalPages) {
      const searchParams = new URLSearchParams(location.search);
      searchParams.set('page', newPage);
      navigate(`${location.pathname}?${searchParams.toString()}`);
    }
  };

  const handleSizeChange = (e) => {
    const newSize = parseInt(e.target.value);
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('size', newSize);
    searchParams.set('page', 0); // Reset to first page when changing size
    navigate(`${location.pathname}?${searchParams.toString()}`);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await authFetch(`http://localhost:8080/api/v1/order/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      fetchOrders(pagination.page, pagination.size); // Refresh orders list after update
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  if (loading) return (
    <div className="admin-text-center">
      <div className="admin-spinner-border" role="status">
        <span className="admin-sr-only">Loading...</span>
      </div>
    </div>
  );

  if (error) return (
    <div className="admin-alert admin-alert-danger">
      {error}
    </div>
  );

  return (
    <div className="admin-orders">
      <div className="admin-row">
        <div className="admin-col-lg-12">
          <h3 className="admin-page-header"><i className="fa fa-shopping-cart"></i> Quản lý đơn hàng</h3>
          <ol className="admin-breadcrumb">
            <li><i className="fa fa-home"></i><Link to="/admin">Home</Link></li>
            <li><i className="fa fa-shopping-cart"></i>Đơn hàng</li>
          </ol>
        </div>
      </div>

      <div className="admin-row">
        <div className="admin-col-lg-12">
          <section className="admin-panel">
            <header className="admin-panel-heading">
              Danh sách đơn hàng
            </header>
            <div className="admin-table-responsive">
              <table className="admin-table admin-table-striped admin-table-advance admin-table-hover">
                <thead>
                  <tr>
                    <th><i className="icon_profile"></i> Mã đơn</th>
                    <th><i className="icon_profile"></i> Khách hàng</th>
                    <th><i className="icon_calendar"></i> Ngày đặt</th>
                    <th><i className="icon_currency"></i> Tổng tiền</th>
                    <th><i className="icon_pin_alt"></i> Phương thức</th>
                    <th><i className="icon_mobile"></i> Trạng thái</th>
                    <th><i className="icon_cog"></i> Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(orders) && orders.length > 0 ? (
                    orders.map(order => (
                      <tr key={order.id}>
                        <td>{order.id}</td>
                        <td>{order.userId}</td>
                        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td>{order.totalPrice ? order.totalPrice.toLocaleString() : '0'} VNĐ</td>
                        <td>{getPaymentMethodDisplay(order.paymentMethod)}</td>
                        <td>
                          <span className={`admin-label admin-label-${getStatusClass(order.status)}`}>
                            {getStatusDisplay(order.status)}
                          </span>
                        </td>
                        <td>
                          <div className="admin-btn-group">
                            <Link to={`/admin/orders/detail/${order.id}`} className="admin-btn admin-btn-primary">
                              <FontAwesomeIcon icon={faEye} />
                            </Link>
                            <button
                              className="admin-btn admin-btn-success"
                              onClick={() => setOpenDropdownOrderId(openDropdownOrderId === order.id ? null : order.id)}
                            >
                              <FontAwesomeIcon icon={faPencilAlt} /> Cập nhật <span className="caret"></span>
                            </button>
                            {openDropdownOrderId === order.id && (
                              <ul className="admin-order-dropdown-menu">
                                <li><a href="#" onClick={(e) => { e.preventDefault(); handleStatusChange(order.id, 'PENDING'); }}>Chờ xác nhận</a></li>
                                <li><a href="#" onClick={(e) => { e.preventDefault(); handleStatusChange(order.id, 'CONFIRMED'); }}>Đã xác nhận</a></li>
                                <li><a href="#" onClick={(e) => { e.preventDefault(); handleStatusChange(order.id, 'SHIPPING'); }}>Đang giao hàng</a></li>
                                <li><a href="#" onClick={(e) => { e.preventDefault(); handleStatusChange(order.id, 'DELIVERED'); }}>Đã giao hàng</a></li>
                                <li><a href="#" onClick={(e) => { e.preventDefault(); handleStatusChange(order.id, 'CANCELLED'); }}>Đã hủy</a></li>
                              </ul>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="admin-text-center">Không có đơn hàng nào</td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Pagination controls */}
              <div className="admin-pagination-container">
                <div className="admin-row">
                  <div className="admin-col-md-6">
                    <div className="admin-dataTables_info" role="status">
                      Hiển thị {orders.length} / {pagination.totalElements} đơn hàng
                    </div>
                  </div>
                  <div className="admin-col-md-6">
                    <div className="admin-dataTables_paginate admin-paging_simple_numbers">
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                        <div className="admin-mr-3">
                          <select
                            className="admin-form-control admin-form-control-sm"
                            value={pagination.size}
                            onChange={handleSizeChange}
                          >
                            <option value="5">5</option>
                            <option value="10">10</option>
                            <option value="25">25</option>
                            <option value="50">50</option>
                          </select>
                        </div>

                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

const OrderDetail = () => {
  const [order, setOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openStatusDropdown, setOpenStatusDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { id } = useParams();
  const orderId = id;
  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user?.id;

  useEffect(() => {
    if (orderId && userId) {
      fetchOrderDetail();
    } else {
      setError("Missing order ID or user ID");
      setLoading(false);
    }
  }, [orderId, userId]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenStatusDropdown(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      
      // First try to fetch all orders for this user
      const response = await authFetch(`http://localhost:8080/api/v1/order/user/${userId}`);
      const data = await response.json();
      
      console.log('All orders data:', data);
      
      let specificOrder = null;
      
      if (data && data.code === 1000 && data.value && Array.isArray(data.value)) {
        // Debug: Check the structure of all order IDs
        console.log('Order ID from URL (to find):', orderId, 'Type:', typeof orderId);
        if (data.value.length > 0) {
          console.log('First order ID from API:', data.value[0].id, 'Type:', typeof data.value[0].id);
          console.log('Sample of order IDs from API:', data.value.slice(0, 5).map(order => order.id));
        }
        
        // Comprehensive search strategy for orderId
        // 1. Direct comparison (handles numerical ids)
        specificOrder = data.value.find(order => order.id === parseInt(orderId));
        
        // 2. String comparison (handles string ids)
        if (!specificOrder) {
          specificOrder = data.value.find(order => String(order.id) === String(orderId));
        }
        
        // 3. Case insensitive comparison (just in case)
        if (!specificOrder) {
          specificOrder = data.value.find(order => 
            String(order.id).toLowerCase() === String(orderId).toLowerCase()
          );
        }
        
        // 4. Contains comparison (for embedded ids)
        if (!specificOrder) {
          specificOrder = data.value.find(order => 
            String(order.id).includes(String(orderId)) || 
            String(orderId).includes(String(order.id))
          );
        }
        
        console.log('Found specific order using array method:', specificOrder);
      }
      
      // If not found in the user's orders, try fetching directly by ID
      if (!specificOrder) {
        console.log('Trying to fetch order directly by ID');
        try {
          const directResponse = await authFetch(`http://localhost:8080/api/v1/order/${orderId}`);
          const directData = await directResponse.json();
          
          console.log('Direct order fetch response:', directData);
          
          if (directData && directData.code === 1000 && directData.value) {
            specificOrder = directData.value;
          }
        } catch (directError) {
          console.error('Error fetching order directly:', directError);
        }
      }
      
      if (specificOrder) {
        setOrder(specificOrder);
        
        // Fetch order items
        const itemsResponse = await authFetch(`http://localhost:8080/api/v1/order/order-detail/${orderId}`);
        const itemsData = await itemsResponse.json();
        
        console.log('Order items data:', itemsData);
        
        if (itemsData && itemsData.code === 1000 && itemsData.value) {
          setOrderItems(itemsData.value);
        }
      } else {
        setError(`Không tìm thấy đơn hàng có mã #${orderId}`);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching order details:', error);
      setError('Lỗi khi tải thông tin đơn hàng');
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const response = await authFetch(`http://localhost:8080/api/v1/order/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        // Close dropdown after successful status change
        setOpenStatusDropdown(false);
        // Show success message or visual feedback
        showStatusUpdateSuccess(newStatus);
        // Refresh order details
        fetchOrderDetail();
      } else {
        alert('Không thể cập nhật trạng thái đơn hàng');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Đã xảy ra lỗi khi cập nhật trạng thái');
    }
  };

  // Function to show success message after status update
  const [statusUpdateMessage, setStatusUpdateMessage] = useState(null);
  
  const showStatusUpdateSuccess = (newStatus) => {
    setStatusUpdateMessage(`Đã cập nhật trạng thái đơn hàng thành "${getStatusDisplay(newStatus)}"`);
    
    // Clear message after 3 seconds
    setTimeout(() => {
      setStatusUpdateMessage(null);
    }, 3000);
  };

  if (loading) return (
    <div className="admin-text-center">
      <div className="admin-spinner-border" role="status">
        <span className="admin-sr-only">Loading...</span>
      </div>
    </div>
  );

  if (error) return (
    <div className="admin-alert admin-alert-danger">
      {error}
    </div>
  );

  if (!order) return (
    <div className="admin-alert admin-alert-danger">
      Không tìm thấy thông tin đơn hàng
    </div>
  );

  return (
    <div className="admin-orders">
      <div className="admin-row">
        <div className="admin-col-lg-12">
          <h3 className="admin-page-header"><i className="fa fa-file-text-o"></i> Chi tiết đơn hàng #{orderId}</h3>
          <ol className="admin-breadcrumb">
            <li><i className="fa fa-home"></i><Link to="/admin">Home</Link></li>
            <li><i className="fa fa-shopping-cart"></i><Link to="/admin/orders">Đơn hàng</Link></li>
            <li><i className="fa fa-file-text-o"></i>Chi tiết đơn hàng</li>
          </ol>
        </div>
      </div>

      <div className="admin-row">
        <div className="admin-col-lg-12">
          <section className="admin-panel">
            <header className="admin-panel-heading">
              Thông tin đơn hàng
              {statusUpdateMessage && (
                <div className="admin-status-update-success">
                  {statusUpdateMessage}
                </div>
              )}
              <div className="admin-pull-right">
                <div className="admin-btn-group" ref={dropdownRef}>
                  <button
                    className={`admin-btn admin-btn-${getButtonClass(order.status)} admin-order-detail-dropdown-toggle`}
                    onClick={() => setOpenStatusDropdown(!openStatusDropdown)}
                  >
                    <span className={`admin-status-indicator admin-status-${order.status.toLowerCase()}`}></span>
                    {getStatusDisplay(order.status)} <span className="admin-caret"></span>
                  </button>
                  {openStatusDropdown && (
                    <ul className="admin-order-detail-dropdown-menu">
                      <li><a href="#" className={order.status === 'PENDING' ? 'active' : ''} onClick={(e) => { e.preventDefault(); handleStatusChange('PENDING'); }}><span className="admin-status-indicator admin-status-pending"></span>Chờ xác nhận</a></li>
                      <li><a href="#" className={order.status === 'CONFIRMED' ? 'active' : ''} onClick={(e) => { e.preventDefault(); handleStatusChange('CONFIRMED'); }}><span className="admin-status-indicator admin-status-confirmed"></span>Đã xác nhận</a></li>
                      <li><a href="#" className={order.status === 'SHIPPING' ? 'active' : ''} onClick={(e) => { e.preventDefault(); handleStatusChange('SHIPPING'); }}><span className="admin-status-indicator admin-status-shipping"></span>Đang giao hàng</a></li>
                      <li><a href="#" className={order.status === 'DELIVERED' ? 'active' : ''} onClick={(e) => { e.preventDefault(); handleStatusChange('DELIVERED'); }}><span className="admin-status-indicator admin-status-delivered"></span>Đã giao</a></li>
                      <li><a href="#" className={order.status === 'CANCELLED' ? 'active' : ''} onClick={(e) => { e.preventDefault(); handleStatusChange('CANCELLED'); }}><span className="admin-status-indicator admin-status-cancelled"></span>Đã hủy</a></li>
                    </ul>
                  )}
                </div>
              </div>
            </header>
            <div className="admin-panel-body">
              <div className="admin-row">
                <div className="admin-col-md-6">
                  <div className="admin-panel">
                    <div className="admin-panel-heading">
                      <h3 className="admin-panel-title"><i className="fa fa-user"></i> Thông tin khách hàng</h3>
                    </div>
                    <div className="admin-panel-body">
                      <table className="admin-table">
                        <tbody>
                          <tr>
                            <td><strong>Mã người dùng:</strong></td>
                            <td>{order.userId}</td>
                          </tr>
                          <tr>
                            <td><strong>Địa chỉ:</strong></td>
                            <td>{order.address || 'N/A'}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                <div className="admin-col-md-6">
                  <div className="admin-panel">
                    <div className="admin-panel-heading">
                      <h3 className="admin-panel-title"><i className="fa fa-shopping-cart"></i> Thông tin đơn hàng</h3>
                    </div>
                    <div className="admin-panel-body">
                      <table className="admin-table">
                        <tbody>
                          <tr>
                            <td><strong>Mã đơn hàng:</strong></td>
                            <td>#{orderId}</td>
                          </tr>
                          <tr>
                            <td><strong>Ngày đặt:</strong></td>
                            <td>{new Date(order.createdAt).toLocaleString()}</td>
                          </tr>
                          <tr>
                            <td><strong>Thanh toán:</strong></td>
                            <td>{getPaymentMethodDisplay(order.paymentMethod)}</td>
                          </tr>
                          <tr>
                            <td><strong>Phí vận chuyển:</strong></td>
                            <td>{order.shippingFee?.toLocaleString() || '0'} VNĐ</td>
                          </tr>
                          <tr>
                            <td><strong>Trạng thái:</strong></td>
                            <td>
                              <span className={`admin-label admin-label-${getStatusClass(order.status)}`}>
                                {getStatusDisplay(order.status)}
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              <div className="admin-panel">
                <div className="admin-panel-heading">
                  <h3 className="admin-panel-title"><i className="fa fa-shopping-basket"></i> Chi tiết sản phẩm</h3>
                </div>
                <div className="admin-table-responsive">
                  <table className="admin-table admin-table-striped">
                    <thead>
                      <tr>
                        <th>Mã sản phẩm</th>
                        <th>Giá</th>
                        <th>Số lượng</th>
                        <th>Tổng</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderItems && orderItems.length > 0 ? (
                        orderItems.map((item, index) => (
                          <tr key={index}>
                            <td>{item.productId}</td>
                            <td>{item.price?.toLocaleString()} VNĐ</td>
                            <td>{item.quantity}</td>
                            <td>{(item.price * item.quantity)?.toLocaleString()} VNĐ</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="admin-text-center">Không có sản phẩm nào</td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot>
                      <tr>
                        <th colSpan="3" className="admin-text-right">Tổng cộng:</th>
                        <th>{order.totalPrice?.toLocaleString() || '0'} VNĐ</th>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              <div className="admin-row">
                <div className="admin-col-md-12">
                  <Link to="/admin/orders" className="admin-btn admin-btn-default">
                    <i className="fa fa-arrow-left"></i> Quay lại danh sách
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

const getStatusDisplay = (status) => {
  switch (status) {
    case 'DELIVERED':
      return 'Đã giao hàng';
    case 'SHIPPING':
      return 'Đang giao hàng';
    case 'CONFIRMED':
      return 'Đã xác nhận';
    case 'PENDING':
      return 'Chờ xác nhận';
    case 'CANCELLED':
      return 'Đã hủy';
    case 'PAID':
      return 'Đã thanh toán';
    default:
      return status;
  }
};

const getStatusClass = (status) => {
  switch (status) {
    case 'DELIVERED':
      return 'success';
    case 'SHIPPING':
      return 'info';
    case 'CONFIRMED':
      return 'primary';
    case 'PENDING':
      return 'warning';
    case 'CANCELLED':
      return 'danger';
    case 'PAID':
      return 'primary';
    default:
      return 'default';
  }
};

const getPaymentMethodDisplay = (method) => {
  switch (method) {
    case 'COD':
      return 'Thanh toán khi nhận hàng';
    case 'VNPAY':
      return 'VNPay';
    default:
      return method || 'COD';
  }
};

const getButtonClass = (status) => {
  switch (status) {
    case 'DELIVERED':
      return 'success';
    case 'SHIPPING':
      return 'info';
    case 'CONFIRMED':
      return 'primary';
    case 'PENDING':
      return 'warning';
    case 'CANCELLED':
      return 'danger';
    case 'PAID':
      return 'primary';
    default:
      return 'default';
  }
};

const Orders = () => {
  return (
    <Routes>
      <Route path="/" element={<OrdersList />} />
      <Route path="/detail/:id" element={<OrderDetail />} />
    </Routes>
  );
};

export default Orders;