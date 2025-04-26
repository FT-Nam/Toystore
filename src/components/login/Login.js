import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Login.scss';
import googleIcon from '../../assets/images/google-icon.png';
import facebookIcon from '../../assets/images/facebook-icon.png';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isProcessing = useRef(false);

  // Xử lý code từ URL khi component mount hoặc URL thay đổi
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const code = urlParams.get('code');
    const provider = urlParams.get('provider');
    
    console.log('URL changed:', location.search);
    console.log('Raw code:', code);
    console.log('Provider:', provider);
    
    if (code && !isProcessing.current) {
      isProcessing.current = true;
      // Decode the code
      const decodedCode = decodeURIComponent(code);
      console.log('Decoded code:', decodedCode);
      
      if (provider === 'google') {
        console.log('Processing Google login...');
        handleGoogleLogin(decodedCode);
      } else if (provider === 'facebook') {
        console.log('Processing Facebook login...');
        handleFacebookLogin(decodedCode);
      }
    }
  }, [location.search]); // Chạy lại khi URL thay đổi

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const fetchUserData = async () => {
    try {
      console.log('Fetching user data...');
      
      // Thử lấy thông tin từ token trước
      try {
        const token = localStorage.getItem('accessToken');
        if (token) {
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const payload = JSON.parse(window.atob(base64));
          
          console.log('Token payload:', payload);
          
          // Nếu lấy được userId từ token
          if (payload.sub) {
            console.log('User ID from token:', payload.sub);
            localStorage.setItem('userId', payload.sub);
            
            // Thử gọi API với userId từ token
            const response = await fetch(`http://localhost:8080/api/v1/user/id/${payload.sub}`, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
              }
            });
            
            if (response.ok) {
              const data = await response.json();
              console.log('User data response (from userId):', data);
              
              if (data.value) {
                localStorage.setItem('userId', data.value.id);
                localStorage.setItem('username', data.value.username);
                
                // Dispatch detailed event
                window.dispatchEvent(new CustomEvent('loginSuccess', { 
                  detail: { userId: data.value.id, username: data.value.username } 
                }));
                console.log('Dispatched loginSuccess event with user details (from userId)');
                return;
              }
            } else {
              console.error('Failed to fetch user data with userId, status:', response.status);
            }
          }
          
          // Nếu lấy được username từ token
          if (payload.username || payload.preferred_username || payload.email) {
            const username = payload.username || payload.preferred_username;
            const email = payload.email;
            
            if (username) {
              console.log('Username from token:', username);
              localStorage.setItem('username', username);
              
              // Thử gọi API với username từ token - updated endpoint
              const response = await fetch(`http://localhost:8080/api/v1/user/id/${username}`, {
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
              });
              
              if (response.ok) {
                const data = await response.json();
                console.log('User data response (from username):', data);
                
                if (data.value) {
                  localStorage.setItem('userId', data.value.id);
                  localStorage.setItem('username', data.value.username);
                  
                  // Dispatch detailed event
                  window.dispatchEvent(new CustomEvent('loginSuccess', { 
                    detail: { userId: data.value.id, username: data.value.username } 
                  }));
                  console.log('Dispatched loginSuccess event with user details (from username)');
                  return;
                }
              } else {
                console.error('Failed to fetch user data with username, status:', response.status);
              }
            }
            
            // Nếu không có username hoặc API gọi username thất bại, thử với email
            if (email) {
              console.log('Email from token:', email);
              localStorage.setItem('email', email);
              
              // Xác định provider từ token hoặc localStorage
              let provider = 'LOCAL';
              try {
                const tokenData = JSON.parse(atob(token.split('.')[1]));
                if (tokenData.iss && tokenData.iss.includes('google')) {
                  provider = 'GOOGLE';
                } else if (tokenData.iss && tokenData.iss.includes('facebook')) {
                  provider = 'FACEBOOK';
                } else if (localStorage.getItem('loginProvider')) {
                  provider = localStorage.getItem('loginProvider');
                }
              } catch (e) {
                console.error('Error determining provider from token:', e);
              }
              
              // Thử gọi API với email từ token
              const response = await fetch(`http://localhost:8080/api/v1/user/email-provider?email=${encodeURIComponent(email)}&provider=${provider}`, {
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
              });
              
              if (response.ok) {
                const data = await response.json();
                console.log('User data response (from email):', data);
                
                if (data.value) {
                  localStorage.setItem('userId', data.value.id);
                  localStorage.setItem('username', data.value.username || data.value.email);
                  
                  // Dispatch detailed event
                  window.dispatchEvent(new CustomEvent('loginSuccess', { 
                    detail: { userId: data.value.id, username: data.value.username || data.value.email } 
                  }));
                  console.log('Dispatched loginSuccess event with user details (from email)');
                  return;
                }
              } else {
                console.error('Failed to fetch user data with email, status:', response.status);
              }
            }
          }
        }
      } catch (tokenErr) {
        console.error('Failed to parse token or fetch user data:', tokenErr);
      }
      
      // Fallback: Thử với userId từ localStorage nếu có
      const userId = localStorage.getItem('userId');
      if (userId) {
        const response = await fetch(`http://localhost:8080/api/v1/user/id/${userId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('User data response (from localStorage userId):', data);
          
          if (data.value) {
            localStorage.setItem('userId', data.value.id);
            localStorage.setItem('username', data.value.username);
            
            // Dispatch detailed event
            window.dispatchEvent(new CustomEvent('loginSuccess', { 
              detail: { userId: data.value.id, username: data.value.username } 
            }));
            console.log('Dispatched loginSuccess event with user details (from localStorage userId)');
            return;
          }
        }
      }
      
      // Fallback: Thử với username từ localStorage nếu có
      const username = localStorage.getItem('username');
      if (username) {
        // Updated endpoint for username
        const response = await fetch(`http://localhost:8080/api/v1/user/id/${username}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('User data response (from localStorage username):', data);
          
          if (data.value) {
            localStorage.setItem('userId', data.value.id);
            localStorage.setItem('username', data.value.username);
            
            // Dispatch detailed event
            window.dispatchEvent(new CustomEvent('loginSuccess', { 
              detail: { userId: data.value.id, username: data.value.username } 
            }));
            console.log('Dispatched loginSuccess event with user details (from localStorage username)');
            return;
          }
        }
      }
      
      // Fallback: Thử với email từ localStorage nếu có
      const email = localStorage.getItem('email');
      if (email) {
        // Xác định provider từ localStorage
        let provider = localStorage.getItem('loginProvider') || 'LOCAL';
        
        const response = await fetch(`http://localhost:8080/api/v1/user/email-provider?email=${encodeURIComponent(email)}&provider=${provider}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('User data response (from localStorage email):', data);
          
          if (data.value) {
            localStorage.setItem('userId', data.value.id);
            localStorage.setItem('username', data.value.username || data.value.email);
            
            // Dispatch detailed event
            window.dispatchEvent(new CustomEvent('loginSuccess', { 
              detail: { userId: data.value.id, username: data.value.username || data.value.email } 
            }));
            console.log('Dispatched loginSuccess event with user details (from localStorage email)');
            return;
          }
        }
      }
      
      // Nếu tất cả các cách không thành công, vẫn dispatch sự kiện cơ bản
      console.warn('Could not fetch detailed user info, dispatching basic event');
      window.dispatchEvent(new Event('loginSuccess'));
      console.log('Dispatched basic loginSuccess event');
      
    } catch (err) {
      console.error('Error in fetchUserData:', err);
      // Still dispatch basic event even if errors occur
      window.dispatchEvent(new Event('loginSuccess'));
      console.log('Dispatched error fallback loginSuccess event');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8080/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
  
      const data = await response.json();
      console.log("Response from API: ", response); // Kiểm tra response ban đầu
      console.log("API fetch token: ", data); // Kiểm tra dữ liệu JSON trả về
      

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      localStorage.setItem('accessToken', data.value.accessToken);
      localStorage.setItem('refreshToken', data.value.refreshToken);
      localStorage.setItem('username', formData.username);
      localStorage.setItem('loginProvider', 'LOCAL');
      
      if (data.userId) {
        localStorage.setItem('userId', data.userId);
      }

      setTimeout(() => {
        navigate('/');
        window.location.reload(); // ép reload để re-render lại với dữ liệu mới từ localStorage
      }, 100);
      
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGoogleLogin = async (code = null) => {
    try {
      if (code) {
        console.log('Exchanging code for token...');
        const response = await fetch(`http://localhost:8080/api/v1/auth/login/google?code=${code}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          credentials: 'include'
        });

        const data = await response.json();
        console.log('Google login response:', data);
        console.log('Response status:', response.status);
        console.log('Is response OK?', response.ok);

        // Checking the structure of the response
        if (data && data.code === 1000 && data.value) {
          console.log('Valid response with code 1000');
          
          // Lưu thông tin provider
          localStorage.setItem('loginProvider', 'GOOGLE');
          
          // Save user info if available
          if (data.value.email) {
            localStorage.setItem('email', data.value.email);
          }
          
          if (data.value.username) {
            localStorage.setItem('username', data.value.username);
          }
          
          if (data.value.email && !data.value.username) {
            // Use email as username if username is not provided
            localStorage.setItem('username', data.value.email);
          }
          
          if (data.value.id) {
            localStorage.setItem('userId', data.value.id);
          }
          
          if (data.value.roles && data.value.roles.length > 0) {
            localStorage.setItem('roles', JSON.stringify(data.value.roles));
          }
          
          // Check JWT response
          if (data.value.accessToken || data.value.access_token) {
            const accessToken = data.value.accessToken || data.value.access_token;
            const refreshToken = data.value.refreshToken || data.value.refresh_token;
            
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            console.log('JWT tokens saved from response');
          } else {
            // Get token from cookie if not in response
            const cookies = document.cookie.split(';');
            let accessToken = null;
            let refreshToken = null;
            
            for (let i = 0; i < cookies.length; i++) {
              const cookie = cookies[i].trim();
              if (cookie.startsWith('accessToken=')) {
                accessToken = cookie.substring('accessToken='.length, cookie.length);
              } else if (cookie.startsWith('refreshToken=')) {
                refreshToken = cookie.substring('refreshToken='.length, cookie.length);
              }
            }
            
            if (accessToken) {
              localStorage.setItem('accessToken', accessToken);
              console.log('Access token saved from cookie');
            }
            
            if (refreshToken) {
              localStorage.setItem('refreshToken', refreshToken);
              console.log('Refresh token saved from cookie');
            }
          }
          
          // Fetch user data using same method as normal login
          try {
            // Call fetchUserData but don't wait for it to complete
            fetchUserData().then(() => {
              console.log('User data fetched successfully after Google login');
            }).catch(err => {
              console.error('Error fetching user data after Google login:', err);
              
              // Even if fetchUserData fails, still dispatch events
              window.dispatchEvent(new Event('loginSuccess'));
              window.dispatchEvent(new Event('userLoggedIn'));
              window.dispatchEvent(new Event('authStateChanged'));
            });
            
            // Dispatch events immediately to ensure UI is updated
            console.log('About to dispatch login events for Google login');
            
            try {
              window.dispatchEvent(new CustomEvent('loginSuccess', { 
                detail: { 
                  userId: data.value.id || localStorage.getItem('userId'),
                  username: data.value.username || data.value.email || localStorage.getItem('username') || localStorage.getItem('email')
                },
                bubbles: true 
              }));
              console.log('Dispatched detailed loginSuccess event');
            } catch (e) {
              console.error('Error dispatching CustomEvent:', e);
            }
            
            // Basic events that other components might listen for
            window.dispatchEvent(new Event('loginSuccess'));
            window.dispatchEvent(new Event('userLoggedIn'));
            window.dispatchEvent(new Event('authStateChanged'));
            console.log('Dispatched additional login events');
            
            // Navigate with delay
            setTimeout(() => {
              console.log('Navigating to home page...');
              navigate('/');
            }, 500);
          } catch (err) {
            console.error('Error in Google login post-processing:', err);
            
            // Fallback direct navigation if all else fails
            navigate('/');
          }
        } else if (response.ok && (data.value?.accessToken || data.value?.access_token)) {
          // Handle JWT direct response format
          const accessToken = data.value.accessToken || data.value.access_token;
          const refreshToken = data.value.refreshToken || data.value.refresh_token;
          
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
          console.log('JWT tokens saved from direct response');
          
          // Fetch user data
          fetchUserData().then(() => {
            console.log('User data fetched successfully after Google login with JWT');
          }).catch(err => {
            console.error('Error fetching user data after Google login with JWT:', err);
          });
          
          // Dispatch events
          window.dispatchEvent(new Event('loginSuccess'));
          window.dispatchEvent(new Event('userLoggedIn'));
          window.dispatchEvent(new Event('authStateChanged'));
          
          // Navigate with delay
          setTimeout(() => {
        navigate('/');
          }, 500);
        } else {
          console.error('Login failed. Response:', data);
          setError(data.message || 'Đăng nhập bằng Google thất bại!');
        }
      } else {
        console.log('Redirecting to Google OAuth...');
        const redirectUri = 'http://localhost:3000/login?provider=google';
        const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.REACT_APP_GOOGLE_CLIENT_ID || '1007079045635-1pt3idi64hnhht2tiai3t6ja9k8lgtba.apps.googleusercontent.com'}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=email%20profile&access_type=offline`;
        window.location.href = googleAuthUrl;
      }
    } catch (err) {
      console.error('Google login error:', err);
      setError('Có lỗi xảy ra khi đăng nhập bằng Google!');
    } finally {
      isProcessing.current = false;
    }
  };

  const handleFacebookLogin = async (code = null) => {
    try {
      if (code) {
        console.log('Exchanging code for token...');
        const response = await fetch(`http://localhost:8080/api/v1/auth/login/facebook?code=${code}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          credentials: 'include'
        });

        const data = await response.json();
        console.log('Facebook login response:', data);
        console.log('Response status:', response.status);
        console.log('Is response OK?', response.ok);

        // Checking the structure of the response
        if (data && data.code === 1000 && data.value) {
          console.log('Valid response with code 1000');
          
          // Lưu thông tin provider
          localStorage.setItem('loginProvider', 'FACEBOOK');
          
          // Save user info if available
          if (data.value.email) {
            localStorage.setItem('email', data.value.email);
          }
          
          if (data.value.username) {
            localStorage.setItem('username', data.value.username);
          }
          
          if (data.value.email && !data.value.username) {
            // Use email as username if username is not provided
            localStorage.setItem('username', data.value.email);
          }
          
          if (data.value.id) {
            localStorage.setItem('userId', data.value.id);
          }
          
          if (data.value.roles && data.value.roles.length > 0) {
            localStorage.setItem('roles', JSON.stringify(data.value.roles));
          }
          
          // Check JWT response
          if (data.value.accessToken || data.value.access_token) {
            const accessToken = data.value.accessToken || data.value.access_token;
            const refreshToken = data.value.refreshToken || data.value.refresh_token;
            
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            console.log('JWT tokens saved from response');
          } else {
            // Get token from cookie if not in response
            const cookies = document.cookie.split(';');
            let accessToken = null;
            let refreshToken = null;
            
            for (let i = 0; i < cookies.length; i++) {
              const cookie = cookies[i].trim();
              if (cookie.startsWith('accessToken=')) {
                accessToken = cookie.substring('accessToken='.length, cookie.length);
              } else if (cookie.startsWith('refreshToken=')) {
                refreshToken = cookie.substring('refreshToken='.length, cookie.length);
              }
            }
            
            if (accessToken) {
              localStorage.setItem('accessToken', accessToken);
              console.log('Access token saved from cookie');
            }
            
            if (refreshToken) {
              localStorage.setItem('refreshToken', refreshToken);
              console.log('Refresh token saved from cookie');
            }
          }
          
          // Fetch user data using same method as normal login
          try {
            // Call fetchUserData but don't wait for it to complete
            fetchUserData().then(() => {
              console.log('User data fetched successfully after Facebook login');
            }).catch(err => {
              console.error('Error fetching user data after Facebook login:', err);
              
              // Even if fetchUserData fails, still dispatch events
              window.dispatchEvent(new Event('loginSuccess'));
              window.dispatchEvent(new Event('userLoggedIn'));
              window.dispatchEvent(new Event('authStateChanged'));
            });
            
            // Dispatch events immediately to ensure UI is updated
            console.log('About to dispatch login events for Facebook login');
            
            try {
              window.dispatchEvent(new CustomEvent('loginSuccess', { 
                detail: { 
                  userId: data.value.id || localStorage.getItem('userId'),
                  username: data.value.username || data.value.email || localStorage.getItem('username') || localStorage.getItem('email')
                },
                bubbles: true 
              }));
              console.log('Dispatched detailed loginSuccess event');
            } catch (e) {
              console.error('Error dispatching CustomEvent:', e);
            }
            
            // Basic events that other components might listen for
            window.dispatchEvent(new Event('loginSuccess'));
            window.dispatchEvent(new Event('userLoggedIn'));
            window.dispatchEvent(new Event('authStateChanged'));
            console.log('Dispatched additional login events');
            
            // Navigate with delay
            setTimeout(() => {
              console.log('Navigating to home page...');
              navigate('/');
            }, 500);
          } catch (err) {
            console.error('Error in Facebook login post-processing:', err);
            
            // Fallback direct navigation if all else fails
            navigate('/');
          }
        } else if (response.ok && (data.value?.accessToken || data.value?.access_token)) {
          // Handle JWT direct response format
          const accessToken = data.value.accessToken || data.value.access_token;
          const refreshToken = data.value.refreshToken || data.value.refresh_token;
          
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
          console.log('JWT tokens saved from direct response');
          
          // Fetch user data
          fetchUserData().then(() => {
            console.log('User data fetched successfully after Facebook login with JWT');
          }).catch(err => {
            console.error('Error fetching user data after Facebook login with JWT:', err);
          });
          
          // Dispatch events
          window.dispatchEvent(new Event('loginSuccess'));
          window.dispatchEvent(new Event('userLoggedIn'));
          window.dispatchEvent(new Event('authStateChanged'));
          
          // Navigate with delay
          setTimeout(() => {
            navigate('/');
          }, 500);
        } else {
          console.error('Login failed. Response:', data);
          setError(data.message || 'Đăng nhập bằng Facebook thất bại!');
        }
      } else {
        console.log('Redirecting to Facebook OAuth...');
        const redirectUri = 'http://localhost:3000/login?provider=facebook';
        const facebookAuthUrl = `https://www.facebook.com/v12.0/dialog/oauth?client_id=${process.env.REACT_APP_FACEBOOK_CLIENT_ID || '1054506113365796'}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=email,public_profile`;
        window.location.href = facebookAuthUrl;
      }
    } catch (err) {
      console.error('Facebook login error:', err);
      setError('Có lỗi xảy ra khi đăng nhập bằng Facebook!');
    } finally {
      isProcessing.current = false;
    }
  };

  return (
    <div className="login-container">
      <h2>Login to Your Account</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="social-login">
        <button 
          className="btn-social btn-google" 
          onClick={() => handleGoogleLogin()}
          title="Login with Google"
        >
          <img src={googleIcon} alt="Google" />
        </button>
        <button 
          className="btn-social btn-facebook" 
          onClick={() => handleFacebookLogin()}
          title="Login with Facebook"
        >
          <img src={facebookIcon} alt="Facebook" />
        </button>
      </div>
      
      <div className="login-divider">
        <div className="line"></div>
        <div className="text">or</div>
        <div className="line"></div>
                </div>

      <form onSubmit={handleSubmit}>
                <div className="form-group">
          <label htmlFor="username">Username</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
            required
                  />
                </div>
                <div className="form-group">
          <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
            required
                  />
                </div>
        <button 
          type="submit" 
          className="btn-login"
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
              </form>
      
      <div className="register-link">
        Don't have an account? <Link to="/register">Register</Link>
            </div>
          </div>
  );
};

export default Login; 