import React, { useEffect, useState } from 'react';
import { Container, Card, Badge, Spinner, Alert } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { FaClipboardList, FaMoneyCheckAlt, FaTruck, FaBoxOpen, FaStar, FaExclamationCircle } from 'react-icons/fa';
import Header from './Header';
import orderService from '../services/orderService';
import { getImageUrl } from '../utils/imageHelper';

const steps = [
    { key: 'PENDING', label: 'Đơn hàng đã đặt', icon: <FaClipboardList /> },
    { key: 'CONFIRMED', label: 'Đã xác nhận thanh toán', icon: <FaMoneyCheckAlt /> },
    { key: 'SHIPPED', label: 'Đã giao cho ĐVVC', icon: <FaTruck /> },
    { key: 'DELIVERED', label: 'Đã nhận được hàng', icon: <FaBoxOpen /> },
    { key: 'PAID', label: 'Đơn hàng đã hoàn thành', icon: <FaStar /> }
];

function OrderStatus() {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [listReturn, setListReturn] = useState([])

    useEffect(() => {
        const load = async () => {
            try {
                const data = await orderService.getOrderById(id);
                setOrder(data._doc);
                setListReturn(data.returnedProductIds)
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    const isStepActive = (stepKey) => {
        if (!order) return false;
        const mapOrderToStep = {
            PENDING: 0,
            PROCESSING: 1,
            CONFIRMED: 1,
            SHIPPED: 2,
            DELIVERED: 3,
            CANCELLED: 0,
            REFUNDED: 4
        };
        const idx = mapOrderToStep[order.status] ?? 0;
        const stepIndex = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'PAID'].indexOf(stepKey);
        return stepIndex <= idx;
    };

    const statusBadge = () => {
        if (!order) return null;
        const labelMap = { PENDING: 'Đang xử lý', PROCESSING: 'Đang xử lý', CONFIRMED: 'Đã xác nhận', SHIPPED: 'Đang giao', DELIVERED: 'Đã giao', CANCELLED: 'Đã hủy', REFUNDED: 'Hoàn tiền' };
        const colorMap = { PENDING: 'warning', PROCESSING: 'warning', CONFIRMED: 'primary', SHIPPED: 'info', DELIVERED: 'success', CANCELLED: 'secondary', REFUNDED: 'secondary' };
        return <Badge bg={colorMap[order.status] || 'secondary'}>{labelMap[order.status] || order.status}</Badge>;
    };

    function isIdInList(list, id) {
        if (!Array.isArray(list)) return false;
        return list.some(item => String(item) === String(id));
    }

    return (
        <>
            <Header />
            <Container className="my-4">
                {loading ? (
                    <div className="text-center py-5"><Spinner animation="border" /></div>
                ) : !order ? (
                    <Card className="text-center p-4">Không tìm thấy đơn hàng</Card>
                ) : (
                    <>
                        <div className="d-flex align-items-center justify-content-between mb-3 p-3 text-white" style={{ background: 'linear-gradient(135deg, rgba(184,134,11,0.95), rgba(212,175,55,0.95))', borderRadius: 16 }}>
                            <div><strong>Mã đơn hàng:</strong> {order._id}</div>
                            <div>{statusBadge()}</div>
                        </div>

                        {/* Cancellation Reason Alert */}
                        {order.status === 'CANCELLED' && order.cancellationReason && (
                            <Alert variant="danger" className="mb-4" style={{ borderRadius: 16, border: 'none', boxShadow: '0 4px 12px rgba(220,53,69,0.15)' }}>
                                <div className="d-flex align-items-start gap-3">
                                    <FaExclamationCircle style={{ fontSize: '1.5rem', marginTop: '0.125rem' }} />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600, marginBottom: '0.5rem', fontSize: '1.05rem' }}>
                                            Đơn hàng đã bị hủy
                                        </div>
                                        <div style={{ fontSize: '0.95rem' }}>
                                            <strong>Lý do:</strong> {order.cancellationReason}
                                        </div>
                                        {order.cancelledBy && (
                                            <div style={{ fontSize: '0.85rem', marginTop: '0.25rem', color: '#721c24' }}>
                                                Hủy bởi: {order.cancelledBy === 'SELLER' ? 'Người bán' : order.cancelledBy === 'BUYER' ? 'Bạn' : 'Quản trị viên'}
                                            </div>
                                        )}
                                        {order.cancelledAt && (
                                            <div style={{ fontSize: '0.85rem', marginTop: '0.25rem', color: '#721c24' }}>
                                                Thời gian: {new Date(order.cancelledAt).toLocaleString('vi-VN')}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Alert>
                        )}

                        {/* timeline */}
                        <Card className="mb-4" style={{ border: 'none', borderRadius: 16, boxShadow: '0 10px 24px rgba(0,0,0,0.06)' }}>
                            <Card.Body>
                                <div className="d-flex justify-content-between flex-wrap" style={{ rowGap: 16 }}>
                                    {steps.map((s, i) => (
                                        <div key={s.key} className="text-center" style={{ flex: '1 1 18%' }}>
                                            <div className="mx-auto mb-2 d-flex align-items-center justify-content-center" style={{ width: 64, height: 64, borderRadius: '50%', border: `3px solid ${isStepActive(s.key) ? '#5ee6b1' : '#e9ecef'}`, color: isStepActive(s.key) ? '#5ee6b1' : '#adb5bd', fontSize: 28 }}>
                                                {s.icon}
                                            </div>
                                            <div style={{ color: isStepActive(s.key) ? '#2c3e50' : '#adb5bd', fontWeight: 600, fontSize: 14 }}>{s.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </Card.Body>
                        </Card>

                        {/* items */}
                        <Card style={{ border: 'none', borderRadius: 16, boxShadow: '0 10px 24px rgba(0,0,0,0.06)' }}>
                            <Card.Body>
                                {(order.items || []).map((it, idx) => (
                                    <div key={idx} className="d-flex align-items-center justify-content-between py-2" style={{ borderBottom: '1px solid #f1f3f5' }}>
                                        <div className="d-flex align-items-center" style={{ gap: 12 }}>
                                            {it.thumbnailUrl && <img src={getImageUrl(it.thumbnailUrl)} alt={it.productName} style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover', border: '1px solid #eee' }} />}
                                            <div>
                                                <div className="fw-semibold">{it.productName}</div>
                                                <div className="text-muted small">Mã sản phẩm: {String(it.productId).slice(-6)}</div>
                                                <div className="text-muted small">Đơn giá: {(it.priceAtPurchase || 0).toLocaleString()} VND</div>
                                                <div className="text-muted small">Số lượng: {it.quantity}</div>
                                            </div>
                                            <div>
                                                {isIdInList(listReturn, it.productId) && (<>
                                                    <span class="badge bg-success">Hoàn hàng</span>
                                                </>)}
                                            </div>
                                        </div>
                                        <div className="text-end">
                                            <div className="fw-semibold">{((it.priceAtPurchase || 0) * (it.quantity || 0)).toLocaleString()} VND</div>
                                            <div className="text-muted small">Tạm tính</div>
                                        </div>
                                    </div>
                                ))}

                                <div className="d-flex justify-content-end pt-3">
                                    <div className="text-end">
                                        <div className="text-muted">Tạm tính: {(order.subtotal || 0).toLocaleString()} VND</div>
                                        <div className="text-muted">Vận chuyển: {(order.shippingFee || 0).toLocaleString()} VND</div>
                                        <div className="fw-bold fs-5">Tổng: <span className="text-primary">{(order.finalAmount || 0).toLocaleString()} VND</span></div>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>

                        {/* shipping & payment blocks */}
                        <div className="row mt-3 g-3">
                            <div className="col-lg-6">
                                <Card style={{ border: 'none', borderRadius: 16, boxShadow: '0 10px 24px rgba(0,0,0,0.06)' }}>
                                    <Card.Body>
                                        <div className="fw-semibold mb-2">Thông tin giao hàng</div>
                                        <div className="text-muted small">Người nhận: {order.shippingAddress?.recipientName}</div>
                                        <div className="text-muted small">Số điện thoại: {order.shippingAddress?.phoneNumber}</div>
                                        <div className="text-muted small">Địa chỉ: {order.shippingAddress?.fullAddress}</div>
                                    </Card.Body>
                                </Card>
                            </div>
                            <div className="col-lg-6">
                                <Card style={{ border: 'none', borderRadius: 16, boxShadow: '0 10px 24px rgba(0,0,0,0.06)' }}>
                                    <Card.Body>
                                        <div className="fw-semibold mb-2">Thanh toán</div>
                                        <div className="text-muted small">Phương thức: {order.paymentInfo?.method}</div>
                                        <div className="text-muted small">Trạng thái: {order.paymentInfo?.status}</div>
                                        <div className="text-muted small">Mã giao dịch: {order.paymentInfo?.transactionId}</div>
                                    </Card.Body>
                                </Card>
                            </div>
                        </div>
                    </>
                )}
            </Container>
        </>
    );
}

export default OrderStatus;


