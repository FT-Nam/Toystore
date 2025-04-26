import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.scss';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__row">
          <div className="footer__col">
            <img
              src="https://150698241.v2.pressablecdn.com/toys-mania/wp-content/uploads/sites/250/2022/09/toys-mania-42.png"
              alt="logo"
              className="footer__logo"
            />
            <div className="footer__content">
              <div className="footer__content__detail">
                <div className="footer__content__address">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                  <span>123 Đường ABC, Quận XYZ, TP.HCM</span>
                </div>
              </div>
              <div className="footer__content__email">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                </svg>
                <span>contact@toystore.com</span>
              </div>
              <div className="footer__content__call">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z" />
                </svg>
                <span>0123 456 789</span>
              </div>
            </div>
          </div>

          <div className="footer__col">
            <h3 className="footer__menu__title">Về chúng tôi</h3>
            <ul className="footer__list-menu">
              <li className="footer__list-menu__item">
                <Link to="/about">Giới thiệu</Link>
              </li>
              <li className="footer__list-menu__item">
                <Link to="/contact">Liên hệ</Link>
              </li>
              <li className="footer__list-menu__item">
                <Link to="/privacy">Chính sách bảo mật</Link>
              </li>
              <li className="footer__list-menu__item">
                <Link to="/terms">Điều khoản sử dụng</Link>
              </li>
            </ul>
          </div>

          <div className="footer__col">
            <h3 className="footer__menu__title">Hỗ trợ khách hàng</h3>
            <ul className="footer__list-menu">
              <li className="footer__list-menu__item">
                <Link to="/faq">Câu hỏi thường gặp</Link>
              </li>
              <li className="footer__list-menu__item">
                <Link to="/shipping">Chính sách vận chuyển</Link>
              </li>
              <li className="footer__list-menu__item">
                <Link to="/returns">Chính sách đổi trả</Link>
              </li>
              <li className="footer__list-menu__item">
                <Link to="/payment">Phương thức thanh toán</Link>
              </li>
            </ul>
          </div>

          <div className="footer__col">
            <h3 className="footer__menu__title">Danh mục sản phẩm</h3>
            <ul className="footer__list-menu">
              <li className="footer__list-menu__item">
                <Link to="/product?type=new">Hàng mới về</Link>
              </li>
              <li className="footer__list-menu__item">
                <Link to="/product?type=sale">Sản phẩm giảm giá</Link>
              </li>
              <li className="footer__list-menu__item">
                <Link to="/product?type=best_seller">Sản phẩm bán chạy</Link>
              </li>
              <li className="footer__list-menu__item">
                <Link to="/product?type=featured">Sản phẩm nổi bật</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer__member">
          <p>© 2024 ToyStore. Tất cả quyền được bảo lưu.</p>
          <div>Thành viên của</div>
          <span>Shopee</span>
          <span>Lazada</span>
          <span>Tiki</span>
          <span>Sendo</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 