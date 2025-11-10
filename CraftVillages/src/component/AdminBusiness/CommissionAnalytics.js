import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Card, Row, Col, Spinner, Table, Badge, Form } from 'react-bootstrap';
import {
    FaPercentage, FaStore, FaMapMarkerAlt, FaChartPie,
    FaHistory, FaArrowUp, FaArrowDown, FaFilter
} from 'react-icons/fa';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import adminService from '../../services/adminService';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const PageContainer = styled.div`
    padding: 0;
`;

const PageHeader = styled.div`
    margin-bottom: 2rem;

    h2 {
        font-size: 1.75rem;
        font-weight: 700;
        color: #2c3e50;
        margin-bottom: 0.5rem;
        display: flex;
        align-items: center;
        gap: 0.75rem;

        svg {
            color: #f39c12;
        }
    }

    p {
        color: #7f8c8d;
        margin: 0;
    }
`;

const FilterBar = styled.div`
    background: white;
    padding: 1.25rem;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    margin-bottom: 1.5rem;
    display: flex;
    gap: 1rem;
    align-items: center;
    flex-wrap: wrap;
`;

const FilterLabel = styled.label`
    font-weight: 600;
    color: #2c3e50;
    margin-right: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const StatsCard = styled(Card)`
    border: none;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.08);
    transition: transform 0.2s, box-shadow 0.2s;
    height: 100%;

    &:hover {
        transform: translateY(-4px);
        box-shadow: 0 4px 20px rgba(0,0,0,0.12);
    }
`;

const StatsCardBody = styled(Card.Body)`
    padding: 1.5rem;
`;

const StatsIcon = styled.div`
    width: 56px;
    height: 56px;
    border-radius: 12px;
    background: ${props => props.gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1rem;

    svg {
        font-size: 1.5rem;
        color: white;
    }
`;

const StatsLabel = styled.div`
    font-size: 0.875rem;
    color: #7f8c8d;
    margin-bottom: 0.5rem;
    font-weight: 500;
`;

const StatsValue = styled.div`
    font-size: 1.75rem;
    font-weight: 700;
    color: #2c3e50;
    margin-bottom: 0.5rem;
`;

const StatsChange = styled.div`
    font-size: 0.875rem;
    color: ${props => props.positive ? '#27ae60' : '#e74c3c'};
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-weight: 600;

    svg {
        font-size: 0.75rem;
    }
`;

const ChartCard = styled(Card)`
    border: none;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.08);
    height: 100%;
`;

const ChartCardHeader = styled(Card.Header)`
    background: white;
    border-bottom: 2px solid #f8f9fa;
    padding: 1.25rem 1.5rem;

    h5 {
        margin: 0;
        font-size: 1.125rem;
        font-weight: 700;
        color: #2c3e50;
    }
`;

const ChartCardBody = styled(Card.Body)`
    padding: 1.5rem;
`;

const TableCard = styled(Card)`
    border: none;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.08);
    margin-top: 1.5rem;
`;

const StyledTable = styled(Table)`
    margin: 0;

    thead {
        background: #f8f9fa;

        th {
            border: none;
            color: #2c3e50;
            font-weight: 700;
            font-size: 0.875rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            padding: 1rem;
        }
    }

    tbody {
        tr {
            transition: background-color 0.2s;

            &:hover {
                background-color: #f8f9fa;
            }

            td {
                padding: 1rem;
                vertical-align: middle;
                border-color: #f1f3f5;
            }
        }
    }
`;

const SellerInfo = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
`;

const SellerAvatar = styled.div`
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: ${props => props.color || '#3498db'};
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 700;
    font-size: 1rem;
`;

const SellerDetails = styled.div`
    .name {
        font-weight: 600;
        color: #2c3e50;
        margin-bottom: 0.125rem;
    }

    .shop {
        font-size: 0.875rem;
        color: #7f8c8d;
    }
`;

