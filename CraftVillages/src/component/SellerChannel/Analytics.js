import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Container, Row, Col, Card, Form, Button, Badge, Nav, Tab, Table } from 'react-bootstrap';
import { FaChartLine, FaShoppingCart, FaMoneyBillWave, FaBox, FaCalendarAlt, FaTrophy, FaStar } from 'react-icons/fa';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
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

const StatsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1.5rem;
    margin-bottom: 2rem;

    @media (max-width: 1200px) {
        grid-template-columns: repeat(2, 1fr);
    }

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
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

const StatChange = styled.div`
    font-size: 0.85rem;
    color: ${props => props.positive ? '#4caf50' : '#6c757d'};
    font-weight: 500;
    margin-top: 0.5rem;
`;

const ChartCard = styled(Card)`
    border: none;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    margin-bottom: 2rem;

    .card-header {
        background: white;
        border-bottom: 2px solid #f0f0f0;
        padding: 1.25rem 1.5rem;
        font-weight: 600;
        font-size: 1.1rem;
        color: #2c3e50;
        display: flex;
        align-items: center;
        gap: 0.75rem;

        svg {
            color: #b8860b;
        }
    }

    .card-body {
        padding: 1.5rem;
    }
`;

const FilterSection = styled.div`
    background: white;
    padding: 1.25rem 1.5rem;
    border-radius: 12px;
    margin-bottom: 2rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    display: flex;
    gap: 1rem;
    align-items: end;
    flex-wrap: wrap;
`;

const TimeRangeButtons = styled.div`
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
`;

const TimeButton = styled(Button)`
    background: ${props => props.active ? 'linear-gradient(135deg, #b8860b 0%, #d4af37 100%)' : 'white'};
    color: ${props => props.active ? 'white' : '#b8860b'};
    border: 2px solid #b8860b;
    border-radius: 8px;
    padding: 0.5rem 1rem;
    font-weight: 600;
    font-size: 0.9rem;
    transition: all 0.3s ease;

    &:hover {
        background: linear-gradient(135deg, #b8860b 0%, #d4af37 100%);
        color: white;
        border-color: #b8860b;
    }
`;

const RankingSection = styled.div`
    margin-top: 2rem;
`;

const RankingTabs = styled.div`
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
    border-bottom: 2px solid #f0f0f0;
`;

const RankingTab = styled.div`
    padding: 1rem 1.5rem;
    font-weight: 600;
    font-size: 1rem;
    color: ${props => props.active ? '#b8860b' : '#6c757d'};
    border-bottom: 3px solid ${props => props.active ? '#b8860b' : 'transparent'};
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    bottom: -2px;

    &:hover {
        color: #b8860b;
    }
`;

const SubTabs = styled.div`
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
`;

const SubTab = styled(Button)`
    background: ${props => props.active ? '#b8860b' : 'white'};
    color: ${props => props.active ? 'white' : '#6c757d'};
    border: 1px solid ${props => props.active ? '#b8860b' : '#dee2e6'};
    border-radius: 6px;
    padding: 0.5rem 1rem;
    font-weight: 500;
    font-size: 0.85rem;
    transition: all 0.3s ease;

    &:hover {
        background: ${props => props.active ? '#b8860b' : '#f8f9fa'};
        color: ${props => props.active ? 'white' : '#b8860b'};
        border-color: #b8860b;
    }
`;

const RankingTable = styled.div`
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

const RankingRow = styled.div`
    display: grid;
    grid-template-columns: 80px 1fr 200px;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #f0f0f0;
    align-items: center;
    gap: 1rem;
    transition: all 0.2s ease;

    &:last-child {
        border-bottom: none;
    }

    &:hover {
        background: #f8f9fa;
        transform: translateX(4px);
    }
`;

const RankingLabel = styled.div`
    font-size: 0.9rem;
    color: #6c757d;
    font-weight: 500;
