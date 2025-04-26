import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Register.scss';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    username: '',
    email: '',
    password: '',
    confirm_password: '',
    phone: '',
    address: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate password match
    if (formData.password !== formData.confirm_password) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    // Validate data
    if (formData.password.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự');
      return;
    }

    if (!formData.email.includes('@')) {
      setError('Email không hợp lệ');
      return;
    }

    // Create request body with correct field structure
    const requestBody = {
      firstname: formData.firstname,
      lastname: formData.lastname,
      username: formData.username,
      password: formData.password,
      address: formData.address,
      email: formData.email,
      phone: formData.phone,
    };

    console.log('Registration payload:', requestBody);

    try {
      const response = await fetch('http://localhost:8080/api/v1/user/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      console.log('Response status:', response.status);
      
      // Lấy response body dù status code là gì
      let data;
      try {
        data = await response.json();
        console.log('Response data:', data);
      } catch (err) {
        console.error('Error parsing response:', err);
      }

      if (response.ok) {
        // Registration successful
        alert('Đăng ký thành công! Vui lòng đăng nhập.');
        navigate('/login');
      } else {
        // Hiển thị lỗi cụ thể từ server nếu có
        if (data && data.message) {
          setError(data.message);
        } else if (data && data.error) {
          setError(data.error);
        } else if (response.status === 400) {
          setError('Thông tin đăng ký không hợp lệ hoặc đã tồn tại');
        } else if (response.status === 409) {
          setError('Tên đăng nhập hoặc email đã tồn tại');
        } else {
          setError('Đăng ký thất bại. Vui lòng thử lại sau.');
        }
      }
    } catch (error) {
      setError('Có lỗi xảy ra khi đăng ký');
      console.error('Registration error:', error);
    }
  };

  return (
    <div className="form-container">
      <div className="account-container" id="registerForm">
        <h2>Đăng Ký Tài Khoản</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="label-form">Họ</label>
            <input
              type="text"
              name="firstname"
              className="input-form"
              value={formData.firstname}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="label-form">Tên</label>
            <input
              type="text"
              name="lastname"
              className="input-form"
              value={formData.lastname}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="label-form">Tên đăng nhập</label>
            <input
              type="text"
              name="username"
              className="input-form"
              value={formData.username}
              onChange={handleChange}
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
              onChange={handleChange}
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
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="label-form">Xác nhận mật khẩu</label>
            <input
              type="password"
              name="confirm_password"
              className="input-form"
              value={formData.confirm_password}
              onChange={handleChange}
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
              onChange={handleChange}
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
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btnForm">Đăng Ký</button>
        </form>

        <div className="options">
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </div>
      </div>
    </div>
  );
};

export default Register; 