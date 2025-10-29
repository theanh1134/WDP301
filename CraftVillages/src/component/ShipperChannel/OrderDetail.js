import React, { useState } from 'react';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';
import styled from 'styled-components';
import { FaCamera, FaMapMarkerAlt, FaPhone, FaBox, FaClock } from 'react-icons/fa';
import { toast } from 'react-toastify';

const ImagePreview = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const ImageThumb = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  border-radius: 4px;
  overflow: hidden;
  background: #f0f0f0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .remove-btn {
    position: absolute;
    top: 2px;
    right: 2px;
    background: rgba(255, 0, 0, 0.8);
    color: white;
    border: none;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    font-size: 0.75rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      background: rgba(255, 0, 0, 1);
    }
  }
`;

const StatusOptions = {
  'ASSIGNED': 'Đã nhận',
  'PICKED_UP': 'Đã lấy hàng',
  'OUT_FOR_DELIVERY': 'Đang giao',
  'DELIVERED': 'Đã giao',
  'FAILED': 'Giao thất bại'
};

function OrderDetail({ show, onHide, order, onUpdateStatus }) {
  const [loading, setLoading] = useState(false);
  const [newStatus, setNewStatus] = useState(order?.status || 'ASSIGNED');
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState([]);
  const [photoPreview, setPhotoPreview] = useState([]);

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (photos.length + files.length > 5) {
      toast.warning('Tối đa 5 ảnh');
      return;
    }

    setPhotos([...photos, ...files]);

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotoPreview(prev => [...prev, event.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemovePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoPreview(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!newStatus) {
      toast.error('Vui lòng chọn trạng thái');
      return;
    }

    setLoading(true);
    try {
      console.log('Submitting status update:', {
        shipmentId: order.id,
        status: newStatus,
        notes,
        photosCount: photos.length
      });
      
      await onUpdateStatus(order.id, newStatus, notes, photos);
      
      // Reset form
      setNotes('');
      setPhotos([]);
      setPhotoPreview([]);
      
      toast.success('Cập nhật trạng thái thành công');
      onHide();
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Có lỗi xảy ra';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

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
        <div className="mb-4 pb-4 border-bottom">
          <h6 className="mb-3">📋 Thông tin khách hàng</h6>
          <div className="row">
            <div className="col-md-6">
              <p><strong>Tên khách:</strong> {order?.customerName}</p>
              <p>
                <FaPhone className="me-2" />
                <strong>SĐT:</strong> {order?.phone}
              </p>
            </div>
            <div className="col-md-6">
              <p>
                <FaMapMarkerAlt className="me-2" />
                <strong>Địa chỉ:</strong> {order?.address}
              </p>
              <p><strong>Khoảng cách:</strong> {order?.distance}</p>
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="mb-4 pb-4 border-bottom">
          <h6 className="mb-3">📦 Chi tiết đơn hàng</h6>
          <div className="row">
            <div className="col-md-6">
              <p>
                <FaBox className="me-2" />
                <strong>Sản phẩm:</strong> {order?.items}
              </p>
              <p><strong>Tổng tiền:</strong> {order?.totalAmount?.toLocaleString()} VND</p>
            </div>
            <div className="col-md-6">
              <p><strong>Phí ship:</strong> {order?.shippingFee?.toLocaleString()} VND</p>
              <p>
                <FaClock className="me-2" />
                <strong>Dự kiến giao:</strong> {new Date(order?.estimatedDelivery).toLocaleString('vi-VN')}
              </p>
            </div>
          </div>
        </div>

        {/* Status Update */}
        <div className="mb-4 pb-4 border-bottom">
          <h6 className="mb-3">✅ Cập nhật trạng thái</h6>
          <Form.Group className="mb-3">
            <Form.Label>Trạng thái hiện tại: <strong>{StatusOptions[order?.status]}</strong></Form.Label>
            <Form.Select 
              value={newStatus} 
              onChange={(e) => setNewStatus(e.target.value)}
            >
              {Object.entries(StatusOptions).map(([key, value]) => (
                <option key={key} value={key}>{value}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </div>

        {/* Notes */}
        <div className="mb-4 pb-4 border-bottom">
          <h6 className="mb-3">📝 Ghi chú (tùy chọn)</h6>
          <Form.Group>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Nhập ghi chú về tình trạng giao hàng..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={loading}
            />
          </Form.Group>
        </div>

        {/* Photo Upload */}
        <div className="mb-3">
          <h6 className="mb-3">📷 Tải lên ảnh xác nhận (tối đa 5 ảnh)</h6>
          
          <Form.Group className="mb-3">
            <Form.Label>
              <div 
                style={{
                  padding: '2rem',
                  border: '2px dashed #ddd',
                  borderRadius: '4px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: '#f9f9f9',
                  transition: 'all 0.2s'
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handlePhotoChange({ target: { files: e.dataTransfer.files } });
                }}
              >
                <FaCamera size={32} className="mb-2 text-muted" />
                <p className="mb-0">
                  <strong>Nhấp để chọn ảnh</strong> hoặc kéo thả
                </p>
                <small className="text-muted">
                  PNG, JPG tối đa 5MB mỗi ảnh
                </small>
              </div>
              <Form.Control
                type="file"
                multiple
                accept="image/*"
                onChange={handlePhotoChange}
                style={{ display: 'none' }}
                disabled={loading || photos.length >= 5}
              />
            </Form.Label>
          </Form.Group>

          {photoPreview.length > 0 && (
            <div>
              <p className="text-muted">Ảnh đã chọn: {photoPreview.length}/5</p>
              <ImagePreview>
                {photoPreview.map((preview, index) => (
                  <ImageThumb key={index}>
                    <img src={preview} alt={`Preview ${index}`} />
                    <button
                      className="remove-btn"
                      onClick={() => handleRemovePhoto(index)}
                      title="Xóa ảnh"
                    >
                      ✕
                    </button>
                  </ImageThumb>
                ))}
              </ImagePreview>
            </div>
          )}
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={loading}>
          Hủy
        </Button>
        <Button 
          variant="primary" 
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Đang cập nhật...
            </>
          ) : (
            'Cập nhật'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default OrderDetail;
