import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Form } from 'react-bootstrap';
import styled from 'styled-components';
import { FaDownload, FaInfoCircle, FaChartLine, FaMoneyBillWave, FaCalendarAlt } from 'react-icons/fa';
import orderService from '../../services/orderService';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Styled Components
const PageWrapper = styled.div`
    background: #f8f9fa;
    min-height: 100vh;
    padding: 2rem 0;
`;

const PageHeader = styled.div`
    margin-bottom: 2rem;
    
    h2 {
        color: #2c3e50;
        font-weight: 700;
        margin-bottom: 0.5rem;
        font-size: 1.75rem;
    }
    
    p {
        color: #6c757d;
        margin: 0;
    }
`;

const InfoBanner = styled.div`
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 12px;
    padding: 1.25rem 1.5rem;
    color: white;
    margin-bottom: 2rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.2);
    
    svg {
        font-size: 1.5rem;
        flex-shrink: 0;
    }
    
    p {
        margin: 0;
        line-height: 1.6;
        font-size: 0.95rem;
    }
`;

const SummaryCard = styled(Card)`
    border: none;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
    height: 100%;
    
    &:hover {
        transform: translateY(-4px);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
    }
`;

const SummaryCardHeader = styled.div`
    padding: 1.25rem 1.5rem;
    background: ${props => props.bg || '#f8f9fa'};
    border-radius: 12px 12px 0 0;
    border-bottom: 2px solid ${props => props.borderColor || '#e9ecef'};
    
    h6 {
        margin: 0;
        color: #495057;
        font-weight: 600;
        font-size: 0.9rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
`;

const SummaryCardBody = styled(Card.Body)`
    padding: 1.5rem;
`;

