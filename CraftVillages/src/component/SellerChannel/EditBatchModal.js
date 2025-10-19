import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import styled from 'styled-components';
import { toast } from 'react-toastify';

const StyledModal = styled(Modal)`
    .modal-content {
        border-radius: 12px;
        border: none;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    }

    .modal-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-radius: 12px 12px 0 0;
        border: none;
        padding: 1.5rem;
    }

    .modal-title {
        font-weight: 600;
        font-size: 1.25rem;
    }

    .btn-close {
        filter: brightness(0) invert(1);
    }
`;

const InfoBox = styled.div`
    background: #f8f9fa;
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 20px;
    border-left: 4px solid #667eea;
`;

const ProfitDisplay = styled.div`
    background: ${props => props.profit > 0 ? '#d4edda' : '#f8d7da'};
    color: ${props => props.profit > 0 ? '#155724' : '#721c24'};
    padding: 15px;
    border-radius: 8px;
    margin-top: 15px;
    border: 1px solid ${props => props.profit > 0 ? '#c3e6cb' : '#f5c6cb'};
    
    .profit-title {
        font-size: 0.9rem;
        margin-bottom: 8px;
        opacity: 0.8;
    }
    
    .profit-value {
        font-size: 1.5rem;
        font-weight: bold;
        margin-bottom: 5px;
    }
    
    .profit-percent {
        font-size: 1rem;
        opacity: 0.9;
    }
`;

function EditBatchModal({ show, onHide, batch, productId, onSuccess }) {
    const [formData, setFormData] = useState({
        costPrice: '',
        sellingPrice: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (batch) {
            setFormData({
                costPrice: batch.costPrice || '',
                sellingPrice: batch.sellingPrice || ''
            });
        }
    }, [batch]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError('');
    };

    const calculateProfit = () => {
        const cost = parseFloat(formData.costPrice) || 0;
        const selling = parseFloat(formData.sellingPrice) || 0;
        const profit = selling - cost;
        const profitPercent = cost > 0 ? ((profit / cost) * 100).toFixed(1) : 0;
        return { profit, profitPercent };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!formData.costPrice || formData.costPrice <= 0) {
            setError('Vui lòng nhập giá nhập hợp lệ');
            return;
        }

        if (!formData.sellingPrice || formData.sellingPrice <= 0) {
            setError('Vui lòng nhập giá bán hợp lệ');
            return;
        }

        if (parseFloat(formData.sellingPrice) <= parseFloat(formData.costPrice)) {
            setError('Giá bán phải lớn hơn giá nhập để có lợi nhuận');
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem('authToken'); // Fixed: Use 'authToken' instead of 'token'
            console.log('Token from localStorage:', token);
            console.log('Token type:', typeof token);
            console.log('Token length:', token?.length);

            // Check if token is valid
            if (!token || token === 'undefined' || token === 'null') {
                toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
                setLoading(false);
                return;
            }

            const response = await fetch(
                `http://localhost:9999/products/${productId}/batches/${batch._id}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        costPrice: parseFloat(formData.costPrice),
                        sellingPrice: parseFloat(formData.sellingPrice)
                    })
                }
            );

            const data = await response.json();

            if (response.ok && data.success) {
                onSuccess(data);
                onHide();
            } else {
                setError(data.message || 'Có lỗi xảy ra khi cập nhật lô hàng');
            }
        } catch (err) {
            console.error('Update batch error:', err);
            setError('Không thể kết nối đến server');
        } finally {
            setLoading(false);
        }
    };

    if (!batch) return null;

    const { profit, profitPercent } = calculateProfit();

    return (
        <StyledModal show={show} onHide={onHide} centered size="md">
            <Modal.Header closeButton>
                <Modal.Title>✏️ Sửa thông tin lô hàng</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}

                <InfoBox>
                    <div style={{ fontSize: '0.9rem', color: '#666' }}>
                        <div><strong>Số lượng nhập:</strong> {batch.quantityReceived}</div>
                        <div><strong>Còn lại:</strong> {batch.quantityRemaining}</div>
                        <div><strong>Ngày nhập:</strong> {new Date(batch.receivedDate).toLocaleDateString('vi-VN')}</div>
                    </div>
                </InfoBox>

                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>
                            Giá nhập <span style={{ color: 'red' }}>*</span>
                        </Form.Label>
                        <Form.Control
                            type="number"
                            name="costPrice"
                            value={formData.costPrice}
                            onChange={handleChange}
                            placeholder="Nhập giá nhập"
                            min="0"
                            step="1000"
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>
                            Giá bán <span style={{ color: 'red' }}>*</span>
                        </Form.Label>
                        <Form.Control
                            type="number"
                            name="sellingPrice"
                            value={formData.sellingPrice}
                            onChange={handleChange}
                            placeholder="Nhập giá bán"
                            min="0"
                            step="1000"
                            required
                        />
                    </Form.Group>

                    {formData.costPrice && formData.sellingPrice && (
                        <ProfitDisplay profit={profit}>
                            <div className="profit-title">Lợi nhuận dự kiến</div>
                            <div className="profit-value">
                                {new Intl.NumberFormat('vi-VN', {
                                    style: 'currency',
                                    currency: 'VND'
                                }).format(profit)}
                            </div>
                            <div className="profit-percent">
                                {profit > 0 ? '📈' : '📉'} {profitPercent}% lợi nhuận
                            </div>
                        </ProfitDisplay>
                    )}
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide} disabled={loading}>
                    Hủy
                </Button>
                <Button 
                    variant="primary" 
                    onClick={handleSubmit}
                    disabled={loading || !formData.costPrice || !formData.sellingPrice}
                >
                    {loading ? 'Đang cập nhật...' : 'Cập nhật'}
                </Button>
            </Modal.Footer>
        </StyledModal>
    );
}

export default EditBatchModal;

