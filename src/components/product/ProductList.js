import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { addToCart } from '../../utils/cartUtils';
import Sidebar from '../layout/Sidebar';
import Filter from './Filter.js';
import SpecialCategoryProducts from './SpecialCategoryProducts';
import './CategoryProducts.scss';
import '../layout/Sidebar.scss';

const ProductList = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [activeFilters, setActiveFilters] = useState({
    priceRange: { min: '', max: '' },
    isBestSeller: false,
    isNew: false,
    isSale: false
  });
          
  // Get search query from URL
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search') || '';
  const typeParam = searchParams.get('type') || '';

  // Check if this is a special category page
  const isSpecialCategory = typeParam === 'new' || typeParam === 'sale' || typeParam === 'best-selling';

  const fetchProducts = useCallback(async (page = 1) => {
      try {
        setLoading(true);

      // Build query parameters
      const params = new URLSearchParams({
        page: page - 1,
        size: 20
      });

      // Determine which API endpoint to use
      let apiUrl;
      if (searchQuery) {
        // If there's a search query
        if (activeFilters.isNew || activeFilters.isSale || activeFilters.isBestSeller || 
            activeFilters.priceRange.min || activeFilters.priceRange.max) {
          // If filters are active, use the filter endpoint
          params.append('name', searchQuery);
          params.append('new', activeFilters.isNew);
          params.append('sale', activeFilters.isSale);
          params.append('bestSeller', activeFilters.isBestSeller);
          params.append('minPrice', activeFilters.priceRange.min ? parseFloat(activeFilters.priceRange.min) : 0);
          params.append('maxPrice', activeFilters.priceRange.max ? parseFloat(activeFilters.priceRange.max) : 1000000000);
          if (selectedCategory) {
            params.append('category', selectedCategory);
          }
          apiUrl = `http://localhost:8080/api/v1/search/product/filter?${params.toString()}`;
        } else {
          // If no filters, use the search endpoint
          apiUrl = `http://localhost:8080/api/v1/search/product?${params.toString()}&name=${encodeURIComponent(searchQuery)}`;
        }
      } else if (activeFilters.isNew || activeFilters.isSale || activeFilters.isBestSeller || 
          activeFilters.priceRange.min || activeFilters.priceRange.max) {
        // If any filters are active without search, use the /type endpoint
        params.append('new', activeFilters.isNew);
        params.append('sale', activeFilters.isSale);
        params.append('bestSeller', activeFilters.isBestSeller);
        params.append('minPrice', activeFilters.priceRange.min ? parseFloat(activeFilters.priceRange.min) : 0);
        params.append('maxPrice', activeFilters.priceRange.max ? parseFloat(activeFilters.priceRange.max) : 1000000000);
        if (selectedCategory) {
          params.append('category', selectedCategory);
        }
        apiUrl = `http://localhost:8080/api/v1/search/product/type?${params.toString()}`;
      } else {
        // If no filters and no search, use the basic /product endpoint
        apiUrl = `http://localhost:8080/api/v1/product?${params.toString()}`;
      }

      console.log('Calling API:', apiUrl);

      const response = await fetch(apiUrl);
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
          
      const data = await response.json();
      console.log('API Response:', data);

      if (data.code === 1000 && Array.isArray(data.value)) {
        console.log('Setting products:', data.value.length);
        setProducts(data.value);
          
        // Use pagination info from API response
        if (data.pagination) {
          const { totalElements: total, size } = data.pagination;
          setTotalElements(total);
          setTotalPages(Math.ceil(total / size));
          setCurrentPage(page);
        } else {
          // Fallback if pagination info is not available
          const totalItems = data.value.length;
          setTotalElements(totalItems);
          setTotalPages(Math.ceil(totalItems / 20));
          setCurrentPage(page);
        }
      } else {
        console.log('Invalid data structure:', data);
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
  }, [selectedCategory, activeFilters.isNew, activeFilters.isSale, activeFilters.isBestSeller, activeFilters.priceRange.min, activeFilters.priceRange.max, searchQuery]);

  useEffect(() => {
    if (!isSpecialCategory) {
      console.log('Effect triggered with:', {
        search: location.search,
        category: selectedCategory,
        type: selectedType,
        filters: activeFilters
      });
      fetchProducts(1);
    }
  }, [location.search, selectedCategory, selectedType, activeFilters, isSpecialCategory, fetchProducts]);

  // If it's a special category page, render SpecialCategoryProducts
  if (isSpecialCategory) {
    return <SpecialCategoryProducts />;
  }

  const handlePageChange = (newPage) => {
    console.log('Changing to page:', newPage);
    fetchProducts(newPage);
  };

  const handleCategoryChange = (category) => {
    console.log('Category changed to:', category);
    setSelectedCategory(category);
    setSelectedType('');
  };

  const handleTypeChange = (type) => {
    console.log('Type changed to:', type);
    setSelectedType(type);
  };
        
  const handleFilterChange = (filters) => {
    console.log('Filters changed to:', filters);
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

  console.log('Rendering products:', products);

  return (
    <div className="category-products">
      <div className="container">
        <div className="row">
          <div className="col-3">
            <Sidebar
              selectedCategory={selectedCategory}
              selectedType={selectedType}
              onCategoryChange={handleCategoryChange}
              onTypeChange={handleTypeChange}
            />
            <Filter onFilterChange={handleFilterChange} />
          </div>
          <div className="col-9">
            <div className="category-header">
              <h1>
                {selectedCategory && selectedCategory.name}
                {!selectedCategory && searchQuery && `Kết quả tìm kiếm cho "${searchQuery}"`}
              </h1>
              <div className="category-description">
                {selectedCategory && `Có ${totalElements} sản phẩm trong danh mục này`}
                {!selectedCategory && searchQuery && `Đã tìm thấy ${totalElements} sản phẩm`}
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

export default ProductList; 