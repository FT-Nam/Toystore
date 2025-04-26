import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.scss';
import { authFetch } from '../../utils/authFetch';

const Header = () => {
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [user, setUser] = useState(null);
  const [showCart, setShowCart] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  // Hàm để decode JWT token
  const decodeToken = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  const fetchCartData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
      const userId = localStorage.getItem('userId');

      if (!token || !userId) {
        console.log('Missing token or userId for cart fetch');
        setCartItems([]);
        return;
      }

      // Lấy cart ID từ userId
      const cartResponse = await authFetch(`http://localhost:8080/api/v1/cart/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const cartData = await cartResponse.json();
      console.log('=== CART ID API RESPONSE ===');
      console.log('Full cart data:', cartData);
      console.log('Cart data code:', cartData?.code);
      console.log('Cart data value:', cartData?.value);

      // Kiểm tra cấu trúc dữ liệu trả về
      if (cartData && cartData.code === 1000) {
        // Nếu không có value, có thể là giỏ hàng trống
        if (!cartData.value) {
          console.log('Cart is empty - no value in response');
          setCartItems([]);
          return;
        }

        const cartId = cartData.value.id;

        // Lấy cart items từ cart ID
        const itemsResponse = await authFetch(`http://localhost:8080/api/v1/cart/${cartId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
    
        const itemsData = await itemsResponse.json();
        console.log('=== CART ITEMS API RESPONSE ===');
        console.log('Full items data:', itemsData);
        console.log('Items data code:', itemsData?.code);
        console.log('Items data value:', itemsData?.value);

        // Kiểm tra cấu trúc dữ liệu trả về
        if (itemsData && itemsData.code === 1000) {
          // Nếu không có value, có thể là giỏ hàng trống
          if (!itemsData.value || !Array.isArray(itemsData.value)) {
            console.log('Cart items is empty - no value in response or not an array');
            setCartItems([]);
          return;
        }
    
          // Lấy thông tin sản phẩm cho mỗi item trong giỏ hàng
          const items = itemsData.value;
          console.log('=== CART ITEMS PROCESSED ===');
          console.log('Number of items:', items.length);
          console.log('Items array:', items);

          // Lấy thông tin chi tiết sản phẩm cho mỗi item
          const itemsWithDetails = await Promise.all(
            items.map(async (item) => {
              try {
                const productResponse = await authFetch(`http://localhost:8080/api/v1/product/${item.productId}`, {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                });
                const productData = await productResponse.json();

                if (productData && productData.code === 1000 && productData.value) {
                  return {
                    ...item,
                    name: productData.value.name,
                    image_url: productData.value.thumbnail || `http://localhost:8080/api/v1/product-img/thumbnail/${item.productId}`,
                    discount_percentage: productData.value.discount_percentage || 0
                  };
                }
                return item;
              } catch (error) {
                return item;
              }
            })
          );

          console.log('Items with product details:', itemsWithDetails);
          setCartItems(itemsWithDetails);

          const total = itemsWithDetails.reduce((total, item) => {
              const price = item.discount_percentage > 0
                ? item.price * (1 - item.discount_percentage / 100)
                : item.price;
              return total + price * item.quantity;
          }, 0);
          console.log('Calculated total price:', total);
          setTotalPrice(total);
        } else {
          console.error('Invalid cart items data:', itemsData);
          setCartItems([]);
        }
      } else {
        console.warn('Invalid cart data:', cartData);
        setCartItems([]);
      }
    } catch (error) {
      setCartItems([]);
    }
  };

  // Effect để kiểm tra token và cập nhật trạng thái
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    console.log('Initial token check:', token);

    if (token) {
      fetchUserData();
    } else {
      setIsLoggedIn(false);
      setUsername('');
      setUser(null);
      setCartItems([]);
    }

    // Thêm event listener để lắng nghe sự kiện đăng nhập thành công
    const handleLoginSuccess = () => {
      console.log('Login success event received');
      const newToken = localStorage.getItem('accessToken');
      if (newToken) {
        fetchUserData();
      }
    };

    // Thêm event listener để lắng nghe thay đổi trong localStorage
    const handleStorageChange = (e) => {
      if (e.key === 'accessToken') {
        console.log('Token changed in localStorage');
        if (e.newValue) {
    fetchUserData();
        } else {
          setIsLoggedIn(false);
          setUsername('');
          setUser(null);
          setCartItems([]);
        }
      }
    };

    window.addEventListener('loginSuccess', handleLoginSuccess);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('loginSuccess', handleLoginSuccess);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []); // Empty dependency array since we want this to run only once on mount

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('accessToken');

      if (!token) {
        console.log('No token found, setting logged out state');
        setIsLoggedIn(false);
        setUsername('');
        setUser(null);
        return;
      }

      // Decode token để lấy thông tin user
      const decodedToken = decodeToken(token);
      console.log('Decoded token:', decodedToken);

      if (!decodedToken) {
        console.warn('Token không hợp lệ');
        setIsLoggedIn(false);
        setUsername('');
        setUser(null);
        return;
      }

      // Lấy username từ sub trong token
      const usernameFromToken = decodedToken.sub;
      console.log('Username from token:', usernameFromToken);

      if (!usernameFromToken) {
        console.warn('Không tìm thấy username trong token');
        setIsLoggedIn(false);
        setUsername('');
        setUser(null);
        return;
      }

      // Kiểm tra xem usernameFromToken có phải là email không
      const isEmail = usernameFromToken.includes('@');
      
      // Sử dụng endpoint phù hợp dựa trên loại username
      let apiUrl;
      if (isEmail) {
        console.log('Username is an email, using email endpoint');
        const provider = localStorage.getItem('loginProvider') || 'LOCAL';
        apiUrl = `http://localhost:8080/api/v1/user/email-provider?email=${encodeURIComponent(usernameFromToken)}&provider=${provider}`;
      } else {
        console.log('Username is not an email, using username endpoint');
        apiUrl = `http://localhost:8080/api/v1/user/id/${usernameFromToken}`;
      }
      
      console.log('Fetching user details with API URL:', apiUrl);
      const userResponse = await authFetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const userData = await userResponse.json();
      console.log('User data received:', userData);

      if (userData && userData.code === 1000 && userData.value) {
        console.log('Setting logged in state with username:', usernameFromToken);
        setIsLoggedIn(true);
        setUsername(usernameFromToken);
        setUser(userData.value);
        localStorage.setItem('userId', userData.value.id);
        // Fetch cart data after successful user data fetch
    fetchCartData();
      } else {
        console.log('Invalid user data received:', userData);
        setIsLoggedIn(false);
        setUsername('');
        setUser(null);
      }

    } catch (error) {
      console.error('Error fetching user data:', error);
      setIsLoggedIn(false);
      setUsername('');
      setUser(null);
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      
      if (token) {
        await fetch('http://localhost:8080/api/v1/auth/logout', { 
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: token })
        });
      }
      
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('username');
      localStorage.removeItem('loginProvider');
      setIsLoggedIn(false);
      setUsername('');
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleCartUpdate = async (action, data) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.error('No token found');
        return;
      }

      if (action === 'delete') {
        const response = await authFetch(`http://localhost:8080/api/v1/cart/cart-detail/${data.cart_item_id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          fetchCartData(); // Refresh cart data after deletion
        }
      } else if (action === 'update') {
        const response = await authFetch(`http://localhost:8080/api/v1/cart/cart-detail/${data.cart_item_id}`, {
          method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ quantity: data.quantity }),
        });
        if (response.ok) {
          fetchCartData(); // Refresh cart data after update
        }
      }
    } catch (error) {
      console.error('Error updating cart:', error);
    }
  };

  return (
    <header className="header">
      <div className="header__top-container">
        <div className="container">
          <div className="header__top">
            <Link to="/" className="header__logo-link">
              <img
                className="header__logo"
                src="https://150698241.v2.pressablecdn.com/toys-mania/wp-content/uploads/sites/250/2022/09/toys-mania-42.png"
                alt="logo"
              />
            </Link>

            <div className="header__search">
              <form action="/product" method="GET" onSubmit={(e) => {
                e.preventDefault();
                const searchInput = e.target.elements.search.value.trim();
                if (searchInput) {
                  navigate(`/product?search=${encodeURIComponent(searchInput)}`);
                }
              }}>
                <input
                  className="header__search-input"
                  name="search"
                  type="text"
                  placeholder="Hãy nhập từ khóa để tìm kiếm"
                  required
                />
                <button type="submit" className="header__search-btn">
                  <svg
                    className="icon icon-search-bar"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <g clipPath="url(#clip0_2375_12031)">
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M19.0088 15.9064C18.9399 15.9165 18.8739 15.9405 18.8145 15.9768C18.7552 16.0132 18.7038 16.0611 18.6635 16.1179C18.3141 16.6098 17.9256 17.0728 17.5021 17.5026C17.0726 17.9258 16.6099 18.314 16.1184 18.6631C16.0616 18.7034 16.0137 18.7548 15.9773 18.8141C15.941 18.8735 15.917 18.9395 15.9069 19.0084C15.8967 19.0772 15.9006 19.1474 15.9183 19.2147C15.936 19.282 15.9672 19.345 16.0099 19.3999L18.6998 22.8601C18.6998 22.8601 18.6998 22.8601 18.6999 22.8602C19.7893 24.2608 21.8818 24.391 23.1364 23.1363C24.3916 21.8817 24.2614 19.7887 22.8605 18.6994C22.8605 18.6994 22.8604 18.6994 22.8604 18.6994L19.4003 16.0094C19.3454 15.9667 19.2824 15.9355 19.2151 15.9178C19.1478 15.9001 19.0776 15.8962 19.0088 15.9064Z"
                        fill="#CF102D"
                      />
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M9.52948 0C7.08875 -2.34375e-07 4.64802 0.929578 2.78881 2.78879C-0.929605 6.50721 -0.929604 12.5517 2.78881 16.2701C6.50723 19.9885 12.5516 19.9885 16.27 16.2701C19.9885 12.5517 19.9886 6.5072 16.2701 2.78879C14.4109 0.929579 11.9702 2.25e-07 9.52948 0ZM9.52938 2.77441C11.2601 2.77441 12.9908 3.43311 14.3083 4.75058C16.9432 7.38552 16.9432 11.6734 14.3083 14.3083C11.6733 16.9433 7.38555 16.9433 4.7506 14.3083C2.11568 11.6734 2.11566 7.38552 4.7506 4.75058C6.06808 3.43311 7.79869 2.77441 9.52938 2.77441Z"
                        fill="#CF102D"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_2375_12031">
                        <rect width="24" height="24" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                </button>
              </form>
            </div>

            <div className="header__cart" onMouseEnter={() => setShowCart(true)} onMouseLeave={() => setShowCart(false)}>
              <Link to="/cart" className="header__icon header__cart-wrap">
                <svg
                  className="icon icon-cart-empty"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <g clipPath="url(#clip0_1635_4470)">
                    <path
                      d="M23.1463 10.2984C21.8432 10.0106 20.5124 9.77016 19.1915 9.58454H19.1863L19.1394 9.57797C18.9852 9.55735 18.83 9.53766 18.6749 9.51797C18.657 9.43529 18.6293 9.35503 18.5924 9.27891L14.8255 1.47844C14.7675 1.34751 14.6838 1.22958 14.5793 1.13166C14.4748 1.03375 14.3516 0.957859 14.2172 0.908504C14.0828 0.859148 13.9398 0.837336 13.7968 0.844366C13.6537 0.851396 13.5136 0.887125 13.3846 0.949426C13.2557 1.01173 13.1406 1.09933 13.0462 1.20702C12.9518 1.3147 12.88 1.44028 12.8352 1.57627C12.7903 1.71226 12.7732 1.85589 12.785 1.99861C12.7968 2.14133 12.8371 2.28023 12.9036 2.40704L16.2111 9.255C13.4089 9.02649 10.5927 9.02649 7.79052 9.255L11.0971 2.40704C11.2203 2.15205 11.2371 1.85858 11.1439 1.59117C11.0508 1.32376 10.8552 1.10431 10.6002 0.981098C10.4739 0.92012 10.3369 0.884613 10.1969 0.876606C10.0569 0.868598 9.91664 0.888247 9.78423 0.93443C9.65181 0.980614 9.5298 1.05243 9.42514 1.14577C9.32048 1.23911 9.23524 1.35215 9.17427 1.47844L5.40692 9.27844C5.37001 9.35456 5.34231 9.43482 5.32442 9.5175C5.16927 9.53719 5.01411 9.55641 4.85989 9.5775H4.85474C3.51739 9.765 2.17114 10.0069 0.853018 10.298C0.591417 10.356 0.360415 10.5084 0.20428 10.7262C0.0481457 10.944 -0.0221383 11.2117 0.00689731 11.4781C0.0359329 11.7444 0.162246 11.9907 0.361629 12.1697C0.561013 12.3487 0.819443 12.4479 1.08739 12.4481C1.16622 12.448 1.24479 12.4393 1.32177 12.4223L1.40333 12.4045C1.48489 13.3223 1.66817 14.5702 2.01271 16.2928C2.35724 18.0155 2.67177 19.2961 2.93708 20.228C3.39271 21.7748 4.81583 22.9772 6.3388 23.0738C7.25942 23.1234 10.2711 23.1164 11.9999 23.1253C13.7286 23.1164 16.7404 23.1253 17.661 23.0738C19.1835 22.9772 20.6071 21.7739 21.0622 20.228C21.3266 19.2961 21.6416 18.0202 21.9866 16.2933C22.3316 14.5664 22.514 13.3228 22.596 12.405L22.6775 12.4228C22.8182 12.4569 22.9643 12.4626 23.1072 12.4395C23.2501 12.4164 23.387 12.3651 23.5098 12.2884C23.6326 12.2118 23.7389 12.1114 23.8224 11.9932C23.9059 11.875 23.965 11.7412 23.9962 11.5999C24.0274 11.4585 24.0301 11.3124 24.0041 11.17C23.9781 11.0276 23.9239 10.8918 23.8447 10.7706C23.7656 10.6494 23.663 10.5452 23.5431 10.4641C23.4232 10.383 23.2883 10.3267 23.1463 10.2984Z"
                      fill="currentColor"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_1635_4470">
                      <rect width="24" height="24" fill="currentColor" />
                    </clipPath>
                  </defs>
                </svg>
                <label className="header__cart-title">Giỏ hàng</label>
                <span className="header__cart-count">{cartItems?.length || 0}</span>
              </Link>

              {showCart && (
                <div className="cart-overlay">
                  <div className="cart-overlay__content">
                    {cartItems.length > 0 ? (
                      <>
                        <div className="cart-overlay__items">
                              {cartItems.map((item) => (
                            <div key={item.id} className="cart-item" data-cart-item-id={item.id}>
                              <div className="cart-item__media">
                                    <img src={item.image_url} alt={item.name} width="100" height="100" />
                              </div>
                              <div className="cart-item__details">
                                    <div className="cart-item__name-container">
                                  <Link to={`/product/${item.productId}`} className="cart-item__name">
                                        {item.name}
                                      </Link>
                                  <button
                                        className="cart-item__delete"
                                    onClick={() => handleCartUpdate('delete', { cart_item_id: item.id })}
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M3 6h18"></path>
                                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                                    </svg>
                                  </button>
                                    </div>
                                    <div className="cart-item__quantity">
                                      <button
                                        className="quantity-btn decrease-btn"
                                        onClick={() =>
                                          handleCartUpdate('update', {
                                        cart_item_id: item.id,
                                            quantity: Math.max(1, item.quantity - 1),
                                          })
                                        }
                                      >
                                    -
                                      </button>
                                      <input
                                        type="number"
                                        value={item.quantity}
                                        min="1"
                                        className="cart-quantity__input"
                                        onChange={(e) =>
                                          handleCartUpdate('update', {
                                        cart_item_id: item.id,
                                            quantity: Math.max(1, parseInt(e.target.value)),
                                          })
                                        }
                                      />
                                      <button
                                        className="quantity-btn increase-btn"
                                        onClick={() =>
                                          handleCartUpdate('update', {
                                        cart_item_id: item.id,
                                            quantity: item.quantity + 1,
                                          })
                                        }
                                      >
                                    +
                                      </button>
                                    </div>
                                    <div className="cart-item__price">
                                  {item.discount_percentage > 0 ? (
                                    <>
                                      <span className="original-price">
                                        {(Number(item.price) || 0).toLocaleString()}đ
                                      </span>
                                      <span className="discounted-price">
                                        {((Number(item.price) || 0) * (1 - (Number(item.discount_percentage) || 0) / 100)).toLocaleString()}đ
                                      </span>
                                    </>
                                  ) : (
                                    <span>{(Number(item.price) || 0).toLocaleString()}đ</span>
                                  )}
                                </div>
                              </div>
                                    </div>
                              ))}
                        </div>
                        <div className="cart-overlay__footer">
                          <div className="totals">
                            <p className="totals__subtotal">Tổng cộng</p>
                            <p className="totals__subtotal-value">{totalPrice.toLocaleString()}đ</p>
                          </div>
                          <div className="check-box">
                            <input type="checkbox" id="agree-terms-overlay" name="check-box" />
                            <label htmlFor="agree-terms-overlay">
                              Tôi đã đọc và đồng ý với <a href="#">điều khoản</a> và{' '}
                              <a href="#">điều kiện thanh toán</a>
                            </label>
                          </div>
                          <div className="cart__ctas">
                            <Link to="/cart" className="cart__go-cart button">
                              Xem giỏ hàng
                            </Link>
                            <button className="cart__checkout button" id="checkout-button">
                              Thanh toán ngay
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="cart-empty">
                        <p>Giỏ Hàng Của Bạn Đang Trống</p>
                        <button onClick={() => navigate('/')}>Tiếp tục mua sắm</button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="header__account">
              {isLoggedIn ? (
                <div className="header__account-info" onMouseEnter={() => setShowDropdown(true)} onMouseLeave={() => setShowDropdown(false)}>
                  <img src={user?.avatar || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSlRM2-AldpZgaraCXCnO5loktGi0wGiNPydQ&s'} alt="Avatar" className="header__account-avatar" />
                  <span className="header__account-name">{user?.username}</span>
                  {showDropdown && (
                    <div className="header__account-dropdown">
                      <Link to="/profile" className="header__account-dropdown-item">
                        <i className="fas fa-user"></i> Profile
                      </Link>
                      <Link to="/orders" className="header__account-dropdown-item">
                        <i className="fas fa-shopping-bag"></i> Orders
                      </Link>
                      <a onClick={handleLogout} className="header__account-dropdown-item">
                        <i className="fas fa-sign-out-alt"></i> Logout
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login" className="header__icon header__account-wrap">
                  <svg
                    className="icon icon-account"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M18 2H6C3.79086 2 2 3.79086 2 6V18C2 19.8642 3.27532 21.4306 5.00111 21.8743C5.32039 21.9563 5.6551 22 6 22H18C18.3449 22 18.6796 21.9563 18.9989 21.8743C20.7247 21.4306 22 19.8642 22 18V6C22 3.79086 20.2091 2 18 2ZM12 13C14.4617 13 16.5783 14.6062 17.5115 16.9071C17.9491 17.986 17.0067 19 15.8425 19H8.15752C6.99332 19 6.05092 17.986 6.48849 16.9071C7.42174 14.6062 9.53834 13 12 13ZM12 5C13.6569 5 15 6.34315 15 8C15 9.65685 13.6569 11 12 11C10.3431 11 9 9.65685 9 8C9 6.34315 10.3431 5 12 5Z"
                      fill="currentColor"
                    />
                  </svg>
                  <span className="header__account-title">Đăng nhập</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="header__menu">
        <ul className="header__menu-list">
          <li className="header__menu-item">
            <Link to="/">Trang Chủ</Link>
          </li>
          <li className="header__menu-item">
            <Link to="/product?type=new">Hàng Mới</Link>
          </li>
          <li className="header__menu-item">
            <Link to="/product?type=sale">Giảm Giá</Link>
          </li>
          <li className="header__menu-item">
            <Link to="/product?type=best-selling">Sản Phẩm Bán Chạy</Link>
          </li>
          <li className="header__menu-item">
            <Link to="/contact">Liên Hệ</Link>
          </li>
        </ul>
      </div>
    </header>
  );
};

export default Header; 