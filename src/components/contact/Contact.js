import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Contact.scss';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    content: ''
  });
  const [errors, setErrors] = useState([]);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors = [];

    if (!formData.name.trim()) {
      newErrors.push("Tên không được để trống.");
    }

    if (!formData.email.trim()) {
      newErrors.push("Email không được để trống.");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.push("Email không hợp lệ.");
    }

    if (!formData.phone.trim()) {
      newErrors.push("Số điện thoại không được để trống.");
    } else if (!/^[0-9]{10,}$/.test(formData.phone)) {
      newErrors.push("Số điện thoại không hợp lệ.");
    }

    if (!formData.content.trim()) {
      newErrors.push("Nội dung phản hồi không được để trống.");
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/v1/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          ...formData,
          created_at: new Date().toISOString()
        })
      });

      if (response.ok) {
        setSuccess(true);
        setFormData({
          name: '',
          email: '',
          phone: '',
          content: ''
        });
      } else {
        throw new Error('Có lỗi xảy ra khi gửi phản hồi');
      }
    } catch (error) {
      setErrors([error.message]);
    }
  };

  return (
    <div className="main-content">
          <div className="form-container">
            <div className="contact-container" id="contactForm">
              {success && (
                <div className="alert alert-success" role="alert">
                  <span>Cảm ơn bạn đã liên hệ với chúng tôi. Chúng tôi rất trân trọng đóng góp của bạn và sẽ phản hồi lại trong thời gian sớm nhất.</span>
                  <div className="mt-3">
                    <Link to="/" className="btn btn-primary">
                      Quay lại trang chủ
                    </Link>
                  </div>
                </div>
              )}

              {/* Show form only if not success */}
              {!success && (
                <>
                  {errors.length > 0 && (
                    <div className="alert alert-danger" role="alert">
                      <ul>
                        {errors.map((error, index) => (
                          <li key={index} style={{ listStyleType: 'none' }}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <h2>Liên Hệ Với Chúng Tôi</h2>
                  <p>Chúng tôi luôn mong muốn nhận được ý kiến đóng góp từ bạn.</p>
                  <form onSubmit={handleSubmit} className="contact-form">
                    <div className="form-group">
                      <label className="label-form" htmlFor="name">Tên</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        className="form-control input-form"
                        value={formData.name}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="form-group">
                      <label className="label-form" htmlFor="email">Email</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        className="form-control input-form"
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="form-group">
                      <label className="label-form" htmlFor="phone">Số điện thoại</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        className="form-control input-form"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="form-group">
                      <label className="label-form" htmlFor="content">Nội dung phản hồi</label>
                      <textarea
                        id="content"
                        name="content"
                        className="form-control input-form"
                        rows="5"
                        value={formData.content}
                        onChange={handleChange}
                      />
                    </div>
                    <button type="submit" className="btnForm btn btn-primary">
                      Gửi phản hồi
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
  );
};

export default Contact; 