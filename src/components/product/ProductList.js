import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { addToCart } from '../../utils/cartUtils';
import Sidebar from '../layout/Sidebar';
import './CategoryProducts.scss';
import '../layout/Sidebar.scss';

const ProductList = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const type = searchParams.get('type');
  const searchQuery = searchParams.get('search');
  const categoryId = searchParams.get('categoryId');
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [displayProducts, setDisplayProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 20;
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState([]);
  const [currentCategory, setCurrentCategory] = useState(null);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/v1/category');
        const data = await response.json();
        
        if (data.code === 1000 && data.value) {
          setCategories(data.value);
          
          // If categoryId is present, find the matching category
          if (categoryId) {
            const category = data.value.find(cat => cat.id === parseInt(categoryId));
            setCurrentCategory(category);
          }
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    
    fetchCategories();
  }, [categoryId]);

  // First fetch all products
  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('accessToken');
        const headers = token ? {
          'Authorization': `Bearer ${token}`
        } : {};
  
        // Fetch all products at once with a large size
        const response = await fetch(`http://localhost:8080/api/v1/product?page=0&size=1000`, {
          headers: headers
        });
  
        const data = await response.json();
        console.log(`Received ${data.value ? data.value.length : 0} total products from API`);
  
        if (data.code === 1000 && data.value) {
          // Store all products
          setAllProducts(data.value);

          // Apply filtering based on type
          let filtered = [...data.value];
          
          console.log('Current URL type parameter:', type);
          console.log('Current search query:', searchQuery);
          console.log('Current category ID:', categoryId);
          
          // Filter by category if specified
          if (categoryId) {
            filtered = data.value.filter(product => 
              product.categoryIds && product.categoryIds.includes(parseInt(categoryId))
            );
            console.log(`After category filtering: ${filtered.length} products in category ${categoryId}`);
          }
          
          // Then filter by type if specified
          if (type) {
            console.log('Filtering by type:', type);
            // Log all flags to check their values
            console.log('Product flags sample:');
            if (filtered.length > 0) {
              const sample = filtered.slice(0, 5);
              sample.forEach(p => {
                console.log(`ID: ${p.id}, name: ${p.name}, new: ${p.new}, sale: ${p.sale}, bestSeller: ${p.bestSeller}`);
              });
            }

            if (type === 'new') {
              filtered = filtered.filter(p => p.new === true);
              console.log(`Found ${filtered.length} products with new=true`);
            } 
            else if (type === 'sale') {
              filtered = filtered.filter(p => p.sale === true);
              console.log(`Found ${filtered.length} products with sale=true`);
            }
            else if (type === 'best-selling' || type === 'best_selling' || type === 'best_seller') {
              filtered = filtered.filter(p => p.bestSeller === true);
              console.log(`Found ${filtered.length} products with bestSeller=true`);
              console.log('First few best seller products:');
              filtered.slice(0, 3).forEach(p => {
                console.log(`ID: ${p.id}, name: ${p.name}`);
              });
            }
            
            console.log(`After filtering for ${type}: ${filtered.length} products out of ${data.value.length}`);
          }
          
          // Then apply search filter if search query exists
          if (searchQuery) {
            const query = searchQuery.toLowerCase();
            console.log('Filtering by search query:', query);
            
            filtered = filtered.filter(product => 
              product.name.toLowerCase().includes(query) || 
              (product.description && product.description.toLowerCase().includes(query)) ||
              (product.brand && product.brand.toLowerCase().includes(query))
            );
            
            console.log(`After search filtering: ${filtered.length} products found for query "${searchQuery}"`);
          }
          
          setFilteredProducts(filtered);
          
          // Calculate total pages based on filtered products
          const calculatedTotalPages = Math.ceil(filtered.length / productsPerPage);
          setTotalPages(calculatedTotalPages > 0 ? calculatedTotalPages : 1);
        } else {
          setError('Không thể tải sản phẩm');
        }
      } catch (error) {
        console.error('Fetch error:', error);
        setError('Không thể tải sản phẩm');
      } finally {
        setLoading(false);
      }
    };
  
    fetchAllProducts();
  }, [type, searchQuery, categoryId]);

  useEffect(() => {
    setCurrentPage(1); // reset về trang đầu tiên khi thay đổi loại sản phẩm hoặc tìm kiếm
  }, [type, searchQuery, categoryId]);
  
  
  // Handle pagination separately
  useEffect(() => {
    const fetchProductImages = async (products) => {
      try {
        // Get the current page of products
        const indexOfLastProduct = currentPage * productsPerPage;
        const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
        const currentPageProducts = products.slice(indexOfFirstProduct, indexOfFirstProduct + productsPerPage);
        
        console.log(`Showing page ${currentPage}: products ${indexOfFirstProduct+1}-${Math.min(indexOfLastProduct, products.length)} of ${products.length}`);
        
        // Fetch images for the current page of products
        const productsWithImages = await Promise.all(
          currentPageProducts.map(async (product) => {
            const imageRes = await fetch(`http://localhost:8080/api/v1/product-img/product/${product.id}`);
            const imageData = await imageRes.json();
            return {
              ...product,
              images: imageData.code === 1000 ? imageData.value : []
            };
          })
        );
        
        setDisplayProducts(productsWithImages);
      } catch (error) {
        console.error('Error fetching images:', error);
      }
    };
    
    if (filteredProducts.length > 0) {
      fetchProductImages(filteredProducts);
    }
  }, [filteredProducts, currentPage]);

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

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="category-products">
      <div className="container">
        <div className="row">
          <div className="col-3">
            <Sidebar />
          </div>
          <div className="col-9">
            <div className="category-header">
              <h1>
                {currentCategory && currentCategory.name}
                {!currentCategory && type === 'new' && 'Sản phẩm mới'}
                {!currentCategory && type === 'sale' && 'Sản phẩm giảm giá'}
                {!currentCategory && (type === 'best-selling' || type === 'best_selling' || type === 'best_seller') && 'Sản phẩm bán chạy'}
                {!currentCategory && searchQuery && !type && `Kết quả tìm kiếm cho "${searchQuery}"`}
                {!currentCategory && searchQuery && type && ` - Tìm kiếm cho "${searchQuery}"`}
              </h1>
              <div className="category-description">
                {currentCategory && `Có ${filteredProducts.length} sản phẩm trong danh mục này`}
                {!currentCategory && type === 'new' && 'Khám phá những sản phẩm mới nhất của chúng tôi'}
                {!currentCategory && type === 'sale' && 'Những ưu đãi hấp dẫn đang chờ đón bạn'}
                {!currentCategory && (type === 'best-selling' || type === 'best_selling' || type === 'best_seller') && 'Những sản phẩm được yêu thích nhất'}
                {!currentCategory && searchQuery && `Đã tìm thấy ${filteredProducts.length} sản phẩm`}
              </div>
            </div>
            <div className="product-grid">
              {displayProducts.length > 0 ? (
                displayProducts.map((product) => (
                <div 
                  key={product.id} 
                  className="product-card"
                  onClick={() => handleProductClick(product.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="product-image">
                    {product.images && product.images.length > 0 && (
                      <img src={product.images[0].imgUrl} alt={product.name} />
                    )}
                    {product.discount > 0 && (
                      <div className="discount-badge">
                        -{product.discount}%
                      </div>
                    )}
                  </div>
                  <div className="product-info">
                      <h3 className="product-title">{product.name}</h3>
                    <div className="product-price">
                      {product.discount > 0 ? (
                        <>
                          <span className="original-price">
                            {product.price.toLocaleString('vi-VN')}đ
                          </span>
                          <span className="discounted-price">
                            {(product.price * (1 - product.discount / 100)).toLocaleString('vi-VN')}đ
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
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentPage(prev => Math.max(prev - 1, 1));
                  }}
                  disabled={currentPage === 1}
                >
                  &laquo;
                </button>
                
                {/* Improved pagination display logic */}
                {(() => {
                  // Always show first page, last page, current page, and pages around current
                  const pageNumbers = [];
                  const rangeSize = 1; // How many pages to show on each side of current page
                  
                  // Always add first page
                  pageNumbers.push(1);
                  
                  // Calculate range around current page
                  const startRange = Math.max(2, currentPage - rangeSize);
                  const endRange = Math.min(totalPages - 1, currentPage + rangeSize);
                  
                  // Add ellipsis after first page if needed
                  if (startRange > 2) {
                    pageNumbers.push('...');
                  }
                  
                  // Add pages around current page
                  for (let i = startRange; i <= endRange; i++) {
                    pageNumbers.push(i);
                  }
                  
                  // Add ellipsis before last page if needed
                  if (endRange < totalPages - 1) {
                    pageNumbers.push('...');
                  }
                  
                  // Add last page if not already included
                  if (totalPages > 1) {
                    pageNumbers.push(totalPages);
                  }
                  
                  return pageNumbers.map((number, index) => {
                    if (number === '...') {
                      return <span key={`ellipsis-${index}`} className="ellipsis">...</span>;
                    }
                    
                    return (
                  <button
                    key={number}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentPage(number);
                    }}
                    className={currentPage === number ? 'active' : ''}
                  >
                    {number}
                  </button>
                    );
                  });
                })()}
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentPage(prev => Math.min(prev + 1, totalPages));
                  }}
                  disabled={currentPage === totalPages}
                >
                  &raquo;
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