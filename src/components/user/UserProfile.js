import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authFetch } from '../../utils/authFetch';
import './UserProfile.scss';

const UserProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    username: '',
    email: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const userId = localStorage.getItem('userId');
      const username = localStorage.getItem('username'); // Có thể là email
      const email = localStorage.getItem('email');

      if (!token) {
        navigate('/login');
        return;
      }

      console.log('Fetching user data with token:', token);
      console.log('UserId:', userId);
      console.log('Username/Email:', username || email);

      // Thử lấy thông tin từ token
      try {
        if (token) {
          const tokenParts = token.split('.');
          const base64 = tokenParts[1].replace(/-/g, '+').replace(/_/g, '/');
          const payload = JSON.parse(atob(base64));
          console.log('Token payload:', payload);
        }
      } catch (e) {
        console.log('Cannot decode token:', e);
      }

      let response;
      let data;

      // Thử gọi API với userId trước
      if (userId) {
        try {
          console.log('Trying with userId endpoint...');
          response = await authFetch(`http://localhost:8080/api/v1/user/id/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          // Kiểm tra response trước khi parse JSON
          if (response.status === 200) {
            data = await response.json();
            if (data && data.code === 1000 && data.value) {
              console.log('User data from userId endpoint:', data);
              setUser(data.value);
              setFormData({
                firstname: data.value.firstname,
                lastname: data.value.lastname,
                username: data.value.username,
                email: data.value.email,
                phone: data.value.phone,
                address: data.value.address
              });
              return; // Kết thúc nếu lấy thành công
            }
          } else {
            console.error('Error response from userId endpoint:', response.status);
          }
        } catch (error) {
          console.error('Error fetching user data with userId:', error);
        }
      }

      // Thử gọi API với email nếu userId không thành công
      if (username) {
        try {
          console.log('Trying with email endpoint...');
          const emailToUse = email || username; // Dùng email nếu có, không thì dùng username (có thể là email)
          const provider = localStorage.getItem('loginProvider') || 'LOCAL';
          response = await authFetch(`http://localhost:8080/api/v1/user/email-provider?email=${encodeURIComponent(emailToUse)}&provider=${provider}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          // Kiểm tra response trước khi parse JSON
          if (response.status === 200) {
            data = await response.json();
            if (data && data.code === 1000 && data.value) {
              console.log('User data from email endpoint:', data);
              setUser(data.value);
              setFormData({
                firstname: data.value.firstname,
                lastname: data.value.lastname,
                username: data.value.username,
                email: data.value.email,
                phone: data.value.phone,
                address: data.value.address
              });
              
              // Cập nhật userId trong localStorage nếu chưa có
              if (!localStorage.getItem('userId') && data.value.id) {
                localStorage.setItem('userId', data.value.id);
              }
              return; // Kết thúc nếu lấy thành công
            }
          } else {
            console.error('Error response from email endpoint:', response.status);
          }
        } catch (error) {
          console.error('Error fetching user data with email:', error);
        }
      }

      // Nếu tất cả các cách đều thất bại
      console.error('All attempts to fetch user data failed');
      navigate('/login'); // Redirect về trang login nếu không lấy được dữ liệu
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      const userId = localStorage.getItem('userId');
      const username = localStorage.getItem('username');
      const email = localStorage.getItem('email');

      if (!token) {
        navigate('/login');
        return;
      }

      // Thử gọi API với userId trước
      if (userId) {
        try {
          console.log('Updating user with userId endpoint...');
          const response = await authFetch(`http://localhost:8080/api/v1/user/${userId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(formData),
          });

          if (response.ok) {
            console.log('User updated successfully using userId endpoint');
            setIsEditing(false);
            fetchUserData();
            return;
          } else {
            console.error('Error updating user with userId:', response.status);
          }
        } catch (error) {
          console.error('Error updating user with userId:', error);
        }
      }

      // Thử gọi API với email nếu userId không thành công
      if (username || email) {
        try {
          console.log('Updating user with email endpoint...');
          const emailToUse = email || username;
          const provider = localStorage.getItem('loginProvider') || 'LOCAL';
          const response = await authFetch(`http://localhost:8080/api/v1/user/email-provider?email=${encodeURIComponent(emailToUse)}&provider=${provider}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(formData),
          });

          if (response.ok) {
            console.log('User updated successfully using email endpoint');
            setIsEditing(false);
            fetchUserData();
            return;
          } else {
            console.error('Error updating user with email:', response.status);
          }
        } catch (error) {
          console.error('Error updating user with email:', error);
        }
      }

      // Nếu tất cả các cách đều thất bại
      console.error('All attempts to update user data failed');
      alert('Không thể cập nhật thông tin người dùng. Vui lòng thử lại sau.');
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Đã xảy ra lỗi khi cập nhật thông tin. Vui lòng thử lại sau.');
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="form-account">
          <h2>Hồ Sơ Của Tôi</h2>
          <p style={{ borderBottom: '1px solid #ccc', paddingBottom: '12px' }}>
            Quản lý thông tin hồ sơ để bảo mật tài khoản
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="username" className="form-label">Tên đăng nhập</label>
              <input
                type="text"
                className="form-control input-form"
                id="username"
                name="username"
                value={formData.username}
                disabled
              />
            </div>
            <div className="mb-3">
              <label htmlFor="firstname" className="form-label">Họ</label>
              <input
                type="text"
                className="form-control input-form"
                id="firstname"
                name="firstname"
                value={formData.firstname}
                onChange={handleInputChange}
                disabled={!isEditing}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="lastname" className="form-label">Tên</label>
              <input
                type="text"
                className="form-control input-form"
                id="lastname"
                name="lastname"
                value={formData.lastname}
                onChange={handleInputChange}
                disabled={!isEditing}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                type="email"
                className="form-control input-form"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="phone" className="form-label">Số điện thoại</label>
              <input
                type="tel"
                className="form-control input-form"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="address" className="form-label">Địa chỉ</label>
              <input
                type="text"
                className="form-control input-form"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>

            {!isEditing ? (
              <button
                type="button"
                className="btn btn-danger btn-account"
                onClick={() => setIsEditing(true)}
              >
                Sửa
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="btn btn-outline-danger btn-account"
                  onClick={() => {
                    setIsEditing(false);
                    fetchUserData();
                  }}
                >
                  Hủy
                </button>
                <button type="submit" className="btn btn-danger btn-account">
                  Lưu
                </button>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserProfile; 