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
        totalCategories: 0
    });

    useEffect(() => {
        fetchCommissionData();
    }, [period]);

    const fetchCommissionData = async () => {
        try {
            setLoading(true);
            // TODO: Call API to fetch real data
            setTimeout(() => {
                setLoading(false);
            }, 1000);
        } catch (error) {
            console.error('Error fetching commission data:', error);
            setLoading(false);
        }
    };

    // Mock data - will be replaced with real API data
    const sellerCommissionData = {
        labels: ['Shop A', 'Shop B', 'Shop C', 'Shop D', 'Shop E'],
        datasets: [{
            label: 'Hoa hồng (triệu VND)',
            data: [12.5, 10.2, 8.7, 7.3, 6.1],
            backgroundColor: 'rgba(243, 156, 18, 0.8)',
            borderColor: '#f39c12',
            borderWidth: 1
        }]
    };



    const categoryCommissionData = {
        labels: ['Gốm sứ', 'Thủ công mỹ nghệ', 'Trang sức', 'Tranh vẽ', 'Khác'],
        datasets: [{
            label: 'Hoa hồng',
            data: [25, 20, 18, 15, 12],
            backgroundColor: [
                'rgba(52, 152, 219, 0.8)',
                'rgba(46, 204, 113, 0.8)',
                'rgba(155, 89, 182, 0.8)',
                'rgba(241, 196, 15, 0.8)',
                'rgba(231, 76, 60, 0.8)'
            ],
            borderWidth: 0
        }]
    };

    const regionCommissionData = {
        labels: ['Hà Nội', 'TP.HCM', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ'],
        datasets: [{
            label: 'Hoa hồng (triệu VND)',
            data: [15.5, 18.2, 9.8, 7.5, 6.3],
            backgroundColor: 'rgba(52, 152, 219, 0.8)',
            borderColor: '#3498db',
            borderWidth: 1
        }]
    };

    const commissionHistoryData = {
        labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
        datasets: [{
            label: 'Hoa hồng (triệu VND)',
            data: [8.5, 9.2, 10.5, 11.8, 12.3, 13.5, 14.2, 15.8, 16.5, 17.2, 18.5, 19.8],
            borderColor: '#27ae60',
            backgroundColor: 'rgba(39, 174, 96, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6
        }]
    };

    const topSellersCommission = [
        { id: 1, name: 'Nguyễn Văn A', shop: 'Gốm Sứ Bát Tràng', commission: 12500000, rate: 5.0, orders: 250, color: '#3498db' },
        { id: 2, name: 'Trần Thị B', shop: 'Thủ Công Mỹ Nghệ', commission: 10200000, rate: 5.0, orders: 204, color: '#2ecc71' },
        { id: 3, name: 'Lê Văn C', shop: 'Trang Sức Handmade', commission: 8700000, rate: 5.0, orders: 174, color: '#9b59b6' },
        { id: 4, name: 'Phạm Thị D', shop: 'Tranh Vẽ Nghệ Thuật', commission: 7300000, rate: 5.0, orders: 146, color: '#f39c12' },
        { id: 5, name: 'Hoàng Văn E', shop: 'Đồ Gỗ Mỹ Nghệ', commission: 6100000, rate: 5.0, orders: 122, color: '#e74c3c' }
    ];

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
                            <StatsValue>{stats.avgCommissionRate}%</StatsValue>
                            <StatsChange positive={true}>
                                <FaArrowUp />
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
                            <StatsValue>₫57.3M</StatsValue>
                            <StatsChange positive={true}>
                                <FaArrowUp />
                                +12.5% so với tháng trước
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
                            <StatsValue>156</StatsValue>
                            <StatsChange positive={true}>
                                <FaArrowUp />
                                +8 sellers mới
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
                                <Bar data={sellerCommissionData} options={chartOptions} />
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
                                <Pie data={categoryCommissionData} options={pieChartOptions} />
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
                                <Bar data={regionCommissionData} options={chartOptions} />
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
                                <Line data={commissionHistoryData} options={lineChartOptions} />
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