`;

const RankingValue = styled.div`
    font-size: 0.95rem;
    color: #2c3e50;
    font-weight: 600;
`;

const EmptyState = styled.div`
    text-align: center;
    padding: 3rem 1rem;
    color: #6c757d;

    svg {
        font-size: 3rem;
        margin-bottom: 1rem;
        opacity: 0.3;
    }

    p {
        margin: 0;
        font-size: 0.95rem;
    }
`;

function Analytics({ shopId }) {
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('today'); // today, 7days, 30days, all
    const [orderTypeFilter, setOrderTypeFilter] = useState('all'); // all, confirmed, delivered, paid, conversion
    const [activeRankingTab, setActiveRankingTab] = useState('products'); // products, categories
    const [activeProductSubTab, setActiveProductSubTab] = useState('revenue'); // revenue, quantity, views, conversion
    const [activeCategorySubTab, setActiveCategorySubTab] = useState('all'); // all, category1, category2, etc.
    const [analyticsData, setAnalyticsData] = useState({
        revenue: 0,
        orders: 0,
        conversionRate: 0,
        pageViews: 0,
        revenueChange: 0,
        ordersChange: 0,
        pageViewsChange: 0,
        chartData: [],
        productRankings: {
            byRevenue: [],
            byQuantity: [],
            byViews: [],
            byConversion: []
        }
    });

    useEffect(() => {
        if (shopId) {
            loadAnalyticsData();
        }
    }, [shopId, timeRange, orderTypeFilter]);

    const loadAnalyticsData = async () => {
        try {
            setLoading(true);
            const params = {
                timeRange,
                orderType: orderTypeFilter
            };
            const data = await orderService.getShopAnalytics(shopId, params);
            console.log('Analytics data loaded:', data);
            console.log('Product rankings:', data.productRankings);

            // Debug: Check if we have any product data
            if (data.productRankings) {
                console.log('Revenue rankings:', data.productRankings.byRevenue);
                console.log('Quantity rankings:', data.productRankings.byQuantity);
                console.log('Views rankings:', data.productRankings.byViews);
                console.log('Conversion rankings:', data.productRankings.byConversion);
            }

            setAnalyticsData(data);
            setLoading(false);
        } catch (error) {
            console.error('Error loading analytics:', error);
            setLoading(false);
        }
    };

    const generateMockData = (range) => {
        const dataPoints = range === 'today' ? 24 : range === '7days' ? 7 : range === '30days' ? 30 : 12;
        const chartData = [];
        
        for (let i = 0; i < dataPoints; i++) {
            chartData.push({
                name: range === 'today' ? `${i}:00` : range === '7days' ? `Ngày ${i + 1}` : range === '30days' ? `${i + 1}` : `Tháng ${i + 1}`,
                revenue: Math.floor(Math.random() * 10000000) + 1000000,
                orders: Math.floor(Math.random() * 50) + 5,
                pageViews: Math.floor(Math.random() * 200) + 50
            });
        }

        const totalRevenue = chartData.reduce((sum, item) => sum + item.revenue, 0);
        const totalOrders = chartData.reduce((sum, item) => sum + item.orders, 0);
        const totalPageViews = chartData.reduce((sum, item) => sum + item.pageViews, 0);

        return {
            revenue: totalRevenue,
            orders: totalOrders,
            conversionRate: totalPageViews > 0 ? ((totalOrders / totalPageViews) * 100).toFixed(2) : 0,
            pageViews: totalPageViews,
            revenueChange: (Math.random() * 20 - 10).toFixed(2),
            ordersChange: (Math.random() * 20 - 10).toFixed(2),
            chartData
        };
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN').format(value);
    };

    const getImageUrl = (imagePath) => {
        if (!imagePath) return 'https://via.placeholder.com/50?text=No+Image';
        if (typeof imagePath === 'object' && imagePath.url) {
            imagePath = imagePath.url;
        }
        if (typeof imagePath !== 'string') {
            return 'https://via.placeholder.com/50?text=No+Image';
        }
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            return imagePath;
        }
        return `http://localhost:9999${imagePath}`;
    };

    const getCurrentRankingData = () => {
        const rankings = analyticsData.productRankings;
        switch (activeProductSubTab) {
            case 'revenue':
                return rankings.byRevenue || [];
            case 'quantity':
                return rankings.byQuantity || [];
            case 'views':
                return rankings.byViews || [];
            case 'conversion':
                return rankings.byConversion || [];
            default:
                return [];
        }
    };

    const getRankingValue = (product) => {
        switch (activeProductSubTab) {
            case 'revenue':
                return `₫${formatCurrency(product.revenue)}`;
            case 'quantity':
                return `${product.quantity} sản phẩm`;
            case 'views':
                return `${product.views} lượt xem`;
            case 'conversion':
                return `${product.conversionRate}%`;
            default:
                return '';
        }
    };

    if (loading) {
        return (
            <Container>
                <div className="text-center py-5">
                    <div className="spinner-border text-warning" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </Container>
        );
    }

    return (
        <PageWrapper>
            <Container fluid>
                <PageHeader>
                    <h4><FaChartLine /> Phân tích bán hàng</h4>
                    <p>Theo dõi và phân tích hiệu quả kinh doanh của shop</p>
                </PageHeader>

                {/* Filters */}
                <FilterSection>
                    <div style={{ flex: 1 }}>
                        <Form.Label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#495057', marginBottom: '0.5rem' }}>
                            <FaCalendarAlt className="me-2" />
                            Khoảng thời gian
                        </Form.Label>
                        <TimeRangeButtons>
                            <TimeButton
                                active={timeRange === 'today'}
                                onClick={() => setTimeRange('today')}
                            >
                                Hôm nay
                            </TimeButton>
                            <TimeButton
                                active={timeRange === '7days'}
                                onClick={() => setTimeRange('7days')}
                            >
                                7 ngày
                            </TimeButton>
                            <TimeButton
                                active={timeRange === '30days'}
                                onClick={() => setTimeRange('30days')}
                            >
                                30 ngày
                            </TimeButton>
                            <TimeButton
                                active={timeRange === 'all'}
                                onClick={() => setTimeRange('all')}
                            >
                                Tất cả
                            </TimeButton>
                        </TimeRangeButtons>
                    </div>

                    <div style={{ minWidth: '250px' }}>
                        <Form.Label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#495057', marginBottom: '0.5rem' }}>
                            <FaShoppingCart className="me-2" />
                            Loại Đơn Hàng
                        </Form.Label>
                        <Form.Select
                            style={{
                                borderRadius: '8px',
                                border: '2px solid #e9ecef',
                                padding: '0.5rem 1rem',
                                fontSize: '0.9rem',
                                fontWeight: 500,
                                color: '#495057',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                '&:focus': {
                                    borderColor: '#b8860b',
                                    boxShadow: '0 0 0 0.2rem rgba(184, 134, 11, 0.25)'
                                }
                            }}
                            value={orderTypeFilter}
                            onChange={(e) => setOrderTypeFilter(e.target.value)}
                        >
                            <option value="all">Tất cả</option>
                            <option value="confirmed">Đơn hàng đã đặt</option>
                            <option value="delivered">Đơn đã xác nhận</option>
                            <option value="paid">Đơn Đã Thanh Toán</option>

                        </Form.Select>
                    </div>
                </FilterSection>

                {/* Stats Overview */}
                <StatsGrid>
                    <StatCard>
                        <StatCardBody>
                            <StatHeader>
                                <StatLabel>Doanh số</StatLabel>
                                <StatIcon bg="#fff3e0" color="#ff9800">
                                    <FaMoneyBillWave />
                                </StatIcon>
                            </StatHeader>
                            <StatValue>₫{formatCurrency(analyticsData.revenue)}</StatValue>
                            <StatChange positive={parseFloat(analyticsData.revenueChange) >= 0}>
                                {analyticsData.revenueChange}%
                            </StatChange>
                        </StatCardBody>
                    </StatCard>

                    <StatCard>
                        <StatCardBody>
                            <StatHeader>
                                <StatLabel>Đơn hàng</StatLabel>
                                <StatIcon bg="#e3f2fd" color="#2196f3">
                                    <FaShoppingCart />
                                </StatIcon>
                            </StatHeader>
                            <StatValue>{analyticsData.orders}</StatValue>
                            <StatChange positive={parseFloat(analyticsData.ordersChange) >= 0}>
                                {analyticsData.ordersChange}%
                            </StatChange>
                        </StatCardBody>
                    </StatCard>

                    <StatCard>
                        <StatCardBody>
                            <StatHeader>
                                <StatLabel>Tỷ lệ chuyển đổi đơn hàng</StatLabel>
                                <StatIcon bg="#e8f5e9" color="#4caf50">
                                    <FaChartLine />
                                </StatIcon>
                            </StatHeader>
                            <StatValue>{analyticsData.conversionRate}%</StatValue>
                            <StatChange>0.00%</StatChange>
                        </StatCardBody>
                    </StatCard>

                    <StatCard>
                        <StatCardBody>
                            <StatHeader>
                                <StatLabel>Lượt truy cập</StatLabel>
                                <StatIcon bg="#f3e5f5" color="#9c27b0">
                                    <FaBox />
                                </StatIcon>
                            </StatHeader>
                            <StatValue>{analyticsData.pageViews}</StatValue>
                            <StatChange positive={parseFloat(analyticsData.pageViewsChange) >= 0}>
                                {analyticsData.pageViewsChange}%
                            </StatChange>
                        </StatCardBody>
                    </StatCard>
                </StatsGrid>

                {/* Revenue & Orders Chart */}
                <ChartCard>
                    <Card.Header>
                        <FaChartLine />
                        Biểu đồ
                    </Card.Header>
                    <Card.Body>
                        <ResponsiveContainer width="100%" height={350}>
                            <LineChart data={analyticsData.chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="name"
                                    tick={{ fontSize: 12 }}
                                    stroke="#6c757d"
                                />
                                <YAxis
                                    yAxisId="left"
                                    tick={{ fontSize: 12 }}
                                    stroke="#6c757d"
                                    tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                                />
                                <YAxis
                                    yAxisId="right"
                                    orientation="right"
                                    tick={{ fontSize: 12 }}
                                    stroke="#6c757d"
                                />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '8px',
                                        border: '1px solid #e9ecef',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                    }}
                                    formatter={(value, name) => {
                                        if (name === 'Doanh số') {
                                            return [`₫${formatCurrency(value)}`, name];
                                        }
                                        return [value, name];
                                    }}
                                />
                                <Legend
                                    wrapperStyle={{ paddingTop: '20px' }}
                                    iconType="circle"
                                />
                                <Line
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#00bcd4"
                                    strokeWidth={3}
                                    dot={{ fill: '#00bcd4', r: 4 }}
                                    activeDot={{ r: 6 }}
                                    name="Doanh số"
                                />
                                <Line
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="pageViews"
                                    stroke="#ff9800"
                                    strokeWidth={3}
                                    dot={{ fill: '#ff9800', r: 4 }}
                                    activeDot={{ r: 6 }}
                                    name="Lượt truy cập"
                                />
                                <Line
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="orders"
                                    stroke="#4caf50"
                                    strokeWidth={3}
                                    dot={{ fill: '#4caf50', r: 4 }}
                                    activeDot={{ r: 6 }}
                                    name="Đơn hàng"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </Card.Body>
                </ChartCard>

                {/* Additional Stats */}
                <Row>
                    <Col md={6} className="mb-3">
                        <ChartCard>
                            <Card.Header>
                                <FaBox />
                                Chỉ số theo thời gian thực
                            </Card.Header>
                            <Card.Body>
                                <div style={{ padding: '1rem 0' }}>
                                    <Row className="mb-3">
                                        <Col xs={6}>
                                            <div style={{ fontSize: '0.9rem', color: '#6c757d', marginBottom: '0.5rem' }}>
                                                Lượt truy cập
                                            </div>
                                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#2c3e50' }}>
                                                {analyticsData.pageViews}
                                            </div>
                                        </Col>
                                        <Col xs={6}>
                                            <div style={{ fontSize: '0.9rem', color: '#6c757d', marginBottom: '0.5rem' }}>
                                                Lượt nhấp vào sản phẩm
                                            </div>
                                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#2c3e50' }}>
                                                0
                                            </div>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col xs={6}>
                                            <div style={{ fontSize: '0.9rem', color: '#6c757d', marginBottom: '0.5rem' }}>
                                                Đơn hàng
                                            </div>
                                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#2c3e50' }}>
                                                {analyticsData.orders}
                                            </div>
                                        </Col>
                                        <Col xs={6}>
                                            <div style={{ fontSize: '0.9rem', color: '#6c757d', marginBottom: '0.5rem' }}>
                                                Tỷ lệ chuyển đổi đơn hàng
                                            </div>
                                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#2c3e50' }}>
                                                {analyticsData.conversionRate}%
                                            </div>
                                        </Col>
                                    </Row>
                                </div>
                            </Card.Body>
                        </ChartCard>
                    </Col>

                    <Col md={6} className="mb-3">
                        <ChartCard>
                            <Card.Header>
                                <FaMoneyBillWave />
                                Hiệu suất bán hàng
                            </Card.Header>
                            <Card.Body>
                                <ResponsiveContainer width="100%" height={200}>
                                    <BarChart data={analyticsData.chartData.slice(-7)}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis
                                            dataKey="name"
                                            tick={{ fontSize: 11 }}
                                            stroke="#6c757d"
                                        />
                                        <YAxis
                                            tick={{ fontSize: 11 }}
                                            stroke="#6c757d"
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                borderRadius: '8px',
                                                border: '1px solid #e9ecef'
                                            }}
                                        />
                                        <Bar
                                            dataKey="orders"
                                            fill="#b8860b"
                                            radius={[8, 8, 0, 0]}
                                            name="Đơn hàng"
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Card.Body>
                        </ChartCard>
                    </Col>
                </Row>

                {/* Ranking Section */}
                <RankingSection>
                    <RankingTabs>
                        <RankingTab active={true}>
                            <FaTrophy className="me-2" />
                            Thứ hạng sản phẩm
                        </RankingTab>
                    </RankingTabs>

                    <SubTabs>
                        <SubTab
                            active={activeProductSubTab === 'revenue'}
                            onClick={() => setActiveProductSubTab('revenue')}
                        >
                            Theo doanh số
                        </SubTab>
                        <SubTab
                            active={activeProductSubTab === 'quantity'}
                            onClick={() => setActiveProductSubTab('quantity')}
                        >
                            Theo số sản phẩm
                        </SubTab>
                    
                        
                    </SubTabs>

                    {/* Bar Chart for Top Products */}
                    {getCurrentRankingData().length > 0 && (
                        <ChartCard style={{ marginBottom: '1.5rem' }}>
                            <Card.Header>
                                <FaChartLine />
                                Biểu đồ top 10 sản phẩm
                            </Card.Header>
                            <Card.Body>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart
                                        data={getCurrentRankingData().slice(0, 10)}
                                        layout="vertical"
                                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis
                                            type="number"
                                            tick={{ fontSize: 11 }}
                                            stroke="#6c757d"
                                            tickFormatter={(value) => {
                                                if (activeProductSubTab === 'revenue') {
                                                    return `${(value / 1000000).toFixed(1)}M`;
                                                } else if (activeProductSubTab === 'conversion') {
                                                    return `${value}%`;
                                                }
                                                return value;
                                            }}
                                        />
                                        <YAxis
                                            type="category"
                                            dataKey="productName"
                                            tick={{ fontSize: 10 }}
                                            stroke="#6c757d"
                                            width={150}
                                            tickFormatter={(value) => {
                                                return value.length > 20 ? value.substring(0, 20) + '...' : value;
                                            }}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                borderRadius: '8px',
                                                border: '1px solid #e9ecef',
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                            }}
                                            formatter={(value, name) => {
                                                if (activeProductSubTab === 'revenue') {
                                                    return [`₫${formatCurrency(value)}`, 'Doanh số'];
                                                } else if (activeProductSubTab === 'quantity') {
                                                    return [`${value} sản phẩm`, 'Số lượng'];
                                                } else if (activeProductSubTab === 'views') {
                                                    return [`${value} lượt`, 'Lượt xem'];
                                                } else if (activeProductSubTab === 'conversion') {
                                                    return [`${value}%`, 'Tỷ lệ chuyển đổi'];
                                                }
                                                return [value, name];
                                            }}
                                        />
                                        <Bar
                                            dataKey={
                                                activeProductSubTab === 'revenue' ? 'revenue' :
                                                activeProductSubTab === 'quantity' ? 'quantity' :
                                                activeProductSubTab === 'views' ? 'views' :
                                                'conversionRate'
                                            }
                                            fill="#b8860b"
                                            radius={[0, 8, 8, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Card.Body>
                        </ChartCard>
                    )}

                    <RankingTable>
                        {getCurrentRankingData().length === 0 ? (
                            <EmptyState>
                                <FaBox />
                                <p>Chưa có dữ liệu</p>
                                <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
                                    Chưa có sản phẩm nào trong khoảng thời gian này
                                </p>
                            </EmptyState>
                        ) : (
                            <>
                                {getCurrentRankingData().map((product, index) => (
                                    <RankingRow key={product.productId}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '1rem',
                                            gridColumn: '1 / 2'
                                        }}>
                                            <div style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '50%',
                                                background: index < 3 ?
                                                    (index === 0 ? 'linear-gradient(135deg, #FFD700, #FFA500)' :
                                                     index === 1 ? 'linear-gradient(135deg, #C0C0C0, #808080)' :
                                                     'linear-gradient(135deg, #CD7F32, #8B4513)') :
                                                    '#f0f0f0',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontWeight: 'bold',
                                                fontSize: '1.1rem',
                                                color: index < 3 ? 'white' : '#666',
                                                boxShadow: index < 3 ? '0 2px 8px rgba(0,0,0,0.2)' : 'none'
                                            }}>
                                                {index + 1}
                                            </div>
                                        </div>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '1rem',
                                            gridColumn: '2 / 3'
                                        }}>
                                            <img
                                                src={getImageUrl(product.image)}
                                                alt={product.productName}
                                                style={{
                                                    width: '50px',
                                                    height: '50px',
                                                    objectFit: 'cover',
                                                    borderRadius: '8px',
                                                    border: '1px solid #e0e0e0'
                                                }}
                                                onError={(e) => {
                                                    e.target.src = 'https://via.placeholder.com/50?text=No+Image';
                                                }}
                                            />
                                            <RankingValue style={{ textAlign: 'left' }}>
                                                {product.productName}
                                            </RankingValue>
                                        </div>
                                        <div style={{
                                            gridColumn: '3 / 4',
                                            textAlign: 'right'
                                        }}>
                                            <RankingValue style={{
                                                color: '#b8860b',
                                                fontSize: '1.1rem'
                                            }}>
                                                {getRankingValue(product)}
                                            </RankingValue>
                                        </div>
                                    </RankingRow>
                                ))}
                            </>
                        )}
                    </RankingTable>
                </RankingSection>
            </Container>
        </PageWrapper>
    );
}

export default Analytics;

