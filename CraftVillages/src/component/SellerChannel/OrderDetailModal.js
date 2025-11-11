import React, { useState } from 'react';
import { Modal, Button, Badge, Form, Row, Col, Table, Alert } from 'react-bootstrap';
import { FaBox, FaUser, FaMapMarkerAlt, FaCreditCard, FaTruck, FaCheckCircle, FaTimesCircle, FaBan, FaMoneyBillWave } from 'react-icons/fa';
import styled from 'styled-components';
import orderService from '../../services/orderService';
import { toast } from 'react-toastify';

const ModalHeader = styled(Modal.Header)`
    background: linear-gradient(135deg, #b8860b 0%, #d4af37 100%);
    color: white;
    border: none;
    
    .modal-title {
        font-weight: 700;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .btn-close {
        filter: brightness(0) invert(1);
    }
`;

const Section = styled.div`
    margin-bottom: 1.5rem;
    
    .section-title {
        font-size: 1rem;
        font-weight: 700;
        color: #333;
        margin-bottom: 1rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding-bottom: 0.5rem;
        border-bottom: 2px solid #f0f0f0;
    }
`;

const InfoRow = styled.div`
    display: flex;
    margin-bottom: 0.75rem;
    
    .label {
        font-weight: 600;
        color: #666;
        min-width: 140px;
    }
    
    .value {
        color: #333;
        flex: 1;
    }
`;

const ProductItem = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 8px;
    margin-bottom: 0.75rem;
    
    img {
        width: 60px;
        height: 60px;
        object-fit: cover;
        border-radius: 8px;
        border: 1px solid #ddd;
    }
    
    .product-info {
        flex: 1;
        
        .product-name {
            font-weight: 600;
            color: #333;
            margin-bottom: 0.25rem;
        }
        
        .product-price {
            color: #b8860b;
            font-weight: 600;
        }
    }
    
    .product-quantity {
        text-align: right;
        
        .quantity {
            font-size: 0.9rem;
            color: #666;
        }
        
        .subtotal {
            font-weight: 700;
            color: #333;
            font-size: 1rem;
        }
    }
`;

const StatusTimeline = styled.div`
    position: relative;
    padding-left: 2rem;
    
    .timeline-item {
        position: relative;
        padding-bottom: 1.5rem;
        
        &:last-child {
            padding-bottom: 0;
        }
        
        &::before {
            content: '';
            position: absolute;
            left: -1.5rem;
            top: 0.5rem;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: ${props => props.active ? '#28a745' : '#ddd'};
            border: 2px solid white;
            box-shadow: 0 0 0 2px ${props => props.active ? '#28a745' : '#ddd'};
        }
        
        &::after {
            content: '';
            position: absolute;
            left: -1.06rem;
            top: 1.25rem;
            width: 2px;
            height: calc(100% - 0.5rem);
            background: #ddd;
        }
        
        &:last-child::after {
            display: none;
        }
        
        .timeline-content {
            .timeline-title {
                font-weight: 600;
                color: ${props => props.active ? '#28a745' : '#999'};
                margin-bottom: 0.25rem;
            }
            
            .timeline-time {
                font-size: 0.8rem;
                color: #999;
            }
        }
    }
`;

const TotalSection = styled.div`
    background: #f8f9fa;
    padding: 1.25rem;
    border-radius: 8px;
    margin-top: 1rem;
    
    .total-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.75rem;
        
        &.final {
            font-size: 1.25rem;
            font-weight: 700;
            color: #b8860b;
            padding-top: 0.75rem;
            border-top: 2px solid #ddd;
            margin-top: 0.75rem;
        }
        
        .label {
            color: #666;
        }
        
        .value {
            font-weight: 600;
            color: #333;
        }
    }
