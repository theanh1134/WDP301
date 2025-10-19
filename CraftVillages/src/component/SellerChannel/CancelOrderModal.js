import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import styled from 'styled-components';
import { FaExclamationTriangle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import orderService from '../../services/orderService';

const ModalHeader = styled(Modal.Header)`
    background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
    color: white;
    border: none;
    
    .modal-title {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 600;
        
        svg {
            font-size: 1.5rem;
        }
    }
    
    .btn-close {
        filter: brightness(0) invert(1);
    }
`;

const WarningBox = styled(Alert)`
    background-color: #fff3cd;
    border-color: #ffc107;
    color: #856404;
    display: flex;
    align-items: start;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
    
    svg {
        font-size: 1.25rem;
        margin-top: 0.125rem;
        flex-shrink: 0;
    }
`;

const OrderInfo = styled.div`
    background: #f8f9fa;
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1.5rem;
    
    .info-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.5rem;
        
        &:last-child {
            margin-bottom: 0;
        }
        
        .label {
            color: #666;
            font-size: 0.9rem;
        }
        
        .value {
            font-weight: 600;
            color: #333;
        }
    }
`;

const ReasonOption = styled.div`
    padding: 0.75rem;
    border: 2px solid ${props => props.selected ? '#b8860b' : '#dee2e6'};
    border-radius: 8px;
    margin-bottom: 0.75rem;
    cursor: pointer;
    transition: all 0.2s;
    background: ${props => props.selected ? '#fffbf0' : 'white'};
    
    &:hover {
        border-color: #b8860b;
        background: #fffbf0;
    }
    
    .reason-title {
        font-weight: 600;
        color: ${props => props.selected ? '#b8860b' : '#333'};
        margin-bottom: 0.25rem;
    }
    
    .reason-desc {
        font-size: 0.85rem;
        color: #666;
        margin: 0;
    }
`;

const ButtonGroup = styled.div`
    display: flex;
    gap: 0.75rem;
    justify-content: flex-end;
    margin-top: 1.5rem;
`;

const CancelButton = styled(Button)`
    background: #dc3545;
    border: none;
    padding: 0.5rem 1.5rem;
    font-weight: 600;
    
    &:hover {
        background: #c82333;
    }
    
    &:disabled {
        background: #6c757d;
    }
`;

const CANCEL_REASONS = [
    {
        id: 'OUT_OF_STOCK',
        title: 'Hết hàng',
        description: 'Sản phẩm đã hết hàng, không đủ số lượng để giao'
    },
    {
        id: 'INVALID_ADDRESS',
        title: 'Địa chỉ giao hàng không hợp lệ',
        description: 'Thông tin địa chỉ hoặc số điện thoại không chính xác'
    },
    {
        id: 'CUSTOMER_NO_RESPONSE',
        title: 'Khách hàng không phản hồi',
        description: 'Đã liên hệ nhiều lần nhưng khách không phản hồi'
    },
    {
        id: 'WRONG_PRICE',
        title: 'Giá sản phẩm sai',
        description: 'Lỗi hệ thống hiển thị giá không chính xác'
    },
    {
        id: 'SUSPICIOUS_ORDER',
        title: 'Đơn hàng bất thường',
        description: 'Nghi ngờ đơn hàng gian lận hoặc không hợp lệ'
    },
    {
        id: 'OTHER',
        title: 'Lý do khác',
        description: 'Vui lòng nhập lý do cụ thể bên dưới'
    }
];

function CancelOrderModal({ show, onHide, order, onCancelSuccess }) {
    const [selectedReason, setSelectedReason] = useState('');
    const [customReason, setCustomReason] = useState('');
    const [cancelling, setCancelling] = useState(false);

    if (!order) return null;

    const handleCancel = async () => {
        if (!selectedReason) {
            toast.warning('Vui lòng chọn lý do hủy đơn');
            return;
        }

        if (selectedReason === 'OTHER' && !customReason.trim()) {
            toast.warning('Vui lòng nhập lý do hủy đơn');
            return;
        }

        const reasonText = selectedReason === 'OTHER' 
            ? customReason.trim()
            : CANCEL_REASONS.find(r => r.id === selectedReason)?.title;

        setCancelling(true);
        try {
            await orderService.updateOrderStatus(order._id, 'CANCELLED', '', reasonText);
            toast.success('Đã hủy đơn hàng thành công!');
            onCancelSuccess();
            onHide();
            // Reset form
            setSelectedReason('');
            setCustomReason('');
        } catch (error) {
            console.error('Error cancelling order:', error);
            toast.error(error.response?.data?.message || 'Không thể hủy đơn hàng');
        } finally {
            setCancelling(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <ModalHeader closeButton>
                <Modal.Title>
                    <FaExclamationTriangle />
                    Hủy đơn hàng
                </Modal.Title>
            </ModalHeader>
            <Modal.Body>
                <WarningBox>
                    <FaExclamationTriangle />
                    <div>
                        <strong>Cảnh báo:</strong> Việc hủy đơn hàng sẽ ảnh hưởng đến uy tín shop của bạn. 
                        Tỷ lệ hủy đơn cao có thể dẫn đến giảm thứ hạng và hạn chế tài khoản.
                    </div>
                </WarningBox>

                <OrderInfo>
                    <div className="info-row">
                        <span className="label">Mã đơn hàng:</span>
                        <span className="value">#{order._id.slice(-8).toUpperCase()}</span>
                    </div>
                    <div className="info-row">
                        <span className="label">Khách hàng:</span>
                        <span className="value">{order.shippingAddress.recipientName}</span>
                    </div>
                    <div className="info-row">
                        <span className="label">Tổng tiền:</span>
                        <span className="value">{formatCurrency(order.finalAmount)}</span>
                    </div>
                    <div className="info-row">
                        <span className="label">Trạng thái:</span>
                        <span className="value">{order.status}</span>
                    </div>
                </OrderInfo>

                <Form.Group style={{ marginBottom: '1rem' }}>
                    <Form.Label style={{ fontWeight: '600', marginBottom: '1rem' }}>
                        Vui lòng chọn lý do hủy đơn: <span style={{ color: 'red' }}>*</span>
                    </Form.Label>
                    
                    {CANCEL_REASONS.map(reason => (
                        <ReasonOption
                            key={reason.id}
                            selected={selectedReason === reason.id}
                            onClick={() => setSelectedReason(reason.id)}
                        >
                            <div className="reason-title">{reason.title}</div>
                            <p className="reason-desc">{reason.description}</p>
                        </ReasonOption>
                    ))}
                </Form.Group>

                {selectedReason === 'OTHER' && (
                    <Form.Group>
                        <Form.Label style={{ fontWeight: '600' }}>
                            Nhập lý do cụ thể: <span style={{ color: 'red' }}>*</span>
                        </Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            placeholder="Vui lòng mô tả chi tiết lý do hủy đơn..."
                            value={customReason}
                            onChange={(e) => setCustomReason(e.target.value)}
                            maxLength={500}
                        />
                        <Form.Text className="text-muted">
                            {customReason.length}/500 ký tự
                        </Form.Text>
                    </Form.Group>
                )}

                <ButtonGroup>
                    <Button variant="secondary" onClick={onHide} disabled={cancelling}>
                        Quay lại
                    </Button>
                    <CancelButton onClick={handleCancel} disabled={cancelling}>
                        {cancelling ? 'Đang xử lý...' : 'Xác nhận hủy đơn'}
                    </CancelButton>
                </ButtonGroup>
            </Modal.Body>
        </Modal>
    );
}

export default CancelOrderModal;

