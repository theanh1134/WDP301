import React from 'react';
import { Modal, Badge, Table, Image } from 'react-bootstrap';
import { FaBox, FaUser, FaCalendar, FaMoneyBillWave, FaImage, FaCheckCircle, FaClock, FaTimes } from 'react-icons/fa';
import styled from 'styled-components';

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

const InfoSection = styled.div`
    margin-bottom: 1.5rem;
    
    .section-title {
        font-size: 0.9rem;
        font-weight: 700;
        color: #666;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 1rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        
        svg {
            color: #b8860b;
        }
    }
    
    .info-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
        background: #f8f9fa;
        padding: 1rem;
        border-radius: 8px;
    }
    
    .info-item {
        .label {
            font-size: 0.8rem;
            color: #666;
            margin-bottom: 0.25rem;
        }
        
        .value {
            font-size: 0.95rem;
            font-weight: 600;
            color: #333;
        }
    }
`;

const ProductList = styled.div`
    .product-item {
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
            
            .product-meta {
                font-size: 0.85rem;
                color: #666;
            }
        }
        
        .product-price {
            text-align: right;
            
            .price {
                font-weight: 700;
                color: #b8860b;
                font-size: 1rem;
            }
            
            .quantity {
                font-size: 0.85rem;
                color: #666;
            }
        }
    }
`;

const EvidenceGallery = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 0.75rem;
    margin-top: 1rem;
    
    .evidence-item {
        position: relative;
        border-radius: 8px;
        overflow: hidden;
        border: 2px solid #ddd;
        cursor: pointer;
        transition: transform 0.2s;
        
        &:hover {
            transform: scale(1.05);
            border-color: #b8860b;
        }
        
        img {
            width: 100%;
            height: 120px;
            object-fit: cover;
        }
    }
`;

const ReasonBox = styled.div`
    background: #fff3cd;
    border: 1px solid #ffc107;
    border-radius: 8px;
    padding: 1rem;
    margin-top: 1rem;
    
    .reason-title {
        font-weight: 700;
        color: #856404;
        margin-bottom: 0.5rem;
        font-size: 0.9rem;
    }
    
    .reason-text {
        color: #856404;
        font-size: 0.9rem;
        line-height: 1.5;
    }
