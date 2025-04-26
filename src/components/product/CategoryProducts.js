import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { addToCart } from '../../utils/cartUtils';
import Sidebar from '../layout/Sidebar';
import './CategoryProducts.scss';

const CategoryProducts = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categoryName, setCategoryName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 20;

  useEffect(() => {
    const fetchCategoryAndProducts = async () => {
      try {
      
        // Fetch category name
        const categoryResponse = await fetch(`http://localhost:8080/api/v1/category/${categoryId}`, {
        });
        const categoryData = await categoryResponse.json();
        console.log(categoryData);
        
        if (categoryData.code === 1000 && categoryData.value) {
          setCategoryName(categoryData.value.categoryName);
        }
        
        // Fetch products
        const response = await fetch(`http://localhost:8080/api/v1/product/category/${categoryId}`, {
        });
        const data = await response.json();
        
        if (data.code === 1000 && data.value) {
          // Use thumbnail directly from products
          setProducts(data.value);
        } else {
          setError('Không thể tải sản phẩm');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Không thể tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryAndProducts();
  }, [categoryId]);

  const handleAddToCart = async (e, productId) => {
    e.stopPropagation(); // Prevent navigation when clicking add to cart
    const result = await addToCart(productId);
    if (result.success) {
      console.log('Đã thêm sản phẩm vào giỏ hàng');
    } else {
      setError(result.error);
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  // Calculate pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(products.length / productsPerPage);

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
      </div>
      <div className="category-page__content">
        <div className="category-products">
          <div className="category-header">
            <h1>{categoryName}</h1>
          </div>
          <div className="product-grid">
            {currentProducts.map((product) => (
              <div 
                key={product.id} 
                className="product-card"
                onClick={() => handleProductClick(product.id)}
                style={{ cursor: 'pointer' }}
              >
                <div className="product-image">
                  <img src={product.thumbnail || '/default-image.jpg'} alt={product.name} />
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
                    onClick={(e) => handleAddToCart(e, product.id)}
                  >
                    Thêm vào giỏ
                  </button>
                </div>
              </div>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                &laquo;
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                <button
                  key={number}
                  onClick={() => setCurrentPage(number)}
                  className={currentPage === number ? 'active' : ''}
                >
                  {number}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                &raquo;
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryProducts; 