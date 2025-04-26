const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

// Kiểm tra xem token có gần hết hạn không (còn dưới 30 giây)
export const isTokenExpiringSoon = (token) => {
  if (!token) return true;
  
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return true;
    
    // Thời gian hết hạn của token (tính bằng giây)
    const expirationTime = decoded.exp * 1000; // Convert to milliseconds
    const currentTime = Date.now();
    const timeRemaining = expirationTime - currentTime;
    
    // Nếu token còn dưới 30 giây hoặc đã hết hạn
    return timeRemaining < 30000;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true;
  }
};

let refreshingPromise = null;

export const refreshToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) throw new Error('No refresh token');

  // Nếu đang có request refresh đang chạy, return promise đó
  if (refreshingPromise) return refreshingPromise;

  // Nếu chưa có, tạo mới
  refreshingPromise = (async () => {
    const response = await fetch('http://localhost:8080/api/v1/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token: refreshToken })
    });

    if (!response.ok) {
      refreshingPromise = null; // clear nếu lỗi
      throw new Error('Refresh token failed');
    }

    const data = await response.json();
    
    // Clear old tokens before setting new ones
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('token');

    
    // Set new tokens
    localStorage.setItem('accessToken', data.value.accessToken);
    localStorage.setItem('refreshToken', data.value.refreshToken);
    
    refreshingPromise = null; // clear sau khi hoàn thành
    return data.value.accessToken;
  })();

  return refreshingPromise;
};

// Function to get token expiration time in milliseconds
export const getTokenExpirationTime = (token) => {
  if (!token) return 0;
  
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return 0;
    
    // Thời gian hết hạn của token (tính bằng milliseconds)
    return decoded.exp * 1000; // Convert to milliseconds
  } catch (error) {
    console.error('Error getting token expiration time:', error);
    return 0;
  }
};

let refreshIntervalId = null;

// Set up automatic token refresh
export const setupAutoRefresh = () => {
  console.log('[AUTH] Setting up automatic token refresh...');
  
  // Clear any existing interval first
  if (refreshIntervalId) {
    clearInterval(refreshIntervalId);
    console.log('[AUTH] Cleared existing refresh interval');
  }
  
  // Function to check and refresh token if needed
  const checkAndRefreshToken = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.log('[AUTH] No token found, skipping auto-refresh check');
      return;
    }
    
    try {
      const expTime = getTokenExpirationTime(token);
      const currentTime = Date.now();
      const timeRemaining = expTime - currentTime;
      
      console.log(`[AUTH] Token expiration check: ${Math.floor(timeRemaining/1000)} seconds remaining`);
      
      // If token expires in less than 3 minutes (180000ms), refresh it
      if (timeRemaining < 180000) {
        console.log('[AUTH] Token will expire soon, refreshing automatically...');
        try {
          await refreshToken();
          console.log('[AUTH] Token refreshed automatically - SUCCESS');
        } catch (err) {
          console.error('[AUTH] Token refresh failed:', err);
        }
      }
    } catch (error) {
      console.error('[AUTH] Auto refresh error:', error);
    }
  };
  
  // Run immediately on setup
  checkAndRefreshToken().catch(err => console.error('[AUTH] Initial token check failed:', err));
  
  // Set up new interval - check every 30 seconds instead of 60
  refreshIntervalId = setInterval(() => {
    console.log('[AUTH] Running scheduled token check');
    checkAndRefreshToken().catch(err => console.error('[AUTH] Scheduled token check failed:', err));
  }, 30000);
  
  console.log('[AUTH] Token refresh interval set up successfully - checking every 30 seconds');
  
  // Add to window for debugging
  window.forceTokenRefresh = () => {
    console.log('[AUTH] Manual token refresh requested');
    return refreshToken()
      .then(() => console.log('[AUTH] Manual token refresh successful'))
      .catch(e => {
        console.error('[AUTH] Manual token refresh failed:', e);
        throw e;
      });
  };
  
  return () => {
    if (refreshIntervalId) {
      clearInterval(refreshIntervalId);
      refreshIntervalId = null;
      console.log('[AUTH] Token refresh interval cleared');
    }
  };
};

// Make sure setupAutoRefresh is called in many ways to ensure it runs
if (typeof window !== 'undefined') {
  console.log('[AUTH] authFetch module loaded, initializing token refresh');
  // When module loads
  const cleanup = setupAutoRefresh();
  
  // When DOM is fully loaded
  window.addEventListener('load', () => {
    console.log('[AUTH] Window loaded, ensuring token refresh is active');
    setupAutoRefresh();
  });
}

export const authFetch = async (url, options = {}) => {
  let token = localStorage.getItem('accessToken');
  const userId = localStorage.getItem('userId');
  const username = localStorage.getItem('username');

  // Kiểm tra token có sắp hết hạn không (còn dưới 30s)
  if (token && isTokenExpiringSoon(token)) {
    console.log('Access token is expiring soon, refreshing...');
    try {
      token = await refreshToken();
      console.log('Access token refreshed successfully');
    } catch (refreshError) {
      console.error('Failed to proactively refresh token:', refreshError);
      // Nếu không refresh được, chúng ta vẫn tiếp tục với token hiện tại
      // Sẽ được xử lý ở phần 401 bên dưới nếu token thực sự đã hết hạn
    }
  }

  // Nếu là request lấy thông tin user
  if (url.includes(`/user/id/${userId}`)) {
    url = userId 
      ? `http://localhost:8080/api/v1/user/id/${userId}`
      : `http://localhost:8080/api/v1/user/email-provider?email=${encodeURIComponent(username)}&provider=${localStorage.getItem('loginProvider') || 'LOCAL'}`;
  }
  

  let headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    let response = await fetch(url, {
      ...options,
      headers,
    });

    // Nếu token hết hạn (401) - đây là fallback nếu kiểm tra chủ động ở trên thất bại
    if (response.status === 401) {
      try {
        // 👉 Gọi API refresh
        const newAccessToken = await refreshToken();
        // Cập nhật header mới
        headers['Authorization'] = `Bearer ${newAccessToken}`;

        // Gọi lại request lần nữa với token mới
        response = await fetch(url, {
          ...options,
          headers,
        });
      } catch (refreshError) {
        // ❌ Nếu không refresh được → clear localStorage & throw
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
        throw new Error('Unauthorized'); // Cho frontend redirect về login
      }
    }

    return response;
  } catch (error) {
    throw new Error('Network error');
  }
};

  
  
  