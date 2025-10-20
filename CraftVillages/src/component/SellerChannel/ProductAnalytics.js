import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Card, Form, Table, Badge, Spinner } from 'react-bootstrap';
import { FaBox, FaEye, FaShoppingCart, FaMoneyBillWave, FaChartLine, FaPercentage, FaStar } from 'react-icons/fa';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import productService from '../../services/productService';
import orderService from '../../services/orderService';

const PageWrapper = styled.div`
    background: #f8f9fa;
    min-height: 100vh;
    padding: 2rem 0;
`;

const PageHeader = styled.div`
    background: linear-gradient(135deg, #b8860b 0%, #d4af37 100%);
    color: white;
    padding: 2rem;
    border-radius: 12px;
    margin-bottom: 2rem;
    box-shadow: 0 4px 12px rgba(184, 134, 11, 0.2);

    h4 {
        margin: 0 0 0.5rem 0;
        font-weight: 700;
        font-size: 1.75rem;
    }

    p {
        margin: 0;
        opacity: 0.95;
        font-size: 1rem;
    }
`;

const FilterSection = styled.div`
    background: white;
    padding: 1.5rem;
    border-radius: 12px;
    margin-bottom: 2rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

const StatsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
`;

const StatCard = styled(Card)`
    border: none;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;

    &:hover {
        transform: translateY(-4px);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    }
`;

const StatCardBody = styled(Card.Body)`
    padding: 1.5rem;
`;

const StatHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
`;

const StatIcon = styled.div`
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: ${props => props.bg || '#f0f0f0'};
    color: ${props => props.color || '#666'};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
`;

const StatValue = styled.div`
    font-size: 2rem;
    font-weight: 700;
    color: #2c3e50;
    margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
    font-size: 0.9rem;
    color: #6c757d;
    font-weight: 500;
`;

const ChartCard = styled(Card)`
    border: none;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    margin-bottom: 2rem;
`;

const ProductImage = styled.img`
    width: 50px;
    height: 50px;
    object-fit: cover;
    border-radius: 8px;
    margin-right: 1rem;