const AmountDisplay = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    
    .label {
        font-size: 0.85rem;
        color: #6c757d;
        font-weight: 500;
    }
    
    .amount {
        font-size: 1.75rem;
        font-weight: 700;
        color: ${props => props.color || '#2c3e50'};
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
    
    .sub-amount {
        font-size: 0.9rem;
        color: #6c757d;
        margin-top: 0.25rem;
    }
`;

const SectionCard = styled(Card)`
    border: none;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    margin-bottom: 2rem;
`;

const SectionHeader = styled.div`
    padding: 1.25rem 1.5rem;
    background: white;
    border-bottom: 2px solid #f0f0f0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-radius: 12px 12px 0 0;
    
    h5 {
        margin: 0;
        color: #2c3e50;
        font-weight: 600;
        font-size: 1.1rem;
    }
`;

const TabButton = styled(Button)`
    background: ${props => props.active ? 'linear-gradient(135deg, #b8860b, #d4af37)' : 'white'};
    color: ${props => props.active ? 'white' : '#6c757d'};
    border: 2px solid ${props => props.active ? '#b8860b' : '#e9ecef'};
    border-radius: 8px;
    padding: 0.5rem 1.25rem;
    font-weight: 600;
    font-size: 0.9rem;
    transition: all 0.3s ease;
    
    &:hover {
        background: ${props => props.active ? 'linear-gradient(135deg, #9a7209, #b8960b)' : '#f8f9fa'};
        color: ${props => props.active ? 'white' : '#2c3e50'};
        border-color: ${props => props.active ? '#9a7209' : '#dee2e6'};
        transform: translateY(-2px);
    }
    
    &:focus {
        box-shadow: none;
    }
`;

const StyledTable = styled(Table)`
    margin: 0;
    
    thead {
        background: #f8f9fa;
        
        th {
            border: none;
            color: #495057;
            font-weight: 600;
            font-size: 0.85rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            padding: 1rem 1.25rem;
        }
    }
    
    tbody {
        tr {
            transition: background 0.2s ease;
            
            &:hover {
                background: #f8f9fa;
            }
            
            td {
                padding: 1rem 1.25rem;
                vertical-align: middle;
                border-color: #f0f0f0;
                color: #495057;
            }
        }
    }
`;

const EmptyState = styled.div`
    text-align: center;
    padding: 4rem 2rem;
    color: #6c757d;
    
    svg {
        font-size: 4rem;
        color: #dee2e6;
        margin-bottom: 1rem;
    }
    
    h5 {
        color: #495057;
        margin-bottom: 0.5rem;
    }
    
    p {
        color: #6c757d;
        margin: 0;
    }
`;

const FilterSection = styled.div`
    background: white;
    padding: 1.25rem 1.5rem;
    border-radius: 12px;
    margin-bottom: 2rem;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    display: flex;
    gap: 1rem;
    align-items: end;
    flex-wrap: wrap;
`;

const DateRangeCard = styled(Card)`
    border: 2px solid #e9ecef;
    border-radius: 8px;
    transition: all 0.3s ease;
    cursor: pointer;

    &:hover {
        border-color: #b8860b;
        box-shadow: 0 2px 8px rgba(184, 134, 11, 0.15);
    }
`;

const ProductImageContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
`;

const ProductImageWrapper = styled.div`
    position: relative;
    display: inline-block;
`;

const ProductImage = styled.img`
    width: 40px;
    height: 40px;
    object-fit: cover;
    border-radius: 6px;
    border: 1px solid #e9ecef;
`;

const ProductQuantityBadge = styled.div`
    position: absolute;
    top: -6px;
    right: -6px;
    background: #b8860b;
    color: white;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7rem;
    font-weight: 700;
    border: 2px solid white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const ProductImageBadge = styled.div`
    width: 40px;
    height: 40px;
    border-radius: 6px;
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 600;
    color: #6c757d;
`;

const ChartSection = styled.div`
    margin-bottom: 30px;
`;

const ChartCard = styled(Card)`
    border: none;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    overflow: hidden;

    .card-header {
        background: linear-gradient(135deg, #b8860b 0%, #d4af37 100%);
        color: white;
        font-weight: 600;
        padding: 15px 20px;
        border: none;

        h6 {
            margin: 0;
            font-size: 1rem;
            display: flex;
            align-items: center;
            gap: 10px;
        }
    }

    .card-body {
        padding: 25px;
    }
`;

const ChartGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 30px;

    @media (max-width: 992px) {
        grid-template-columns: 1fr;
    }
`;

function Revenue({ shopId }) {
    const [activeTab, setActiveTab] = useState('unpaid');
    const [loading, setLoading] = useState(true);
    const [revenueData, setRevenueData] = useState({
        unpaid: { total: 0, thisWeek: 0, thisMonth: 0, cumulative: 0 },
        paid: { total: 0, thisWeek: 0, thisMonth: 0, cumulative: 0 },
        transactions: []
    });
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [paymentMethodFilter, setPaymentMethodFilter] = useState('');
    const [dateRange, setDateRange] = useState({
        startDate: '',
        endDate: ''
    });

    useEffect(() => {
        if (shopId) {
            loadRevenueData();
        }
    }, [shopId, dateRange]);

    useEffect(() => {
        filterTransactions();
    }, [activeTab, searchQuery, statusFilter, paymentMethodFilter, revenueData.transactions]);

    const loadRevenueData = async () => {
        try {
            setLoading(true);
            const params = {};
            if (dateRange.startDate) params.startDate = dateRange.startDate;
            if (dateRange.endDate) params.endDate = dateRange.endDate;

            const data = await orderService.getShopRevenue(shopId, params);
            console.log('Revenue data loaded:', data);
            setRevenueData(data);
            setLoading(false);
        } catch (error) {
            console.error('Error loading revenue data:', error);
            setLoading(false);
        }
    };

    const filterTransactions = () => {
        let filtered = revenueData.transactions || [];

        // Filter by tab (paid/unpaid)
        if (activeTab === 'unpaid') {
            filtered = filtered.filter(t => t.status !== 'PAID');
        } else {
            filtered = filtered.filter(t => t.status === 'PAID');
        }

        // Filter by search query
        if (searchQuery) {
            filtered = filtered.filter(t =>
                t.orderId.toString().toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Filter by status
        if (statusFilter) {
            filtered = filtered.filter(t => t.orderStatus === statusFilter);
        }

        // Filter by payment method
        if (paymentMethodFilter) {
            filtered = filtered.filter(t => t.paymentMethod === paymentMethodFilter);
        }

        setFilteredTransactions(filtered);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN').format(amount || 0);
    };

    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('vi-VN');
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            'PAID': { bg: 'success', text: 'Đã thanh toán' },
            'PENDING': { bg: 'warning', text: 'Chờ thanh toán' },
            'HELD_IN_ESCROW': { bg: 'info', text: 'Đang giữ' },
            'REFUNDED': { bg: 'danger', text: 'Đã hoàn tiền' },
            'FAILED': { bg: 'danger', text: 'Thất bại' },
            'CANCELLED': { bg: 'secondary', text: 'Đã hủy' }
        };
        return statusMap[status] || { bg: 'secondary', text: status };
    };

    const getPaymentMethodText = (method) => {
        const methodMap = {
            'COD': 'Thanh toán khi nhận hàng',
            'VNPay': 'VNPay',
            'Momo': 'Momo',
            'BankTransfer': 'Chuyển khoản ngân hàng'
        };
        return methodMap[method] || method;
    };

    return (
        <PageWrapper>
            <Container fluid>
                <PageHeader>
                    <h2>Tài Chính</h2>
                    <p>Quản lý doanh thu và theo dõi giao dịch của shop</p>
                </PageHeader>

                <InfoBanner>
                    <FaInfoCircle />
                    <p>
                        Các số dưới đây bao gồm tiền chiết khấu thu được từ người mua. Vui lòng xem Báo cáo thu nhập để kiểm tra chi tiết các khoản chiết khấu liên quan.
                    </p>
                </InfoBanner>

                {/* Charts Section */}
                <ChartSection>
                    <ChartGrid>
                        {/* Bar Chart - Comparison */}
                        <ChartCard>
                            <Card.Header>
                                <h6><FaChartLine /> Biểu đồ so sánh doanh thu</h6>
                            </Card.Header>
                            <Card.Body>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={[
                                        {
                                            name: 'Tuần này',
                                            'Chưa thanh toán': revenueData.unpaid.thisWeek,
                                            'Đã thanh toán': revenueData.paid.thisWeek
                                        },
                                        {
                                            name: 'Tháng này',
                                            'Chưa thanh toán': revenueData.unpaid.thisMonth,
                                            'Đã thanh toán': revenueData.paid.thisMonth
                                        },
                                        {
                                            name: 'Tổng cộng',
                                            'Chưa thanh toán': revenueData.unpaid.cumulative,
                                            'Đã thanh toán': revenueData.paid.cumulative
                                        }
                                    ]}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
                                        <Tooltip
                                            formatter={(value) => `₫${formatCurrency(value)}`}
                                            contentStyle={{ borderRadius: '8px', border: '1px solid #e9ecef' }}
                                        />
                                        <Legend />
                                        <Bar dataKey="Chưa thanh toán" fill="#ff9800" radius={[8, 8, 0, 0]} />
                                        <Bar dataKey="Đã thanh toán" fill="#4caf50" radius={[8, 8, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Card.Body>
                        </ChartCard>

                        {/* Pie Chart - Total Revenue Distribution */}
                        <ChartCard>
                            <Card.Header>
                                <h6><FaMoneyBillWave /> Tỷ lệ doanh thu</h6>
                            </Card.Header>
                            <Card.Body>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={[
                                                { name: 'Chưa thanh toán', value: revenueData.unpaid.cumulative },
                                                { name: 'Đã thanh toán', value: revenueData.paid.cumulative }
                                            ]}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            <Cell fill="#ff9800" />
                                            <Cell fill="#4caf50" />
                                        </Pie>
                                        <Tooltip
                                            formatter={(value) => `₫${formatCurrency(value)}`}
                                            contentStyle={{ borderRadius: '8px', border: '1px solid #e9ecef' }}
                                        />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </Card.Body>
                        </ChartCard>
                    </ChartGrid>
                </ChartSection>

                {/* Summary Cards */}
                <Row className="mb-4">
                    <Col md={6} className="mb-3">
                        <SummaryCard>
                            <SummaryCardHeader bg="#fff3e0" borderColor="#ff9800">
                                <h6>Chưa thanh toán</h6>
                            </SummaryCardHeader>
                            <SummaryCardBody>
                                <Row>
                                    <Col xs={4}>
                                        <AmountDisplay color="#ff9800">
                                            <div className="label">Tuần này</div>
                                            <div className="amount">₫{formatCurrency(revenueData.unpaid.thisWeek)}</div>
                                        </AmountDisplay>
                                    </Col>
                                    <Col xs={4}>
                                        <AmountDisplay color="#ff9800">
                                            <div className="label">Tháng này</div>
                                            <div className="amount">₫{formatCurrency(revenueData.unpaid.thisMonth)}</div>
                                        </AmountDisplay>
                                    </Col>
                                    <Col xs={4}>
                                        <AmountDisplay color="#ff9800">
                                            <div className="label">Tổng cộng</div>
                                            <div className="amount">₫{formatCurrency(revenueData.unpaid.cumulative)}</div>
                                        </AmountDisplay>
                                    </Col>
                                </Row>
                            </SummaryCardBody>
                        </SummaryCard>
                    </Col>

                    <Col md={6} className="mb-3">
                        <SummaryCard>
                            <SummaryCardHeader bg="#e8f5e9" borderColor="#4caf50">
                                <h6>Đã thanh toán</h6>
                            </SummaryCardHeader>
                            <SummaryCardBody>
                                <Row>
                                    <Col xs={4}>
                                        <AmountDisplay color="#4caf50">
                                            <div className="label">Tuần này</div>
                                            <div className="amount">₫{formatCurrency(revenueData.paid.thisWeek)}</div>
                                        </AmountDisplay>
                                    </Col>
                                    <Col xs={4}>
                                        <AmountDisplay color="#4caf50">
                                            <div className="label">Tháng này</div>
                                            <div className="amount">₫{formatCurrency(revenueData.paid.thisMonth)}</div>
                                        </AmountDisplay>
                                    </Col>
                                    <Col xs={4}>
                                        <AmountDisplay color="#4caf50">
                                            <div className="label">Tổng cộng</div>
                                            <div className="amount">₫{formatCurrency(revenueData.paid.cumulative)}</div>
                                        </AmountDisplay>
                                    </Col>
                                </Row>
                            </SummaryCardBody>
                        </SummaryCard>
                    </Col>
                </Row>

                {/* Transactions Section */}
                <SectionCard>
                    <SectionHeader>
                        <h5>
                            <FaChartLine className="me-2" />
                            Chi Tiết
                        </h5>
                        <div className="d-flex gap-2">
                            <TabButton
                                active={activeTab === 'unpaid'}
                                onClick={() => setActiveTab('unpaid')}
                            >
                                Chưa thanh toán
                            </TabButton>
                            <TabButton
                                active={activeTab === 'paid'}
                                onClick={() => setActiveTab('paid')}
                            >
                                Đã thanh toán
                            </TabButton>
                        </div>
                    </SectionHeader>

                    <Card.Body className="p-0">
                        {loading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        ) : filteredTransactions.length === 0 ? (
                            <EmptyState>
                                <FaMoneyBillWave />
                                <h5>Không có dữ liệu</h5>
                                <p>Chưa có giao dịch nào trong khoảng thời gian này</p>
                            </EmptyState>
                        ) : (
                            <>
                                <FilterSection>
                                    <Form.Group style={{ minWidth: '200px' }}>
                                        <Form.Label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#495057' }}>
                                            Đơn hàng
                                        </Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Tìm kiếm đơn hàng"
                                            style={{ borderRadius: '8px' }}
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </Form.Group>
                                    <Form.Group style={{ minWidth: '180px' }}>
                                        <Form.Label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#495057' }}>
                                            Trạng thái đơn hàng
                                        </Form.Label>
                                        <Form.Select
                                            style={{ borderRadius: '8px' }}
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                        >
                                            <option value="">Tất cả</option>
                                            <option value="PENDING">Chờ xử lý</option>
                                            <option value="PROCESSING">Đang xử lý</option>
                                            <option value="CONFIRMED">Đã xác nhận</option>
                                            <option value="SHIPPED">Đang giao</option>
                                            <option value="DELIVERED">Đã giao</option>
                                        </Form.Select>
                                    </Form.Group>
                                    <Form.Group style={{ minWidth: '180px' }}>
                                        <Form.Label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#495057' }}>
                                            Phương thức
                                        </Form.Label>
                                        <Form.Select
                                            style={{ borderRadius: '8px' }}
                                            value={paymentMethodFilter}
                                            onChange={(e) => setPaymentMethodFilter(e.target.value)}
                                        >
                                            <option value="">Tất cả</option>
                                            <option value="COD">COD</option>
                                            <option value="VNPay">VNPay</option>
                                            <option value="Momo">Momo</option>
                                            <option value="BankTransfer">Chuyển khoản</option>
                                        </Form.Select>
                                    </Form.Group>
                                </FilterSection>

                                <StyledTable responsive hover>
                                    <thead>
                                        <tr>
                                            <th>Đơn hàng</th>
                                            <th>Sản phẩm</th>
                                            <th>Ngày thanh toán dự kiến</th>
                                            <th>Trạng thái thanh toán</th>
                                            <th>Phương thức thanh toán</th>
                                            <th className="text-end">Số tiền</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredTransactions.map((transaction, index) => {
                                            const statusBadge = getStatusBadge(transaction.status);
                                            const products = transaction.products || [];
                                            const displayProducts = products.slice(0, 3);
                                            const remainingCount = products.length - 3;

                                            return (
                                                <tr key={index}>
                                                    <td>
                                                        <div style={{ fontWeight: 600, color: '#2c3e50' }}>
                                                            #{transaction.orderId.toString().slice(-8)}
                                                        </div>
                                                        <div style={{ fontSize: '0.85rem', color: '#6c757d' }}>
                                                            {formatDate(transaction.date)}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <ProductImageContainer>
                                                            {displayProducts.map((product, idx) => (
                                                                <ProductImageWrapper key={idx}>
                                                                    <ProductImage
                                                                        src={product.thumbnailUrl}
                                                                        alt={product.productName}
                                                                        title={`${product.productName} (x${product.quantity})`}
                                                                    />
                                                                    {product.quantity > 1 && (
                                                                        <ProductQuantityBadge>
                                                                            {product.quantity}
                                                                        </ProductQuantityBadge>
                                                                    )}
                                                                </ProductImageWrapper>
                                                            ))}
                                                            {remainingCount > 0 && (
                                                                <ProductImageBadge title={`+${remainingCount} sản phẩm khác`}>
                                                                    +{remainingCount}
                                                                </ProductImageBadge>
                                                            )}
                                                        </ProductImageContainer>
                                                    </td>
                                                    <td>{formatDate(transaction.expectedDate)}</td>
                                                    <td>
                                                        <Badge bg={statusBadge.bg}>
                                                            {statusBadge.text}
                                                        </Badge>
                                                    </td>
                                                    <td>{getPaymentMethodText(transaction.paymentMethod)}</td>
                                                    <td className="text-end">
                                                        <div style={{ fontWeight: 700, color: '#2c3e50', fontSize: '1.05rem' }}>
                                                            ₫{formatCurrency(transaction.amount)}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </StyledTable>
                            </>
                        )}
                    </Card.Body>
                </SectionCard>
            </Container>
        </PageWrapper>
    );
}

export default Revenue;

