import React, { useEffect, useMemo, useState } from 'react';
import { Container, Card, Table, Badge, Spinner, Form, Modal, Button, Row, Col } from 'react-bootstrap';
import { FaSearch, FaReceipt, FaCalendarAlt, FaMoneyBillWave, FaTruck, FaCheckCircle, FaTimesCircle, FaClock, FaTrash, FaStar, FaEye } from 'react-icons/fa';
import Header from './Header';
import orderService from '../services/orderService';
import { toast } from 'react-toastify';

const StatusBadge = ({ status }) => {
    const map = { PENDING: 'warning', CONFIRMED: 'primary', PAID: 'success', CANCELLED: 'secondary' };
    const labelMap = { PENDING: 'Đang xử lý', CONFIRMED: 'Đã xác nhận', PAID: 'Đã thanh toán', CANCELLED: 'Đã hủy' };
    return <Badge bg={map[status] || 'secondary'}>{labelMap[status] || status}</Badge>;
};

function OrderHistory() {
    const user = useMemo(() => { try { return JSON.parse(localStorage.getItem('user')) || null; } catch { return null; } }, []);
    const [orders, setOrders] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);
    const [q, setQ] = useState('');
    const [status, setStatus] = useState('ALL');
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [cancelling, setCancelling] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [showViewReviewModal, setShowViewReviewModal] = useState(false);
    const [showEditReviewModal, setShowEditReviewModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [userReview, setUserReview] = useState(null);
    const [reviewData, setReviewData] = useState({
        rating: 5,
        title: '',
        content: '',
        images: []
    });
    const [submittingReview, setSubmittingReview] = useState(false);
    const [updatingReview, setUpdatingReview] = useState(false);
    const [deletingReview, setDeletingReview] = useState(false);
    const [orderReviews, setOrderReviews] = useState({}); // Lưu trữ review của từng order

    useEffect(() => {
        const load = async () => {
            try {
                const list = await orderService.getOrdersByUser(user?._id || user?.id);
                setOrders(list);
                setFiltered(list);

                // Load reviews cho các order PAID
                const reviews = {};
                for (const order of list) {
                    if (canReviewProduct(order)) {
                        try {
                            const review = await orderService.getUserReview(order._id);
                            reviews[order._id] = review;
                        } catch (error) {
                            // Không có review cho order này
                            console.log(`No review found for order ${order._id}`);
                        }
                    }
                }
                setOrderReviews(reviews);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [user]);

    useEffect(() => {
        let list = [...orders];
        if (status !== 'ALL') list = list.filter(o => (o.status || o.paymentInfo?.status) === status);
        if (q.trim()) list = list.filter(o => o._id.toLowerCase().includes(q.trim().toLowerCase()));
        setFiltered(list);
    }, [q, status, orders]);

    // Hàm kiểm tra có thể hủy đơn hàng không
    const canCancelOrder = (order) => {
        const orderStatus = order.status || order.paymentInfo?.status;
        return orderStatus === 'PENDING';
    };

    // Hàm xử lý hủy đơn hàng
    const handleCancelOrder = (order) => {
        const orderStatus = order.status || order.paymentInfo?.status;

        if (orderStatus === 'CONFIRMED' || orderStatus === 'PAID') {
            toast.warning('Đơn hàng của quý khách đang trong quá trình vận chuyển, không thể hủy đơn hàng lúc này');
            return;
        }

        if (orderStatus === 'CANCELLED') {
            toast.info('Đơn hàng này đã được hủy trước đó');
            return;
        }

        setSelectedOrder(order);
        setShowCancelModal(true);
    };

    // Hàm xác nhận hủy đơn hàng
    const confirmCancelOrder = async () => {
        if (!selectedOrder) return;

        setCancelling(true);
        try {
            // Gọi API hủy đơn hàng
            await orderService.cancelOrder(selectedOrder._id);

            // Cập nhật state local
            setOrders(prev => prev.map(order =>
                order._id === selectedOrder._id
                    ? { ...order, status: 'CANCELLED' }
                    : order
            ));

            toast.success('Đã hủy đơn hàng thành công');
            setShowCancelModal(false);
            setSelectedOrder(null);
        } catch (error) {
            console.error('Error cancelling order:', error);
            toast.error('Có lỗi xảy ra khi hủy đơn hàng. Vui lòng thử lại.');
        } finally {
            setCancelling(false);
        }
    };

    // Hàm kiểm tra có thể đánh giá không
    const canReviewProduct = (order) => {
        const orderStatus = order.status || order.paymentInfo?.status;
        return orderStatus === 'PAID';
    };

    // Hàm kiểm tra đã có review chưa
    const hasReview = (orderId) => {
        return orderReviews[orderId] !== undefined;
    };

    // Hàm lấy review của order
    const getOrderReview = (orderId) => {
        return orderReviews[orderId];
    };

    // Hàm mở modal xem review
    const handleViewReview = (orderId) => {
        const review = getOrderReview(orderId);
        if (review) {
            setUserReview(review);
            setShowViewReviewModal(true);
        }
    };

    // Hàm mở modal đánh giá
    const handleReviewProduct = (product, order) => {
        console.log('Product data:', product); // Debug
        console.log('Order data:', order); // Debug

        if (!product.productId) {
            toast.error('Không tìm thấy thông tin sản phẩm');
            return;
        }

        setSelectedProduct({ ...product, orderId: order._id });
        setReviewData({
            rating: 5,
            title: '',
            content: '',
            images: []
        });
        setShowReviewModal(true);
    };

    // Hàm gửi đánh giá
    const submitReview = async () => {
        if (!selectedProduct || !reviewData.title.trim() || !reviewData.content.trim()) {
            toast.warning('Vui lòng điền đầy đủ thông tin đánh giá');
            return;
        }

        setSubmittingReview(true);
        try {
            // Gọi API gửi đánh giá
            await orderService.submitReview({
                productId: selectedProduct.productId,
                orderId: selectedProduct.orderId,
                rating: reviewData.rating,
                title: reviewData.title,
                content: reviewData.content,
                images: reviewData.images
            });

            toast.success('Đánh giá đã được gửi thành công!');
            setShowReviewModal(false);

            // Lấy đánh giá vừa tạo để hiển thị
            try {
                const newReview = await orderService.getUserReview(selectedProduct.orderId);
                setUserReview(newReview);
                setShowViewReviewModal(true);

                // Cập nhật orderReviews để nút "Đánh giá" chuyển thành "Xem đánh giá"
                setOrderReviews(prev => ({
                    ...prev,
                    [selectedProduct.orderId]: newReview
                }));
            } catch (error) {
                console.error('Error fetching new review:', error);
            }

            setSelectedProduct(null);

            // Reset form
            setReviewData({
                rating: 5,
                title: '',
                content: '',
                images: []
            });
        } catch (error) {
            console.error('Error submitting review:', error);

            // Hiển thị lỗi chi tiết hơn
            const errorMessage = error.response?.data?.message ||
                error.response?.data?.error ||
                'Có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại.';
            toast.error(errorMessage);
        } finally {
            setSubmittingReview(false);
        }
    };

    // Hàm mở modal chỉnh sửa đánh giá
    const handleEditReview = (review) => {
        setUserReview(review);
        setReviewData({
            rating: review.rating,
            title: review.title,
            content: review.content,
            images: []
        });
        setShowEditReviewModal(true);
    };

    // Hàm cập nhật đánh giá
    const updateReview = async () => {
        if (!userReview || !reviewData.title.trim() || !reviewData.content.trim()) {
            toast.warning('Vui lòng điền đầy đủ thông tin đánh giá');
            return;
        }

        setUpdatingReview(true);
        try {
            await orderService.updateReview(userReview._id, {
                rating: reviewData.rating,
                title: reviewData.title,
                content: reviewData.content
            });

            toast.success('Đánh giá đã được cập nhật thành công!');
            setShowEditReviewModal(false);

            // Cập nhật orderReviews với review đã chỉnh sửa
            setOrderReviews(prev => ({
                ...prev,
                [userReview.orderId]: { ...userReview, ...reviewData, editCount: 1, canEdit: false }
            }));

            setUserReview(null);

            // Reset form
            setReviewData({
                rating: 5,
                title: '',
                content: '',
                images: []
            });
        } catch (error) {
            console.error('Error updating review:', error);
            const errorMessage = error.response?.data?.message ||
                error.response?.data?.error ||
                'Có lỗi xảy ra khi cập nhật đánh giá. Vui lòng thử lại.';
            toast.error(errorMessage);
        } finally {
            setUpdatingReview(false);
        }
    };

    // Hàm xóa đánh giá
    const handleDeleteReview = async (review) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) {
            return;
        }

        setDeletingReview(true);
        try {
            await orderService.deleteReview(review._id);
            toast.success('Đánh giá đã được xóa thành công!');
            setShowViewReviewModal(false);

            // Xóa review khỏi orderReviews
            setOrderReviews(prev => {
                const newReviews = { ...prev };
                delete newReviews[review.orderId];
                return newReviews;
            });

            setUserReview(null);
        } catch (error) {
            console.error('Error deleting review:', error);
            const errorMessage = error.response?.data?.message ||
                error.response?.data?.error ||
                'Có lỗi xảy ra khi xóa đánh giá. Vui lòng thử lại.';
            toast.error(errorMessage);
        } finally {
            setDeletingReview(false);
        }
    };

    const styles = {
        tab: (active) => ({
            padding: '10px 18px',
            borderRadius: 24,
            border: active ? '1px solid #d4af37' : '1px solid #eee',
            background: active ? 'rgba(212,175,55,0.1)' : '#fff',
            color: active ? '#b8860b' : '#666',
            fontWeight: 600,
            cursor: 'pointer'
        }),
        orderCard: {
            border: '1px solid #eee',
            borderRadius: 12,
            boxShadow: '0 8px 18px rgba(0,0,0,0.05)'
        },
        orderHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '14px 18px',
            borderBottom: '1px dashed #eee',
            background: '#fff'
        },
        itemRow: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 16,
            padding: '10px 0',
            borderBottom: '1px solid #f6f6f6'
        },
        thumb: {
            width: 56,
            height: 56,
            borderRadius: 6,
            objectFit: 'cover',
            background: '#f8f8f8',
            border: '1px solid #eee'
        },
        footer: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: 12
        }
    };

    return (
        <>
            <Header />
            <Container className="my-4">
                <div className="mb-3 p-4 text-white" style={{ background: 'linear-gradient(135deg, rgba(184,134,11,0.95), rgba(212,175,55,0.95))', borderRadius: 16 }}>
                    <h2 className="m-0">Đơn hàng của tôi</h2>
                    <div className="opacity-75">Theo dõi lịch sử và trạng thái đơn hàng</div>
                </div>

                {/* Tabs giống ảnh tham chiếu nhưng theo màu dự án */}
                <div className="d-flex flex-wrap mb-3" style={{ gap: 8 }}>
                    {[
                        { key: 'ALL', label: 'Tất cả', icon: <FaReceipt className="me-1" /> },
                        { key: 'PENDING', label: 'Chờ xác nhận', icon: <FaClock className="me-1" /> },
                        { key: 'CONFIRMED', label: 'Vận chuyển', icon: <FaTruck className="me-1" /> },
                        { key: 'PAID', label: 'Hoàn thành', icon: <FaCheckCircle className="me-1" /> },
                        { key: 'CANCELLED', label: 'Đã hủy', icon: <FaTimesCircle className="me-1" /> },
                    ].map(t => (
                        <button key={t.key} className="btn btn-sm" style={styles.tab(status === t.key)} onClick={() => setStatus(t.key)}>{t.icon}{t.label}</button>
                    ))}
                    <div className="ms-auto d-flex align-items-center" style={{ gap: 8 }}>
                        <FaSearch className="text-muted" />
                        <Form.Control size="sm" style={{ minWidth: 220 }} placeholder="Tìm theo mã đơn" value={q} onChange={(e) => setQ(e.target.value)} />
                    </div>
                </div>

                {loading ? (
                    <Card className="text-center py-5" style={styles.orderCard}><Spinner animation="border" /></Card>
                ) : filtered.length === 0 ? (
                    <Card className="text-center py-4 text-muted" style={styles.orderCard}>Bạn chưa có đơn hàng nào</Card>
                ) : (
                    filtered.map(o => (
                        <Card key={o._id} className="mb-3" style={styles.orderCard}>
                            <div style={styles.orderHeader}>
                                <div className="d-flex align-items-center" style={{ gap: 10 }}>
                                    <strong>#{o._id.slice(-6)}</strong>
                                    <span className="text-muted small">{new Date(o.createdAt).toLocaleString('vi-VN')}</span>
                                </div>
                                <StatusBadge status={o.status || o.paymentInfo?.status} />
                            </div>
                            <Card.Body>
                                {(o.items || []).map((it, idx) => (
                                    <div key={idx} style={styles.itemRow}>
                                        <div className="d-flex align-items-center" style={{ gap: 12 }}>
                                            {it.thumbnailUrl ? (
                                                <img src={it.thumbnailUrl} alt={it.productName} style={styles.thumb} />
                                            ) : (
                                                <div style={{ ...styles.thumb, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb', fontSize: 12 }}>No Image</div>
                                            )}
                                            <div>
                                                <div className="fw-semibold">{it.productName}</div>
                                                <div className="text-muted small">x {it.quantity}</div>
                                            </div>
                                        </div>
                                        <div className="text-end">{(it.priceAtPurchase || it.priceAtAdd || 0).toLocaleString()} VND</div>
                                    </div>
                                ))}

                                <div style={styles.footer}>
                                    <div className="text-muted small">Thanh toán: <span className="d-inline-flex align-items-center"><FaMoneyBillWave className="me-1" />{o.paymentInfo?.method || 'COD'}</span></div>
                                    <div>
                                        <span className="me-2">Thành tiền:</span>
                                        <strong className="text-primary">{(o.finalAmount || 0).toLocaleString()} VND</strong>
                                    </div>
                                </div>

                                <div className="text-end mt-3">
                                    <a href={`/orders/${o._id}`} className="btn btn-outline-primary btn-sm">Xem chi tiết</a>
                                    {o.items && o.items.length > 0 && (
                                        <a href={`/products/${o.items[0].productId}`} className="btn btn-warning btn-sm ms-2">Mua lại</a>
                                    )}
                                    {canCancelOrder(o) && (
                                        <button
                                            className="btn btn-outline-danger btn-sm ms-2"
                                            onClick={() => handleCancelOrder(o)}
                                        >
                                            <FaTrash className="me-1" />
                                            Hủy đơn
                                        </button>
                                    )}
                                    {canReviewProduct(o) && (
                                        hasReview(o._id) ? (
                                            <button
                                                className="btn btn-outline-info btn-sm ms-2"
                                                onClick={() => handleViewReview(o._id)}
                                            >
                                                <FaEye className="me-1" />
                                                Xem đánh giá
                                            </button>
                                        ) : (
                                            <button
                                                className="btn btn-outline-success btn-sm ms-2"
                                                onClick={() => handleReviewProduct(o.items[0], o)}
                                            >
                                                <FaStar className="me-1" />
                                                Đánh giá
                                            </button>
                                        )
                                    )}
                                </div>
                            </Card.Body>
                        </Card>
                    ))
                )}

                {/* Modal xác nhận hủy đơn hàng */}
                <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Xác nhận hủy đơn hàng</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>Bạn có chắc chắn muốn hủy đơn hàng <strong>#{selectedOrder?._id?.slice(-6)}</strong>?</p>
                        <p className="text-muted small">
                            Sau khi hủy, đơn hàng sẽ không thể khôi phục và bạn sẽ nhận được hoàn tiền theo chính sách của chúng tôi.
                        </p>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
                            Hủy bỏ
                        </Button>
                        <Button
                            variant="danger"
                            onClick={confirmCancelOrder}
                            disabled={cancelling}
                        >
                            {cancelling ? (
                                <>
                                    <Spinner animation="border" size="sm" className="me-2" />
                                    Đang xử lý...
                                </>
                            ) : (
                                'Xác nhận hủy'
                            )}
                        </Button>
                    </Modal.Footer>
                </Modal>

                {/* Modal đánh giá sản phẩm */}
                <Modal show={showReviewModal} onHide={() => setShowReviewModal(false)} size="lg" centered>
                    <Modal.Header closeButton style={{ borderBottom: '1px solid #e9ecef' }}>
                        <Modal.Title className="d-flex align-items-center">
                            <FaStar className="me-2 text-warning" />
                            Đánh giá sản phẩm
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body style={{ padding: '30px' }}>
                        {selectedProduct && (
                            <>
                                {/* Thông tin sản phẩm */}
                                <div className="d-flex align-items-center mb-4 p-3" style={{ backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                                    {selectedProduct.thumbnailUrl && (
                                        <img
                                            src={selectedProduct.thumbnailUrl}
                                            alt={selectedProduct.productName}
                                            style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px', marginRight: '15px' }}
                                        />
                                    )}
                                    <div>
                                        <h6 className="mb-1">{selectedProduct.productName}</h6>
                                        <small className="text-muted">Đơn hàng #{selectedProduct.orderId?.slice(-6)}</small>
                                    </div>
                                </div>

                                {/* Đánh giá sao */}
                                <div className="mb-4">
                                    <label className="form-label fw-semibold">Đánh giá của bạn *</label>
                                    <div className="d-flex align-items-center">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                className="btn btn-link p-0 me-1"
                                                onClick={() => setReviewData(prev => ({ ...prev, rating: star }))}
                                                style={{ border: 'none', background: 'none' }}
                                            >
                                                <FaStar
                                                    size={24}
                                                    color={star <= reviewData.rating ? '#ffc107' : '#e9ecef'}
                                                />
                                            </button>
                                        ))}
                                        <span className="ms-2 text-muted">
                                            {reviewData.rating === 1 && 'Rất tệ'}
                                            {reviewData.rating === 2 && 'Tệ'}
                                            {reviewData.rating === 3 && 'Bình thường'}
                                            {reviewData.rating === 4 && 'Tốt'}
                                            {reviewData.rating === 5 && 'Rất tốt'}
                                        </span>
                                    </div>
                                </div>

                                {/* Tiêu đề đánh giá */}
                                <div className="mb-4">
                                    <label className="form-label fw-semibold">Tiêu đề đánh giá *</label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Ví dụ: Sản phẩm chất lượng tốt, đúng mô tả"
                                        value={reviewData.title}
                                        onChange={(e) => setReviewData(prev => ({ ...prev, title: e.target.value }))}
                                        maxLength={100}
                                    />
                                    <small className="text-muted">{reviewData.title.length}/100 ký tự</small>
                                </div>

                                {/* Nội dung đánh giá */}
                                <div className="mb-4">
                                    <label className="form-label fw-semibold">Nội dung đánh giá *</label>
                                    <Form.Control
                                        as="textarea"
                                        rows={4}
                                        placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                                        value={reviewData.content}
                                        onChange={(e) => setReviewData(prev => ({ ...prev, content: e.target.value }))}
                                        maxLength={500}
                                    />
                                    <small className="text-muted">{reviewData.content.length}/500 ký tự</small>
                                </div>

                                {/* Hình ảnh (tùy chọn) */}
                                <div className="mb-4">
                                    <label className="form-label fw-semibold">Hình ảnh (tùy chọn)</label>
                                    <Form.Control
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={(e) => {
                                            const files = Array.from(e.target.files);
                                            setReviewData(prev => ({ ...prev, images: files }));
                                        }}
                                    />
                                    <small className="text-muted">Tối đa 5 hình ảnh, mỗi hình không quá 5MB</small>
                                </div>

                                {/* Lưu ý */}
                                <div className="alert alert-info">
                                    <small>
                                        <strong>Lưu ý:</strong> Đánh giá của bạn sẽ được hiển thị công khai và giúp người dùng khác đưa ra quyết định mua hàng.
                                        Vui lòng đánh giá trung thực và khách quan.
                                    </small>
                                </div>
                            </>
                        )}
                    </Modal.Body>
                    <Modal.Footer style={{ borderTop: '1px solid #e9ecef', padding: '20px 30px' }}>
                        <Button variant="secondary" onClick={() => setShowReviewModal(false)}>
                            Hủy bỏ
                        </Button>
                        <Button
                            variant="success"
                            onClick={submitReview}
                            disabled={submittingReview || !reviewData.title.trim() || !reviewData.content.trim()}
                        >
                            {submittingReview ? (
                                <>
                                    <Spinner animation="border" size="sm" className="me-2" />
                                    Đang gửi...
                                </>
                            ) : (
                                <>
                                    <FaStar className="me-2" />
                                    Gửi đánh giá
                                </>
                            )}
                        </Button>
                    </Modal.Footer>
                </Modal>

                {/* Modal xem đánh giá */}
                <Modal show={showViewReviewModal} onHide={() => setShowViewReviewModal(false)} size="lg" centered>
                    <Modal.Header closeButton style={{ borderBottom: '1px solid #e9ecef' }}>
                        <Modal.Title className="d-flex align-items-center">
                            <FaStar className="me-2 text-warning" />
                            Đánh giá của bạn
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body style={{ padding: '30px' }}>
                        {userReview && (
                            <>
                                {/* Thông tin sản phẩm */}
                                <div className="d-flex align-items-center mb-4 p-3" style={{ backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                                    <div>
                                        <h6 className="mb-1">Đánh giá đã được gửi thành công!</h6>
                                        <small className="text-muted">Ngày đánh giá: {new Date(userReview.createdAt).toLocaleDateString('vi-VN')}</small>
                                    </div>
                                </div>

                                {/* Đánh giá sao */}
                                <div className="mb-4">
                                    <label className="form-label fw-semibold">Đánh giá của bạn</label>
                                    <div className="d-flex align-items-center">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <FaStar
                                                key={star}
                                                size={20}
                                                color={star <= userReview.rating ? '#ffc107' : '#e9ecef'}
                                                className="me-1"
                                            />
                                        ))}
                                        <span className="ms-2 text-muted">
                                            {userReview.rating === 1 && 'Rất tệ'}
                                            {userReview.rating === 2 && 'Tệ'}
                                            {userReview.rating === 3 && 'Bình thường'}
                                            {userReview.rating === 4 && 'Tốt'}
                                            {userReview.rating === 5 && 'Rất tốt'}
                                        </span>
                                    </div>
                                </div>

                                {/* Tiêu đề đánh giá */}
                                <div className="mb-4">
                                    <label className="form-label fw-semibold">Tiêu đề đánh giá</label>
                                    <div className="p-3" style={{ backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                                        {userReview.title}
                                    </div>
                                </div>

                                {/* Nội dung đánh giá */}
                                <div className="mb-4">
                                    <label className="form-label fw-semibold">Nội dung đánh giá</label>
                                    <div className="p-3" style={{ backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                                        {userReview.content}
                                    </div>
                                </div>

                                {/* Hình ảnh */}
                                {userReview.images && userReview.images.length > 0 && (
                                    <div className="mb-4">
                                        <label className="form-label fw-semibold">Hình ảnh đánh giá</label>
                                        <div className="d-flex flex-wrap gap-2">
                                            {userReview.images.map((image, index) => (
                                                <img
                                                    key={index}
                                                    src={`http://localhost:9999${image}`}
                                                    alt={`Review image ${index + 1}`}
                                                    style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '6px' }}
                                                    onError={(e) => {
                                                        console.error('Image load error:', image);
                                                        e.target.style.display = 'none';
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Thông tin bổ sung */}
                                <div className="alert alert-info">
                                    <small>
                                        <strong>Lưu ý:</strong>
                                        {userReview.canEdit && ' Bạn có thể chỉnh sửa đánh giá này 1 lần duy nhất. '}
                                        {userReview.canDelete && ' Bạn có thể xóa đánh giá này trong vòng 3 ngày kể từ ngày tạo. '}
                                        {!userReview.canEdit && ' Bạn đã hết quyền chỉnh sửa đánh giá này. '}
                                        {!userReview.canDelete && ' Bạn không thể xóa đánh giá này sau 3 ngày. '}
                                    </small>
                                </div>
                            </>
                        )}
                    </Modal.Body>
                    <Modal.Footer style={{ borderTop: '1px solid #e9ecef', padding: '20px 30px' }}>
                        <Button variant="secondary" onClick={() => setShowViewReviewModal(false)}>
                            Đóng
                        </Button>
                        {userReview && userReview.canEdit && (
                            <Button
                                variant="warning"
                                onClick={() => {
                                    setShowViewReviewModal(false);
                                    handleEditReview(userReview);
                                }}
                            >
                                <FaStar className="me-2" />
                                Chỉnh sửa
                            </Button>
                        )}
                        {userReview && userReview.canDelete && (
                            <Button
                                variant="danger"
                                onClick={() => handleDeleteReview(userReview)}
                                disabled={deletingReview}
                            >
                                {deletingReview ? (
                                    <>
                                        <Spinner animation="border" size="sm" className="me-2" />
                                        Đang xóa...
                                    </>
                                ) : (
                                    'Xóa đánh giá'
                                )}
                            </Button>
                        )}
                    </Modal.Footer>
                </Modal>

                {/* Modal chỉnh sửa đánh giá */}
                <Modal show={showEditReviewModal} onHide={() => setShowEditReviewModal(false)} size="lg" centered>
                    <Modal.Header closeButton style={{ borderBottom: '1px solid #e9ecef' }}>
                        <Modal.Title className="d-flex align-items-center">
                            <FaStar className="me-2 text-warning" />
                            Chỉnh sửa đánh giá
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body style={{ padding: '30px' }}>
                        {userReview && (
                            <>
                                {/* Thông tin sản phẩm */}
                                <div className="d-flex align-items-center mb-4 p-3" style={{ backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                                    <div>
                                        <h6 className="mb-1">Chỉnh sửa đánh giá</h6>
                                        <small className="text-muted">Lần chỉnh sửa cuối cùng</small>
                                    </div>
                                </div>

                                {/* Đánh giá sao */}
                                <div className="mb-4">
                                    <label className="form-label fw-semibold">Đánh giá của bạn *</label>
                                    <div className="d-flex align-items-center">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                className="btn btn-link p-0 me-1"
                                                onClick={() => setReviewData(prev => ({ ...prev, rating: star }))}
                                                style={{ border: 'none', background: 'none' }}
                                            >
                                                <FaStar
                                                    size={24}
                                                    color={star <= reviewData.rating ? '#ffc107' : '#e9ecef'}
                                                />
                                            </button>
                                        ))}
                                        <span className="ms-2 text-muted">
                                            {reviewData.rating === 1 && 'Rất tệ'}
                                            {reviewData.rating === 2 && 'Tệ'}
                                            {reviewData.rating === 3 && 'Bình thường'}
                                            {reviewData.rating === 4 && 'Tốt'}
                                            {reviewData.rating === 5 && 'Rất tốt'}
                                        </span>
                                    </div>
                                </div>

                                {/* Tiêu đề đánh giá */}
                                <div className="mb-4">
                                    <label className="form-label fw-semibold">Tiêu đề đánh giá *</label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Ví dụ: Sản phẩm chất lượng tốt, đúng mô tả"
                                        value={reviewData.title}
                                        onChange={(e) => setReviewData(prev => ({ ...prev, title: e.target.value }))}
                                        maxLength={100}
                                    />
                                    <small className="text-muted">{reviewData.title.length}/100 ký tự</small>
                                </div>

                                {/* Nội dung đánh giá */}
                                <div className="mb-4">
                                    <label className="form-label fw-semibold">Nội dung đánh giá *</label>
                                    <Form.Control
                                        as="textarea"
                                        rows={4}
                                        placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                                        value={reviewData.content}
                                        onChange={(e) => setReviewData(prev => ({ ...prev, content: e.target.value }))}
                                        maxLength={500}
                                    />
                                    <small className="text-muted">{reviewData.content.length}/500 ký tự</small>
                                </div>

                                {/* Lưu ý */}
                                <div className="alert alert-warning">
                                    <small>
                                        <strong>Lưu ý:</strong> Bạn chỉ có thể chỉnh sửa đánh giá này 1 lần duy nhất.
                                        Sau khi cập nhật, bạn sẽ không thể chỉnh sửa nữa.
                                    </small>
                                </div>
                            </>
                        )}
                    </Modal.Body>
                    <Modal.Footer style={{ borderTop: '1px solid #e9ecef', padding: '20px 30px' }}>
                        <Button variant="secondary" onClick={() => setShowEditReviewModal(false)}>
                            Hủy bỏ
                        </Button>
                        <Button
                            variant="warning"
                            onClick={updateReview}
                            disabled={updatingReview || !reviewData.title.trim() || !reviewData.content.trim()}
                        >
                            {updatingReview ? (
                                <>
                                    <Spinner animation="border" size="sm" className="me-2" />
                                    Đang cập nhật...
                                </>
                            ) : (
                                <>
                                    <FaStar className="me-2" />
                                    Cập nhật đánh giá
                                </>
                            )}
                        </Button>
                    </Modal.Footer>
                </Modal>
            </Container>
        </>
    );
}

export default OrderHistory;


