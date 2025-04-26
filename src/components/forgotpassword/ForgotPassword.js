import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './ForgotPassword.scss';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      if (response.ok) {
        setSuccess(true);
        setEmail('');
      } else {
        const data = await response.json();
        setError(data.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      setError('Có lỗi xảy ra khi gửi yêu cầu');
    }
  };

  return (
    <div className="main-content">
      <div className="container">
        <div className="row">
          <div className="form-container">
            <div className="main-content__product col-9">
              <div className="form-container">
                <div className="account-container" id="forgotPasswordForm">
                  <h2>Đặt lại mật khẩu</h2>
                  {success && (
                    <div className="alert alert-success" role="alert">
                      Vui lòng kiểm tra email của bạn để đặt lại mật khẩu.
                    </div>
                  )}
                  {error && (
                    <div className="alert alert-danger" role="alert">
                      {error}
                    </div>
                  )}
                  <form onSubmit={handleSubmit} className="forgot-password-form">
                    <div className="form-group">
                      <label className="label-form" htmlFor="email">Email</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        className="form-control input-form"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <button type="submit" className="btnForm btn btn-primary">
                      Gửi yêu cầu
                    </button>
                    <p className="options">
                      <Link to="/login" id="showLogin">Đăng nhập</Link> |{' '}
                      <Link to="/register" id="showRegister">Đăng ký tài khoản</Link>
                    </p>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword; 