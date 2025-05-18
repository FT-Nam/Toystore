import React, { useState } from 'react';
import './Filter.scss';

const Filter = ({ onFilterChange }) => {
  const [priceRange, setPriceRange] = useState({
    min: '',
    max: ''
  });
  const [filters, setFilters] = useState({
    isBestSeller: false,
    isNew: false,
    isSale: false
  });
  const [tempFilters, setTempFilters] = useState({
    priceRange: { min: '', max: '' },
    isBestSeller: false,
    isNew: false,
    isSale: false
  });

  // Mock data for product counts - replace with actual data from API
  const productCounts = {
    bestSeller: 12,
    new: 8,
    sale: 15
  };

  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    const newPriceRange = {
      ...tempFilters.priceRange,
      [name]: value
    };
    setTempFilters(prev => ({
      ...prev,
      priceRange: newPriceRange
    }));
  };

  const handleFilterChange = (e) => {
    const { name, checked } = e.target;
    setTempFilters(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleApply = () => {
    setPriceRange(tempFilters.priceRange);
    setFilters({
      isBestSeller: tempFilters.isBestSeller,
      isNew: tempFilters.isNew,
      isSale: tempFilters.isSale
    });
    onFilterChange({
      priceRange: tempFilters.priceRange,
      isBestSeller: tempFilters.isBestSeller,
      isNew: tempFilters.isNew,
      isSale: tempFilters.isSale
    });
  };

  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  return (
    <div className="filter">
      <div className="filter__section">
        <h3 className="filter__title">Khoảng giá</h3>
        <div className="filter__price-range">
          <div className="price-input">
            <input
              type="number"
              name="min"
              value={tempFilters.priceRange.min}
              onChange={handlePriceChange}
              placeholder="Từ"
              min="0"
            />
            <span className="price-input__currency">đ</span>
          </div>
          <span className="price-separator">-</span>
          <div className="price-input">
            <input
              type="number"
              name="max"
              value={tempFilters.priceRange.max}
              onChange={handlePriceChange}
              placeholder="Đến"
              min="0"
            />
            <span className="price-input__currency">đ</span>
          </div>
        </div>
      </div>

      <div className="filter__section">
        <h3 className="filter__title">Lọc theo</h3>
        <div className="filter__options">
          <label className="filter__option">
            <input
              type="checkbox"
              name="isBestSeller"
              checked={tempFilters.isBestSeller}
              onChange={handleFilterChange}
            />
            <span className="filter__option-label">
              <i className="fas fa-fire"></i>
              Sản phẩm bán chạy
            </span>
          </label>

          <label className="filter__option">
            <input
              type="checkbox"
              name="isNew"
              checked={tempFilters.isNew}
              onChange={handleFilterChange}
            />
            <span className="filter__option-label">
              <i className="fas fa-star"></i>
              Sản phẩm mới
            </span>
          </label>

          <label className="filter__option">
            <input
              type="checkbox"
              name="isSale"
              checked={tempFilters.isSale}
              onChange={handleFilterChange}
            />
            <span className="filter__option-label">
              <i className="fas fa-tag"></i>
              Đang giảm giá
            </span>
          </label>
        </div>
      </div>

      <div className="filter__actions">
        <button className="filter__apply-btn" onClick={handleApply}>
          Áp dụng
        </button>
      </div>
    </div>
  );
};

export default Filter; 