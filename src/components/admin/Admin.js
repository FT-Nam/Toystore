import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './Admin.scss';
import defaultAvatar from '../../assets/images/default-avatar.png';

// Import các components con
import Dashboard from './dashboard/Dashboard';
import Products from './products/Products';
import Users from './users/Users';
import Orders from './orders/Orders';
import Categories from './categories/Categories';
import Feedback from './feedback/Feedback';

const Admin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showSubMenu, setShowSubMenu] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  console.log('Admin component initialized, path:', location.pathname);

  useEffect(() => {
    // Verify user is authenticated and authorized
    console.log('Running authentication check effect');
    
    const checkAuthorization = async () => {
      console.log('Starting authorization check');
      try {
        // Check for token using both possible keys for backward compatibility
        const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
        console.log('Token from localStorage:', token ? 'exists' : 'not found');
        
        if (!token) {
          console.log('No token found, redirecting to admin login');
          navigate('/admin-login');
          return;
        }
        
        const storedUserData = JSON.parse(localStorage.getItem('user'));
        console.log('User data from localStorage:', storedUserData);
        
        if (!storedUserData || storedUserData.role !== 'admin') {
          console.log('No valid admin user data in localStorage, verifying with backend');
          // If no user data in localStorage or not admin, verify with backend
          try {
            console.log('Making API request to verify admin status');
            const response = await axios.get('http://localhost:8080/api/v1/auth/me', {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            console.log('Auth verification response:', response.data);
            
            if (response.data && response.data.role === 'admin') {
              console.log('Backend verified admin role, granting access');
              setIsAuthorized(true);
              setUserData(response.data);
              localStorage.setItem('user', JSON.stringify(response.data));
              console.log('User data saved to state and localStorage');
            } else {
              console.log('Backend denied admin access, redirecting to login');
              navigate('/admin-login');
            }
          } catch (error) {
            console.error('Authorization check API error:', error);
            if (error.response) {
              console.log('Error response status:', error.response.status);
              console.log('Error response data:', error.response.data);
            }
            console.log('API verification failed, redirecting to login');
            navigate('/admin-login');
          }
        } else {
          console.log('Valid admin user data found in localStorage, granting access');
          setIsAuthorized(true);
          setUserData(storedUserData);
        }
      } catch (error) {
        console.error('General authorization check error:', error);
        console.log('Auth check failed, redirecting to login');
        navigate('/admin-login');
      } finally {
        setLoading(false);
        console.log('Authorization check completed, loading state set to false');
      }
    };
    
    checkAuthorization();
  }, [navigate]);

  // If still loading or not authorized, don't render the admin interface
  if (loading) {
    console.log('Still loading, showing spinner');
    return <div className="admin-loading-spinner">Đang tải...</div>;
  }
  
  if (!isAuthorized) {
    console.log('Not authorized, returning null');
    return null;
  }

  console.log('Authorization successful, rendering admin interface');

  const menuItems = [
    { path: '/admin', label: 'Dashboard', icon: 'fa fa-dashboard' },
    { 
      path: '/admin/products', 
      label: 'Quản lý sản phẩm', 
      icon: 'fa fa-shopping-cart',
      subMenu: [
        { path: '/admin/products/add', label: 'Thêm mới sản phẩm' },
        { path: '/admin/products', label: 'Danh sách sản phẩm' },
      ]
    },
    { 
      path: '/admin/categories', 
      label: 'Quản lý danh mục', 
      icon: 'fa fa-folder',
      subMenu: [
        { path: '/admin/categories/add', label: 'Thêm mới danh mục' },
        { path: '/admin/categories', label: 'Danh sách danh mục' },
      ]
    },
    { 
      path: '/admin/users', 
      label: 'Quản lý người dùng', 
      icon: 'fa fa-users',
      subMenu: [
        { path: '/admin/users/add', label: 'Thêm mới người dùng' },
        { path: '/admin/users', label: 'Danh sách người dùng' },
      ]
    },
    { 
      path: '/admin/feedback', 
      label: 'Quản lý liên hệ', 
      icon: 'fa fa-envelope',
      subMenu: [
        { path: '/admin/feedback', label: 'Xem liên hệ' },
      ]
    },
    { 
      path: '/admin/orders', 
      label: 'Quản lý đơn hàng', 
      icon: 'fa fa-shopping-bag',
      subMenu: [
        { path: '/admin/orders', label: 'Danh sách đơn hàng' },
      ]
    },
  ];

  const handleLogout = () => {
    console.log('Logout initiated');
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      console.log('Logging out with token:', token ? 'exists' : 'not found');
      
      if (token) {
        console.log('Sending logout request to server');
        fetch('http://localhost:8080/api/v1/auth/logout', { 
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ accessToken: token })
        }).then(response => {
          console.log('Logout API response status:', response.status);
        }).catch(error => {
          console.error('Error in logout API call:', error);
        });
      }
      
      // Xóa token và user info
      console.log('Clearing localStorage');
      localStorage.removeItem('token');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      console.log('Redirecting to login page');
      navigate('/admin-login');
    } catch (error) {
      console.error('Error during logout process:', error);
    }
  };
  
  const toggleSubMenu = (index) => {
    console.log('Toggling submenu:', index);
    if (showSubMenu === index) {
      setShowSubMenu(null);
    } else {
      setShowSubMenu(index);
    }
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="admin-container">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-toggle-nav" onClick={toggleSidebar}>
          <i className={`fa ${sidebarCollapsed ? 'fa-indent' : 'fa-outdent'}`}></i>
        </div>
        
        {/* Logo */}
        <Link to="/admin" className="admin-logo">
          Toy <span className="admin-lite">Store</span>
        </Link>
        
        {/* User Profile & Logout */}
        <div className="admin-user-profile">
          <div className="admin-dropdown">
            <div className="admin-dropdown-toggle">
              <span className="admin-profile-ava">
                <img src={(userData && userData.avatar) || defaultAvatar} alt="User Avatar" />
              </span>
              <span className="admin-username">{userData ? userData.name : 'Admin'}</span>
              <i className="fa fa-caret-down"></i>
            </div>
            <ul className="admin-dropdown-menu">
              <li>
                <button onClick={handleLogout} className="admin-btn admin-btn-link">
                  <i className="fa fa-sign-out"></i> Đăng xuất
                </button>
              </li>
            </ul>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarCollapsed ? 'admin-collapsed' : ''}`}>
        <ul className="admin-nav-sidebar">
          {menuItems.map((item, index) => (
            <li key={item.path} className={location.pathname === item.path ? 'admin-active' : ''}>
              {item.subMenu ? (
                <>
                  <a href="#!" onClick={() => toggleSubMenu(index)}>
                    <i className={item.icon}></i>
                    <span>{item.label}</span>
                    <i className={`fa fa-angle-${showSubMenu === index ? 'down' : 'right'} admin-pull-right`}></i>
                  </a>
                  {showSubMenu === index && (
                    <ul className="admin-sub-menu">
                      {item.subMenu.map(subItem => (
                        <li key={subItem.path} className={location.pathname === subItem.path ? 'admin-active' : ''}>
                          <Link to={subItem.path}>
                            <i className="fa fa-circle-o"></i> {subItem.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <Link to={item.path}>
                  <i className={item.icon}></i>
                  <span>{item.label}</span>
                </Link>
              )}
            </li>
          ))}
        </ul>
      </aside>

      {/* Main Content */}
      <section className={`admin-main-content ${sidebarCollapsed ? 'admin-expanded' : ''}`}>
        <div className="admin-page-container">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products/*" element={<Products />} />
            <Route path="/users/*" element={<Users />} />
            <Route path="/orders/*" element={<Orders />} />
            <Route path="/categories/*" element={<Categories />} />
            <Route path="/feedback/*" element={<Feedback />} />
          </Routes>
        </div>
      </section>
    </div>
  );
};

export default Admin; 