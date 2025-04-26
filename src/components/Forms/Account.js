import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Forms.scss';

const Account = () => {
  const navigate = useNavigate();
  const [activeForm, setActiveForm] = useState('login'); // 'login', 'register', 'forgot'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    address: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/auth/login', {
        email: formData.email,
        password: formData.password
      });
      
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setSuccess('Đăng nhập thành công!');
        setTimeout(() => {
          navigate('/');
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại!');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp!');
      return;
    }

    try {
      const response = await axios.post('/api/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        address: formData.address
      });

      if (response.data.success) {
        setSuccess('Đăng ký thành công! Vui lòng đăng nhập.');
        setTimeout(() => {
          setActiveForm('login');
          setFormData({
            email: '',
            password: '',
            confirmPassword: '',
            name: '',
            phone: '',
            address: ''
          });
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký thất bại!');
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/auth/forgot-password', {
        email: formData.email
      });

      if (response.data.success) {
        setSuccess('Vui lòng kiểm tra email của bạn để đặt lại mật khẩu!');
        setTimeout(() => {
          setActiveForm('login');
          setFormData({ email: '', password: '' });
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể gửi yêu cầu đặt lại mật khẩu!');
    }
  };

  const renderLoginForm = () => (
    <div className="account-container">
      <h2>Đăng Nhập</h2>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label className="label-form">Email</label>
          <input
            type="email"
            name="email"
            className="input-form"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label className="label-form">Mật khẩu</label>
          <input
            type="password"
            name="password"
            className="input-form"
            value={formData.password}
            onChange={handleInputChange}
            required
          />
        </div>
        <button type="submit" className="btnForm">Đăng Nhập</button>
      </form>
      <div className="options">
        <a href="#" onClick={() => setActiveForm('register')}>Đăng ký tài khoản mới</a>
        <span> | </span>
        <a href="#" onClick={() => setActiveForm('forgot')}>Quên mật khẩu?</a>
      </div>
    </div>
  );

  const renderRegisterForm = () => (
    <div className="account-container">
      <h2>Đăng Ký</h2>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      <form onSubmit={handleRegister}>
        <div className="form-group">
          <label className="label-form">Họ tên</label>
          <input
            type="text"
            name="name"
            className="input-form"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label className="label-form">Email</label>
          <input
            type="email"
            name="email"
            className="input-form"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label className="label-form">Số điện thoại</label>
          <input
            type="tel"
            name="phone"
            className="input-form"
            value={formData.phone}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label className="label-form">Địa chỉ</label>
          <input
            type="text"
            name="address"
            className="input-form"
            value={formData.address}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label className="label-form">Mật khẩu</label>
          <input
            type="password"
            name="password"
            className="input-form"
            value={formData.password}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label className="label-form">Xác nhận mật khẩu</label>
          <input
            type="password"
            name="confirmPassword"
            className="input-form"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            required
          />
        </div>
        <button type="submit" className="btnForm">Đăng Ký</button>
      </form>
      <div className="options">
        <a href="#" onClick={() => setActiveForm('login')}>Đã có tài khoản? Đăng nhập</a>
      </div>
    </div>
  );

  const renderForgotPasswordForm = () => (
    <div className="account-container">
      <h2>Quên Mật Khẩu</h2>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      <form onSubmit={handleForgotPassword}>
        <div className="form-group">
          <label className="label-form">Email</label>
          <input
            type="email"
            name="email"
            className="input-form"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </div>
        <button type="submit" className="btnForm">Gửi Yêu Cầu</button>
      </form>
      <div className="options">
        <a href="#" onClick={() => setActiveForm('login')}>Quay lại đăng nhập</a>
      </div>
    </div>
  );

  return (
    <div className="form-container">
      {activeForm === 'login' && renderLoginForm()}
      {activeForm === 'register' && renderRegisterForm()}
      {activeForm === 'forgot' && renderForgotPasswordForm()}
    </div>
  );
};

export default Account; 