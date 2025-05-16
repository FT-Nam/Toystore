import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { addToCart } from '../../utils/cartUtils';
import Sidebar from '../layout/Sidebar';
import Filter from './Filter.js';
import './CategoryProducts.scss';

const CategoryProducts = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categoryName, setCategoryName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [activeFilters, setActiveFilters] = useState({
    priceRange: { min: '', max: '' },
    isBestSeller: false,
    isNew: false,
    isSale: false
  });

  const fetchProducts = async (page = 1) => {
    try {
      setLoading(true);

      // Build query parameters
      const params = new URLSearchParams({
        page: page - 1,
        size: 20,
        new: activeFilters.isNew,
        sale: activeFilters.isSale,
        bestSeller: activeFilters.isBestSeller,
        minPrice: activeFilters.priceRange.min ? parseFloat(activeFilters.priceRange.min) : 0,
        maxPrice: activeFilters.priceRange.max ? parseFloat(activeFilters.priceRange.max) : 1000000000
      });

      // Determine which API endpoint to use
      let apiUrl;
      if (activeFilters.isNew || activeFilters.isSale || activeFilters.isBestSeller || 
          activeFilters.priceRange.min || activeFilters.priceRange.max) {
        // If any filters are active, use the /type endpoint
        params.append('category', categoryId);
        apiUrl = `http://localhost:8080/api/v1/search/product/type?${params.toString()}`;
      } else {
        // If no filters, use the category endpoint
        apiUrl = `http://localhost:8080/api/v1/product/category/${categoryId}?${params.toString()}`;
      }

      console.log('Calling API:', apiUrl);

      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      console.log('API Response:', data);

      if (data.code === 1000 && Array.isArray(data.value)) {
        setProducts(data.value);
        if (data.pagination) {
          const { totalElements: total, size } = data.pagination;
          setTotalElements(total);
          setTotalPages(Math.ceil(total / size));
          setCurrentPage(page);
        }
      } else {
        setProducts([]);
        setTotalPages(0);
        setTotalElements(0);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message);
      setProducts([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchCategoryName = async () => {
      try {
        const categoryResponse = await fetch(`http://localhost:8080/api/v1/category/${categoryId}`);
        const categoryData = await categoryResponse.json();
        
        if (categoryData.code === 1000 && categoryData.value) {
          setCategoryName(categoryData.value.categoryName);
        }
      } catch (error) {
        console.error('Error fetching category:', error);
        setError('Không thể tải thông tin danh mục');
      }
    };

    fetchCategoryName();
  }, [categoryId]);

  useEffect(() => {
    fetchProducts(1);
  }, [categoryId, activeFilters]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) {
      console.warn(`Page ${newPage} is out of bounds. Total pages: ${totalPages}`);
      return;
    }
    console.log('Changing to page:', newPage);
    fetchProducts(newPage);
  };

  const handleFilterChange = (filters) => {
    console.log('Filters changed to:', filters);
    setActiveFilters(filters);
  };

  const handleAddToCart = async (e, productId) => {
    e.stopPropagation();
    try {
      await addToCart(productId, 1);
    } catch (error) {
      console.error('Error adding to cart:', error);
      setError(error.message);
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  if (loading) {
    return <div className="loading">Đang tải...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="category-page">
      <div className="category-page__sidebar">
        <Sidebar />
        <Filter onFilterChange={handleFilterChange} />
      </div>
      <div className="category-page__content">
        <div className="category-products">
          <div className="category-header">
            <h1>{categoryName}</h1>
            <div className="category-description">
              Có {totalElements} sản phẩm trong danh mục này
            </div>
          </div>
          <div className="product-grid">
            {products.length > 0 ? (
              products.map((product) => (
              <div 
                key={product.id} 
                className="product-card"
                onClick={() => handleProductClick(product.id)}
                style={{ cursor: 'pointer' }}
              >
                <div className="product-image">
                  <img src={product.thumbnail || '/default-image.jpg'} alt={product.name} />
                    {product.discountPercentage > 0 && (
                    <div className="discount-badge">
                        -{product.discountPercentage}%
                    </div>
                  )}
                </div>
                <div className="product-info">
                  <h3 className="product-title">{product.name}</h3>
                  <div className="product-price">
                      {product.discountPercentage > 0 ? (
                      <>
                        <span className="original-price">
                          {product.price.toLocaleString('vi-VN')}đ
                        </span>
                        <span className="discounted-price">
                            {(product.price * (1 - product.discountPercentage / 100)).toLocaleString('vi-VN')}đ
                        </span>
                      </>
                    ) : (
                      <span>{product.price.toLocaleString('vi-VN')}đ</span>
                    )}
                  </div>
                  <button
                    className="add-to-cart-btn"
                    onClick={(e) => handleAddToCart(e, product.id)}
                  >
                    Thêm vào giỏ
                  </button>
                </div>
              </div>
              ))
            ) : (
              <div className="no-products">
                <p>Không tìm thấy sản phẩm nào</p>
              </div>
            )}
          </div>
          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryProducts; 