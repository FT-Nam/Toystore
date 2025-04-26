import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminLogin.scss';
import { jwtDecode } from 'jwt-decode';

const AdminLogin = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    console.log('Admin login attempt with username:', credentials.username);

    try {
      // Step 1: Login with username and password
      console.log('Step 1: Sending login request to API');
      const loginResponse = await axios.post('http://localhost:8080/api/v1/auth/login', credentials);
      console.log('Login response:', loginResponse);
      
      // Check for token in the correct structure from the API response
      if (loginResponse.data && loginResponse.data.code === 1000 && loginResponse.data.value && loginResponse.data.value.accessToken) {
        const token = loginResponse.data.value.accessToken;
        console.log('Token received successfully:', token);
        
        // Step 2: Decode token to get email (subject)
        try {
          console.log('Step 2: Decoding JWT token');
          const decodedToken = jwtDecode(token);
          console.log('Decoded token:', decodedToken);
          const id = decodedToken.sub;
          console.log('Email extracted from token:', id);
          
          // Check if token contains role information
          const hasAdminScope = decodedToken.scope && decodedToken.scope.includes('ROLE_ADMIN');
          console.log('Token has admin scope:', hasAdminScope);
          
          if (hasAdminScope) {
            console.log('Token contains admin role, granting access directly');
            // Create user data from token information
            const userData = {
              id: id,
              role: 'admin',
              // Add other info if available in token
              scope: decodedToken.scope
            };
            
            // Store token and user data in localStorage
            localStorage.setItem('token', token);
            localStorage.setItem('refreshToken', loginResponse.data.value.refreshToken);
            localStorage.setItem('user', JSON.stringify(userData));
            console.log('Auth data saved to localStorage');
            navigate('/admin');
            return;
          }
          
          // If role info not in token, fetch user details
          console.log(`Step 3: Fetching user details for email: ${id}`);
          const userResponse = await axios.get(`http://localhost:8080/api/v1/user/id/${id}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          console.log('User data response:', userResponse);
          
          if (userResponse.data) {
            const userData = userResponse.data;
            console.log('User data:', userData);
            console.log('User role:', userData.role);
            
            // Step 4: Check if user has admin role
            if (userData.role === 'admin') {
              console.log('User has admin role, granting access');
              // Store token and user data in localStorage
              localStorage.setItem('token', token);
              localStorage.setItem('refreshToken', loginResponse.data.value.refreshToken);
              localStorage.setItem('user', JSON.stringify(userData));
              console.log('Auth data saved to localStorage');
              navigate('/admin');
            } else {
              console.log('User does not have admin role, access denied');
              setError('Bạn không có quyền truy cập vào trang quản trị.');
            }
          } else {
            console.log('No user data returned from API');
            setError('Không thể lấy thông tin người dùng.');
          }
        } catch (decodeError) {
          console.error('Error decoding token:', decodeError);
          
          // Fallback to manual decoding
          console.log('Attempting manual token decoding');
          try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const payload = JSON.parse(window.atob(base64));
            console.log('Manually decoded payload:', payload);
            
            const email = payload.sub;
            console.log('Email from manual decoding:', email);
            
            // Check if token contains role from manual decoding
            const hasAdminScope = payload.scope && payload.scope.includes('ROLE_ADMIN');
            console.log('Token has admin scope (manual decode):', hasAdminScope);
            
            if (hasAdminScope) {
              console.log('Token contains admin role (manual decode), granting access directly');
              // Create user data from token information
              const userData = {
                email: email,
                role: 'admin',
                // Add other info if available in token
                scope: payload.scope
              };
              
              // Store token and user data in localStorage
              localStorage.setItem('token', token);
              localStorage.setItem('refreshToken', loginResponse.data.value.refreshToken);
              localStorage.setItem('user', JSON.stringify(userData));
              console.log('Auth data saved to localStorage');
              navigate('/admin');
              return;
            }
            
            // Continue with user data fetch as above
            console.log(`Fetching user details for email: ${email} (manual decode)`);
            const userResponse = await axios.get(`http://localhost:8080/api/v1/user/email/${email}`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            console.log('User data response (after manual decode):', userResponse);
            
            if (userResponse.data) {
              const userData = userResponse.data;
              console.log('User data (after manual decode):', userData);
              console.log('User role (after manual decode):', userData.role);
              
              if (userData.role === 'admin') {
                console.log('User has admin role (after manual decode), granting access');
                localStorage.setItem('token', token);
                localStorage.setItem('refreshToken', loginResponse.data.value.refreshToken);
                localStorage.setItem('user', JSON.stringify(userData));
                console.log('Auth data saved to localStorage (after manual decode)');
                navigate('/admin');
              } else {
                console.log('User does not have admin role (after manual decode), access denied');
                setError('Bạn không có quyền truy cập vào trang quản trị.');
              }
            } else {
              console.log('No user data returned from API (after manual decode)');
              setError('Không thể lấy thông tin người dùng.');
            }
          } catch (manualDecodeError) {
            console.error('Error with manual token decoding:', manualDecodeError);
            setError('Không thể xác minh thông tin người dùng từ token.');
          }
        }
      } else {
        console.log('No token received from login API:', loginResponse.data);
        setError('Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin.');
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error.response) {
        console.log('Error response status:', error.response.status);
        console.log('Error response data:', error.response.data);
      }
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError('Đăng nhập không thành công. Vui lòng thử lại sau.');
      }
    } finally {
      setLoading(false);
      console.log('Login process completed');
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-box">
        <div className="admin-login-header">
          <h2>ToyStore Admin</h2>
          <p>Đăng nhập vào hệ thống quản trị</p>
        </div>
        
        {error && <div className="admin-alert admin-alert-danger">{error}</div>}
        
        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="admin-form-group">
            <label htmlFor="username">Tên đăng nhập</label>
            <input
              type="text"
              id="username"
              name="username"
              className="admin-form-control"
              placeholder="Nhập tên đăng nhập"
              value={credentials.username}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="admin-form-group">
            <label htmlFor="password">Mật khẩu</label>
            <input
              type="password"
              id="password"
              name="password"
              className="admin-form-control"
              placeholder="Nhập mật khẩu"
              value={credentials.password}
              onChange={handleChange}
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="admin-btn admin-btn-primary admin-btn-block" 
            disabled={loading}
          >
            {loading ? 'Đang xử lý...' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin; 