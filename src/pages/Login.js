const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
    const response = await fetch('http://localhost:8080/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.ok) {
      // Lưu token vào localStorage
      localStorage.setItem('accessToken', data.access_token);
      localStorage.setItem('refreshToken', data.refresh_token);
      
      // Chuyển hướng về trang chủ và reload trang
      navigate('/');
      window.location.reload();
    } else {
      setError(data.message || 'Đăng nhập thất bại');
    }
  } catch (err) {
    setError('Có lỗi xảy ra khi đăng nhập');
  } finally {
    setLoading(false);
  }
}; 