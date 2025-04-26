import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Feedback.scss';
import { authFetch } from '../../../utils/authFetch';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faCheck, faTimes, faReply } from '@fortawesome/free-solid-svg-icons';

const Feedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalPages: 0,
    totalElements: 0
  });
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Parse URL search params for pagination
    const searchParams = new URLSearchParams(location.search);
    const page = parseInt(searchParams.get('page')) || 0;
    const size = parseInt(searchParams.get('size')) || 10;

    setPagination(prev => ({
      ...prev,
      page,
      size
    }));

    fetchFeedbacks(page, size);
  }, [location.search]);

  const fetchFeedbacks = async (page = 0, size = 10) => {
    try {
      setLoading(true);
      const response = await authFetch(`http://localhost:8080/api/v1/feedback?page=${page}&size=${size}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      // Ensure users is always an array
      const data = await response.json();

      // Ensure products is always an array
      const feedbacksData = Array.isArray(data.value) ? data.value :
        (data && data.value && Array.isArray(data.value)) ? data.value : [];

      // Set pagination data if available
      if (data.totalPages) {
        setPagination({
          page: data.page || 0,
          size: data.size || 10,
          totalPages: data.totalPages || 1,
          totalElements: data.totalElements || feedbacksData.length
        });
      }

      setFeedbacks(feedbacksData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      setError('Failed to load feedback');
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < pagination.totalPages) {
      const searchParams = new URLSearchParams(location.search);
      searchParams.set('page', newPage);
      navigate(`${location.pathname}?${searchParams.toString()}`);
    }
  };

  const handleSizeChange = (e) => {
    const newSize = parseInt(e.target.value);
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('size', newSize);
    searchParams.set('page', 0); // Reset to first page when changing size
    navigate(`${location.pathname}?${searchParams.toString()}`);
  };

  const handleDelete = async (feedbackId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa phản hồi này?')) {
      try {
        await authFetch(`http://localhost:8080/api/v1/feedback/${feedbackId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
        fetchFeedbacks(pagination.page, pagination.size);
      } catch (error) {
        console.error('Error deleting feedback:', error);
      }
    }
  };

  const handleReply = (feedback) => {
    setSelectedFeedback(feedback);
    setShowReplyModal(true);
  };

  const handleSendReply = async () => {
    try {
      await authFetch(`http://localhost:8080/api/v1/feedback/${selectedFeedback.id}/reply`, {
        method: 'POST',
          headers: {
          'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ message: replyMessage })
      });
      setShowReplyModal(false);
      setReplyMessage('');
      fetchFeedbacks(pagination.page, pagination.size);
    } catch (error) {
      console.error('Error sending reply:', error);
    }
  };

  const handleStatusChange = async (feedbackId, statusFeedback) => {
    try {
      await authFetch(`http://localhost:8080/api/v1/feedback/${feedbackId}`, {
        method: 'PUT',
          headers: {
          'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ statusFeedback: "RESOLVED" })
      });
      fetchFeedbacks(pagination.page, pagination.size);
    } catch (error) {
      console.error('Error updating feedback status:', error);
    }
  };

  if (loading) return (
    <div className="admin-text-center">
      <div className="admin-spinner-border" role="status">
        <span className="admin-sr-only">Loading...</span>
      </div>
    </div>
  );

  if (error) return (
    <div className="admin-alert admin-alert-danger">
      {error}
    </div>
  );

  return (
    <div className="admin-feedback">
      <div className="admin-row">
        <div className="admin-col-lg-12">
          <h3 className="admin-page-header"><i className="fa fa-comments-o"></i> Quản lý phản hồi</h3>
          <ol className="admin-breadcrumb">
            <li><i className="fa fa-home"></i><Link to="/admin">Trang chủ</Link></li>
            <li className="admin-active"><i className="fa fa-comments-o"></i>Phản hồi</li>
          </ol>
        </div>
      </div>

      <div className="admin-row">
        <div className="admin-col-lg-12">
          <section className="admin-panel">
            <header className="admin-panel-heading">
              <div className="admin-panel-title">Danh sách phản hồi từ khách hàng</div>
            </header>
            <div className="admin-panel-body">
              <div className="admin-table-responsive">
                <table className="admin-table admin-table-striped admin-table-hover">
                  <thead>
                    <tr>
                      <th><i className="fa fa-hashtag"></i> ID</th>
                      <th><i className="fa fa-user"></i> Người gửi</th>
                      <th><i className="fa fa-envelope"></i> Email</th>
                      <th><i className="fa fa-phone"></i> Số điện thoại</th>
                      <th><i className="fa fa-calendar"></i> Ngày gửi</th>
                      <th><i className="fa fa-comment"></i> Nội dung</th>
                      <th><i className="fa fa-check-circle"></i> Trạng thái</th>
                      <th><i className="fa fa-cogs"></i> Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(feedbacks) && feedbacks.length > 0 ? (
                      feedbacks.map(feedback => (
                        <tr key={feedback.id}>
                          <td>{feedback.id}</td>
                          <td>{feedback.name}</td>
                          <td className="admin-truncate">{feedback.email}</td>
                          <td>{feedback.phone || 'N/A'}</td>
                          <td>{new Date(feedback.createdAt).toLocaleDateString()}</td>
                          <td>
                            <div className="admin-feedback-content admin-truncate">{feedback.content}</div>
                          </td>
                          <td>
                            <span className={`admin-label admin-label-${feedback.statusFeedback === 'RESOLVED' ? 'success' : 'warning'}`}>
                              {feedback.statusFeedback === 'RESOLVED' ? 'Đã giải quyết' : 'Chưa giải quyết'}
                            </span>
                          </td>
                          <td>
                            <div className="admin-btn-group">
                              <button onClick={() => handleReply(feedback)} className="admin-btn admin-btn-primary admin-btn-sm" title="Trả lời">
                                <FontAwesomeIcon icon={faReply} />
                              </button>
                              <button
                                onClick={() => handleStatusChange(feedback.id, !feedback.statusFeedback)}
                                className={`admin-btn admin-btn-${feedback.statusFeedback === 'RESOLVED' ? 'warning' : 'success'} admin-btn-sm`}
                                title={feedback.statusFeedback === 'RESOLVED' ? 'Đánh dấu chưa giải quyết' : 'Đánh dấu đã giải quyết'}
                              >
                                <FontAwesomeIcon icon={feedback.statusFeedback === 'RESOLVED' ? faTimes : faCheck} />
                              </button>
                              <button onClick={() => handleDelete(feedback.id)} className="admin-btn admin-btn-danger admin-btn-sm" title="Xóa">
                                <FontAwesomeIcon icon={faTrash} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="admin-text-center">Không có phản hồi nào</td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {/* Pagination controls */}
                <div className="admin-pagination-container">
                  <div className="admin-row">
                    <div className="admin-col-md-6">
                      <div className="admin-dataTables_info" role="status">
                        Hiển thị {feedbacks.length} / {pagination.totalElements} phản hồi
                      </div>
                    </div>
                    <div className="admin-col-md-6">
                      <div className="admin-dataTables_paginate admin-paging_simple_numbers">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                          <div className="admin-mr-3">
                            <select
                              className="admin-form-control admin-form-control-sm"
                              value={pagination.size}
                              onChange={handleSizeChange}
                            >
                              <option value="5">5</option>
                              <option value="10">10</option>
                              <option value="25">25</option>
                              <option value="50">50</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Reply Modal */}
      {showReplyModal && selectedFeedback && (
        <div className="admin-modal admin-show" style={{ display: 'block' }}>
          <div className="admin-modal-dialog">
            <div className="admin-modal-content">
              <div className="admin-modal-header">
                <button type="button" className="admin-close" onClick={() => setShowReplyModal(false)}>×</button>
                <h4 className="admin-modal-title">Phản hồi tới {selectedFeedback.name}</h4>
              </div>
              <div className="admin-modal-body">
                <div className="admin-form-group">
                  <label>Nội dung phản hồi khách hàng:</label>
                  <div className="admin-well admin-feedback-content">{selectedFeedback.message}</div>
                </div>
                <div className="admin-form-group">
                  <label>Trả lời:</label>
                  <textarea
                    className="admin-form-control"
                    rows="5"
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Nhập nội dung trả lời..."
                  ></textarea>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn admin-btn-default" onClick={() => setShowReplyModal(false)}>
                  <i className="fa fa-times"></i> Hủy
                </button>
                <button type="button" className="admin-btn admin-btn-primary" onClick={handleSendReply}>
                  <i className="fa fa-paper-plane"></i> Gửi phản hồi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Backdrop */}
      {showReplyModal && (
        <div className="admin-modal-backdrop admin-fade admin-in"></div>
      )}
    </div>
  );
};

export default Feedback; 