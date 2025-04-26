import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../layout/Sidebar';
import { productService, cartService } from '../../services/api';
import './Home.scss';

const Home = () => {
  const [bestSellers, setBestSellers] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [saleProducts, setSaleProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const [bestSellersRes, newProductsRes, saleProductsRes] = await Promise.all([
          productService.getBestSellers(),
          productService.getNewProducts(),
          productService.getSaleProducts()
        ]);


        // Extract data from response - products are in the 'value' property
        const bestSellersData = bestSellersRes?.data?.value || [];
        const newProductsData = newProductsRes?.data?.value || [];
        const saleProductsData = saleProductsRes?.data?.value || [];


        setBestSellers(bestSellersData);
        setNewProducts(newProductsData);
        setSaleProducts(saleProductsData);

      } catch (error) {
        console.error('Error fetching products:', error);
        setBestSellers([]);
        setNewProducts([]);
        setSaleProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCart = async (productId) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        // Nếu chưa đăng nhập, chuyển hướng đến trang đăng nhập
        window.location.href = '/login';
        return;
      }

      // Lấy thông tin sản phẩm từ API
      const productResponse = await fetch(`http://localhost:8080/api/v1/product/${productId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const productData = await productResponse.json();
      
      if (productData.code !== 1000 || !productData.value) {
        console.error('Không thể lấy thông tin sản phẩm:', productData.message);
        return;
      }
      
      // Lấy productId từ response
      const actualProductId = productData.value.id;

      // Lấy thông tin từ token
      let username = '';
      let userId = localStorage.getItem('userId');
      let email = localStorage.getItem('email');
      
      try {
        const tokenParts = token.split('.');
        const payload = JSON.parse(atob(tokenParts[1]));
        username = payload.sub || payload.username || payload.email;
        console.log('Token decode - Username/Email:', username);
      } catch (error) {
        console.error('Error decoding token:', error);
      }
      
      // Nếu có userId thì dùng luôn, không cần gọi API lấy thông tin user
      if (userId) {
        console.log('Using userId from localStorage:', userId);
      } 
      // Nếu không có userId nhưng có username/email thì gọi API để lấy userId
      else if (username || email) {
        try {
          const emailToUse = email || username;
          console.log('Fetching user info using email:', emailToUse);
          
          const userResponse = await fetch(`http://localhost:8080/api/v1/user/email-provider?email=${encodeURIComponent(emailToUse)}&provider=${localStorage.getItem('loginProvider') || 'LOCAL'}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (userResponse.ok) {
            const userData = await userResponse.json();
            console.log('User data response:', userData);
            
            if (userData.code === 1000 && userData.value && userData.value.id) {
              userId = userData.value.id;
              console.log('User ID from API:', userId);
              
              // Lưu userId vào localStorage để lần sau không cần gọi API
              localStorage.setItem('userId', userId);
            } else {
              console.error('Không thể lấy thông tin người dùng:', userData.message);
              alert('Không thể thêm vào giỏ hàng. Vui lòng đăng nhập lại.');
              return;
            }
          } else {
            console.error('Failed to fetch user info:', userResponse.status);
            alert('Không thể thêm vào giỏ hàng. Vui lòng đăng nhập lại.');
            return;
          }
        } catch (error) {
          console.error('Error fetching user info:', error);
          alert('Có lỗi xảy ra. Vui lòng thử lại sau.');
          return;
        }
      } else {
        console.error('Không có thông tin người dùng');
        alert('Vui lòng đăng nhập lại để thêm sản phẩm vào giỏ hàng.');
        window.location.href = '/login';
        return;
      }
      
      // Kiểm tra lại nếu vẫn không có userId
      if (!userId) {
        console.error('Không thể lấy userId');
        alert('Không thể thêm vào giỏ hàng. Vui lòng đăng nhập lại.');
        return;
      }

      // Lấy cartId
      let cartId;
      try {
        console.log('Fetching cart info...');
        const cartResponse = await fetch('http://localhost:8080/api/v1/cart', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!cartResponse.ok) {
          throw new Error('Failed to fetch cart: ' + cartResponse.status);
        }
        
        const cartData = await cartResponse.json();
        console.log('Cart data response:', cartData);
        
        if (cartData.code === 1000 && cartData.value) {
          // Kiểm tra cấu trúc dữ liệu giỏ hàng
          if (Array.isArray(cartData.value) && cartData.value.length > 0) {
            // Log chi tiết về cấu trúc dữ liệu giỏ hàng
            console.log('Cart items:', cartData.value);
            console.log('First cart item:', cartData.value[0]);
            
            // Lấy cartId từ phần tử đầu tiên của mảng
            // Thử các thuộc tính khác nhau có thể chứa cartId
            cartId = cartData.value[0].cartId || cartData.value[0].id || cartData.value[0].cart_id;
          } else if (typeof cartData.value === 'object' && cartData.value !== null) {
            // Nếu giá trị là object, có thể cartId nằm trực tiếp trong value
            cartId = cartData.value.cartId || cartData.value.id || cartData.value.cart_id;
          }
          
          console.log('Cart ID:', cartId);
        } else {
          throw new Error('Invalid cart data');
        }
      } catch (error) {
        console.error('Error fetching cart:', error);
        
        // Nếu không lấy được giỏ hàng, thử tạo giỏ hàng mới
        try {
          console.log('Creating new cart...');
          const createCartResponse = await fetch('http://localhost:8080/api/v1/cart/create', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ userId })
          });
          
          if (!createCartResponse.ok) {
            throw new Error('Failed to create new cart: ' + createCartResponse.status);
          }
          
          const createCartData = await createCartResponse.json();
          console.log('Create cart response:', createCartData);
          
          if (createCartData.code === 1000 && createCartData.value) {
            cartId = createCartData.value.id || createCartData.value.cartId;
            console.log('New cart ID:', cartId);
          } else {
            throw new Error('Invalid create cart response');
          }
        } catch (createError) {
          console.error('Error creating new cart:', createError);
          alert('Không thể tạo giỏ hàng mới. Vui lòng thử lại sau.');
          return;
        }
      }

      if (!cartId) {
        console.error('Không tìm thấy cartId');
        alert('Không thể thêm vào giỏ hàng. Vui lòng thử lại sau.');
        return;
      }

      if (!actualProductId) {
        console.error('Không tìm thấy productId');
        alert('Không thể thêm vào giỏ hàng. Vui lòng thử lại sau.');
        return;
      }

      // Thêm sản phẩm vào giỏ hàng
      const requestBody = {
        userId: userId,
        cartId: cartId,
        productId: actualProductId,
        quantity: 1
      };
      console.log('Request body for add-to-cart:', requestBody);

      try {
        console.log('Adding product to cart...');
        const response = await fetch('http://localhost:8080/api/v1/cart/add-to-cart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
          throw new Error('Failed to add to cart: ' + response.status);
        }
        
        const data = await response.json();
        console.log('Add to cart response:', data);
        
        if (data.code === 1000) {
          // Thêm thành công
          console.log('Đã thêm sản phẩm vào giỏ hàng');
          alert('Đã thêm sản phẩm vào giỏ hàng!');
          
          // Thông báo cho Header cập nhật giỏ hàng
          window.dispatchEvent(new CustomEvent('cartUpdated'));
        } else {
          console.error('Lỗi khi thêm vào giỏ hàng:', data.message || 'Lỗi không xác định');
          alert('Không thể thêm vào giỏ hàng: ' + (data.message || 'Lỗi không xác định'));
        }
      } catch (error) {
        console.error('Error in add to cart request:', error);
        alert('Có lỗi xảy ra khi thêm vào giỏ hàng. Vui lòng thử lại sau.');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Có lỗi xảy ra. Vui lòng thử lại sau.');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const ProductCard = ({ product }) => {
    if (!product) {
      console.warn('⚠️ Product is undefined or null');
      return null;
    }
    return(
    <div className="product-card">
      <div className="product-card__image">
        {product.discount_percentage > 0 && (
          <span className="discount-badge">-{product.discount_percentage}%</span>
        )}
        <Link to={`/product/${product.id}`}>
          <img src={product.thumbnail || '/default-image.jpg'} alt={product.name} />
        </Link>
      </div>
      <div className="product-card__content">
        <Link to={`/product/${product.id}`} className="product-card__content-title">
          <h3 className="product-name">{product.name}</h3>
        </Link>
        <div className="product-card__content-price">
          {product.discount_percentage > 0 ? (
            <>
              <span className="product-card__content-price-current">
                {formatPrice(product.price * (1 - product.discount_percentage / 100))}đ
              </span>
              <span className="product-card__content-price-old">
                {formatPrice(product.price)}đ
              </span>
            </>
          ) : (
            <span className="product-card__content-price-current">
              {formatPrice(product.price)}đ
            </span>
          )}
        </div>
        <button
          className="product-card__content-button"
          onClick={() => {
            handleAddToCart(product.id);
          }}
          disabled={product.stock === 0}
        >
          {product.stock > 0 ? 'Thêm vào giỏ' : 'Hết hàng'}
        </button>
      </div>
    </div>
  );
  }
    

  const ProductSection = ({ products, title, type }) => {
    if (!Array.isArray(products) || products.length === 0) {
      console.warn('⚠️ No products to display in section:', title);
    }
    return (
      <div className="home__products">
        <div className="section-header">
          <h2 className="section-title">{title}</h2>
          <Link to={`/product?type=${type}`} className="view-all-link">
            Xem tất cả <i className="fas fa-arrow-right"></i>
          </Link>
        </div>
        <div className="home__products-grid">
          {Array.isArray(products) && products.length > 0 ? (
            products.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <p>No products available</p>
          )}
        </div>
      </div>
    );
  };
  

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="home">
      <div className="banner">
        <section className="banner__section">
          <div className="banner__container">
            <div className="banner__content">
              <h1 className="banner__title">Chào Mừng Đến Cửa Hàng Đồ Chơi!</h1>
              <p className="banner__description">Khám phá đồ chơi hấp dẫn cho bé yêu!</p>
              <Link to="/product" className="banner__button">Mua Ngay</Link>
            </div>
            <div className="banner__image">
              <img src="https://demo.assets.templately.com/woo/elementor/33/2024/03/93f96b1b-img-1.png" alt="Toys" />
            </div>
          </div>
        </section>
      </div>

      <div className="main-content">
        <div className="main-content__menu">
          <Sidebar />
        </div>
        <div className="main-content__product">
          <ProductSection title="Hàng bán chạy" products={bestSellers} type="best-selling" />
          <ProductSection title="Hàng mới" products={newProducts} type="new" />
          <ProductSection title="Hàng giảm giá" products={saleProducts} type="sale" />
          
        </div>
      </div>
    </div>
  );
};

export default Home;
