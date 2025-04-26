import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Sidebar from '../layout/Sidebar';
import './Product.scss';

const Product = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [categoryName, setCategoryName] = useState('');
  const productsPerPage = 16;

  const categoryId = searchParams.get('category_id') || '';
  const type = searchParams.get('type') || '';
  const searchKeyword = searchParams.get('search') || '';
  const pageParam = parseInt(searchParams.get('page')) || 1;

  useEffect(() => {
    setCurrentPage(pageParam);
  }, [pageParam]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const params = new URLSearchParams();
        if (type) params.append('type', type);
        if (categoryId) params.append('category_id', categoryId);
        if (searchKeyword) params.append('search', searchKeyword);
        params.append('page', currentPage);
        params.append('limit', productsPerPage);

        const url = `http://localhost:8080/api/v1/product?${params.toString()}`;
        const response = await fetch(url);
        const data = await response.json();


        setProducts(Array.isArray(data.products) ? data.products : []);
        setTotalProducts(data.total || 0);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    const fetchCategoryName = async () => {
      if (categoryId) {
        try {
          const response = await fetch(`/api/categories/${categoryId}`);
          const data = await response.json();
          setCategoryName(data.name || '');
        } catch (error) {
          console.error('Error fetching category:', error);
        }
      }
    };

    fetchProducts();
    fetchCategoryName();
  }, [categoryId, type, searchKeyword, currentPage]);

  const getTitle = () => {
    if (type === 'sale') return 'Sản Phẩm Giảm Giá';
    if (type === 'best_seller') return 'Sản Phẩm Bán Chạy';
    if (type === 'new') return 'Sản Phẩm Mới';
    if (categoryId) return categoryName;
    if (searchKeyword) return `Kết quả tìm kiếm: ${searchKeyword}`;
    return 'Tất Cả Sản Phẩm';
  };

  const handleAddToCart = async (productId) => {
    try {
      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: 1 })
      });

      if (response.ok) {
        // TODO: Add notification or update cart UI
        console.log('Đã thêm vào giỏ hàng');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const totalPages = Math.ceil(totalProducts / productsPerPage);

  return (
    <div className="main-content">
      <div className="container">
        <div className="row">
          <div className="main-content__menu col-3">
            <Sidebar />
          </div>

          <div className="main-content__product col-9">
            <div className="main-content__product-list">
              <div className="main-content__product--title">
                <span>{getTitle()}</span>
              </div>

              <ul className="row product__list">
                {Array.isArray(products) && products.length > 0 ? (
                  products.map(product => (
                    <li key={product.product_id} className="col-3 product__list-item">
                      <Link to={`/product_detail?product_id=${product.product_id}`} className="product__img-wrap">
                        {product.discount_percentage > 0 && (
                          <span className="discount-label">-{product.discount_percentage}%</span>
                        )}
                        <img src={product.image_url || 'default-image.jpg'} alt="Ảnh sản phẩm" />
                      </Link>
                      <div className="product__title-wrap">
                        <Link to={`/product_detail?product_id=${product.product_id}`}>
                          <h2 className="product__title-name">{product.name}</h2>
                        </Link>
                      </div>
                      <div className="product__price-wrap">
                        {product.discount_percentage > 0 ? (
                          <>
                            <span className="product__price-original">
                              {product.price.toLocaleString('vi-VN')} Đ
                            </span>
                            <span className="product__price-discount">
                              {(product.price * (1 - product.discount_percentage / 100)).toLocaleString('vi-VN')} Đ
                            </span>
                          </>
                        ) : (
                          <span className="product__price product__price--no-discount">
                            {product.price.toLocaleString('vi-VN')} Đ
                          </span>
                        )}
                      </div>
                      <div className="product__button-wrap">
                        {product.stock > 0 ? (
                          <button className="add-to-cart-btn" onClick={() => handleAddToCart(product.product_id)}>
                            Thêm Vào Giỏ Hàng
                          </button>
                        ) : (
                          <button className="out-of-stock-btn" disabled>
                            Đã Hết Hàng
                          </button>
                        )}
                      </div>
                    </li>
                  ))
                ) : (
                  <p>No products available</p>
                )}
              </ul>
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <ul className="pagination-list">
                  {currentPage > 1 && (
                    <li>
                      <Link to={`?page=${currentPage - 1}&category_id=${categoryId}&type=${type}`}>«</Link>
                    </li>
                  )}
                  {[...Array(totalPages)].map((_, i) => (
                    <li key={i + 1} className={i + 1 === currentPage ? 'active' : ''}>
                      <Link to={`?page=${i + 1}&category_id=${categoryId}&type=${type}`}>{i + 1}</Link>
                    </li>
                  ))}
                  {currentPage < totalPages && (
                    <li>
                      <Link to={`?page=${currentPage + 1}&category_id=${categoryId}&type=${type}`}>»</Link>
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Product;
