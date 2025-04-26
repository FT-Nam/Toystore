export const addToCart = async (productId, quantity = 1) => {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      window.location.href = '/login';
      return { success: false, error: 'Vui lòng đăng nhập' };
    }

    // Lấy username từ token
    const tokenParts = token.split('.');
    const payload = JSON.parse(atob(tokenParts[1]));
    const username = payload.sub;

    // Lấy thông tin user
    const userResponse = await fetch(`http://localhost:8080/api/v1/user/id/${encodeURIComponent(username)}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const userData = await userResponse.json();
    
    if (userData.code !== 1000 || !userData.value) {
      return { success: false, error: 'Không thể lấy thông tin người dùng' };
    }
    
    const userId = userData.value.id;
    
    // Lấy cartId
    const cartResponse = await fetch('http://localhost:8080/api/v1/cart', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const cartData = await cartResponse.json();
    
    if (cartData.code !== 1000 || !cartData.value) {
      return { success: false, error: 'Không thể lấy thông tin giỏ hàng' };
    }
    
    const cartId = cartData.value.cartId;

    // Thêm sản phẩm vào giỏ hàng
    const response = await fetch('http://localhost:8080/api/v1/cart/add-to-cart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        userId: userId,
        cartId: cartId,
        productId: productId,
        quantity: quantity
      })
    });

    const data = await response.json();
    
    if (data.code === 1000) {
      return { success: true };
    } else {
      return { success: false, error: 'Lỗi khi thêm vào giỏ hàng' };
    }
  } catch (error) {
    console.error('Error adding to cart:', error);
    return { success: false, error: 'Không thể thêm sản phẩm vào giỏ hàng' };
  }
}; 