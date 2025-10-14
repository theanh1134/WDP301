import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, ProgressBar } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

function SellerDashboard() {
    const navigate = useNavigate();
    const [sellerData, setSellerData] = useState({
        shopName: 'Craft Shop Demo',
        email: 'seller@example.com',
        phone: '+84 123 456 789',
        status: 'active',
        totalProducts: 15,
        totalOrders: 45,
        totalRevenue: 12500000,
        pendingOrders: 3
    });

    const [recentOrders, setRecentOrders] = useState([
        {
            id: 'ORD001',
            customer: 'Nguyễn Văn A',
            product: 'Nón lá truyền thống',
            amount: 200000,
            status: 'pending',
            date: '2024-01-15'
        },
        {
            id: 'ORD002',
            customer: 'Trần Thị B',
            product: 'Gốm sứ Bát Tràng',
            amount: 350000,
            status: 'shipped',
            date: '2024-01-14'
        },
        {
            id: 'ORD003',
            customer: 'Lê Văn C',
            product: 'Lụa tơ tằm',
            amount: 500000,
            status: 'delivered',
            date: '2024-01-13'
        }
    ]);

    const [stats, setStats] = useState({
        todayOrders: 2,
        todayRevenue: 750000,
        monthlyTarget: 20000000,
        monthlyCurrent: 12500000
    });

    const getStatusBadge = (status) => {
        const variants = {
            'pending': 'warning',
            'shipped': 'info',
            'delivered': 'success',
            'cancelled': 'danger'
        };
        return <Badge bg={variants[status] || 'secondary'}>{status.toUpperCase()}</Badge>;
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const handleAddProduct = () => {
        // Navigate to add product page
        console.log('Navigate to add product');
    };

    const handleViewOrders = () => {
        // Navigate to orders page
        console.log('Navigate to orders page');
    };

    const handleViewProducts = () => {
        // Navigate to products page
        console.log('Navigate to products page');
    };

    const handleSettings = () => {
        // Navigate to settings page
        console.log('Navigate to settings page');
    };

    const handleLogout = () => {
        // Clear authentication data and navigate to home
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        navigate('/');
    };

    const styles = {
        container: {
            minHeight: '100vh',
            backgroundColor: '#f8f9fa',
            padding: '2rem 0'
        },
        card: {
            border: 'none',
            borderRadius: '10px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            marginBottom: '1.5rem'
        },
        statCard: {
            textAlign: 'center',
            padding: '1.5rem'
        },
        statNumber: {
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#dc3545'
        },
        statLabel: {
            fontSize: '0.9rem',
            color: '#6c757d',
            marginTop: '0.5rem'
        },
        header: {
            backgroundColor: '#fff',
            padding: '1rem 0',
            borderBottom: '1px solid #e9ecef',
            marginBottom: '2rem'
        },
        welcomeText: {
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#333'
        },
        actionButton: {
            margin: '0.25rem'
        }
    };

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <Container>
                    <Row className="align-items-center">
                        <Col md={8}>
                            <div style={styles.welcomeText}>
                                Chào mừng, {sellerData.shopName}!
                            </div>
                            <p className="text-muted mb-0">Quản lý shop của bạn một cách hiệu quả</p>
                        </Col>
                        <Col md={4} className="text-end">
                            <Button 
                                variant="outline-secondary" 
                                onClick={handleLogout}
                                style={styles.actionButton}
                            >
                                <i className="fas fa-sign-out-alt me-2"></i>Thoát
                            </Button>
                            <Button 
                                variant="outline-primary" 
                                onClick={handleSettings}
                                style={styles.actionButton}
                            >
                                <i className="fas fa-cog me-2"></i>Cài đặt
                            </Button>
                            <Button 
                                variant="danger" 
                                onClick={handleAddProduct}
                                style={styles.actionButton}
                            >
                                <i className="fas fa-plus me-2"></i>Thêm sản phẩm
                            </Button>
                        </Col>
                    </Row>
                </Container>
            </div>

            <Container>
                {/* Stats Cards */}
                <Row>
                    <Col md={3}>
                        <Card style={styles.card}>
                            <Card.Body style={styles.statCard}>
                                <div style={styles.statNumber}>{sellerData.totalProducts}</div>
                                <div style={styles.statLabel}>Sản phẩm</div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card style={styles.card}>
                            <Card.Body style={styles.statCard}>
                                <div style={styles.statNumber}>{sellerData.totalOrders}</div>
                                <div style={styles.statLabel}>Đơn hàng</div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card style={styles.card}>
                            <Card.Body style={styles.statCard}>
                                <div style={styles.statNumber}>{formatCurrency(sellerData.totalRevenue)}</div>
                                <div style={styles.statLabel}>Doanh thu</div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card style={styles.card}>
                            <Card.Body style={styles.statCard}>
                                <div style={styles.statNumber}>{sellerData.pendingOrders}</div>
                                <div style={styles.statLabel}>Đơn chờ xử lý</div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* Today's Stats */}
                <Row>
                    <Col md={6}>
                        <Card style={styles.card}>
                            <Card.Header>
                                <h5 className="mb-0">Hôm nay</h5>
                            </Card.Header>
                            <Card.Body>
                                <Row>
                                    <Col md={6}>
                                        <div className="text-center">
                                            <div style={styles.statNumber}>{stats.todayOrders}</div>
                                            <div style={styles.statLabel}>Đơn hàng mới</div>
                                        </div>
                                    </Col>
                                    <Col md={6}>
                                        <div className="text-center">
                                            <div style={styles.statNumber}>{formatCurrency(stats.todayRevenue)}</div>
                                            <div style={styles.statLabel}>Doanh thu</div>
                                        </div>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={6}>
                        <Card style={styles.card}>
                            <Card.Header>
                                <h5 className="mb-0">Mục tiêu tháng</h5>
                            </Card.Header>
                            <Card.Body>
                                <div className="mb-2">
                                    <div className="d-flex justify-content-between">
                                        <span>Tiến độ</span>
                                        <span>{Math.round((stats.monthlyCurrent / stats.monthlyTarget) * 100)}%</span>
                                    </div>
                                    <ProgressBar 
                                        now={(stats.monthlyCurrent / stats.monthlyTarget) * 100} 
                                        variant="success"
                                        style={{ height: '8px' }}
                                    />
                                </div>
                                <div className="text-center">
                                    <div style={styles.statNumber}>{formatCurrency(stats.monthlyCurrent)}</div>
                                    <div style={styles.statLabel}>/ {formatCurrency(stats.monthlyTarget)}</div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* Recent Orders */}
                <Row>
                    <Col md={12}>
                        <Card style={styles.card}>
                            <Card.Header className="d-flex justify-content-between align-items-center">
                                <h5 className="mb-0">Đơn hàng gần đây</h5>
                                <Button variant="outline-primary" size="sm" onClick={handleViewOrders}>
                                    Xem tất cả
                                </Button>
                            </Card.Header>
                            <Card.Body>
                                <Table responsive>
                                    <thead>
                                        <tr>
                                            <th>Mã đơn</th>
                                            <th>Khách hàng</th>
                                            <th>Sản phẩm</th>
                                            <th>Giá trị</th>
                                            <th>Trạng thái</th>
                                            <th>Ngày</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentOrders.map((order) => (
                                            <tr key={order.id}>
                                                <td>{order.id}</td>
                                                <td>{order.customer}</td>
                                                <td>{order.product}</td>
                                                <td>{formatCurrency(order.amount)}</td>
                                                <td>{getStatusBadge(order.status)}</td>
                                                <td>{order.date}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* Quick Actions */}
                <Row>
                    <Col md={12}>
                        <Card style={styles.card}>
                            <Card.Header>
                                <h5 className="mb-0">Thao tác nhanh</h5>
                            </Card.Header>
                            <Card.Body>
                                <Row>
                                    <Col md={3}>
                                        <Button 
                                            variant="outline-primary" 
                                            className="w-100 mb-2"
                                            onClick={handleAddProduct}
                                        >
                                            <i className="fas fa-plus me-2"></i>
                                            Thêm sản phẩm
                                        </Button>
                                    </Col>
                                    <Col md={3}>
                                        <Button 
                                            variant="outline-success" 
                                            className="w-100 mb-2"
                                            onClick={handleViewProducts}
                                        >
                                            <i className="fas fa-box me-2"></i>
                                            Quản lý sản phẩm
                                        </Button>
                                    </Col>
                                    <Col md={3}>
                                        <Button 
                                            variant="outline-info" 
                                            className="w-100 mb-2"
                                            onClick={handleViewOrders}
                                        >
                                            <i className="fas fa-shopping-cart me-2"></i>
                                            Quản lý đơn hàng
                                        </Button>
                                    </Col>
                                    <Col md={3}>
                                        <Button 
                                            variant="outline-warning" 
                                            className="w-100 mb-2"
                                            onClick={handleSettings}
                                        >
                                            <i className="fas fa-cog me-2"></i>
                                            Cài đặt shop
                                        </Button>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}

export default SellerDashboard;
