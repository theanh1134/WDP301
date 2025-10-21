import React, { useState } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import productService from '../../services/productService';

const AddInventoryModal = ({ show, onHide, product, onSuccess }) => {
    const [formData, setFormData] = useState({
        quantity: '',
        costPrice: '',
        sellingPrice: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!formData.quantity || formData.quantity <= 0) {
            setError('Vui lòng nhập số lượng hợp lệ');
            return;
        }

        if (!formData.costPrice || formData.costPrice <= 0) {
            setError('Vui lòng nhập giá nhập hợp lệ');
            return;
        }

        if (!formData.sellingPrice || formData.sellingPrice <= 0) {
            setError('Vui lòng nhập giá bán hợp lệ');
            return;
        }

        // Check if selling price is higher than cost price
        if (parseFloat(formData.sellingPrice) <= parseFloat(formData.costPrice)) {
            setError('Giá bán phải lớn hơn giá nhập để có lợi nhuận');
            return;
        }

        try {
            setLoading(true);
            const response = await productService.addInventory(product._id, {
                quantity: parseInt(formData.quantity),
                costPrice: parseFloat(formData.costPrice),
                sellingPrice: parseFloat(formData.sellingPrice)
            });

            toast.success('Nhập hàng thành công!');
            
            // Reset form
            setFormData({
                quantity: '',
                costPrice: '',
                sellingPrice: ''
            });

            // Call success callback
            if (onSuccess) {
                onSuccess(response.data);
            }

            // Close modal
            onHide();
        } catch (error) {
            console.error('Add inventory error:', error);
            setError(error.message || 'Có lỗi xảy ra khi nhập hàng');
            toast.error(error.message || 'Nhập hàng thất bại');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            quantity: '',
            costPrice: '',
            sellingPrice: ''
        });
        setError('');
        onHide();
    };

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Nhập thêm hàng</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {product && (
                    <div style={{ 
                        padding: '12px', 
                        backgroundColor: '#f8f9fa', 
                        borderRadius: '8px',
                        marginBottom: '20px'
                    }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                            {product.productName}
                        </div>
                        <div style={{ fontSize: '0.9rem', color: '#6c757d' }}>
                            <div>Giá bán hiện tại: {new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND'
                            }).format(product.sellingPrice)}</div>
                            <div>Tồn kho hiện tại: {product.quantity || 0} sản phẩm</div>
                        </div>
                    </div>
                )}

                {error && (
                    <Alert variant="danger" onClose={() => setError('')} dismissible>
                        {error}
                    </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>
                            Số lượng nhập <span style={{ color: 'red' }}>*</span>
                        </Form.Label>
                        <Form.Control
                            type="number"
                            name="quantity"
                            value={formData.quantity}
                            onChange={handleInputChange}
                            placeholder="Nhập số lượng"
                            min="1"
                            required
                        />
                        <Form.Text className="text-muted">
                            Số lượng sản phẩm nhập vào kho
                        </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>
                            Giá nhập <span style={{ color: 'red' }}>*</span>
                        </Form.Label>
                        <Form.Control
                            type="number"
                            name="costPrice"
                            value={formData.costPrice}
                            onChange={handleInputChange}
                            placeholder="Nhập giá vốn"
                            min="0"
                            step="1000"
                            required
                        />
                        <Form.Text className="text-muted">
                            Giá nhập của lô hàng này
                        </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>
                            Giá bán <span style={{ color: 'red' }}>*</span>
                        </Form.Label>
                        <Form.Control
                            type="number"
                            name="sellingPrice"
                            value={formData.sellingPrice}
                            onChange={handleInputChange}
                            placeholder="Nhập giá bán cho lô hàng này"
                            min="0"
                            step="1000"
                            required
                        />
                        <Form.Text className="text-muted">
                            Giá bán của lô hàng này (có thể khác với lô cũ nếu giá nhập thay đổi)
                        </Form.Text>
                        {product?.sellingPrice && (
                            <Form.Text style={{ display: 'block', marginTop: '4px', color: '#6c757d' }}>
                                💡 Giá bán hiện tại của sản phẩm: {new Intl.NumberFormat('vi-VN', {
                                    style: 'currency',
                                    currency: 'VND'
                                }).format(product.sellingPrice)}
                            </Form.Text>
                        )}
                    </Form.Group>

                    {formData.quantity && formData.costPrice && formData.sellingPrice && (
                        <div style={{
                            padding: '12px',
                            backgroundColor: '#e7f3ff',
                            borderRadius: '8px',
                            marginBottom: '16px'
                        }}>
                            <div style={{ fontSize: '0.9rem', color: '#0066cc', marginBottom: '8px' }}>
                                <strong>Tổng giá trị nhập:</strong>{' '}
                                {new Intl.NumberFormat('vi-VN', {
                                    style: 'currency',
                                    currency: 'VND'
                                }).format(formData.quantity * formData.costPrice)}
                            </div>
                            <div style={{ fontSize: '0.9rem', color: '#28a745', marginBottom: '8px' }}>
                                <strong>Lợi nhuận/sản phẩm:</strong>{' '}
                                {new Intl.NumberFormat('vi-VN', {
                                    style: 'currency',
                                    currency: 'VND'
                                }).format(formData.sellingPrice - formData.costPrice)}
                                {' '}
                                ({((formData.sellingPrice - formData.costPrice) / formData.costPrice * 100).toFixed(1)}%)
                            </div>
                            <div style={{ fontSize: '0.9rem', color: '#17a2b8', fontWeight: 'bold' }}>
                                <strong>Tổng lợi nhuận dự kiến:</strong>{' '}
                                {new Intl.NumberFormat('vi-VN', {
                                    style: 'currency',
                                    currency: 'VND'
                                }).format((formData.sellingPrice - formData.costPrice) * formData.quantity)}
                            </div>
                        </div>
                    )}
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose} disabled={loading}>
                    Hủy
                </Button>
                <Button
                    variant="primary"
                    onClick={handleSubmit}
                    disabled={loading || !formData.quantity || !formData.costPrice || !formData.sellingPrice}
                >
                    {loading ? 'Đang xử lý...' : 'Nhập hàng'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default AddInventoryModal;