`;

const ProductName = styled.div`
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 0.25rem;
`;

const COLORS = ['#b8860b', '#d4af37', '#ffd700', '#daa520', '#cd853f'];

function ProductAnalytics({ shopId }) {
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [productStats, setProductStats] = useState(null);
    const [timeRange, setTimeRange] = useState('30days');

    useEffect(() => {
        loadProducts();
    }, [shopId]);

    useEffect(() => {
        if (selectedProduct) {
            loadProductStats();
        }
    }, [selectedProduct, timeRange]);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const response = await productService.getProductsByShop(shopId);
            const productList = response.products || [];
            setProducts(productList);
            if (productList.length > 0) {
                setSelectedProduct(productList[0]._id);
            }
        } catch (error) {
            console.error('Error loading products:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadProductStats = async () => {
        try {
            setLoading(true);
            const response = await orderService.getProductAnalytics(selectedProduct, timeRange);
            setProductStats(response.data);
        } catch (error) {
            console.error('Error loading product stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(value);
    };

    const formatNumber = (value) => {
        return new Intl.NumberFormat('vi-VN').format(value);
    };

    const getProductInfo = () => {
        return products.find(p => p._id === selectedProduct);
    };

    const getImageUrl = (product) => {
        if (!product) return 'https://via.placeholder.com/80x80?text=No+Image';

        const API_URL = 'http://localhost:9999';

        // Helper to add base URL if needed
        const formatUrl = (url) => {
            if (!url) return null;
            // If URL already has http/https, return as is
            if (url.startsWith('http://') || url.startsWith('https://')) {
                return url;
            }
            // Add base URL for relative paths
            return `${API_URL}${url.startsWith('/') ? url : '/' + url}`;
        };

        // Try different image sources
        if (product.image) {
            return formatUrl(product.image);
        }

        if (product.images && Array.isArray(product.images)) {
            if (product.images.length > 0) {
                // Check if images is array of objects with url property
                if (typeof product.images[0] === 'object' && product.images[0].url) {
                    return formatUrl(product.images[0].url);
                }
                // Check if images is array of strings
                if (typeof product.images[0] === 'string') {
                    return formatUrl(product.images[0]);
                }
            }
        }

        return 'https://via.placeholder.com/80x80?text=No+Image';
    };

    if (loading && !productStats) {
        return (
            <div className="text-center py-5">
                <Spinner animation="border" variant="warning" />
                <p className="mt-3">Đang tải dữ liệu...</p>
            </div>
        );
    }

    const productInfo = getProductInfo();

    return (
        <PageWrapper>
            <div className="container">
                <PageHeader>
                    <h4><FaChartLine className="me-2" />Phân tích sản phẩm</h4>
                    <p>Xem chi tiết hiệu suất từng sản phẩm của shop</p>
                </PageHeader>

                <FilterSection>
                    <div className="row align-items-center">
                        <div className="col-md-6">
                            <Form.Group>
                                <Form.Label>Chọn sản phẩm</Form.Label>
                                <Form.Select
                                    value={selectedProduct || ''}
                                    onChange={(e) => setSelectedProduct(e.target.value)}
                                >
                                    {products.map(product => (
                                        <option key={product._id} value={product._id}>
                                            {product.productName}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </div>
                        <div className="col-md-6">
                            <Form.Group>
                                <Form.Label>Khoảng thời gian</Form.Label>
                                <Form.Select
                                    value={timeRange}
                                    onChange={(e) => setTimeRange(e.target.value)}
                                >
                                    <option value="today">Hôm nay</option>
                                    <option value="7days">7 ngày qua</option>
                                    <option value="30days">30 ngày qua</option>
                                    <option value="all">Tất cả</option>
                                </Form.Select>
                            </Form.Group>
                        </div>
                    </div>
                </FilterSection>

                {productInfo && (
                    <Card className="mb-4" style={{ border: 'none', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                        <Card.Body className="p-4">
                            <div className="d-flex align-items-center">
                                <ProductImage
                                    src={getImageUrl(productInfo)}
                                    alt={productInfo.productName}
                                    onError={(e) => {
                                        if (!e.target.dataset.errorHandled) {
                                            e.target.dataset.errorHandled = 'true';
                                            e.target.src = 'https://via.placeholder.com/80x80?text=No+Image';
                                        }
                                    }}
                                />
                                <div>
                                    <ProductName>{productInfo.productName}</ProductName>
                                    <div className="text-muted small">
                                        Giá: {formatCurrency(productInfo.sellingPrice)} |
                                        Tồn kho: {productInfo.stock || 0} sản phẩm
                                    </div>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                )}

                {productStats && (
                    <>
                        <StatsGrid>
                            <StatCard>
                                <StatCardBody>
                                    <StatHeader>
                                        <StatLabel>Doanh số</StatLabel>
                                        <StatIcon bg="rgba(76, 175, 80, 0.1)" color="#4caf50">
                                            <FaMoneyBillWave />
                                        </StatIcon>
                                    </StatHeader>
                                    <StatValue>{formatCurrency(productStats.revenue || 0)}</StatValue>
                                </StatCardBody>
                            </StatCard>

                            <StatCard>
                                <StatCardBody>
                                    <StatHeader>
                                        <StatLabel>Đã bán</StatLabel>
                                        <StatIcon bg="rgba(33, 150, 243, 0.1)" color="#2196f3">
                                            <FaShoppingCart />
                                        </StatIcon>
                                    </StatHeader>
                                    <StatValue>{formatNumber(productStats.quantitySold || 0)}</StatValue>
                                </StatCardBody>
                            </StatCard>

                            <StatCard>
                                <StatCardBody>
                                    <StatHeader>
                                        <StatLabel>Lượt xem</StatLabel>
                                        <StatIcon bg="rgba(255, 152, 0, 0.1)" color="#ff9800">
                                            <FaEye />
                                        </StatIcon>
                                    </StatHeader>
                                    <StatValue>{formatNumber(productStats.views || 0)}</StatValue>
                                </StatCardBody>
                            </StatCard>

                            <StatCard>
                                <StatCardBody>
                                    <StatHeader>
                                        <StatLabel>Tỷ lệ chuyển đổi</StatLabel>
                                        <StatIcon bg="rgba(156, 39, 176, 0.1)" color="#9c27b0">
                                            <FaPercentage />
                                        </StatIcon>
                                    </StatHeader>
                                    <StatValue>{productStats.conversionRate || 0}%</StatValue>
                                </StatCardBody>
                            </StatCard>
                        </StatsGrid>

                        {/* Biểu đồ doanh số theo thời gian */}
                        {productStats.chartData && productStats.chartData.length > 0 && (
                            <ChartCard>
                                <Card.Body className="p-4">
                                    <h5 className="mb-4">Doanh số theo thời gian</h5>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <LineChart data={productStats.chartData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip
                                                formatter={(value) => formatCurrency(value)}
                                                labelStyle={{ color: '#666' }}
                                            />
                                            <Legend />
                                            <Line
                                                type="monotone"
                                                dataKey="revenue"
                                                stroke="#b8860b"
                                                strokeWidth={2}
                                                name="Doanh số"
                                                dot={{ fill: '#b8860b', r: 4 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </Card.Body>
                            </ChartCard>
                        )}

                        {/* Biểu đồ số lượng bán theo thời gian */}
                        {productStats.chartData && productStats.chartData.length > 0 && (
                            <ChartCard>
                                <Card.Body className="p-4">
                                    <h5 className="mb-4">Số lượng bán theo thời gian</h5>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={productStats.chartData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip
                                                labelStyle={{ color: '#666' }}
                                            />
                                            <Legend />
                                            <Bar
                                                dataKey="quantity"
                                                fill="#2196f3"
                                                name="Số lượng"
                                                radius={[8, 8, 0, 0]}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Card.Body>
                            </ChartCard>
                        )}

                        {/* Thống kê đơn hàng */}
                        {productStats.orderStats && (
                            <ChartCard>
                                <Card.Body className="p-4">
                                    <h5 className="mb-4">Thống kê đơn hàng</h5>
                                    <div className="row">
                                        <div className="col-md-6">
                                            <ResponsiveContainer width="100%" height={300}>
                                                <PieChart>
                                                    <Pie
                                                        data={[
                                                            { name: 'Đã giao', value: productStats.orderStats.delivered || 0 },
                                                            { name: 'Đang xử lý', value: productStats.orderStats.processing || 0 },
                                                            { name: 'Đã hủy', value: productStats.orderStats.cancelled || 0 }
                                                        ]}
                                                        cx="50%"
                                                        cy="50%"
                                                        labelLine={false}
                                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                        outerRadius={80}
                                                        fill="#8884d8"
                                                        dataKey="value"
                                                    >
                                                        {[0, 1, 2].map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div className="col-md-6">
                                            <Table borderless>
                                                <tbody>
                                                    <tr>
                                                        <td><Badge bg="success">Đã giao</Badge></td>
                                                        <td className="text-end fw-bold">{productStats.orderStats.delivered || 0} đơn</td>
                                                    </tr>
                                                    <tr>
                                                        <td><Badge bg="warning">Đang xử lý</Badge></td>
                                                        <td className="text-end fw-bold">{productStats.orderStats.processing || 0} đơn</td>
                                                    </tr>
                                                    <tr>
                                                        <td><Badge bg="danger">Đã hủy</Badge></td>
                                                        <td className="text-end fw-bold">{productStats.orderStats.cancelled || 0} đơn</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="fw-bold">Tổng đơn hàng</td>
                                                        <td className="text-end fw-bold">{productStats.orderStats.total || 0} đơn</td>
                                                    </tr>
                                                </tbody>
                                            </Table>
                                        </div>
                                    </div>
                                </Card.Body>
                            </ChartCard>
                        )}

                        {/* Lịch sử đơn hàng gần đây */}
                        {productStats.recentOrders && productStats.recentOrders.length > 0 && (
                            <ChartCard>
                                <Card.Body className="p-4">
                                    <h5 className="mb-4">Đơn hàng gần đây</h5>
                                    <Table hover responsive>
                                        <thead>
                                            <tr>
                                                <th>Mã đơn</th>
                                                <th>Ngày đặt</th>
                                                <th>Số lượng</th>
                                                <th>Giá trị</th>
                                                <th>Trạng thái</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {productStats.recentOrders.map((order, index) => (
                                                <tr key={index}>
                                                    <td className="text-muted">#{order.orderId?.toString().slice(-8)}</td>
                                                    <td>{new Date(order.date).toLocaleDateString('vi-VN')}</td>
                                                    <td>{order.quantity}</td>
                                                    <td className="fw-bold">{formatCurrency(order.amount)}</td>
                                                    <td>
                                                        <Badge bg={
                                                            order.status === 'DELIVERED' ? 'success' :
                                                            order.status === 'CANCELLED' ? 'danger' :
                                                            'warning'
                                                        }>
                                                            {order.status === 'DELIVERED' ? 'Đã giao' :
                                                             order.status === 'CANCELLED' ? 'Đã hủy' :
                                                             'Đang xử lý'}
                                                        </Badge>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </Card.Body>
                            </ChartCard>
                        )}
                    </>
                )}
            </div>
        </PageWrapper>
    );
}

export default ProductAnalytics;

