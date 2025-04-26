import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Sidebar from '../layout/Sidebar';
import { addToCart } from '../../utils/cartUtils';
import './ProductDetail.scss';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        console.log('Fetching product with ID:', id);
        const token = localStorage.getItem('accessToken');
        const headers = token ? {
          'Authorization': `Bearer ${token}`
        } : {};
        
        // Fetch product details
        const response = await fetch(`http://localhost:8080/api/v1/product/${id}`, {
          headers: headers
        });
        const data = await response.json();
        console.log('Product data response:', data);
        
        if (data.code !== 1000 || !data.value) {
          console.error('Không thể lấy thông tin sản phẩm:', data.message);
          setError('Không thể tải thông tin sản phẩm');
          return;
        }

        // Fetch product images
        const imageResponse = await fetch(`http://localhost:8080/api/v1/product-img/product/${id}`);
        const imageData = await imageResponse.json();
        console.log('Image data response:', imageData);

        if (imageData.code === 1000 && imageData.value) {
          // Update product with image URLs
          const updatedProduct = {
            ...data.value,
            images: imageData.value // Lưu trực tiếp mảng ảnh từ API
          };
          console.log('Setting product state with:', updatedProduct);
          setProduct(updatedProduct);
        setSelectedImage(0);
        } else {
          console.error('Không thể lấy URL ảnh:', imageData.message);
          setError('Không thể tải ảnh sản phẩm');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        setError('Không thể tải thông tin sản phẩm');
      }
    };

    const fetchRelatedProducts = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const headers = token ? {
          'Authorization': `Bearer ${token}`
        } : {};
        
        const response = await fetch('http://localhost:8080/api/v1/product', {
          headers: headers
        });
        const data = await response.json();
        
        if (data.code !== 1000 || !data.value) {
          console.error('Không thể lấy sản phẩm liên quan:', data.message);
          return;
        }
        
        // Filter out the current product and get 4 random products
        const filteredProducts = data.value.filter(p => p.id !== parseInt(id));
        const randomProducts = filteredProducts
          .sort(() => 0.5 - Math.random())
          .slice(0, 4);
        
        // Fetch images for each related product
        const productsWithImages = await Promise.all(
          randomProducts.map(async (product) => {
            const imageResponse = await fetch(`http://localhost:8080/api/v1/product-img/product/${product.id}`);
            const imageData = await imageResponse.json();
            return {
              ...product,
              images: imageData.code === 1000 ? imageData.value : []
            };
          })
        );
        
        setRelatedProducts(productsWithImages);
      } catch (error) {
        console.error('Error fetching related products:', error);
      }
    };

    if (id) {
      fetchProduct();
      fetchRelatedProducts();
    } else {
      console.error('No product ID provided');
      setError('Không tìm thấy ID sản phẩm');
    }
  }, [id]);

  // Thêm log để kiểm tra trạng thái của product
  useEffect(() => {
    console.log('Product state changed:', product);
  }, [product]);

  // Thêm log để kiểm tra trạng thái của error
  useEffect(() => {
    console.log('Error state changed:', error);
  }, [error]);

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= product.stock) {
      setQuantity(value);
    }
  };

  const handleAddToCart = async () => {
    const result = await addToCart(product.id, quantity);
    if (result.success) {
      console.log('Đã thêm sản phẩm vào giỏ hàng');
      } else {
      setError(result.error);
    }
  };

  // Thêm các hàm xử lý ảnh
  const prevImage = () => {
    if (product?.images && product.images.length > 0) {
      setSelectedImage((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));
    }
  };

  const nextImage = () => {
    if (product?.images && product.images.length > 0) {
      setSelectedImage((prev) => (prev === product.images.length - 1 ? 0 : prev + 1));
    }
  };

  const changeImage = (index) => {
    setSelectedImage(index);
  };

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!product) {
    return <div className="loading">Đang tải...</div>;
  }

  console.log('Rendering product:', product);

  return (
    <div className="main-content">
      <div className="container product-detail-container">
        <div className="row">
          <div className="main-content__menu col-7">
            <div className="product-gallery">
              <div className="image-container">
                <button className="nav-icon left" onClick={prevImage}>❮</button>
                {product?.images && product.images.length > 0 && (
                  <img 
                    id="mainImage" 
                    src={product.images[selectedImage].imgUrl} 
                    alt="Main Product Image"
                    className="large-image"
                  />
                )}
                <button className="nav-icon right" onClick={nextImage}>❯</button>
          </div>
              <div className="thumbnail-list">
                {product?.images?.map((image, index) => (
                  <img 
                    key={image.id}
                    onClick={() => changeImage(index)}
                    src={image.imgUrl}
                    alt={`Thumbnail ${index + 1}`}
                    className={index === selectedImage ? 'active' : ''}
                  />
                      ))}
                    </div>
                  </div>
                </div>

          <div className="main-content__product col-5">
            <div className="product-info">
              <h1>{product.name}</h1>
              <p>Thương hiệu: {product.brand}</p>
              <p>Mã SP: {product.id}</p>
              <div className="price-section">
                      {product.discount_percentage > 0 ? (
                        <>
                    <span className="original-price">
                      {product.price.toLocaleString('vi-VN')}đ
                          </span>
                    <span className="current-price">
                      {Math.round(product.price * (1 - product.discount_percentage / 100)).toLocaleString('vi-VN')}đ
                          </span>
                    <span className="discount">-{product.discount_percentage}%</span>
                        </>
                      ) : (
                  <span className="current-price">
                    {product.price.toLocaleString('vi-VN')}đ
                        </span>
                      )}
                    </div>
              <div className="policy-detail">
                <ul className="policy-detail__list">
                  <li className="policy-detail__item">
                    <svg width="18" height="14" viewBox="0 0 18 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M16.5 1L6 13L1.5 8.5" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                    <span>Hàng chính hãng</span>
                  </li>
                  <li className="policy-detail__item">
                    <svg width="18" height="14" viewBox="0 0 18 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M16.5 1L6 13L1.5 8.5" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                    <span>Miễn phí giao hàng toàn quốc đơn trên 500k</span>
                  </li>
                  <li className="policy-detail__item">
                    <svg width="18" height="14" viewBox="0 0 18 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M16.5 1L6 13L1.5 8.5" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                    <span>Giao hàng hỏa tốc 4 tiếng</span>
                  </li>
                </ul>
                <div className="quantity-section">
                  <label className="quantity-label">Số lượng</label>
                  <div className="quantity-wrap">
                    <div className="quantity-input">
                      <button className="decrease" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                        <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" fill="none" viewBox="0 0 10 2">
                          <path fillRule="evenodd" clipRule="evenodd" d="M.5 1C.5.7.7.5 1 .5h8a.5.5 0 110 1H1A.5.5 0 01.5 1z" fill="currentColor"></path>
                        </svg>
                      </button>
                      <input 
                        type="number" 
                        value={quantity} 
                        min="1" 
                        max={product.stock}
                        onChange={handleQuantityChange}
                      />
                      <button className="increase" onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}>
                        <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" fill="none" viewBox="0 0 10 10">
                          <path fillRule="evenodd" clipRule="evenodd" d="M1 4.51a.5.5 0 000 1h3.5l.01 3.5a.5.5 0 001-.01V5.5l3.5-.01a.5.5 0 00-.01-1H5.5L5.49.99a.5.5 0 00-1 .01v3.5l-3.5.01H1z" fill="currentColor"></path>
                        </svg>
                      </button>
                    </div>
                      {product.stock > 0 ? (
                      <button className="add-to-cart" onClick={handleAddToCart}>
                        <span>Thêm vào giỏ hàng</span>
                        </button>
                      ) : (
                      <button className="out-of-stock" disabled>
                          Đã Hết Hàng
                        </button>
                      )}
                  </div>
                </div>
              </div>
              <p className="product-hotline">Hotline 1900 69 69 (9:00 AM - 8:00 PM) Từ Thứ 2 đến Chủ Nhật</p>
            </div>
          </div>
        </div>

        <div className="product-detail__product-description-wrap">
          <span className="title">MÔ TẢ SẢN PHẨM</span>
          <div 
            className="product-detail__product-description-content"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
              </div>

              {relatedProducts.length > 0 && (
          <div className="product-detail__product-related-wrap">
            <span className="title">SẢN PHẨM LIÊN QUAN</span>
            <ul className="product-detail__product-related-list">
              {relatedProducts.map((relatedProduct) => (
                <li key={relatedProduct.id} className="col-2 product-detail__product-related-item">
                  <Link to={`/product/${relatedProduct.id}`} className="product__img-wrap">
                    {relatedProduct.discount_percentage > 0 && (
                      <span className="discount-label">-{relatedProduct.discount_percentage}%</span>
                    )}
                    <img 
                      src={relatedProduct.images && relatedProduct.images.length > 0 ? relatedProduct.images[0].imgUrl : ''}
                              alt={relatedProduct.name}
                    />
                  </Link>
                  <div className="product__title-wrap">
                    <Link to={`/product/${relatedProduct.id}`}>
                      <h2 className="product__title-name">{relatedProduct.name}</h2>
                    </Link>
                  </div>
                  <div className="product__price-wrap">
                              {relatedProduct.discount_percentage > 0 ? (
                                <>
                        <span className="product__price-original">
                          {relatedProduct.price.toLocaleString('vi-VN')}đ
                                  </span>
                        <span className="product__price-discount">
                          {Math.round(relatedProduct.price * (1 - relatedProduct.discount_percentage / 100)).toLocaleString('vi-VN')}đ
                                  </span>
                                </>
                              ) : (
                      <span className="product__price product__price--no-discount">
                        {relatedProduct.price.toLocaleString('vi-VN')}đ
                                </span>
                              )}
                            </div>
                  <div className="product__button-wrap">
                    {relatedProduct.stock > 0 ? (
                      <button className="add-to-cart-btn" onClick={() => handleAddToCart(relatedProduct.id)}>
                        Thêm Vào Giỏ Hàng
                      </button>
                    ) : (
                      <button className="out-of-stock-btn" disabled>
                        Đã Hết Hàng
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail; 