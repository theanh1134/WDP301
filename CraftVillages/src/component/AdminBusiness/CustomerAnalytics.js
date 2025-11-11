import React, { useEffect, useState, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import { Card, Col, Row, Spinner, Table, Badge, Form, Button } from 'react-bootstrap';
import {
    FaUsers,
    FaUserCheck,
    FaDollarSign,
    FaRedoAlt,
    FaChartBar,
    FaTrophy,
    FaSearch,
    FaSyncAlt,
    FaFilter
} from 'react-icons/fa';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import adminService from '../../services/adminService';
import CustomerTable from './CustomerTable';

const PageWrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
`;

const PageHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;

    h2 {
        font-size: 1.75rem;
        font-weight: 700;
        color: #2c3e50;
        margin: 0;
    }
`;

const HeaderActions = styled.div`
    display: flex;
    gap: 0.75rem;
    align-items: center;
`;

const RefreshButton = styled.button`
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.55rem 1.2rem;
    border-radius: 12px;
    border: none;
    background: linear-gradient(135deg, #1abc9c 0%, #16a085 100%);
    color: white;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;

    &:hover {
        transform: translateY(-1px);
        box-shadow: 0 10px 20px rgba(26, 188, 156, 0.2);
    }

    &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
        transform: none;
    }

    svg {
        animation: ${props => props.loading ? 'spin 1s linear infinite' : 'none'};
    }

    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;

const SummaryCardsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.25rem;
`;

const SummaryCard = styled(Card)`
    border: none;
    border-radius: 16px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
    overflow: hidden;
    position: relative;

    &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    }

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: ${props => props.gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
    }
`;

const CardBody = styled(Card.Body)`
    padding: 1.5rem;
`;

const CardHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
`;

const CardTitle = styled.div`
    h6 {
        font-size: 0.875rem;
        font-weight: 600;
        color: #7f8c8d;
        margin: 0 0 0.5rem 0;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    h3 {
        font-size: 2rem;
        font-weight: 700;
        color: #2c3e50;
        margin: 0;
    }
`;

const IconBadge = styled.div`
    width: 56px;
    height: 56px;
    border-radius: 14px;
    background: ${props => props.gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.5rem;
    box-shadow: 0 4px 12px ${props => props.shadowColor || 'rgba(102, 126, 234, 0.3)'};
`;

const ChartCard = styled(Card)`
    border: none;
    border-radius: 16px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    overflow: hidden;

    .card-header {
        background: white;
        border-bottom: 1px solid #f0f0f0;
        padding: 1.25rem 1.5rem;
        
        h5 {
            margin: 0;
            font-size: 1.125rem;
            font-weight: 700;
            color: #2c3e50;
        }
    }

    .card-body {
        padding: 1.5rem;
    }
`;

const CustomerAnalytics = () => {
    const [loading, setLoading] = useState(true);
    const [overview, setOverview] = useState(null);
    const [topByOrders, setTopByOrders] = useState([]);

    // Fetch all data
    const fetchData = async () => {
        setLoading(true);
        try {
            const [overviewRes, topOrdersRes] = await Promise.all([
                adminService.getCustomerOverview(),
                adminService.getTopCustomersByOrders({ limit: 10 })
            ]);

            console.log('📊 Customer Overview Response:', overviewRes);
            console.log('📊 Top Orders Response:', topOrdersRes);
            console.log('📊 Top Orders Data:', topOrdersRes.data);

            setOverview(overviewRes.data);
            setTopByOrders(topOrdersRes.data);
        } catch (error) {
            console.error('Error fetching customer analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Format currency
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(value);
    };

    if (loading) {
        return (
            <PageWrapper>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                    <Spinner animation="border" variant="primary" />
                </div>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper>
            <PageHeader>
                <h2>📊 Phân Tích Khách Hàng</h2>
                <HeaderActions>
                    <RefreshButton loading={loading ? 1 : 0} onClick={fetchData} disabled={loading}>
                        <FaSyncAlt />
                        Làm mới
                    </RefreshButton>
                </HeaderActions>
            </PageHeader>

            {/* Summary Cards */}
            <SummaryCardsGrid>
                <SummaryCard gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
                    <CardBody>
                        <CardHeader>
                            <CardTitle>
                                <h6>Tổng Khách Hàng</h6>
                                <h3>{overview?.totalCustomers?.toLocaleString() || 0}</h3>
                            </CardTitle>
                            <IconBadge
                                gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                                shadowColor="rgba(102, 126, 234, 0.3)"
                            >
                                <FaUsers />
                            </IconBadge>
                        </CardHeader>
                    </CardBody>
                </SummaryCard>

                <SummaryCard gradient="linear-gradient(135deg, #1abc9c 0%, #16a085 100%)">
                    <CardBody>
                        <CardHeader>
                            <CardTitle>
                                <h6>Khách Hàng Active</h6>
                                <h3>{overview?.activeCustomers?.toLocaleString() || 0}</h3>
                            </CardTitle>
                            <IconBadge
                                gradient="linear-gradient(135deg, #1abc9c 0%, #16a085 100%)"
                                shadowColor="rgba(26, 188, 156, 0.3)"
                            >
                                <FaUserCheck />
                            </IconBadge>
                        </CardHeader>
                    </CardBody>
                </SummaryCard>

                <SummaryCard gradient="linear-gradient(135deg, #f39c12 0%, #e67e22 100%)">
                    <CardBody>
                        <CardHeader>
                            <CardTitle>
                                <h6>Giá Trị Đơn TB</h6>
                                <h3>{formatCurrency(overview?.averageOrderValue || 0)}</h3>
                            </CardTitle>
                            <IconBadge
                                gradient="linear-gradient(135deg, #f39c12 0%, #e67e22 100%)"
                                shadowColor="rgba(243, 156, 18, 0.3)"
                            >
                                <FaDollarSign />
                            </IconBadge>
                        </CardHeader>
                    </CardBody>
                </SummaryCard>

                <SummaryCard gradient="linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)">
                    <CardBody>
                        <CardHeader>
                            <CardTitle>
                                <h6>Tỷ Lệ Quay Lại</h6>
                                <h3>{overview?.repeatCustomerRate?.toFixed(1) || 0}%</h3>
                            </CardTitle>
                            <IconBadge
                                gradient="linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)"
                                shadowColor="rgba(231, 76, 60, 0.3)"
                            >
                                <FaRedoAlt />
                            </IconBadge>
                        </CardHeader>
                    </CardBody>
                </SummaryCard>
            </SummaryCardsGrid>

            {/* Charts Section */}
            <ChartCard style={{ marginBottom: '1.5rem' }}>
                <div className="card-header">
                    <h5><FaTrophy style={{ marginRight: '0.5rem', color: '#f39c12' }} /> Top 10 Khách Hàng - Số Đơn Hàng</h5>
                </div>
                <Card.Body>
                    <ResponsiveContainer width="100%" height={500}>
                        <BarChart
                            data={topByOrders.map(customer => ({
                                ...customer,
                                displayName: `${customer.customerName}\n(${customer.email || 'N/A'})`
                            }))}
                            layout="vertical"
                            margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis type="number" />
                            <YAxis
                                dataKey="displayName"
                                type="category"
                                width={140}
                                tick={{ fontSize: 11 }}
                            />
                            <Tooltip
                                formatter={(value, name) => {
                                    if (name === 'orderCount') return [value, 'Số đơn hàng'];
                                    if (name === 'totalSpent') return [formatCurrency(value), 'Tổng chi tiêu'];
                                    return [value, name];
                                }}
                                labelFormatter={(label) => {
                                    const customer = topByOrders.find(c =>
                                        `${c.customerName}\n(${c.email || 'N/A'})` === label
                                    );
                                    return customer ? `${customer.customerName} - ${customer.email}` : label;
                                }}
                                contentStyle={{ borderRadius: '8px', border: '1px solid #e0e0e0' }}
                            />
                            <Legend />
                            <Bar dataKey="orderCount" fill="#3498db" name="Số đơn hàng" radius={[0, 8, 8, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </Card.Body>
            </ChartCard>

            {/* Customer Table - Chi tiết top 10 khách hàng */}
            <CustomerTable topCustomers={topByOrders} />
        </PageWrapper>
    );
};

export default CustomerAnalytics;

