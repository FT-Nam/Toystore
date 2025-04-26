import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import './Categories.scss';
import { authFetch } from '../../../utils/authFetch';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons';

const CategoriesList = () => {
  const [categories, setCategories] = useState([]);
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

    fetchCategories(page, size);
  }, [location.search]);

  const fetchCategories = async (page = 0, size = 10) => {
    try {
      console.log('Fetching categories...');
      const response = await authFetch(`http://localhost:8080/api/v1/category?page=${page}&size=${size}`, {
        headers: {
        }
      });
      // Ensure users is always an array
      const data = await response.json();

      // Ensure products is always an array
      const categoriesData = Array.isArray(data.value) ? data.value :
        (data && data.value && Array.isArray(data.value)) ? data.value : [];

      // Set pagination data if available
      if (data.totalPages) {
        setPagination({
          page: data.page || 0,
          size: data.size || 10,
          totalPages: data.totalPages || 1,
          totalElements: data.totalElements || categoriesData.length
        });
      }

      console.log('Processed categories data:', categoriesData);
      setCategories(categoriesData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Failed to load categories');
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

  const handleDelete = async (categoryId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
      try {
        const response = await authFetch(`http://localhost:8080/api/v1/category/${categoryId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to delete category');
        }
        
        fetchCategories(pagination.page, pagination.size);
      } catch (error) {
        console.error('Error deleting category:', error);
        setError('Failed to delete category: ' + (error.message || 'Unknown error'));
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
    <div className="admin-categories">
      <div className="admin-row">
        <div className="admin-col-lg-12">
          <h3 className="admin-page-header"><i className="fa fa-list"></i> Quản lý danh mục</h3>
          <ol className="admin-breadcrumb">
            <li><i className="fa fa-home"></i><Link to="/admin">Home</Link></li>
            <li><i className="fa fa-list"></i>Danh mục</li>
          </ol>
        </div>
      </div>

      <div className="admin-row">
        <div className="admin-col-lg-12">
          <section className="admin-panel">
            <header className="admin-panel-heading">
              Danh sách danh mục
              <Link to="/admin/categories/add" className="admin-btn admin-btn-primary admin-pull-right">
                <i className="fa fa-plus"></i> Thêm danh mục
              </Link>
            </header>
            <div className="admin-table-responsive">
              <table className="admin-table admin-table-striped admin-table-advance admin-table-hover">
                <thead>
                  <tr>
                    <th><i className="icon_profile"></i> ID</th>
                    <th><i className="icon_document"></i> Tên danh mục</th>
                    <th><i className="icon_cog"></i> Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(categories) && categories.length > 0 ? (
                    categories.map((category) => (
                      <tr key={category.categoryId}>
                        <td>{category.categoryId}</td>
                        <td>{category.categoryName}</td>
                        <td>
                          <div className="admin-btn-group">
                            <Link
                              to={`/admin/categories/edit/${category.categoryId}`}
                              className="admin-btn admin-btn-primary"
                            >
                              <FontAwesomeIcon icon={faEdit} />
                            </Link>
                            <button
                              onClick={() => handleDelete(category.categoryId)}
                              className="admin-btn admin-btn-danger"
                            >
                              <FontAwesomeIcon icon={faTrashAlt} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="admin-text-center">
                        Không có danh mục nào
                      </td>
                    </tr>
                  )}

                </tbody>
              </table>

              {/* Pagination controls */}
              <div className="admin-pagination-container">
                <div className="admin-row">
                  <div className="admin-col-md-6">
                    <div className="admin-dataTables_info" role="status">
                      Hiển thị {categories.length} / {pagination.totalElements} danh mục
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

const AddCategory = () => {
  const [formData, setFormData] = useState({
    categoryName: '',
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authFetch('http://localhost:8080/api/v1/category', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(formData)
      });
      navigate('/admin/categories');
    } catch (error) {
      console.error('Error adding category:', error);
      setError('Failed to add category: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-categories">
      <div className="admin-row">
        <div className="admin-col-lg-12">
          <h3 className="admin-page-header"><i className="fa fa-plus"></i> Thêm danh mục</h3>
          <ol className="admin-breadcrumb">
            <li><i className="fa fa-home"></i><Link to="/admin">Home</Link></li>
            <li><i className="fa fa-list"></i><Link to="/admin/categories">Danh mục</Link></li>
            <li><i className="fa fa-plus"></i>Thêm danh mục</li>
          </ol>
        </div>
      </div>

      <div className="admin-row">
        <div className="admin-col-lg-12">
          <section className="admin-panel">
            <header className="admin-panel-heading">
              Thông tin danh mục mới
            </header>
            <div className="admin-panel-body">
              {error && <div className="admin-alert admin-alert-danger">{error}</div>}
              <form className="admin-form-horizontal" onSubmit={handleSubmit}>
                <div className="admin-form-group">
                  <label className="admin-col-sm-2 admin-control-label">Tên danh mục</label>
                  <div className="admin-col-sm-10">
                    <input
                      type="text"
                      className="admin-form-control"
                      name="categoryName"
                      value={formData.categoryName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              
                <div className="admin-form-group">
                  <div className="admin-col-sm-offset-2 admin-col-sm-10">
                    <button type="submit" className="admin-btn admin-btn-primary" disabled={loading}>
                      {loading ? 'Đang xử lý...' : 'Lưu danh mục'}
                    </button>
                    <Link to="/admin/categories" className="admin-btn admin-btn-default" style={{ marginLeft: '10px' }}>
                      Hủy
                    </Link>
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

const EditCategory = () => {
  const [formData, setFormData] = useState({
    categoryName: '',
    categoryId: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const categoryId = window.location.pathname.split('/').pop();

  useEffect(() => {
    fetchCategory();
  }, []);

  const fetchCategory = async () => {
    try {
      console.log('Fetching category with ID:', categoryId);
      const response = await authFetch(`http://localhost:8080/api/v1/category/${categoryId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch category: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Category data:', data);

      if (data && data.value) {
        const category = data.value;
        setFormData({
          categoryName: category.categoryName || '',
          categoryId: category.categoryId || categoryId
        });
      } else {
        throw new Error('Invalid category data received');
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching category details:', error);
      setError('Failed to load category: ' + (error.message || 'Unknown error'));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      console.log('Updating category:', formData);
      const response = await authFetch(`http://localhost:8080/api/v1/category/${categoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          categoryName: formData.categoryName,
          categoryId: formData.categoryId
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update category');
      }
      
      navigate('/admin/categories');
    } catch (error) {
      console.error('Error updating category:', error);
      setError('Failed to update category: ' + (error.message || 'Unknown error'));
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
    <div className="admin-categories">
      <div className="admin-row">
        <div className="admin-col-lg-12">
          <h3 className="admin-page-header"><i className="fa fa-edit"></i> Chỉnh sửa danh mục</h3>
          <ol className="admin-breadcrumb">
            <li><i className="fa fa-home"></i><Link to="/admin">Home</Link></li>
            <li><i className="fa fa-list"></i><Link to="/admin/categories">Danh mục</Link></li>
            <li><i className="fa fa-edit"></i>Chỉnh sửa danh mục</li>
          </ol>
        </div>
      </div>

      <div className="admin-row">
        <div className="admin-col-lg-12">
          <section className="admin-panel">
            <header className="admin-panel-heading">
              Chỉnh sửa thông tin danh mục
            </header>
            <div className="admin-panel-body">
              {error && <div className="admin-alert admin-alert-danger">{error}</div>}
              <form className="admin-form-horizontal" onSubmit={handleSubmit}>
                
                
                <div className="admin-form-group">
                  <label className="admin-col-sm-2 admin-control-label">Tên danh mục</label>
                  <div className="admin-col-sm-10">
                    <input
                      type="text"
                      className="admin-form-control"
                      name="categoryName"
                      value={formData.categoryName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="admin-form-group">
                  <div className="admin-col-sm-offset-2 admin-col-sm-10">
                    <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
                      {saving ? 'Đang xử lý...' : 'Cập nhật danh mục'}
                    </button>
                    <Link to="/admin/categories" className="admin-btn admin-btn-default" style={{ marginLeft: '10px' }}>
                      Hủy
                    </Link>
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

const Categories = () => {
  return (
    <Routes>
      <Route path="/" element={<CategoriesList />} />
      <Route path="/add" element={<AddCategory />} />
      <Route path="/edit/:id" element={<EditCategory />} />
    </Routes>
  );
};

export default Categories; 