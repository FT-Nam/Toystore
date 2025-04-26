import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import './Users.scss';
import { authFetch } from '../../../utils/authFetch';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons';


const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalPages: 0,
    totalElements: 0
  });
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Parse URL search params for pagination
    const searchParams = new URLSearchParams(location.search);
    const page = parseInt(searchParams.get('page')) || 0;
    const size = parseInt(searchParams.get('size')) || 10;

    setPagination(prev => ({
      ...prev,
      page,
      size
    }));

    fetchUsers(page, size);
  }, [location.search]);

  const fetchUsers = async (page = 0, size = 10) => {
    try {
      const response = await authFetch(`http://localhost:8080/api/v1/user?page=${page}&size=${size}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      // Ensure users is always an array
      const data = await response.json();
      
      // Ensure products is always an array
      const usersData = Array.isArray(data.value) ? data.value : 
                          (data && data.value && Array.isArray(data.value)) ? data.value : [];
      
      // Set pagination data if available
      if (data.totalPages) {
        setPagination({
          page: data.page || 0,
          size: data.size || 10,
          totalPages: data.totalPages || 1,
          totalElements: data.totalElements || usersData.length
        });
      }
      
      console.log('Processed users data:', usersData);
      setUsers(usersData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users');
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < pagination.totalPages) {
      const searchParams = new URLSearchParams(location.search);
      searchParams.set('page', newPage);
      navigate(`${location.pathname}?${searchParams.toString()}`);
    }
  };

  const handleSizeChange = (e) => {
    const newSize = parseInt(e.target.value);
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('size', newSize);
    searchParams.set('page', 0); // Reset to first page when changing size
    navigate(`${location.pathname}?${searchParams.toString()}`);
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      try {
        await authFetch(`http://localhost:8080/api/v1/user/id/${userId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
        fetchUsers(pagination.page, pagination.size);
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  if (loading) return (
    <div className="admin-text-center">
      <div className="admin-spinner-border" role="status">
        <span className="admin-sr-only">Loading...</span>
      </div>
    </div>
  );

  if (error) return (
    <div className="admin-alert admin-alert-danger">
      {error}
    </div>
  );

  return (
    <div className="admin-users">
      <div className="admin-row">
        <div className="admin-col-lg-12">
          <h3 className="admin-page-header"><i className="fa fa-users"></i> Quản lý người dùng</h3>
          <ol className="admin-breadcrumb">
            <li><i className="fa fa-home"></i><Link to="/admin">Home</Link></li>
            <li><i className="fa fa-users"></i>Người dùng</li>
          </ol>
        </div>
      </div>

      <div className="admin-row">
        <div className="admin-col-lg-12">
          <section className="admin-panel">
            <header className="admin-panel-heading">
              Danh sách người dùng
              <Link to="/admin/users/add" className="admin-btn admin-btn-primary admin-pull-right">
                <i className="fa fa-plus"></i> Thêm người dùng
              </Link>
            </header>
            <div className="admin-table-responsive">
              <table className="admin-table admin-table-striped admin-table-advance admin-table-hover">
                <thead>
                  <tr>
                    <th><i className="icon_profile"></i> ID</th>
                    <th><i className="icon_profile"></i> Ảnh đại diện</th>
                    <th><i className="icon_profile"></i> Họ</th>
                    <th><i className="icon_profile"></i> Tên</th>
                    <th><i className="icon_mail_alt"></i> Email</th>
                    <th><i className="icon_mobile"></i> Số điện thoại</th>
                    <th><i className="icon_key"></i> Vai trò</th>
                    <th><i className="icon_cog"></i> Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(users) && users.length > 0 ? (
                    users.map(user => (
                      <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>
                          <img 
                            src={user.avatar || '/default-avatar.png'} 
                            alt={user.name} 
                            className="admin-user-avatar"
                          />
                        </td>
                        <td>{user.firstname}</td>
                        <td>{user.lastname}</td>
                        <td>{user.email}</td>
                        <td>{user.phone || 'N/A'}</td>
                        <td>
                          <span
                            className={`admin-label ${user.roles?.includes('ADMIN')
                                ? 'admin-label-danger'
                                : user.roles?.includes('STAFF')
                                  ? 'admin-label-warning'
                                  : 'admin-label-info'
                              }`}
                          >
                            {user.roles?.includes('ADMIN')
                              ? 'Admin'
                              : user.roles?.includes('STAFF')
                                ? 'Nhân viên'
                                : 'Khách hàng'}
                          </span>
                        </td>


                        <td>
                          <div className="admin-btn-group">
                            <Link to={`/admin/users/edit/${user.id}`} className="admin-btn admin-btn-primary">
                              <FontAwesomeIcon icon={faEdit} />
                            </Link>
                            <button onClick={() => handleDelete(user.id)} className="admin-btn admin-btn-danger">
                              <FontAwesomeIcon icon={faTrashAlt} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="admin-text-center">Không có người dùng nào</td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Pagination controls */}
              <div className="admin-pagination-container">
                <div className="admin-row">
                  <div className="admin-col-md-6">
                    <div className="admin-dataTables_info" role="status">
                      Hiển thị {users.length} / {pagination.totalElements} người dùng
                    </div>
                  </div>
                  <div className="admin-col-md-6">
                    <div className="admin-dataTables_paginate admin-paging_simple_numbers">
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                        <div className="admin-mr-3">
                          <select
                            className="admin-form-control admin-form-control-sm"
                            value={pagination.size}
                            onChange={handleSizeChange}
                          >
                            <option value="5">5</option>
                            <option value="10">10</option>
                            <option value="25">25</option>
                            <option value="50">50</option>
                          </select>
                        </div>

                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

const AddUser = () => {
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    username: '',
    email: '',
    password: '',
    address: '',
    phone: '',
    avatar: null,
    provider: 'LOCAL',
    providerId: '',
    role: new Set(['CUSTOMER'])
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRoleChange = (e) => {
    const { value, checked } = e.target;
    setFormData(prev => {
      const updatedRoles = new Set(prev.role);

      if (checked) {
        // Add role if it doesn't exist
        updatedRoles.add(value);
      } else {
        // Remove role
        updatedRoles.delete(value);
      }

      return {
        ...prev,
        role: updatedRoles
      };
    });
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      avatar: e.target.files[0]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create JSON payload
      const userData = {
        ...formData,
        role: Array.from(formData.role),
        avatar: formData.avatar ? await convertFileToBase64(formData.avatar) : null
      };

      await authFetch('http://localhost:8080/api/v1/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      navigate('/admin/users');
    } catch (error) {
      console.error('Error adding user:', error);
      setError('Failed to add user: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Helper function to convert file to base64
  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  if (loading) return (
    <div className="admin-text-center">
      <div className="admin-spinner-border" role="status">
        <span className="admin-sr-only">Loading...</span>
      </div>
    </div>
  );

  return (
    <div className="admin-users">
      <div className="admin-row">
        <div className="admin-col-lg-12">
          <h3 className="admin-page-header"><i className="fa fa-user-plus"></i> Thêm người dùng</h3>
          <ol className="admin-breadcrumb">
            <li><i className="fa fa-home"></i><Link to="/admin">Home</Link></li>
            <li><i className="fa fa-users"></i><Link to="/admin/users">Người dùng</Link></li>
            <li><i className="fa fa-user-plus"></i>Thêm người dùng</li>
          </ol>
        </div>
      </div>

      <div className="admin-row">
        <div className="admin-col-lg-12">
          <section className="admin-panel">
            <header className="admin-panel-heading">
              Thông tin người dùng mới
            </header>
            <div className="admin-panel-body">
              {error && <div className="admin-alert admin-alert-danger">{error}</div>}
              
              <form className="admin-form-horizontal" onSubmit={handleSubmit}>
                <div className="admin-form-group">
                  <label className="admin-col-sm-2 admin-control-label">Họ <span className="admin-text-danger">*</span></label>
                  <div className="admin-col-sm-10">
                    <input
                      type="text"
                      className="admin-form-control"
                      name="firstname"
                      value={formData.firstname}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-col-sm-2 admin-control-label">Tên <span className="admin-text-danger">*</span></label>
                  <div className="admin-col-sm-10">
                    <input 
                      type="text" 
                      className="admin-form-control" 
                      name="lastname"
                      value={formData.lastname}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-col-sm-2 admin-control-label">Tên đăng nhập <span className="admin-text-danger">*</span></label>
                  <div className="admin-col-sm-10">
                    <input
                      type="text"
                      className="admin-form-control"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      required
                      minLength="5"
                    />
                    <small className="admin-text-muted">Tối thiểu 5 ký tự</small>
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-col-sm-2 admin-control-label">Email <span className="admin-text-danger">*</span></label>
                  <div className="admin-col-sm-10">
                    <input 
                      type="email" 
                      className="admin-form-control" 
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-col-sm-2 admin-control-label">Mật khẩu <span className="admin-text-danger">*</span></label>
                  <div className="admin-col-sm-10">
                    <input 
                      type="password" 
                      className="admin-form-control" 
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      minLength="7"
                    />
                    <small className="admin-text-muted">Tối thiểu 7 ký tự</small>
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-col-sm-2 admin-control-label">Địa chỉ <span className="admin-text-danger">*</span></label>
                  <div className="admin-col-sm-10">
                    <input
                      type="text"
                      className="admin-form-control" 
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-col-sm-2 admin-control-label">Số điện thoại <span className="admin-text-danger">*</span></label>
                  <div className="admin-col-sm-10">
                    <input 
                      type="text" 
                      className="admin-form-control" 
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      pattern="^(\+\d{1,3})?[- .]?\d{10,15}$"
                    />
                    <small className="admin-text-muted">Định dạng: +84xxxxxxxxx hoặc 0xxxxxxxxx</small>
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-col-sm-2 admin-control-label">Vai trò <span className="admin-text-danger">*</span></label>
                  <div className="admin-col-sm-10">
                    <div className="admin-checkbox">
                      <input
                        type="checkbox"
                        id="roleCustomer"
                        value="CUSTOMER"
                        checked={formData.role.has('CUSTOMER')}
                        onChange={handleRoleChange}
                      />
                      <label htmlFor="roleCustomer">Khách hàng</label>
                    </div>

                    <div className="admin-checkbox">
                      <input
                        type="checkbox"
                        id="roleAdmin"
                        value="ADMIN"
                        checked={formData.role.has('ADMIN')}
                        onChange={handleRoleChange}
                      />
                      <label htmlFor="roleAdmin">Quản trị viên</label>
                    </div>

                    <div className="admin-checkbox">
                      <input
                        type="checkbox"
                        id="roleStaff"
                        value="STAFF"
                        checked={formData.role.has('STAFF')}
                        onChange={handleRoleChange}
                      />
                      <label htmlFor="roleAdmin">Nhân viên</label>
                    </div>
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-col-sm-2 admin-control-label">Ảnh đại diện</label>
                  <div className="admin-col-sm-10">
                    <input 
                      type="file" 
                      className="admin-form-control" 
                      name="avatar"
                      onChange={handleFileChange}
                      accept="image/*"
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <div className="admin-col-sm-offset-2 admin-col-sm-10">
                    <button type="submit" className="admin-btn admin-btn-primary" disabled={loading}>
                      {loading ? 'Đang xử lý...' : 'Thêm người dùng'}
                    </button>
                    <Link to="/admin/users" className="admin-btn admin-btn-default admin-ml-2">Hủy</Link>
                  </div>
                </div>
              </form>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

const EditUser = () => {
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    username: '',
    email: '',
    address: '',
    phone: '',
    avatar: null,
    provider: 'LOCAL',
    providerId: '',
    role: new Set(['CUSTOMER'])
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const userId = window.location.pathname.split('/').pop();

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await authFetch(`http://localhost:8080/api/v1/user/id/${userId}`);
      const data = await response.json();
      const userData = data.value || data; // Access the value property if it exists

      console.log('User data received:', userData);
      
      // Convert role array to Set
      const roleSet = new Set(Array.isArray(userData.roles) ? userData.roles : 
                              (userData.role ? (Array.isArray(userData.role) ? userData.role : [userData.role]) : []));
      
      setFormData({
        firstname: userData.firstname || '',
        lastname: userData.lastname || '',
        username: userData.username || '',
        email: userData.email || '',
        address: userData.address || '',
        phone: userData.phone || '',
        avatar: null,
        provider: userData.provider || 'LOCAL',
        providerId: userData.providerId || '',
        role: roleSet
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user details:', error);
      setError('Failed to load user details');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRoleChange = (e) => {
    const { value, checked } = e.target;
    setFormData(prev => {
      const updatedRoles = new Set(prev.role);

      if (checked) {
        // Add role if it doesn't exist
        updatedRoles.add(value);
      } else {
        // Remove role
        updatedRoles.delete(value);
      }

      return {
        ...prev,
        role: updatedRoles
      };
    });
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      avatar: e.target.files[0]
    }));
  };

  // Helper function to convert file to base64
  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Create JSON payload
      const userData = {
        ...formData,
        role: Array.from(formData.role),
        avatar: formData.avatar ? await convertFileToBase64(formData.avatar) : undefined
      };

      // Don't send password in update
      delete userData.password;

      await authFetch(`http://localhost:8080/api/v1/user/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      navigate('/admin/users');
    } catch (error) {
      console.error('Error updating user:', error);
      setError('Failed to update user: ' + (error.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="admin-text-center">
      <div className="admin-spinner-border" role="status">
        <span className="admin-sr-only">Loading...</span>
      </div>
    </div>
  );

  return (
    <div className="admin-users">
      <div className="admin-row">
        <div className="admin-col-lg-12">
          <h3 className="admin-page-header"><i className="fa fa-edit"></i> Chỉnh sửa người dùng</h3>
          <ol className="admin-breadcrumb">
            <li><i className="fa fa-home"></i><Link to="/admin">Home</Link></li>
            <li><i className="fa fa-users"></i><Link to="/admin/users">Người dùng</Link></li>
            <li><i className="fa fa-edit"></i>Chỉnh sửa người dùng</li>
          </ol>
        </div>
      </div>

      <div className="admin-row">
        <div className="admin-col-lg-12">
          <section className="admin-panel">
            <header className="admin-panel-heading">
              Thông tin người dùng
            </header>
            <div className="admin-panel-body">
              {error && <div className="admin-alert admin-alert-danger">{error}</div>}
              
              <form className="admin-form-horizontal" onSubmit={handleSubmit}>
                <div className="admin-form-group">
                  <label className="admin-col-sm-2 admin-control-label">Họ <span className="admin-text-danger">*</span></label>
                  <div className="admin-col-sm-10">
                    <input
                      type="text"
                      className="admin-form-control"
                      name="firstname"
                      value={formData.firstname}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-col-sm-2 admin-control-label">Tên <span className="admin-text-danger">*</span></label>
                  <div className="admin-col-sm-10">
                    <input 
                      type="text" 
                      className="admin-form-control" 
                      name="lastname"
                      value={formData.lastname}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-col-sm-2 admin-control-label">Tên đăng nhập</label>
                  <div className="admin-col-sm-10">
                    <input
                      type="text"
                      className="admin-form-control"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      readOnly
                    />
                    <small className="admin-text-muted">Tên đăng nhập không thể thay đổi</small>
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-col-sm-2 admin-control-label">Email</label>
                  <div className="admin-col-sm-10">
                    <input 
                      type="email" 
                      className="admin-form-control" 
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      readOnly
                    />
                    <small className="admin-text-muted">Email không thể thay đổi</small>
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-col-sm-2 admin-control-label">Địa chỉ <span className="admin-text-danger">*</span></label>
                  <div className="admin-col-sm-10">
                    <input
                      type="text"
                      className="admin-form-control" 
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-col-sm-2 admin-control-label">Số điện thoại <span className="admin-text-danger">*</span></label>
                  <div className="admin-col-sm-10">
                    <input 
                      type="text" 
                      className="admin-form-control" 
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      pattern="^(\+\d{1,3})?[- .]?\d{10,15}$"
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-col-sm-2 admin-control-label">Vai trò <span className="admin-text-danger">*</span></label>
                  <div className="admin-col-sm-10">
                    <div className="admin-checkbox">
                      <input
                        type="checkbox"
                        id="roleCustomer"
                        value="CUSTOMER"
                        checked={formData.role.has('CUSTOMER')}
                        onChange={handleRoleChange}
                      />
                      <label htmlFor="roleCustomer">Khách hàng</label>
                    </div>

                    <div className="admin-checkbox">
                      <input
                        type="checkbox"
                        id="roleAdmin"
                        value="ADMIN"
                        checked={formData.role.has('ADMIN')}
                        onChange={handleRoleChange}
                      />
                      <label htmlFor="roleAdmin">Quản trị viên</label>
                    </div>

                    <div className="admin-checkbox">
                      <input
                        type="checkbox"
                        id="roleStaff"
                        value="STAFF"
                        checked={formData.role.has('STAFF')}
                        onChange={handleRoleChange}
                      />
                      <label htmlFor="roleAdmin">Nhân viên</label>
                    </div>
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-col-sm-2 admin-control-label">Ảnh đại diện</label>
                  <div className="admin-col-sm-10">
                    <input 
                      type="file" 
                      className="admin-form-control" 
                      name="avatar"
                      onChange={handleFileChange}
                      accept="image/*"
                    />
                    <small className="admin-text-muted">Để trống nếu không thay đổi ảnh đại diện</small>
                  </div>
                </div>

                <div className="admin-form-group">
                  <div className="admin-col-sm-offset-2 admin-col-sm-10">
                    <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
                      {saving ? 'Đang lưu...' : 'Cập nhật'}
                    </button>
                    <Link to="/admin/users" className="admin-btn admin-btn-default admin-ml-2">Hủy</Link>
                  </div>
                </div>
              </form>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

const Users = () => {
  return (
    <Routes>
      <Route path="/" element={<UsersList />} />
      <Route path="/add" element={<AddUser />} />
      <Route path="/edit/:id" element={<EditUser />} />
    </Routes>
  );
};

export default Users; 