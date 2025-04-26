import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { authFetch } from '../../../utils/authFetch';
import './Products.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons';

const ProductsList = () => {
  const [products, setProducts] = useState([]);
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

    fetchProducts(page, size);
  }, [location.search]);

  const fetchProducts = async (page = 0, size = 10) => {
    try {
      console.log('Fetching products...');
      const response = await authFetch(`http://localhost:8080/api/v1/product?page=${page}&size=${size}`);

      console.log('Products response:', response);

      const data = await response.json();
      console.log('Products data:', data);

      // Ensure products is always an array
      const productsData = Array.isArray(data.value) ? data.value :
        (data && data.value && Array.isArray(data.value)) ? data.value : [];

      // Set pagination data if available
      if (data.totalPages) {
        setPagination({
          page: data.page || 0,
          size: data.size || 10,
          totalPages: data.totalPages || 1,
          totalElements: data.totalElements || productsData.length
        });
      }

      // Fetch category details for each product
      const productsWithCategories = await Promise.all(
        productsData.map(async (product) => {
          if (product.categoryIds && Array.isArray(product.categoryIds) && product.categoryIds.length > 0) {
            try {
              const categoryNames = [];

              for (const categoryId of product.categoryIds) {
                const categoryResponse = await authFetch(`http://localhost:8080/api/v1/category/${categoryId}`);
                const categoryData = await categoryResponse.json();

                if (categoryData && categoryData.value && categoryData.value.categoryName) {
                  categoryNames.push(categoryData.value.categoryName);
                }
              }

              return {
                ...product,
                categoryNames: categoryNames
              };
            } catch (error) {
              console.error(`Error fetching categories for product ${product.id}:`, error);
              return product;
            }
          }
          return product;
        })
      );

      console.log('Processed products data with categories:', productsWithCategories);
      setProducts(productsWithCategories);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products');
      setLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      try {
        await authFetch(`http://localhost:8080/api/v1/product/${productId}`, {
          method: 'DELETE'
        });
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        setError('Failed to delete product');
      }
    }
  };

  const formatProductStatus = (product) => {
    const statuses = [];

    if (product.new) {
      statuses.push('Mới');
    }

    if (product.bestSeller) {
      statuses.push('Bán chạy');
    }

    if (product.sale) {
      statuses.push('Giảm giá');
    }

    return statuses.length > 0 ? statuses.join(', ') : 'Thường';
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
    <div className="admin-products">
      <div className="admin-row">
        <div className="admin-col-lg-12">
          <h3 className="admin-page-header"><i className="fa fa-file-text-o"></i> Quản lý sản phẩm</h3>
          <ol className="admin-breadcrumb">
            <li><i className="fa fa-home"></i><Link to="/admin">Home</Link></li>
            <li><i className="fa fa-file-text-o"></i>Sản phẩm</li>
          </ol>
        </div>
      </div>

      <div className="admin-row">
        <div className="admin-col-lg-12">
          <section className="admin-panel">
            <header className="admin-panel-heading">
              Danh sách sản phẩm
              <Link to="/admin/products/add" className="admin-btn admin-btn-primary admin-pull-right">
                <i className="fa fa-plus"></i> Thêm sản phẩm
              </Link>
            </header>
            <div className="admin-table-responsive">
              <table className="admin-table admin-table-striped admin-table-advance admin-table-hover">
                <thead>
                  <tr>
                    <th><i className="icon_profile"></i> ID</th>
                    <th><i className="icon_image"></i> Hình ảnh</th>
                    <th><i className="icon_document"></i> Tên sản phẩm</th>
                    <th><i className="icon_tag_alt"></i> Thương hiệu</th>
                    <th><i className="icon_pin_alt"></i> Danh mục</th>
                    <th><i className="icon_currency"></i> Giá</th>
                    <th><i className="icon_percent"></i> Giảm giá</th>
                    <th><i className="icon_box-checked"></i> Tồn kho</th>
                    <th><i className="icon_star"></i> Trạng thái</th>
                    <th><i className="icon_cog"></i> Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(products) && products.length > 0 ? (
                    products.map(product => (
                      <tr key={product.id}>
                        <td>{product.id}</td>
                        <td>
                          <img 
                            src={product.thumbnail || '/default-product.png'} 
                            alt={product.name} 
                            className="admin-product-image"
                          />
                        </td>
                        <td>{product.name}</td>
                        <td>{product.brand}</td>
                        <td>
                          {product.categoryNames && product.categoryNames.length > 0
                            ? product.categoryNames.join(', ')
                            : 'Chưa phân loại'}
                        </td>
                        <td>{Number(product.price).toLocaleString()} VNĐ</td>
                        <td>
                          {product.discountPercentage > 0 ? (
                            <span className="admin-discount">{product.discountPercentage}%</span>
                          ) : '0%'}
                        </td>
                        <td>{product.stock}</td>
                        <td>{formatProductStatus(product)}</td>
                        <td>
                          <div className="admin-btn-group">
                            <Link to={`/admin/products/edit/${product.id}`} className="admin-btn admin-btn-primary">
                              <FontAwesomeIcon icon={faEdit} />
                            </Link>
                            <button onClick={() => handleDelete(product.id)} className="admin-btn admin-btn-danger">
                              <FontAwesomeIcon icon={faTrashAlt} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="10" className="admin-text-center">Không có sản phẩm nào</td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Pagination controls */}
              <div className="admin-pagination-container">
                <div className="admin-row">
                  <div className="admin-col-md-6">
                    <div className="admin-dataTables_info" role="status">
                      Hiển thị {products.length} / {pagination.totalElements} sản phẩm
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
                            <option value="100">100</option>
                            <option value="150">150</option>
                            <option value="200">200</option>
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

const AddProduct = () => {
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    thumbnail: '',
    description: '',
    price: '',
    discountPercentage: 0,
    stock: '',
    categoryIds: [],
    isNew: false,
    isBestSeller: false,
    isSale: false
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      console.log('Fetching categories...');
      const response = await authFetch('http://localhost:8080/api/v1/category');
      console.log('Categories response:', response);
      const data = await response.json();
      console.log('Categories data:', data);
      // Ensure categories is always an array
      const categoriesData = Array.isArray(data.value) ? data.value :
        (data && data.value && Array.isArray(data.value)) ? data.value : [];
      console.log('Processed categories data:', categoriesData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Failed to load categories');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleCategoryChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => parseInt(option.value));
    setFormData(prev => ({
      ...prev,
      categoryIds: selectedOptions
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setPreviewImage(previewUrl);

      // Convert image to base64 for thumbnail field
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
    setFormData(prev => ({
      ...prev,
          thumbnail: reader.result
    }));
      };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Create a product first with all form data
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        discountPercentage: parseInt(formData.discountPercentage) || 0
      };

      console.log('Sending product data:', productData);

      const response = await authFetch('http://localhost:8080/api/v1/product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productData)
      });

      const data = await response.json();
      console.log('Product created successfully:', data);

      // Upload product image if available
      if (imageFile && data && data.value && data.value.id) {
        const productId = data.value.id;
        const imageFormData = new FormData();
        imageFormData.append('image', imageFile);

        await authFetch(`http://localhost:8080/api/v1/product-img/upload/${productId}`, {
          method: 'POST',
          body: imageFormData
        });

        console.log('Product image uploaded successfully');
      }

      navigate('/admin/products');
    } catch (error) {
      console.error('Error adding product:', error);
      setError(error.response?.data?.message || 'Failed to add product');
    } finally {
      setLoading(false);
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
    <div className="admin-products">
      <div className="admin-row">
        <div className="admin-col-lg-12">
          <h3 className="admin-page-header"><i className="fa fa-plus"></i> Thêm sản phẩm mới</h3>
          <ol className="admin-breadcrumb">
            <li><i className="fa fa-home"></i><Link to="/admin">Home</Link></li>
            <li><i className="fa fa-file-text-o"></i><Link to="/admin/products">Sản phẩm</Link></li>
            <li><i className="fa fa-plus"></i>Thêm sản phẩm</li>
          </ol>
        </div>
      </div>

      <div className="admin-row">
        <div className="admin-col-lg-12">
          <section className="admin-panel">
            <header className="admin-panel-heading">
              Thông tin sản phẩm
            </header>
            <div className="admin-panel-body">
              {error && <div className="admin-alert admin-alert-danger">{error}</div>}
              
              <form className="admin-form-horizontal" onSubmit={handleSubmit}>
                <div className="admin-form-group">
                  <label className="admin-col-sm-2 admin-control-label">Tên sản phẩm <span className="admin-text-danger">*</span></label>
                  <div className="admin-col-sm-10">
                    <input 
                      type="text" 
                      className="admin-form-control" 
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-col-sm-2 admin-control-label">Thương hiệu <span className="admin-text-danger">*</span></label>
                  <div className="admin-col-sm-10">
                    <input
                      type="text"
                      className="admin-form-control"
                      name="brand"
                      value={formData.brand}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-col-sm-2 admin-control-label">Mô tả <span className="admin-text-danger">*</span></label>
                  <div className="admin-col-sm-10">
                    <textarea 
                      className="admin-form-control" 
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="5"
                      required
                    ></textarea>
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-col-sm-2 admin-control-label">Giá <span className="admin-text-danger">*</span></label>
                  <div className="admin-col-sm-10">
                    <input 
                      type="number" 
                      className="admin-form-control" 
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      min="0.1"
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-col-sm-2 admin-control-label">Giảm giá (%)</label>
                  <div className="admin-col-sm-10">
                    <input
                      type="number"
                      className="admin-form-control" 
                      name="discountPercentage"
                      value={formData.discountPercentage}
                      onChange={handleInputChange}
                      min="0"
                      max="100"
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-col-sm-2 admin-control-label">Tồn kho <span className="admin-text-danger">*</span></label>
                  <div className="admin-col-sm-10">
                    <input 
                      type="number" 
                      className="admin-form-control" 
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-col-sm-2 admin-control-label">Danh mục <span className="admin-text-danger">*</span></label>
                  <div className="admin-col-sm-10">
                    <select
                      className="admin-form-control"
                      name="categoryIds"
                      value={formData.categoryIds}
                      onChange={handleCategoryChange}
                      multiple
                      required
                    >
                      {Array.isArray(categories) && categories.length > 0 ? (
                        categories.map(category => (
                          <option key={category.categoryId} value={category.categoryId}>{category.categoryName}</option>
                        ))
                      ) : (
                        <option value="" disabled>Không có danh mục nào</option>
                      )}
                    </select>
                    <small className="admin-text-muted">Giữ phím Ctrl để chọn nhiều danh mục</small>
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-col-sm-2 admin-control-label">Hình ảnh <span className="admin-text-danger">*</span></label>
                  <div className="admin-col-sm-10">
                    <input 
                      type="file" 
                      className="admin-form-control" 
                      name="image"
                      onChange={handleImageChange}
                      accept="image/*"
                      required
                    />
                    {previewImage && (
                      <div className="admin-mt-2">
                        <img
                          src={previewImage}
                          alt="Preview"
                          style={{ maxWidth: '200px', maxHeight: '200px' }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-col-sm-2 admin-control-label">Thuộc tính</label>
                  <div className="admin-col-sm-10">
                    <div className="admin-checkbox">
                      <input
                        type="checkbox"
                        id="isNewProduct"
                        name="isNew"
                        checked={formData.isNew}
                        onChange={handleInputChange}
                      />
                      <label htmlFor="isNewProduct">Sản phẩm mới</label>
                    </div>

                    <div className="admin-checkbox">
                      <input
                        type="checkbox"
                        id="isBestSeller"
                        name="isBestSeller"
                        checked={formData.isBestSeller}
                        onChange={handleInputChange}
                      />
                      <label htmlFor="isBestSeller">Sản phẩm bán chạy</label>
                    </div>

                    <div className="admin-checkbox">
                      <input
                        type="checkbox"
                        id="isSale"
                        name="isSale"
                        checked={formData.isSale}
                        onChange={handleInputChange}
                      />
                      <label htmlFor="isSale">Đang giảm giá</label>
                    </div>
                  </div>
                </div>

                <div className="admin-form-group">
                  <div className="admin-col-sm-12 admin-text-center">
                    <button type="submit" className="admin-btn admin-btn-primary" disabled={loading}>
                      {loading ? 'Đang xử lý...' : 'Thêm sản phẩm'}
                    </button>
                    <Link to="/admin/products" className="admin-btn admin-btn-default admin-ml-2">Hủy</Link>
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

const EditProduct = () => {
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    description: '',
    price: '',
    discountPercentage: 0,
    stock: 0,
    categoryIds: [],
    isNew: false,
    isBestSeller: false,
    isSale: false
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [productImages, setProductImages] = useState([]);
  const [deletingImage, setDeletingImage] = useState(false);
  const navigate = useNavigate();
  const productId = window.location.pathname.split('/').pop();

  useEffect(() => {
    fetchCategories();
    fetchProduct();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await authFetch('http://localhost:8080/api/v1/category');
      const data = await response.json();

      // Ensure categories is always an array
      const categoriesData = Array.isArray(data.value) ? data.value :
        (data && data.value && Array.isArray(data.value)) ? data.value : [];
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Failed to load categories');
    }
  };

  const fetchProduct = async () => {
    try {
      // Fetch product details
      const response = await authFetch(`http://localhost:8080/api/v1/product/${productId}`);
      const productData = await response.json();

      const product = productData.value || productData;

      // Fetch product images
      try {
        const imageResponse = await authFetch(`http://localhost:8080/api/v1/product-img/product/${productId}`);
        const imageData = await imageResponse.json();

        const images = imageData.value || [];
        setProductImages(images);

        // Set preview image if available
        if (images.length > 0) {
          setPreviewImage(images[0].imgUrl);
        }
      } catch (imageError) {
        console.error('Error fetching product images:', imageError);
      }

      setFormData({
        name: product.name || '',
        brand: product.brand || '',
        description: product.description || '',
        price: product.price || '',
        discountPercentage: product.discountPercentage || 0,
        stock: product.stock || 0,
        categoryIds: product.categoryIds || [],
        isNew: product.isNew || false,
        isBestSeller: product.isBestSeller || false,
        isSale: product.isSale || false
      });

      setLoading(false);
    } catch (error) {
      console.error('Error fetching product details:', error);
      setError('Failed to load product details');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    }
  };

  const handleCategoryChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => parseInt(option.value));
    setFormData(prev => ({
      ...prev,
      categoryIds: selectedOptions
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setPreviewImage(previewUrl);
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa ảnh này?')) {
      return;
    }

    try {
      setDeletingImage(true);

      await authFetch(`http://localhost:8080/api/v1/product-img/${imageId}`, {
        method: 'DELETE'
      });

      // Remove the deleted image from the state
      setProductImages(prev => prev.filter(img => img.id !== imageId));

      // Update preview image if needed
      if (productImages.length > 1) {
        const remainingImages = productImages.filter(img => img.id !== imageId);
        if (remainingImages.length > 0) {
          setPreviewImage(remainingImages[0].imgUrl);
        } else {
          setPreviewImage(null);
        }
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      setError('Failed to delete image');
    } finally {
      setDeletingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // Update product details
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        discountPercentage: parseInt(formData.discountPercentage) || 0
      };

      await authFetch(`http://localhost:8080/api/v1/product/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productData)
      });

      // Upload new image if provided
      if (imageFile) {
        const imageFormData = new FormData();
        imageFormData.append('image', imageFile);

        await authFetch(`http://localhost:8080/api/v1/product-img/upload/${productId}`, {
          method: 'POST',
          body: imageFormData
        });
      }

      navigate('/admin/products');
    } catch (error) {
      console.error('Error updating product:', error);
      setError(error.response?.data?.message || 'Failed to update product');
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
    <div className="admin-products">
      <div className="admin-row">
        <div className="admin-col-lg-12">
          <h3 className="admin-page-header"><i className="fa fa-edit"></i> Chỉnh sửa sản phẩm</h3>
          <ol className="admin-breadcrumb">
            <li><i className="fa fa-home"></i><Link to="/admin">Home</Link></li>
            <li><i className="fa fa-file-text-o"></i><Link to="/admin/products">Sản phẩm</Link></li>
            <li><i className="fa fa-edit"></i>Chỉnh sửa sản phẩm</li>
          </ol>
        </div>
      </div>

      <div className="admin-row">
        <div className="admin-col-lg-12">
          <section className="admin-panel">
            <header className="admin-panel-heading">
              Thông tin sản phẩm
            </header>
            <div className="admin-panel-body">
              {error && <div className="admin-alert admin-alert-danger">{error}</div>}

              <form className="admin-form-horizontal" onSubmit={handleSubmit}>
                <div className="admin-form-group">
                  <label className="admin-col-sm-2 admin-control-label">Tên sản phẩm</label>
                  <div className="admin-col-sm-10">
                    <input 
                      type="text" 
                      className="admin-form-control" 
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-col-sm-2 admin-control-label">Thương hiệu</label>
                  <div className="admin-col-sm-10">
                    <input
                      type="text"
                      className="admin-form-control"
                      name="brand"
                      value={formData.brand}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-col-sm-2 admin-control-label">Mô tả</label>
                  <div className="admin-col-sm-10">
                    <textarea 
                      className="admin-form-control" 
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="5"
                    ></textarea>
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-col-sm-2 admin-control-label">Giá</label>
                  <div className="admin-col-sm-10">
                    <input 
                      type="number" 
                      className="admin-form-control" 
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      min="0.1"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-col-sm-2 admin-control-label">Giảm giá (%)</label>
                  <div className="admin-col-sm-10">
                    <input
                      type="number"
                      className="admin-form-control" 
                      name="discountPercentage"
                      value={formData.discountPercentage}
                      onChange={handleInputChange}
                      min="0"
                      max="100"
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-col-sm-2 admin-control-label">Tồn kho</label>
                  <div className="admin-col-sm-10">
                    <input 
                      type="number" 
                      className="admin-form-control" 
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                      min="0"
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-col-sm-2 admin-control-label">Danh mục</label>
                  <div className="admin-col-sm-10">
                    <select
                      className="admin-form-control"
                      name="categoryIds"
                      value={formData.categoryIds}
                      onChange={handleCategoryChange}
                      multiple
                    >
                      {Array.isArray(categories) && categories.length > 0 ? (
                        categories.map(category => (
                          <option key={category.CategoryId} value={category.CategoryId}>{category.categoryName}</option>
                        ))
                      ) : (
                        <option value="" disabled>Không có danh mục nào</option>
                      )}
                    </select>
                    <small className="admin-text-muted">Giữ phím Ctrl để chọn nhiều danh mục</small>
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-col-sm-2 admin-control-label">Ảnh hiện tại</label>
                  <div className="admin-col-sm-10">
                    <div className="admin-product-images">
                      {productImages.length > 0 ? (
                        <div className="admin-image-gallery">
                          {productImages.map((image, index) => (
                            <div className="admin-image-item" key={index}>
                              <img
                                src={image.imgUrl}
                                alt={`Product ${index + 1}`}
                                className="admin-thumbnail"
                              />
                              <button
                                type="button"
                                className="admin-btn admin-btn-danger admin-btn-sm admin-image-delete-btn"
                                onClick={() => handleDeleteImage(image.id)}
                                disabled={deletingImage}
                              >
                                <i className="fa fa-trash-o"></i>
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p>Không có ảnh</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-col-sm-2 admin-control-label">Thay đổi ảnh</label>
                  <div className="admin-col-sm-10">
                    <input 
                      type="file" 
                      className="admin-form-control" 
                      name="image"
                      onChange={handleImageChange}
                      accept="image/*"
                    />
                    {previewImage && imageFile && (
                      <div className="admin-mt-2">
                        <p>Ảnh mới:</p>
                        <img
                          src={previewImage}
                          alt="Preview"
                          style={{ maxWidth: '200px', maxHeight: '200px' }}
                        />
                      </div>
                    )}
                    <small className="admin-text-muted">Để trống nếu không thay đổi hình ảnh</small>
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-col-sm-2 admin-control-label">Thuộc tính</label>
                  <div className="admin-col-sm-10">
                    <div className="admin-checkbox">
                      <input
                        type="checkbox"
                        id="isNewProduct"
                        name="isNew"
                        checked={formData.isNew}
                        onChange={handleInputChange}
                      />
                      <label htmlFor="isNewProduct">Sản phẩm mới</label>
                    </div>

                    <div className="admin-checkbox">
                      <input
                        type="checkbox"
                        id="isBestSeller"
                        name="isBestSeller"
                        checked={formData.isBestSeller}
                        onChange={handleInputChange}
                      />
                      <label htmlFor="isBestSeller">Sản phẩm bán chạy</label>
                    </div>

                    <div className="admin-checkbox">
                      <input
                        type="checkbox"
                        id="isSale"
                        name="isSale"
                        checked={formData.isSale}
                        onChange={handleInputChange}
                      />
                      <label htmlFor="isSale">Đang giảm giá</label>
                    </div>
                  </div>
                </div>

                <div className="admin-form-group">
                  <div className="admin-col-sm-12 admin-text-center">
                    <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
                      {saving ? 'Đang lưu...' : 'Cập nhật'}
                    </button>
                    <Link to="/admin/products" className="admin-btn admin-btn-default admin-ml-2">Hủy</Link>
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

const Products = () => {
  return (
    <Routes>
      <Route path="/" element={<ProductsList />} />
      <Route path="/add" element={<AddProduct />} />
      <Route path="/edit/:id" element={<EditProduct />} />
    </Routes>
  );
};

export default Products; 