const CommissionAnalytics = () => {
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('month');
    const [stats, setStats] = useState({
        avgCommissionRate: 5.0,
        totalCommission: 0,
        totalSellers: 0,
        totalOrders: 0
    });
    const [sellerCommissionData, setSellerCommissionData] = useState(null);
    const [categoryCommissionData, setCategoryCommissionData] = useState(null);
    const [regionCommissionData, setRegionCommissionData] = useState(null);
    const [commissionHistoryData, setCommissionHistoryData] = useState(null);
    const [topSellersCommission, setTopSellersCommission] = useState([]);

    useEffect(() => {
        fetchCommissionData();
    }, [period]);

    const fetchCommissionData = async () => {
        try {
            setLoading(true);

            // Fetch commission analytics stats
            const analyticsResponse = await adminService.getCommissionAnalytics(period);
            if (analyticsResponse.success) {
                setStats(analyticsResponse.data);
            }

            // Fetch commission by seller
            const sellerResponse = await adminService.getCommissionBySeller(5, period);
            if (sellerResponse.success) {
                const { labels, data, details } = sellerResponse.data;
                setSellerCommissionData({
                    labels,
                    datasets: [{
                        label: 'Hoa hồng (triệu VND)',
                        data,
                        backgroundColor: 'rgba(243, 156, 18, 0.8)',
                        borderColor: '#f39c12',
                        borderWidth: 1
                    }]
                });

                // Set top sellers for table
                const colors = ['#3498db', '#2ecc71', '#9b59b6', '#f39c12', '#e74c3c'];
                setTopSellersCommission(details.map((seller, index) => ({
                    ...seller,
                    color: colors[index % colors.length]
                })));
            }

            // Fetch commission by category
            const categoryResponse = await adminService.getRevenueByCategory(period);
            if (categoryResponse.success) {
                const { labels, data } = categoryResponse.data;
                setCategoryCommissionData({
                    labels,
                    datasets: [{
                        label: 'Hoa hồng',
                        data,
                        backgroundColor: [
                            'rgba(52, 152, 219, 0.8)',
                            'rgba(46, 204, 113, 0.8)',
                            'rgba(155, 89, 182, 0.8)',
                            'rgba(241, 196, 15, 0.8)',
                            'rgba(231, 76, 60, 0.8)'
                        ],
                        borderWidth: 0
                    }]
                });
            }

            // Fetch commission by region
            const regionResponse = await adminService.getCommissionByRegion(period);
            if (regionResponse.success) {
                const { labels, data } = regionResponse.data;
                setRegionCommissionData({
                    labels,
                    datasets: [{
                        label: 'Hoa hồng (triệu VND)',
                        data,
                        backgroundColor: 'rgba(52, 152, 219, 0.8)',
                        borderColor: '#3498db',
                        borderWidth: 1
                    }]
                });
            }

            // Fetch commission history
            const historyResponse = await adminService.getCommissionHistory();
            if (historyResponse.success) {
                const { labels, data } = historyResponse.data;
                setCommissionHistoryData({
                    labels,
                    datasets: [{
                        label: 'Hoa hồng (triệu VND)',
                        data,
                        borderColor: '#27ae60',
                        backgroundColor: 'rgba(39, 174, 96, 0.1)',
                        fill: true,
                        tension: 0.4,
                        pointRadius: 4,
                        pointHoverRadius: 6
                    }]
                });
            }

            setLoading(false);
        } catch (error) {
            console.error('Error fetching commission data:', error);
            setLoading(false);
        }
    };

    // Mock data for commission rate history (this would come from a separate collection in real app)

    const commissionRateHistory = [
        { date: '2024-01-01', oldRate: 4.5, newRate: 5.0, reason: 'Điều chỉnh chính sách mới', appliedTo: 'Tất cả sellers' },
        { date: '2023-10-15', oldRate: 4.0, newRate: 4.5, reason: 'Tăng tỷ lệ theo mùa', appliedTo: 'Danh mục Gốm sứ' },
        { date: '2023-07-01', oldRate: 3.5, newRate: 4.0, reason: 'Điều chỉnh theo thị trường', appliedTo: 'Tất cả sellers' }
    ];

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'top',
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)'
                }
            },
            x: {
                grid: {
                    display: false
                }
            }
        }
    };

    const pieChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
            }
        }
    };

    const lineChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'top',
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)'
                }
            },
            x: {
                grid: {
                    display: false
                }
            }
        }
    };

    return (
        <PageContainer>
            <PageHeader>
                <h2>
                    <FaPercentage />
                    Phân Tích Hoa Hồng
                </h2>
                <p>Theo dõi và phân tích hoa hồng từ các sellers</p>
            </PageHeader>

            {/* Filter Bar */}
            <FilterBar>
                <FilterLabel>
                    <FaFilter />
                    Thời gian:
                </FilterLabel>
                <Form.Select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    style={{ width: '200px' }}
                >
                    <option value="day">Hôm nay</option>
                    <option value="week">Tuần này</option>
                    <option value="month">Tháng này</option>
                    <option value="year">Năm nay</option>
                </Form.Select>
            </FilterBar>

            {/* Stats Cards */}
            <Row className="g-3 mb-4">
                <Col lg={3} md={6}>
                    <StatsCard>
                        <StatsCardBody>
                            <StatsIcon gradient="linear-gradient(135deg, #f39c12 0%, #e67e22 100%)">
                                <FaPercentage />
                            </StatsIcon>
                            <StatsLabel>Tỷ Lệ Hoa Hồng TB</StatsLabel>
                            <StatsValue>{stats.avgCommissionRate.toFixed(1)}%</StatsValue>
                            <StatsChange positive={true}>
                                Ổn định
                            </StatsChange>
                        </StatsCardBody>
                    </StatsCard>
                </Col>

                <Col lg={3} md={6}>
                    <StatsCard>
                        <StatsCardBody>
                            <StatsIcon gradient="linear-gradient(135deg, #27ae60 0%, #229954 100%)">
                                <FaChartPie />
                            </StatsIcon>
                            <StatsLabel>Tổng Hoa Hồng</StatsLabel>
                            <StatsValue>₫{(stats.totalCommission / 1000000).toFixed(1)}M</StatsValue>
                            <StatsChange positive={true}>
                                <FaArrowUp />
                                Kỳ {period === 'day' ? 'hôm nay' : period === 'week' ? 'tuần này' : period === 'month' ? 'tháng này' : 'năm nay'}
                            </StatsChange>
                        </StatsCardBody>
                    </StatsCard>
                </Col>

                <Col lg={3} md={6}>
                    <StatsCard>
                        <StatsCardBody>
                            <StatsIcon gradient="linear-gradient(135deg, #3498db 0%, #2980b9 100%)">
                                <FaStore />
                            </StatsIcon>
                            <StatsLabel>Sellers Đóng Góp</StatsLabel>
                            <StatsValue>{stats.totalSellers}</StatsValue>
                            <StatsChange positive={true}>
                                <FaArrowUp />
                                {stats.totalOrders} đơn hàng
                            </StatsChange>
                        </StatsCardBody>
                    </StatsCard>
                </Col>

                <Col lg={3} md={6}>
                    <StatsCard>
                        <StatsCardBody>
                            <StatsIcon gradient="linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)">
                                <FaMapMarkerAlt />
                            </StatsIcon>
                            <StatsLabel>Khu Vực Hoạt Động</StatsLabel>
                            <StatsValue>5</StatsValue>
                            <StatsChange positive={false}>
                                Không đổi
                            </StatsChange>
                        </StatsCardBody>
                    </StatsCard>
                </Col>
            </Row>

            {/* Charts Row 1 */}
            <Row className="g-3 mb-3">
                <Col lg={8}>
                    <ChartCard>
                        <ChartCardHeader>
                            <h5>Hoa Hồng Theo Seller (Top 5)</h5>
                        </ChartCardHeader>
                        <ChartCardBody>
                            <div style={{ height: '350px' }}>
                                {sellerCommissionData ? (
                                    <Bar data={sellerCommissionData} options={chartOptions} />
                                ) : (
                                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                        <Spinner animation="border" variant="primary" />
                                    </div>
                                )}
                            </div>
                        </ChartCardBody>
                    </ChartCard>
                </Col>

                <Col lg={4}>
                    <ChartCard>
                        <ChartCardHeader>
                            <h5>Hoa Hồng Theo Danh Mục</h5>
                        </ChartCardHeader>
                        <ChartCardBody>
                            <div style={{ height: '350px' }}>
                                {categoryCommissionData ? (
                                    <Pie data={categoryCommissionData} options={pieChartOptions} />
                                ) : (
                                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                        <Spinner animation="border" variant="primary" />
                                    </div>
                                )}
                            </div>
                        </ChartCardBody>
                    </ChartCard>
                </Col>
            </Row>

            {/* Charts Row 2 */}
            <Row className="g-3 mb-3">
                <Col lg={6}>
                    <ChartCard>
                        <ChartCardHeader>
                            <h5>Hoa Hồng Theo Khu Vực</h5>
                        </ChartCardHeader>
                        <ChartCardBody>
                            <div style={{ height: '300px' }}>
                                {regionCommissionData ? (
                                    <Bar data={regionCommissionData} options={chartOptions} />
                                ) : (
                                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                        <Spinner animation="border" variant="primary" />
                                    </div>
                                )}
                            </div>
                        </ChartCardBody>
                    </ChartCard>
                </Col>

                <Col lg={6}>
                    <ChartCard>
                        <ChartCardHeader>
                            <h5>Lịch Sử Hoa Hồng Theo Tháng</h5>
                        </ChartCardHeader>
                        <ChartCardBody>
                            <div style={{ height: '300px' }}>
                                {commissionHistoryData ? (
                                    <Line data={commissionHistoryData} options={lineChartOptions} />
                                ) : (
                                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                        <Spinner animation="border" variant="primary" />
                                    </div>
                                )}
                            </div>
                        </ChartCardBody>
                    </ChartCard>
                </Col>
            </Row>

            {/* Top Sellers Table */}
            <TableCard>
                <ChartCardHeader>
                    <h5>Top Sellers Theo Hoa Hồng</h5>
                </ChartCardHeader>
                <Card.Body style={{ padding: 0 }}>
                    <StyledTable responsive>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Seller</th>
                                <th>Hoa Hồng</th>
                                <th>Tỷ Lệ</th>
                                <th>Đơn Hàng</th>
                                <th>Trạng Thái</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topSellersCommission.map((seller, index) => (
                                <tr key={seller.id}>
                                    <td><strong>{index + 1}</strong></td>
                                    <td>
                                        <SellerInfo>
                                            <SellerAvatar color={seller.color}>
                                                {seller.name.charAt(0)}
                                            </SellerAvatar>
                                            <SellerDetails>
                                                <div className="name">{seller.name}</div>
                                                <div className="shop">{seller.shop}</div>
                                            </SellerDetails>
                                        </SellerInfo>
                                    </td>
                                    <td>
                                        <strong style={{ color: '#27ae60' }}>
                                            ₫{seller.commission.toLocaleString()}
                                        </strong>
                                    </td>
                                    <td>
                                        <Badge bg="warning" text="dark">{seller.rate}%</Badge>
                                    </td>
                                    <td>{seller.orders} đơn</td>
                                    <td>
                                        <Badge bg="success">Hoạt động</Badge>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </StyledTable>
                </Card.Body>
            </TableCard>

            {/* Commission Rate History */}
            <TableCard>
                <ChartCardHeader>
                    <h5>
                        <FaHistory style={{ marginRight: '0.5rem' }} />
                        Lịch Sử Thay Đổi Tỷ Lệ Hoa Hồng
                    </h5>
                </ChartCardHeader>
                <Card.Body style={{ padding: 0 }}>
                    <StyledTable responsive>
                        <thead>
                            <tr>
                                <th>Ngày Thay Đổi</th>
                                <th>Tỷ Lệ Cũ</th>
                                <th>Tỷ Lệ Mới</th>
                                <th>Thay Đổi</th>
                                <th>Lý Do</th>
                                <th>Áp Dụng Cho</th>
                            </tr>
                        </thead>
                        <tbody>
                            {commissionRateHistory.map((history, index) => (
                                <tr key={index}>
                                    <td>{new Date(history.date).toLocaleDateString('vi-VN')}</td>
                                    <td>
                                        <Badge bg="secondary">{history.oldRate}%</Badge>
                                    </td>
                                    <td>
                                        <Badge bg="warning" text="dark">{history.newRate}%</Badge>
                                    </td>
                                    <td>
                                        <StatsChange positive={history.newRate > history.oldRate}>
                                            {history.newRate > history.oldRate ? <FaArrowUp /> : <FaArrowDown />}
                                            {Math.abs(history.newRate - history.oldRate)}%
                                        </StatsChange>
                                    </td>
                                    <td>{history.reason}</td>
                                    <td>
                                        <Badge bg="info">{history.appliedTo}</Badge>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </StyledTable>
                </Card.Body>
            </TableCard>
        </PageContainer>
    );
};

export default CommissionAnalytics;

