import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { FaMapMarkerAlt, FaPhone, FaBox, FaClock } from 'react-icons/fa';

const StatusOptions = {
  'ASSIGNED': { label: 'Đã nhận', color: 'primary' },
  'PICKED_UP': { label: 'Đã lấy hàng', color: 'info' },
  'OUT_FOR_DELIVERY': { label: 'Đang giao', color: 'warning' },
  'DELIVERED': { label: 'Đã giao', color: 'success' },
  'FAILED': { label: 'Giao thất bại', color: 'danger' }
};

function OrderDetail({ show, onHide, order }) {

  if (!order) return null;

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          Chi tiết đơn hàng #{order?.orderId}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* Customer Info */}
        <div className="mb-4 pb-3 border-bottom">
          <h6 className="mb-3 text-primary">📋 Thông tin khách hàng</h6>
          <div className="row">
            <div className="col-md-6">
              <p className="mb-2">
                <strong>Tên khách:</strong> 
                <span className="ms-2">{order?.customerName}</span>
              </p>
              <p className="mb-2">
                <FaPhone className="me-2 text-muted" />
                <strong>SĐT:</strong> 
                <span className="ms-2">{order?.phone}</span>
              </p>
            </div>
            <div className="col-md-6">
              <p className="mb-2">
                <FaMapMarkerAlt className="me-2 text-danger" />
                <strong>Địa chỉ:</strong>
              </p>
              <p className="text-muted ms-4">{order?.address}</p>
              <p className="mb-2">
                <strong>Khoảng cách:</strong> 
                <span className="ms-2 text-info">{order?.distance}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="mb-4 pb-3 border-bottom">
          <h6 className="mb-3 text-success">📦 Chi tiết đơn hàng</h6>
          <div className="row">
            <div className="col-md-6">
              <p className="mb-2">
                <FaBox className="me-2 text-muted" />
                <strong>Sản phẩm:</strong>
              </p>
              <p className="text-muted ms-4 mb-3">{order?.items}</p>
              <p className="mb-2">
                <strong>Tổng tiền:</strong> 
                <span className="ms-2 text-success fw-bold">
                  {order?.totalAmount?.toLocaleString()} đ
                </span>
              </p>
            </div>
            <div className="col-md-6">
              <p className="mb-2">
                <strong>Phí ship:</strong> 
                <span className="ms-2 text-warning fw-bold">
                  {order?.shippingFee?.toLocaleString()} đ
                </span>
              </p>
              <p className="mb-2">
                <FaClock className="me-2 text-muted" />
                <strong>Dự kiến giao:</strong>
              </p>
              <p className="text-muted ms-4">
                {new Date(order?.estimatedDelivery).toLocaleString('vi-VN')}
              </p>
            </div>
          </div>
        </div>

        {/* Current Status */}
        <div className="mb-3">
          <h6 className="mb-3 text-info">✅ Trạng thái hiện tại</h6>
          <div className="p-3 bg-light rounded">
            <div className="d-flex align-items-center">
              <div className={`badge bg-${StatusOptions[order?.status]?.color || 'secondary'} fs-6 px-3 py-2`}>
                {StatusOptions[order?.status]?.label || order?.status}
              </div>
              <p className="mb-0 ms-3 text-muted">
                <small>Sử dụng các nút bên ngoài để cập nhật trạng thái</small>
              </p>
            </div>
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Đóng
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default OrderDetail;
