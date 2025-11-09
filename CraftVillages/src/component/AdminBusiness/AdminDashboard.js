import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Card, Row, Col, Spinner } from 'react-bootstrap';
import {
    FaMoneyBillWave, FaShoppingCart, FaStore, FaUsers,
    FaChartLine, FaArrowUp, FaArrowDown, FaPercentage
} from 'react-icons/fa';
import { Line, Pie, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import adminService from '../../services/adminService';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const DashboardContainer = styled.div`
    padding: 0;
`;

const PageHeader = styled.div`
    margin-bottom: 2rem;
    
    h2 {
        font-size: 1.75rem;
        font-weight: 700;
        color: #2c3e50;
        margin-bottom: 0.5rem;
    }
    
    p {
        color: #7f8c8d;
        margin: 0;
    }
`;

const StatsCard = styled(Card)`
    border: none;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
    height: 100%;
    
    &:hover {
        transform: translateY(-4px);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    }
`;

const StatsCardBody = styled(Card.Body)`
    padding: 1.5rem;
`;

const StatsIcon = styled.div`
    width: 56px;
    height: 56px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    margin-bottom: 1rem;
    background: ${props => props.gradient};
    color: white;
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
    
    svg {
        font-size: 0.75rem;
    }
`;

const ChartCard = styled(Card)`
    border: none;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    margin-bottom: 1.5rem;
`;

const ChartCardHeader = styled(Card.Header)`
    background: white;
    border-bottom: 1px solid #ecf0f1;
    padding: 1.25rem 1.5rem;
    
    h5 {
        margin: 0;
        font-size: 1.125rem;
        font-weight: 600;
        color: #2c3e50;
    }
`;

const ChartCardBody = styled(Card.Body)`
    padding: 1.5rem;
`;

const AdminDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        totalSellers: 0,
        totalCustomers: 0,
        revenueChange: 0,
        ordersChange: 0,
        sellersChange: 0,
        customersChange: 0
    });
    const [revenueChartData, setRevenueChartData] = useState(null);
    const [categoryChartData, setCategoryChartData] = useState(null);
    const [topSellersData, setTopSellersData] = useState(null);
    const [period, setPeriod] = useState('month');

    useEffect(() => {
        fetchDashboardData();
    }, [period]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Fetch overview stats
            const overviewResponse = await adminService.getRevenueOverview(period);
            if (overviewResponse.success) {
                const { current, changes } = overviewResponse.data;
                setStats({
                    totalRevenue: current.totalRevenue,
                    totalOrders: current.totalOrders,
                    totalSellers: current.totalSellers,
                    totalCustomers: current.totalCustomers,
                    revenueChange: changes.revenueChange,
                    ordersChange: changes.ordersChange,
                    sellersChange: 0,
                    customersChange: 0
                });
            }

            // Fetch revenue chart data (only commission)
            const chartResponse = await adminService.getRevenueChart('year');
            if (chartResponse.success) {
                const { labels, datasets } = chartResponse.data;
                // Only show commission (datasets[1])
                setRevenueChartData({
                    labels,
                    datasets: [
                        {
                            label: 'Doanh thu Hoa hồng (triệu VND)',
                            data: datasets[1].data,
                            borderColor: '#27ae60',
                            backgroundColor: 'rgba(39, 174, 96, 0.1)',
                            fill: true,
                            tension: 0.4,
                            pointRadius: 4,
                            pointHoverRadius: 6
                        }
                    ]
                });
            }

            // Fetch category data
            const categoryResponse = await adminService.getRevenueByCategory(period);
            if (categoryResponse.success) {
                const { labels, data } = categoryResponse.data;
                setCategoryChartData({
                    labels,
                    datasets: [{
                        data,
                        backgroundColor: [
                            '#3498db',
                            '#e74c3c',
                            '#f39c12',
                            '#9b59b6',
                            '#95a5a6',
                            '#1abc9c',
                            '#34495e'
                        ],
                        borderWidth: 0
                    }]
                });
            }

            // Fetch top sellers
            const sellersResponse = await adminService.getTopSellers(5, period);
            if (sellersResponse.success) {
                const { labels, data } = sellersResponse.data;
                setTopSellersData({
                    labels,
                    datasets: [{
                        label: 'Doanh thu (triệu VND)',
                        data,
                        backgroundColor: 'rgba(52, 152, 219, 0.8)',
                        borderColor: '#3498db',
                        borderWidth: 1
                    }]
                });
            }

            setLoading(false);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setLoading(false);
        }
    };

    const revenueChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'top',
            },
            tooltip: {
                mode: 'index',
                intersect: false,
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

    const categoryChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
            }
        }
    };

    const topSellersOptions = {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
            legend: {
                display: false
            }
        },
        scales: {
            x: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)'
                }
            },
            y: {
                grid: {
                    display: false
                }
            }
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    return (
        <DashboardContainer>
            <PageHeader>
                <h2>Dashboard Tổng Quan</h2>
                <p>Chào mừng trở lại! Đây là tổng quan về hoạt động kinh doanh của bạn.</p>
            </PageHeader>

            {/* Stats Cards */}
            <Row className="g-3 mb-4">
                <Col lg={4} md={6}>
                    <StatsCard>
                        <StatsCardBody>
                            <StatsIcon gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
                                <FaMoneyBillWave />
                            </StatsIcon>
                            <StatsLabel>Tổng Doanh Thu</StatsLabel>
                            <StatsValue>₫{stats.totalRevenue.toLocaleString()}</StatsValue>
                            <StatsChange positive={stats.revenueChange > 0}>
                                {stats.revenueChange > 0 ? <FaArrowUp /> : <FaArrowDown />}
                                {Math.abs(stats.revenueChange)}% so với tháng trước
                            </StatsChange>
                        </StatsCardBody>
                    </StatsCard>
                </Col>

                <Col lg={4} md={6}>
                    <StatsCard>
                        <StatsCardBody>
                            <StatsIcon gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)">
                                <FaShoppingCart />
                            </StatsIcon>
                            <StatsLabel>Tổng Đơn Hàng</StatsLabel>
                            <StatsValue>{stats.totalOrders.toLocaleString()}</StatsValue>
                            <StatsChange positive={stats.ordersChange > 0}>
                                {stats.ordersChange > 0 ? <FaArrowUp /> : <FaArrowDown />}
                                {Math.abs(stats.ordersChange)}% so với tháng trước
                            </StatsChange>
                        </StatsCardBody>
                    </StatsCard>
                </Col>

                <Col lg={4} md={6}>
                    <StatsCard>
                        <StatsCardBody>
                            <StatsIcon gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)">
                                <FaStore />
                            </StatsIcon>
                            <StatsLabel>Tổng Sellers</StatsLabel>
                            <StatsValue>{stats.totalSellers.toLocaleString()}</StatsValue>
                            <StatsChange positive={stats.sellersChange > 0}>
                                {stats.sellersChange > 0 ? <FaArrowUp /> : <FaArrowDown />}
                                {Math.abs(stats.sellersChange)}% so với tháng trước
                            </StatsChange>
                        </StatsCardBody>
                    </StatsCard>
                </Col>

                
            </Row>

            {/* Charts */}
            <Row className="g-3">
                <Col lg={8}>
                    <ChartCard>
                        <ChartCardHeader>
                            <h5>Doanh Thu Hoa Hồng Theo Tháng</h5>
                        </ChartCardHeader>
                        <ChartCardBody>
                            <div style={{ height: '350px' }}>
                                {revenueChartData ? (
                                    <Line data={revenueChartData} options={revenueChartOptions} />
                                ) : (
                                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                        <Spinner animation="border" />
                                    </div>
                                )}
                            </div>
                        </ChartCardBody>
                    </ChartCard>
                </Col>

                

                <Col lg={12}>
                    <ChartCard>
                        <ChartCardHeader>
                            <h5>Top 5 Sellers Theo Doanh Thu</h5>
                        </ChartCardHeader>
                        <ChartCardBody>
                            <div style={{ height: '300px' }}>
                                {topSellersData ? (
                                    <Bar data={topSellersData} options={topSellersOptions} />
                                ) : (
                                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                        <Spinner animation="border" />
                                    </div>
                                )}
                            </div>
                        </ChartCardBody>
                    </ChartCard>
                </Col>
            </Row>
        </DashboardContainer>
    );
};

export default AdminDashboard;

