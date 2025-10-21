import React from 'react';
import { Container, Card } from 'react-bootstrap';
import { useParams, useLocation, Link } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';
import Header from './Header';

function OrderSuccess() {
    const { id } = useParams();
    const location = useLocation();
    const summary = location.state?.summary;

    const styles = {
        banner: {
            background: 'linear-gradient(135deg, rgba(184,134,11,0.95), rgba(212,175,55,0.95))',
            borderRadius: 16,
            padding: '40px 24px',
            color: 'white',
            textAlign: 'center',
            marginTop: 24,
            marginBottom: 24
        },
        card: {
            border: 'none',
            borderRadius: 16,
            boxShadow: '0 15px 35px rgba(0,0,0,0.08)'
        },
        check: {
            fontSize: 56,
            color: '#2ecc71',
            marginBottom: 12
        },
        meta: {
            background: '#f8f9fa',
            borderRadius: 12,
            padding: 16
        }
    };

    return (
        <>
            <Header />
            <Container>
                <div style={styles.banner}>
                    <h1 className="mb-1">Đặt hàng thành công</h1>
                    <div className="opacity-75">Cảm ơn bạn đã tin tưởng Craft Villages</div>
                </div>

                <Card className="p-4 text-center" style={styles.card}>
                    <FaCheckCircle style={styles.check} />
                    <h4 className="mb-2">Cảm ơn bạn đã đặt hàng!</h4>
                    <p className="text-muted mb-1">Mã đơn hàng: <strong>{id}</strong></p>
                    {summary && (
                        <p className="text-muted">Tổng thanh toán: <strong className="text-primary">{summary.total?.toLocaleString()} VND</strong></p>
                    )}

                    <div className="row justify-content-center mt-3">
                        <div className="col-md-6" style={styles.meta}>
                            <div className="d-flex justify-content-between">
                                <span>Trạng thái</span>
                                <span className="fw-semibold">Đã tiếp nhận</span>
                            </div>
                            <div className="d-flex justify-content-between mt-2">
                                <span>Phương thức thanh toán</span>
                                <span className="fw-semibold">COD / Chuyển khoản</span>
                            </div>
                        </div>
                    </div>

                    <div className="d-flex justify-content-center mt-4" style={{ gap: 12 }}>
                        <Link to="/" className="btn btn-outline-primary">Về trang chủ</Link>
                        <Link to="/orders" className="btn btn-primary">Xem đơn hàng</Link>
                    </div>
                </Card>
            </Container>
        </>
    );
}

export default OrderSuccess;


