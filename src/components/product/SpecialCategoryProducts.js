import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { addToCart } from '../../utils/cartUtils';
import Filter from './Filter.js';
import Sidebar from '../layout/Sidebar';
import './CategoryProducts.scss';
import '../layout/Sidebar.scss';

const SpecialCategoryProducts = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [activeFilters, setActiveFilters] = useState({
    priceRange: { min: '', max: '' },
    isBestSeller: false,
    isNew: false,
    isSale: false
  });

  // Get type from URL
  const searchParams = new URLSearchParams(location.search);
  const type = searchParams.get('type') || '';

  const fetchProducts = useCallback(async (page = 1) => {
    try {
      setLoading(true);

      // Build query parameters with all required params
      const params = new URLSearchParams({
        page: page - 1, // Convert to 0-based index for API
        size: 20,
        new: type === 'new' ? true : activeFilters.isNew,
        sale: type === 'sale' ? true : activeFilters.isSale,
        bestSeller: type === 'best-selling' ? true : activeFilters.isBestSeller,
        minPrice: activeFilters.priceRange.min ? parseFloat(activeFilters.priceRange.min) : 0,
        maxPrice: activeFilters.priceRange.max ? parseFloat(activeFilters.priceRange.max) : 1000000000
      });

      // Add category if selected
      if (selectedCategory) {
        params.append('category', selectedCategory);
      }

      const apiUrl = `http://localhost:8080/api/v1/search/product/type?${params.toString()}`;
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
  }, [type, selectedCategory, activeFilters.priceRange.min, activeFilters.priceRange.max, activeFilters.isNew, activeFilters.isSale, activeFilters.isBestSeller]);

  useEffect(() => {
    const controller = new AbortController();
    fetchProducts(1);
    return () => controller.abort();
  }, [fetchProducts]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) {
      console.warn(`Page ${newPage} is out of bounds. Total pages: ${totalPages}`);
      return;
    }
    console.log('Changing to page:', newPage);
    fetchProducts(newPage);
  };

  const handleCategoryChange = (category) => {
    console.log('Category changed to:', category);
    setSelectedCategory(category);
  };

  const handleFilterChange = (filters) => {
    setActiveFilters(filters);
  };

  const handleAddToCart = async (productId) => {
    try {
      await addToCart(productId, 1);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  const getCategoryTitle = () => {
    switch (type) {
      case 'new':
        return 'Sản phẩm mới';
      case 'sale':
        return 'Sản phẩm giảm giá';
      case 'best-selling':
        return 'Sản phẩm bán chạy';
      default:
        return '';
    }
  };

  const getCategoryDescription = () => {
    switch (type) {
      case 'new':
        return 'Khám phá những sản phẩm mới nhất của chúng tôi';
      case 'sale':
        return 'Những ưu đãi hấp dẫn đang chờ đón bạn';
      case 'best-selling':
        return 'Những sản phẩm được yêu thích nhất';
      default:
        return '';
    }
  };

  return (
    <div className="category-products">
      <div className="container">
        <div className="row">
          <div className="col-3">
            <Sidebar
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
            />
            <Filter onFilterChange={handleFilterChange} />
          </div>
          <div className="col-9">
            <div className="category-header">
              <h1>
                {selectedCategory ? selectedCategory.name : getCategoryTitle()}
              </h1>
              <div className="category-description">
                {selectedCategory 
                  ? `Có ${totalElements} sản phẩm trong danh mục này`
                  : getCategoryDescription()
                }
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
                      <img src={product.thumbnail} alt={product.name} />
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
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(product.id);
                        }}
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
    </div>
  );
};

export default SpecialCategoryProducts; 