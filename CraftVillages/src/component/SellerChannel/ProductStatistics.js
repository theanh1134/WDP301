import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Badge, Spinner, Table } from 'react-bootstrap';
import styled from 'styled-components';
import { FaArrowLeft, FaBox, FaShoppingCart, FaEye, FaStar, FaDollarSign, FaChartLine, FaWarehouse } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';

const Container = styled.div`
    padding: 20px;
    max-width: 1400px;
    margin: 0 auto;
`;

const Header = styled.div`
    display: flex;
    align-items: center;
    gap: 20px;
    margin-bottom: 30px;
`;

const BackButton = styled.button`
    background: #fff;
    border: 1px solid #ddd;
    padding: 10px 15px;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.3s;

    &:hover {
        background: #f8f9fa;
        border-color: #b8860b;
        color: #b8860b;
    }
`;

const ProductHeader = styled.div`
    display: flex;
    gap: 20px;
    align-items: center;
    flex: 1;
`;

const ProductImage = styled.img`
    width: 100px;
    height: 100px;
    object-fit: cover;
    border-radius: 8px;
    border: 1px solid #ddd;
`;

const ProductInfo = styled.div`
    flex: 1;

    h2 {
        margin: 0 0 10px 0;
        font-size: 24px;
        color: #333;
    }

    .price {
        font-size: 20px;
        color: #b8860b;
        font-weight: bold;
        margin-bottom: 5px;
    }

    .sku {
        color: #666;
        font-size: 14px;
    }
`;

const StatsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
`;

const StatCard = styled(Card)`
    border: none;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    transition: transform 0.3s;

    &:hover {
        transform: translateY(-5px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
`;

const StatCardBody = styled(Card.Body)`
    display: flex;
    align-items: center;
    gap: 15px;
`;

const StatIcon = styled.div`
    width: 60px;
    height: 60px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    background: ${props => props.bg || '#f8f9fa'};
    color: ${props => props.color || '#333'};
`;

const StatInfo = styled.div`
    flex: 1;

    .stat-label {
        font-size: 14px;
        color: #666;
        margin-bottom: 5px;
    }

    .stat-value {
        font-size: 28px;
        font-weight: bold;
        color: #333;
    }

    .stat-change {
        font-size: 12px;
        margin-top: 5px;
    }
`;

const SectionTitle = styled.h4`
    margin: 30px 0 20px 0;
    color: #333;
    font-weight: 600;
`;

const ProductStatistics = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [product, setProduct] = useState(null);
    const [stats, setStats] = useState(null);

    useEffect(() => {
        loadProductStatistics();
    }, [id]);

    const loadProductStatistics = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.get(
                `http://localhost:9999/products/${id}/statistics`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {
                setProduct(response.data.data.product);
                setStats(response.data.data.statistics);
            }
        } catch (error) {
            console.error('Error loading statistics:', error);
            toast.error('Không thể tải thống kê sản phẩm');
        } finally {
            setLoading(false);
        }
    };

    const getImageUrl = (imagePath) => {
        if (!imagePath) return 'https://via.placeholder.com/100?text=No+Image';
        if (typeof imagePath === 'object' && imagePath.url) {
            imagePath = imagePath.url;
        }
        if (typeof imagePath !== 'string') {
            return 'https://via.placeholder.com/100?text=No+Image';
        }
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            return imagePath;
        }
        return `http://localhost:9999${imagePath}`;
    };

    if (loading) {
        return (
            <Container>
                <div className="text-center py-5">
                    <Spinner animation="border" variant="warning" />
                    <p className="mt-3">Đang tải thống kê...</p>
                </div>
            </Container>
        );
    }

    if (!product || !stats) {
        return (
            <Container>
                <div className="text-center py-5">
                    <p>Không tìm thấy sản phẩm</p>
                    <BackButton onClick={() => navigate('/seller-dashboard')}>
                        <FaArrowLeft /> Quay lại
                    </BackButton>
                </div>
            </Container>
        );
    }

    return (
        <Container>
            <Header>
                <BackButton onClick={() => navigate('/seller-dashboard')}>
                    <FaArrowLeft /> Quay lại
                </BackButton>
                <ProductHeader>
                    <ProductImage 
                        src={getImageUrl(product.images?.[0])} 
                        alt={product.productName}
                        onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/100?text=No+Image';
                        }}
                    />
                    <ProductInfo>
                        <h2>{product.productName}</h2>
                        <div className="price">
                            {new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND'
                            }).format(product.sellingPrice)}
                        </div>
                        <div className="sku">SKU: {product.sku || 'N/A'}</div>
                    </ProductInfo>
                </ProductHeader>
            </Header>

            <StatsGrid>
                <StatCard>
                    <StatCardBody>
                        <StatIcon bg="#e3f2fd" color="#1976d2">
                            <FaBox />
                        </StatIcon>
                        <StatInfo>
                            <div className="stat-label">Tồn kho</div>
                            <div className="stat-value">{stats.inventory.totalStock}</div>
                            <div className="stat-change text-muted">
                                Giá vốn TB: {new Intl.NumberFormat('vi-VN').format(stats.inventory.averageCostPrice)}đ
                            </div>
                        </StatInfo>
                    </StatCardBody>
                </StatCard>

                <StatCard>
                    <StatCardBody>
                        <StatIcon bg="#e8f5e9" color="#388e3c">
                            <FaShoppingCart />
                        </StatIcon>
                        <StatInfo>
                            <div className="stat-label">Đã bán</div>
                            <div className="stat-value">{stats.sales.totalSold}</div>
                            <div className="stat-change text-success">
                                {stats.sales.totalOrders} đơn hàng
                            </div>
                        </StatInfo>
                    </StatCardBody>
                </StatCard>

                <StatCard>
                    <StatCardBody>
                        <StatIcon bg="#fff3e0" color="#f57c00">
                            <FaDollarSign />
                        </StatIcon>
                        <StatInfo>
                            <div className="stat-label">Doanh thu</div>
                            <div className="stat-value" style={{ fontSize: '20px' }}>
                                {new Intl.NumberFormat('vi-VN').format(stats.revenue.totalRevenue)}đ
                            </div>
                            <div className="stat-change text-warning">
                                Lợi nhuận: {new Intl.NumberFormat('vi-VN').format(stats.revenue.totalProfit)}đ
                            </div>
                        </StatInfo>
                    </StatCardBody>
                </StatCard>

                <StatCard>
                    <StatCardBody>
                        <StatIcon bg="#fce4ec" color="#c2185b">
                            <FaStar />
                        </StatIcon>
                        <StatInfo>
                            <div className="stat-label">Đánh giá</div>
                            <div className="stat-value">
                                {stats.reviews.averageRating.toFixed(1)} <FaStar size={20} color="#ffc107" />
                            </div>
                            <div className="stat-change text-muted">
                                {stats.reviews.totalReviews} đánh giá
                            </div>
                        </StatInfo>
                    </StatCardBody>
                </StatCard>
            </StatsGrid>

            <SectionTitle><FaWarehouse /> Chi tiết tồn kho</SectionTitle>
            <Card>
                <Card.Body>
                    <Table responsive hover>
                        <thead>
                            <tr>
                                <th>Lô hàng</th>
                                <th>Ngày nhập</th>
                                <th>SL nhập</th>
                                <th>SL còn lại</th>
                                <th>Giá vốn</th>
                                <th>Giá bán</th>
                                <th>Lợi nhuận/sp</th>
                                <th>Giá trị tồn</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.inventory.batches.map((batch, index) => {
                                const profit = (batch.sellingPrice || 0) - (batch.costPrice || 0);
                                const profitPercent = batch.costPrice > 0
                                    ? ((profit / batch.costPrice) * 100).toFixed(1)
                                    : 0;

                                return (
                                    <tr key={batch.batchId || index}>
                                        <td>#{index + 1}</td>
                                        <td>{new Date(batch.receivedDate).toLocaleDateString('vi-VN')}</td>
                                        <td>{batch.quantityReceived}</td>
                                        <td>
                                            <Badge bg={batch.quantityRemaining > 0 ? 'success' : 'secondary'}>
                                                {batch.quantityRemaining}
                                            </Badge>
                                        </td>
                                        <td>{new Intl.NumberFormat('vi-VN').format(batch.costPrice)}đ</td>
                                        <td>{new Intl.NumberFormat('vi-VN').format(batch.sellingPrice || 0)}đ</td>
                                        <td style={{ color: profit > 0 ? '#28a745' : '#dc3545', fontWeight: 'bold' }}>
                                            {new Intl.NumberFormat('vi-VN').format(profit)}đ
                                            <div style={{ fontSize: '0.85rem', color: '#666' }}>
                                                ({profitPercent}%)
                                            </div>
                                        </td>
                                        <td>{new Intl.NumberFormat('vi-VN').format(batch.costPrice * batch.quantityRemaining)}đ</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        <tfoot>
                            <tr style={{ fontWeight: 'bold', background: '#f8f9fa' }}>
                                <td colSpan="3">Tổng cộng</td>
                                <td>
                                    <Badge bg="primary">{stats.inventory.totalStock}</Badge>
                                </td>
                                <td colSpan="3">-</td>
                                <td>{new Intl.NumberFormat('vi-VN').format(stats.inventory.totalInventoryValue)}đ</td>
                            </tr>
                        </tfoot>
                    </Table>
                </Card.Body>
            </Card>

            {stats.sales.recentOrders.length > 0 && (
                <>
                    <SectionTitle><FaChartLine /> Đơn hàng gần đây</SectionTitle>
                    <Card>
                        <Card.Body>
                            <Table responsive hover>
                                <thead>
                                    <tr>
                                        <th>Mã đơn</th>
                                        <th>Ngày đặt</th>
                                        <th>Số lượng</th>
                                        <th>Giá bán</th>
                                        <th>Tổng tiền</th>
                                        <th>Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.sales.recentOrders.map((order) => (
                                        <tr key={order.orderId}>
                                            <td>#{order.orderId.slice(-8)}</td>
                                            <td>{new Date(order.orderDate).toLocaleDateString('vi-VN')}</td>
                                            <td>{order.quantity}</td>
                                            <td>{new Intl.NumberFormat('vi-VN').format(order.priceAtPurchase)}đ</td>
                                            <td>{new Intl.NumberFormat('vi-VN').format(order.totalAmount)}đ</td>
                                            <td>
                                                <Badge bg={
                                                    order.status === 'DELIVERED' ? 'success' :
                                                    order.status === 'CANCELLED' ? 'danger' :
                                                    order.status === 'SHIPPED' ? 'info' :
                                                    'warning'
                                                }>
                                                    {order.status}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr style={{ fontWeight: 'bold', background: '#f8f9fa' }}>
                                        <td colSpan="2">Tổng cộng</td>
                                        <td>
                                            <Badge bg="primary">
                                                {stats.sales.recentOrders.reduce((sum, order) => sum + order.quantity, 0)}
                                            </Badge>
                                        </td>
                                        <td>-</td>
                                        <td>
                                            {new Intl.NumberFormat('vi-VN').format(
                                                stats.sales.recentOrders.reduce((sum, order) => sum + order.totalAmount, 0)
                                            )}đ
                                        </td>
                                        <td>-</td>
                                    </tr>
                                </tfoot>
                            </Table>
                        </Card.Body>
                    </Card>
                </>
            )}

            <Row className="mt-4">
                <Col md={6}>
                    <Card>
                        <Card.Header>
                            <strong>Thông tin sản phẩm</strong>
                        </Card.Header>
                        <Card.Body>
                            <Table borderless size="sm">
                                <tbody>
                                    <tr>
                                        <td><strong>Danh mục:</strong></td>
                                        <td>{product.category?.name || 'N/A'}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Trạng thái:</strong></td>
                                        <td>
                                            <Badge bg={
                                                product.moderation?.status === 'ACTIVE' ? 'success' :
                                                product.moderation?.status === 'PENDING' ? 'warning' :
                                                'danger'
                                            }>
                                                {product.moderation?.status || 'N/A'}
                                            </Badge>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td><strong>Ngày tạo:</strong></td>
                                        <td>{new Date(product.createdAt).toLocaleDateString('vi-VN')}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Cập nhật:</strong></td>
                                        <td>{new Date(product.updatedAt).toLocaleDateString('vi-VN')}</td>
                                    </tr>
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6}>
                    <Card>
                        <Card.Header>
                            <strong>Hiệu suất bán hàng</strong>
                        </Card.Header>
                        <Card.Body>
                            <Table borderless size="sm">
                                <tbody>
                                    <tr>
                                        <td><strong>Tỷ lệ chuyển đổi:</strong></td>
                                        <td>{stats.performance.conversionRate}%</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Giá trị đơn TB:</strong></td>
                                        <td>{new Intl.NumberFormat('vi-VN').format(stats.performance.averageOrderValue)}đ</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Tỷ suất lợi nhuận:</strong></td>
                                        <td className={stats.performance.profitMargin > 0 ? 'text-success' : 'text-danger'}>
                                            {stats.performance.profitMargin.toFixed(2)}%
                                        </td>
                                    </tr>
                                    <tr>
                                        <td><strong>Tốc độ bán:</strong></td>
                                        <td>{stats.performance.salesVelocity.toFixed(1)} sp/ngày</td>
                                    </tr>
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default ProductStatistics;