`;

function OrderDetailModal({ show, onHide, order, onStatusUpdate, shopId }) {
    const [updating, setUpdating] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState('');

    if (!order) return null;

    // Filter items to only show products from this shop
    const shopItems = order.items || [];

    // Calculate totals for this shop only
    const shopSubtotal = shopItems.reduce((sum, item) =>
        sum + (item.priceAtPurchase * item.quantity), 0
    );

    // Calculate proportional shipping fee
    const totalOrderAmount = order.subtotal || 1;
    const shopShippingFee = totalOrderAmount > 0
        ? Math.round((shopSubtotal / totalOrderAmount) * (order.shippingFee || 0))
        : 0;

    const shopTotal = shopSubtotal + shopShippingFee;

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            'PENDING': { bg: 'warning', text: 'Chờ xác nhận' },
            'PROCESSING': { bg: 'info', text: 'Đang xử lý' },
            'CONFIRMED': { bg: 'primary', text: 'Đã xác nhận' },
            'SHIPPED': { bg: 'info', text: 'Đang giao' },
            'DELIVERED': { bg: 'success', text: 'Đã giao' },
            'CANCELLED': { bg: 'danger', text: 'Đã hủy' },
            'REFUNDED': { bg: 'secondary', text: 'Hoàn tiền' }
        };

        const config = statusConfig[status] || statusConfig['PENDING'];
        return <Badge bg={config.bg}>{config.text}</Badge>;
    };

    const getAvailableStatuses = (currentStatus) => {
        const transitions = {
            'PENDING': [
                { value: 'CONFIRMED', label: 'Đã xác nhận' }
            ],
            'PROCESSING': [
                { value: 'CONFIRMED', label: 'Đã xác nhận' }
            ],
            'CONFIRMED': [],
            'SHIPPED': [],
            'DELIVERED': [],
            'CANCELLED': [],
            'REFUNDED': []
        };

        return transitions[currentStatus] || [];
    };

    const handleUpdateStatus = async () => {
        if (!selectedStatus) {
            toast.warning('Vui lòng chọn trạng thái mới');
            return;
        }

        console.log('Updating order status:', {
            orderId: order._id,
            currentStatus: order.status,
            newStatus: selectedStatus
        });

        setUpdating(true);
        try {
            const response = await orderService.updateOrderStatus(order._id, selectedStatus);
            console.log('Update response:', response);
            toast.success('Cập nhật trạng thái đơn hàng thành công!');
            onStatusUpdate();
            onHide();
        } catch (error) {
            console.error('Error updating status:', error);
            console.error('Error response:', error.response?.data);
            toast.error(error.response?.data?.message || 'Không thể cập nhật trạng thái');
        } finally {
            setUpdating(false);
        }
    };

    const availableStatuses = getAvailableStatuses(order.status);

    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <ModalHeader closeButton>
                <Modal.Title>
                    <FaBox /> Chi tiết đơn hàng #{order._id.slice(-8).toUpperCase()}
                </Modal.Title>
            </ModalHeader>
            <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                {/* Order Status */}
                <Section>
                    <div className="section-title">
                        <FaTruck /> Trạng thái đơn hàng
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <div>
                            <div style={{ marginBottom: '0.5rem' }}>
                                Trạng thái hiện tại: {getStatusBadge(order.status)}
                            </div>
                            <div style={{ fontSize: '0.85rem', color: '#666' }}>
                                Ngày đặt: {formatDate(order.createdAt)}
                            </div>
                        </div>
                    </div>

                    {availableStatuses.length > 0 && (
                        <Alert variant="info" style={{ marginTop: '1rem' }}>
                            <Form.Group>
                                <Form.Label style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
                                    Cập nhật trạng thái
                                </Form.Label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <Form.Select
                                        value={selectedStatus}
                                        onChange={(e) => setSelectedStatus(e.target.value)}
                                        style={{ flex: 1 }}
                                    >
                                        <option value="">-- Chọn trạng thái mới --</option>
                                        {availableStatuses.map(status => (
                                            <option key={status.value} value={status.value}>
                                                {status.label}
                                            </option>
                                        ))}
                                    </Form.Select>
                                    <Button
                                        variant="primary"
                                        onClick={handleUpdateStatus}
                                        disabled={!selectedStatus || updating}
                                    >
                                        {updating ? 'Đang cập nhật...' : 'Cập nhật'}
                                    </Button>
                                </div>
                            </Form.Group>
                        </Alert>
                    )}


                </Section>

                {/* Customer Information */}
                <Section>
                    <div className="section-title">
                        <FaUser /> Thông tin khách hàng
                    </div>
                    <Row>
                        <Col md={6}>
                            <InfoRow>
                                <div className="label">Tên khách hàng:</div>
                                <div className="value">{order.buyerInfo.fullName}</div>
                            </InfoRow>
                        </Col>
                        <Col md={6}>
                            <InfoRow>
                                <div className="label">Số điện thoại:</div>
                                <div className="value">{order.shippingAddress.phoneNumber}</div>
                            </InfoRow>
                        </Col>
                    </Row>
                </Section>

                {/* Shipping Address */}
                <Section>
                    <div className="section-title">
                        <FaMapMarkerAlt /> Địa chỉ giao hàng
                    </div>
                    <InfoRow>
                        <div className="label">Người nhận:</div>
                        <div className="value">{order.shippingAddress.recipientName}</div>
                    </InfoRow>
                    <InfoRow>
                        <div className="label">Địa chỉ:</div>
                        <div className="value">{order.shippingAddress.fullAddress}</div>
                    </InfoRow>
                </Section>

                {/* Products */}
                <Section>
                    <div className="section-title">
                        <FaBox /> Sản phẩm của shop ({shopItems.length})
                    </div>
                    {shopItems.length === 0 ? (
                        <Alert variant="warning">
                            Đơn hàng này không có sản phẩm nào từ shop của bạn.
                        </Alert>
                    ) : (
                        shopItems.map((item, index) => (
                        <ProductItem key={index}>
                            <img
                                src={item.thumbnailUrl || '/placeholder.png'}
                                alt={item.productName}
                                onError={(e) => e.target.src = '/placeholder.png'}
                            />
                            <div className="product-info">
                                <div className="product-name">{item.productName}</div>
                                <div className="product-price">{formatCurrency(item.priceAtPurchase)}</div>
                            </div>
                            <div className="product-quantity">
                                <div className="quantity">x{item.quantity}</div>
                                <div className="subtotal">
                                    {formatCurrency(item.priceAtPurchase * item.quantity)}
                                </div>
                            </div>
                        </ProductItem>
                        ))
                    )}

                    {order.items.length > shopItems.length && (
                        <Alert variant="info" style={{ marginTop: '1rem', fontSize: '0.85rem' }}>
                            <strong>Lưu ý:</strong> Đơn hàng này có {order.items.length - shopItems.length} sản phẩm khác từ shop khác.
                            Bạn chỉ quản lý {shopItems.length} sản phẩm của shop mình.
                        </Alert>
                    )}
                </Section>

                {/* Payment Information */}
                <Section>
                    <div className="section-title">
                        <FaCreditCard /> Thông tin thanh toán
                    </div>
                    <InfoRow>
                        <div className="label">Phương thức:</div>
                        <div className="value">
                            <Badge bg="secondary">{order.paymentInfo.method}</Badge>
                        </div>
                    </InfoRow>
                    <InfoRow>
                        <div className="label">Trạng thái thanh toán:</div>
                        <div className="value">
                            <Badge bg={order.paymentInfo.status === 'PAID' ? 'success' : 'warning'}>
                                {order.paymentInfo.status}
                            </Badge>
                        </div>
                    </InfoRow>
                    {order.paymentInfo.paidAt && (
                        <InfoRow>
                            <div className="label">Thời gian thanh toán:</div>
                            <div className="value" style={{ color: '#27ae60', fontWeight: '500' }}>
                                {formatDate(order.paymentInfo.paidAt)}
                            </div>
                        </InfoRow>
                    )}
                    <InfoRow>
                        <div className="label">Mã giao dịch:</div>
                        <div className="value" style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                            {order.paymentInfo.transactionId}
                        </div>
                    </InfoRow>
                </Section>

                {/* Order Summary */}
                <Section>
                    <div className="section-title">
                        Tổng kết đơn hàng (Phần của shop)
                    </div>
                    <TotalSection>
                        <div className="total-row">
                            <div className="label">Tạm tính (sản phẩm của shop):</div>
                            <div className="value">{formatCurrency(shopSubtotal)}</div>
                        </div>
                        <div className="total-row">
                            <div className="label">Phí vận chuyển (chia tỷ lệ):</div>
                            <div className="value">{formatCurrency(shopShippingFee)}</div>
                        </div>
                        <div className="total-row final">
                            <div className="label">Tổng cộng (shop nhận):</div>
                            <div className="value">{formatCurrency(shopTotal)}</div>
                        </div>
                    </TotalSection>

                    {order.items.length > shopItems.length && (
                        <Alert variant="secondary" style={{ marginTop: '1rem', fontSize: '0.85rem' }}>
                            <div style={{ marginBottom: '0.5rem' }}>
                                <strong>Tổng đơn hàng gốc:</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                <span>Tổng tất cả sản phẩm:</span>
                                <strong>{formatCurrency(order.subtotal)}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                <span>Phí ship:</span>
                                <strong>{formatCurrency(order.shippingFee)}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid #ddd' }}>
                                <span>Tổng khách hàng trả:</span>
                                <strong style={{ color: '#b8860b' }}>{formatCurrency(order.finalAmount)}</strong>
                            </div>
                        </Alert>
                    )}
                </Section>

                {/* Seller Payment Information */}
                {order.sellerPayment && order.sellerPayment.isPaid && (
                    <Section>
                        <div className="section-title">
                            <FaMoneyBillWave /> Thông tin thanh toán cho Seller
                        </div>
                        <Alert variant="success" style={{ marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <FaCheckCircle style={{ color: '#27ae60' }} />
                                <strong>Đã thanh toán cho seller</strong>
                            </div>
                            {order.sellerPayment.paidAt && (
                                <div style={{ fontSize: '0.85rem', color: '#666' }}>
                                    Thời gian: {formatDate(order.sellerPayment.paidAt)}
                                </div>
                            )}
                        </Alert>
                        <InfoRow>
                            <div className="label">Tổng tiền đơn hàng:</div>
                            <div className="value">{formatCurrency(order.finalAmount)}</div>
                        </InfoRow>
                        <InfoRow>
                            <div className="label">Phí sàn ({order.sellerPayment.platformFeeRate}%):</div>
                            <div className="value" style={{ color: '#e74c3c' }}>
                                - {formatCurrency(order.sellerPayment.platformFee)}
                            </div>
                        </InfoRow>
                        <InfoRow style={{ borderTop: '2px solid #dee2e6', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
                            <div className="label" style={{ fontWeight: '600', fontSize: '1rem' }}>Seller thực nhận:</div>
                            <div className="value" style={{ fontWeight: '700', fontSize: '1.1rem', color: '#27ae60' }}>
                                {formatCurrency(order.sellerPayment.netAmount)}
                            </div>
                        </InfoRow>
                        {order.sellerPayment.transactionId && (
                            <InfoRow>
                                <div className="label">Mã giao dịch seller:</div>
                                <div className="value" style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#667eea' }}>
                                    {order.sellerPayment.transactionId}
                                </div>
                            </InfoRow>
                        )}
                    </Section>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Đóng
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default OrderDetailModal;

