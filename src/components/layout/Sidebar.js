import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.scss';

const Sidebar = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/v1/category');
        const data = await response.json();
  
        if (data.code === 1000 && data.value) {
          const validCategories = data.value.filter(category => category.categoryId);
          setCategories(validCategories);
        } else {
          console.error('API Error:', data.message);
          setError('Không thể tải danh mục sản phẩm');
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError('Không thể tải danh mục sản phẩm');
      } finally {
        setLoading(false);
      }
    };
  
    fetchCategories();
  }, []);
  

  if (loading) {
    return <div className="sidebar-loading">Đang tải...</div>;
  }

  if (error) {
    return <div className="sidebar-error">{error}</div>;
  }

  return (
    <div className="main-content__menu">
      <ul className="main-content__menu-list">
        <li key="category-title" className="main_content__menu-title">
          <span>DANH MỤC SẢN PHẨM</span>
        </li>
        {categories.map((category) => {
          return (
            <li key={`category-${category.categoryId}`} className="main-content__menu-item">
              <Link to={`/category/${category.categoryId}`}>
                {category.categoryName}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Sidebar; 