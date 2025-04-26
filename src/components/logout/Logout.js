import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Xóa tất cả thông tin đăng nhập từ localStorage
    localStorage.removeItem('userId');
    localStorage.removeItem('loginProvider');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    
    // Chuyển hướng về trang chủ
    navigate('/');
  }, [navigate]);

  return null; // Không render gì cả vì component này chỉ xử lý logout
};

export default Logout; 