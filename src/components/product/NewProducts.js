import React, { useState, useEffect } from 'react';
import { addToCart } from '../../utils/cartUtils';
import Sidebar from '../layout/Sidebar';
import './CategoryProducts.scss';

const NewProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 20;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const headers = token ? {
          'Authorization': `Bearer ${token}`
        } : {};
        
        const response = await fetch('http://localhost:8080/api/v1/product', {
          headers: headers
        });
        const data = await response.json();
        
        if (data.code === 1000 && data.value) {
          
          // Filter new products
          const newProducts = data.value.filter(product => product.isNew === true);
          
          if (newProducts.length === 0) {
            setError('Không có sản phẩm mới');
            setLoading(false);
            return;
          }
          
          // Fetch images for each product
          const productsWithImages = await Promise.all(
            newProducts.map(async (product) => {
              const imageResponse = await fetch(`http://localhost:8080/api/v1/product-img/product/${product.id}`);
              const imageData = await imageResponse.json();
              return {
                ...product,
                images: imageData.code === 1000 ? imageData.value : []
              };
            })
          );
          setProducts(productsWithImages);
        } else {
          console.error('Error in API response:', data);
          setError('Không thể tải sản phẩm');
        }
      } catch (error) {
        console.error('Fetch error:', error);
        setError('Không thể tải sản phẩm');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCart = async (productId) => {
    const result = await addToCart(productId);
    if (result.success) {
      console.log('Đã thêm sản phẩm vào giỏ hàng');
    } else {
      setError(result.error);
    }
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
          <h2>Hàng mới về</h2>
          <div className="product-list">
            {currentProducts.map((product) => (
              <div key={product.id} className="product-card">
                <div className="product__img-wrap">
                  {product.discount_percentage > 0 && (
                    <span className="discount-label">-{product.discount_percentage}%</span>
                  )}
                  <img 
                    src={product.images && product.images.length > 0 ? product.images[0].imgUrl : ''}
                    alt={product.name}
                  />
                </div>
                <div className="product__title-wrap">
                  <h2 className="product__title-name">{product.name}</h2>
                </div>
                <div className="product__price-wrap">
                  {product.discount_percentage > 0 ? (
                    <>
                      <span className="product__price-original">
                        {product.price.toLocaleString('vi-VN')}đ
                      </span>
                      <span className="product__price-discount">
                        {Math.round(product.price * (1 - product.discount_percentage / 100)).toLocaleString('vi-VN')}đ
                      </span>
                    </>
                  ) : (
                    <span className="product__price product__price--no-discount">
                      {product.price.toLocaleString('vi-VN')}đ
                    </span>
                  )}
                </div>
                <div className="product__button-wrap">
                  {product.stock > 0 ? (
                    <button 
                      className="add-to-cart-btn" 
                      onClick={() => handleAddToCart(product.id)}
                    >
                      Thêm Vào Giỏ Hàng
                    </button>
                  ) : (
                    <button className="out-of-stock-btn" disabled>
                      Đã Hết Hàng
                    </button>
                  )}
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
                Trước
              </button>
              <span>{currentPage} / {totalPages}</span>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Sau
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewProducts; 