`;

function ReturnDetailModal({ show, onHide, returnRequest }) {
    if (!returnRequest) return null;

    const getStatusBadge = (status) => {
        const statusConfig = {
            'REQUESTED': { bg: 'warning', text: 'Chờ duyệt', icon: <FaClock /> },
            'APPROVED': { bg: 'info', text: 'Đã duyệt', icon: <FaCheckCircle /> },
            'REJECTED': { bg: 'danger', text: 'Từ chối', icon: <FaTimes /> },
            'SHIPPED': { bg: 'primary', text: 'Đang gửi trả', icon: <FaBox /> },
            'RETURNED': { bg: 'success', text: 'Đã nhận hàng', icon: <FaCheckCircle /> },
            'REFUNDED': { bg: 'success', text: 'Đã hoàn tiền', icon: <FaMoneyBillWave /> },
            'COMPLETED': { bg: 'success', text: 'Hoàn tất', icon: <FaCheckCircle /> },
            'CANCELLED': { bg: 'secondary', text: 'Đã hủy', icon: <FaTimes /> }
        };

        const config = statusConfig[status] || statusConfig['REQUESTED'];
        return (
            <Badge bg={config.bg} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', width: 'fit-content' }}>
                {config.icon} {config.text}
            </Badge>
        );
    };

    const getReasonText = (reasonCode) => {
        const reasons = {
            'DAMAGED_ITEM': 'Sản phẩm bị hư hỏng',
            'NOT_AS_DESCRIBED': 'Không đúng mô tả',
            'WRONG_ITEM': 'Gửi sai sản phẩm',
            'OTHER': 'Lý do khác'
        };
        return reasons[reasonCode] || reasonCode;
    };

    const getResolutionText = (resolution) => {
        const resolutions = {
            'REFUND': 'Hoàn tiền',
            'REPLACE': 'Đổi hàng',
            'REPAIR': 'Sửa chữa'
        };
        return resolutions[resolution] || resolution;
    };

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

    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <ModalHeader closeButton>
                <Modal.Title>
                    <FaBox /> Chi tiết yêu cầu hoàn hàng
                </Modal.Title>
            </ModalHeader>
            <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                {/* Basic Info */}
                <InfoSection>
                    <div className="section-title">
                        <FaBox /> Thông tin cơ bản
                    </div>
                    <div className="info-grid">
                        
                        <div className="info-item">
                            <div className="label">Mã đơn hàng</div>
                            <div className="value">#{returnRequest.orderId?._id?.slice(-8).toUpperCase() || 'N/A'}</div>
                        </div>
                        <div className="info-item">
                            <div className="label">Trạng thái</div>
                            <div className="value">{getStatusBadge(returnRequest.status)}</div>
                        </div>
                        <div className="info-item">
                            <div className="label">Ngày yêu cầu</div>
                            <div className="value">{formatDate(returnRequest.createdAt)}</div>
                        </div>
                    </div>
                </InfoSection>

                {/* Customer Info */}
                <InfoSection>
                    <div className="section-title">
                        <FaUser /> Thông tin khách hàng
                    </div>
                    <div className="info-grid">
                        <div className="info-item">
                            <div className="label">Tên khách hàng</div>
                            <div className="value">{returnRequest.buyerId?.fullName || 'N/A'}</div>
                        </div>
                        <div className="info-item">
                            <div className="label">Email</div>
                            <div className="value">{returnRequest.buyerId?.email || 'N/A'}</div>
                        </div>
                        <div className="info-item">
                            <div className="label">Số điện thoại</div>
                            <div className="value">{returnRequest.buyerId?.phoneNumber || 'N/A'}</div>
                        </div>
                    </div>
                </InfoSection>

                {/* Products */}
                <InfoSection>
                    <div className="section-title">
                        <FaBox /> Sản phẩm hoàn trả
                    </div>
                    <ProductList>
                        {returnRequest.items?.map((item, index) => (
                            <div key={index} className="product-item">
                                {(item.productId?.images?.[0]?.url || item.thumbnailUrl) ? (
                                    <img
                                        src={`http://localhost:9999${item.productId?.images?.[0]?.url || item.thumbnailUrl}`}
                                        alt={item.productName}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = 'https://via.placeholder.com/60?text=No+Image';
                                        }}
                                    />
                                ) : (
                                    <div style={{
                                        width: '60px',
                                        height: '60px',
                                        borderRadius: '8px',
                                        border: '1px solid #ddd',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: '#f0f0f0',
                                        color: '#999',
                                        fontSize: '0.7rem',
                                        textAlign: 'center'
                                    }}>
                                        No Image
                                    </div>
                                )}
                                <div className="product-info">
                                    <div className="product-name">{item.productName}</div>
                                    <div className="product-meta">Số lượng: {item.quantity}</div>
                                </div>
                                <div className="product-price">
                                    <div className="price">{formatCurrency(item.unitPrice)}</div>
                                    <div className="quantity">x{item.quantity}</div>
                                </div>
                            </div>
                        ))}
                    </ProductList>
                </InfoSection>

                {/* Reason & Resolution */}
                <InfoSection>
                    <div className="section-title">
                        Lý do & Giải pháp
                    </div>
                    <div className="info-grid">
                        <div className="info-item">
                            <div className="label">Lý do hoàn hàng</div>
                            <div className="value">{getReasonText(returnRequest.reasonCode)}</div>
                        </div>
                        <div className="info-item">
                            <div className="label">Yêu cầu giải quyết</div>
                            <div className="value">{getResolutionText(returnRequest.requestedResolution)}</div>
                        </div>
                    </div>
                    {returnRequest.reasonDetail && (
                        <ReasonBox>
                            <div className="reason-title">Chi tiết lý do:</div>
                            <div className="reason-text">{returnRequest.reasonDetail}</div>
                        </ReasonBox>
                    )}
                </InfoSection>

                {/* Evidence Images */}
                {returnRequest.evidences && returnRequest.evidences.length > 0 && (
                    <InfoSection>
                        <div className="section-title">
                            <FaImage /> Hình ảnh minh chứng
                        </div>
                        <EvidenceGallery>
                            {returnRequest.evidences.map((evidence, index) => (
                                <div key={index} className="evidence-item">
                                    <img 
                                        src={`http://localhost:9999${evidence.url}`} 
                                        alt={`Evidence ${index + 1}`}
                                        onError={(e) => e.target.src = '/placeholder.png'}
                                    />
                                </div>
                            ))}
                        </EvidenceGallery>
                    </InfoSection>
                )}

                {/* Amount Info */}
                <InfoSection>
                    <div className="section-title">
                        <FaMoneyBillWave /> Thông tin hoàn tiền
                    </div>
                    <div className="info-grid">
                        <div className="info-item">
                            <div className="label">Tổng tiền sản phẩm</div>
                            <div className="value">{formatCurrency(returnRequest.amounts?.subtotal || 0)}</div>
                        </div>
                        <div className="info-item">
                            <div className="label">Phí vận chuyển</div>
                            <div className="value">{formatCurrency(returnRequest.amounts?.shippingFee || 0)}</div>
                        </div>
                        <div className="info-item">
                            <div className="label">Phí tái kho</div>
                            <div className="value">{formatCurrency(returnRequest.amounts?.restockingFee || 0)}</div>
                        </div>
                        <div className="info-item">
                            <div className="label">Tổng hoàn trả</div>
                            <div className="value" style={{ color: '#28a745', fontSize: '1.1rem' }}>
                                {formatCurrency(returnRequest.amounts?.refundTotal || 0)}
                            </div>
                        </div>
                    </div>
                </InfoSection>
            </Modal.Body>
        </Modal>
    );
}

export default ReturnDetailModal;

