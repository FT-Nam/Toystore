import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { authFetch } from '../../../utils/authFetch';
import './Dashboard.scss';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    recentOrders: [],
    topProducts: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch products count
        const productsResponse = await authFetch('http://localhost:8080/api/v1/product/count', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        // Fetch users count
        const usersResponse = await authFetch('http://localhost:8080/api/v1/user/count', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        // Fetch orders count and total revenue
        const ordersResponse = await authFetch('http://localhost:8080/api/v1/order/stats', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        // Fetch recent orders
        const recentOrdersResponse = await authFetch('http://localhost:8080/api/v1/order/recent', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        // Fetch top selling products
        const topProductsResponse = await authFetch('http://localhost:8080/api/v1/product/top-selling', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        setStats({
          totalProducts: productsResponse.data.count || 0,
          totalUsers: usersResponse.data.count || 0,
          totalOrders: ordersResponse.data.orderCount || 0,
          totalRevenue: ordersResponse.data.totalRevenue || 0,
          recentOrders: recentOrdersResponse.data || [],
          topProducts: topProductsResponse.data || []
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="admin-dashboard">
      <div className="admin-row">
        <div className="admin-col-lg-12">
          <h3 className="admin-page-header"><i className="fa fa-laptop"></i> Dashboard</h3>
          <ol className="admin-breadcrumb">
            <li><i className="fa fa-home"></i><a href="index.html">Home</a></li>
            <li><i className="fa fa-laptop"></i>Dashboard</li>
          </ol>
        </div>
      </div>

      <div className="admin-row">
        <div className="admin-col-lg-3 admin-col-md-3 admin-col-sm-12 admin-col-xs-12">
          <div className="admin-info-box admin-blue-bg">
            <i className="fa fa-cubes"></i>
            <div className="admin-count">{stats.totalProducts}</div>
            <div className="admin-title">Sản phẩm</div>
          </div>
        </div>
        
        <div className="admin-col-lg-3 admin-col-md-3 admin-col-sm-12 admin-col-xs-12">
          <div className="admin-info-box admin-brown-bg">
            <i className="fa fa-users"></i>
            <div className="admin-count">{stats.totalUsers}</div>
            <div className="admin-title">Người dùng</div>
          </div>
        </div>
        
        <div className="admin-col-lg-3 admin-col-md-3 admin-col-sm-12 admin-col-xs-12">
          <div className="admin-info-box admin-dark-bg">
            <i className="fa fa-shopping-cart"></i>
            <div className="admin-count">{stats.totalOrders}</div>
            <div className="admin-title">Đơn hàng</div>
          </div>
        </div>
        
        <div className="admin-col-lg-3 admin-col-md-3 admin-col-sm-12 admin-col-xs-12">
          <div className="admin-info-box admin-green-bg">
            <i className="fa fa-money"></i>
            <div className="admin-count">{stats.totalRevenue.toLocaleString()} VNĐ</div>
            <div className="admin-title">Doanh thu</div>
          </div>
        </div>
      </div>

      <div className="admin-row">
        <div className="admin-col-lg-6">
          <section className="admin-panel">
            <header className="admin-panel-heading">
              Đơn hàng gần đây
            </header>
            <table className="admin-table admin-table-striped">
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Khách hàng</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map(order => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>{order.customerName}</td>
                    <td>{order.total.toLocaleString()} VNĐ</td>
                    <td>
                      <span className={`admin-label admin-label-${getStatusClass(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
        
        <div className="admin-col-lg-6">
          <section className="admin-panel">
            <header className="admin-panel-heading">
              Sản phẩm bán chạy
            </header>
            <table className="admin-table admin-table-striped">
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th>Danh mục</th>
                  <th>Đã bán</th>
                  <th>Doanh thu</th>
                </tr>
              </thead>
              <tbody>
                {stats.topProducts.map(product => (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td>{product.categoryName}</td>
                    <td>{product.soldCount}</td>
                    <td>{product.revenue.toLocaleString()} VNĐ</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      </div>
    </div>
  );
};

const getStatusClass = (status) => {
  // First convert to uppercase to ensure consistent handling
  const statusUpper = status.toUpperCase();
  
  switch (statusUpper) {
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
      // Fallback for legacy status values
      switch (status.toLowerCase()) {
        case 'đã giao':
        case 'hoàn thành':
        case 'completed':
          return 'success';
        case 'đang xử lý':
        case 'đang giao hàng':
        case 'processing':
          return 'info';
        case 'đã xác nhận':
          return 'primary';
        case 'đã hủy':
        case 'cancelled':
          return 'danger';
        case 'chờ xác nhận':
        case 'pending':
          return 'warning';
        case 'đã thanh toán':
          return 'primary';
        default:
          return 'default';
      }
  }
};

export default Dashboard; 