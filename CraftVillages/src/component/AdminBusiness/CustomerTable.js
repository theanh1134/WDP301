import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Badge } from 'react-bootstrap';

const TableCard = styled.div`
    background: white;
    border-radius: 16px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    overflow: hidden;
`;

const TableHeader = styled.div`
    padding: 1.5rem;
    border-bottom: 1px solid #f0f0f0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;

    h5 {
        margin: 0;
        font-size: 1.125rem;
        font-weight: 700;
        color: #2c3e50;
    }
`;

const StyledTable = styled.table`
    width: 100%;
    margin: 0;

    thead {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

        th {
            color: white;
            font-weight: 600;
            font-size: 0.875rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            padding: 1rem;
            border: none;
            white-space: nowrap;
            text-align: left;
        }
    }

    tbody {
        tr {
            transition: all 0.2s ease;

            &:hover {
                background: #f8f9fa;
            }

            td {
                padding: 1rem;
                vertical-align: middle;
                font-size: 0.9rem;
                color: #2c3e50;
                border-bottom: 1px solid #f0f0f0;
            }
        }
    }
`;

const SpendingBadge = styled(Badge)`
    padding: 0.375rem 0.75rem;
    border-radius: 999px;
    font-weight: 600;
    font-size: 0.75rem;
`;

const PaginationWrapper = styled.div`
    padding: 1.5rem;
    border-top: 1px solid #f0f0f0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
`;

const PaginationInfo = styled.div`
    color: #7f8c8d;
    font-size: 0.9rem;
`;

const CustomerTable = ({ topCustomers = [] }) => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(false);

    // Set customers from props
    useEffect(() => {
        if (topCustomers && topCustomers.length > 0) {
            setCustomers(topCustomers);
        }
    }, [topCustomers]);

    // Format currency
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(value);
    };

    // Format date
    const formatDate = (date) => {
        if (!date) return 'Chưa có';
        return new Date(date).toLocaleDateString('vi-VN');
    };

    // Get spending badge
    const getSpendingBadge = (level) => {
        const badges = {
            vip: { bg: 'danger', text: 'VIP' },
            high: { bg: 'warning', text: 'High Value' },
            medium: { bg: 'info', text: 'Medium' },
            low: { bg: 'secondary', text: 'Low' }
        };
        const badge = badges[level] || badges.low;
        return <SpendingBadge bg={badge.bg}>{badge.text}</SpendingBadge>;
    };

    return (
        <TableCard>
            <TableHeader>
                <h5>📋 Chi Tiết Top 10 Khách Hàng</h5>
            </TableHeader>

            <div style={{ overflowX: 'auto' }}>
                <StyledTable>
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>Tên Khách Hàng</th>
                            <th>Email</th>
                            <th>Số Điện Thoại</th>
                            <th>Số Đơn Hàng</th>
                            <th>Tổng Chi Tiêu</th>
                            <th>Giá Trị Trung Bình</th>
                            <th>Mức Chi Tiêu</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>
                                    Đang tải...
                                </td>
                            </tr>
                        ) : customers.length === 0 ? (
                            <tr>
                                <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: '#7f8c8d' }}>
                                    Không có dữ liệu
                                </td>
                            </tr>
                        ) : (
                            customers.map((customer, index) => {
                                const averageOrderValue = customer.orderCount > 0
                                    ? customer.totalSpent / customer.orderCount
                                    : 0;

                                // Determine spending level
                                let spendingLevel = 'low';
                                if (customer.totalSpent > 50000000) spendingLevel = 'vip';
                                else if (customer.totalSpent > 20000000) spendingLevel = 'high';
                                else if (customer.totalSpent > 5000000) spendingLevel = 'medium';

                                return (
                                    <tr key={customer.customerId || index}>
                                        <td style={{ textAlign: 'center', fontWeight: 600 }}>{index + 1}</td>
                                        <td style={{ fontWeight: 600 }}>{customer.customerName}</td>
                                        <td>{customer.email || 'N/A'}</td>
                                        <td>{customer.phoneNumber || 'N/A'}</td>
                                        <td style={{ textAlign: 'center', fontWeight: 600 }}>{customer.orderCount}</td>
                                        <td style={{ fontWeight: 600, color: '#27ae60' }}>
                                            {formatCurrency(customer.totalSpent)}
                                        </td>
                                        <td>{formatCurrency(averageOrderValue)}</td>
                                        <td>{getSpendingBadge(spendingLevel)}</td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </StyledTable>
            </div>

            {customers.length > 0 && (
                <PaginationWrapper>
                    <PaginationInfo>
                        Hiển thị {customers.length} khách hàng hàng đầu
                    </PaginationInfo>
                </PaginationWrapper>
            )}
        </TableCard>
    );
};

export default CustomerTable;

