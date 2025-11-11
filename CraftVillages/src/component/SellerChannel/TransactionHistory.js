import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Spinner, Form, Button, Row, Col } from 'react-bootstrap';
import { FaMoneyBillWave, FaFilter, FaDownload, FaReceipt, FaChartLine } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import styled from 'styled-components';

const PageHeader = styled.div`
  margin-bottom: 2rem;
  
  h4 {
    color: #2c3e50;
    font-weight: 600;
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
  margin-bottom: 1.5rem;
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  }
`;

const StatsIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  background: ${props => props.gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
`;

const FilterSection = styled(Card)`
  border: none;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 1.5rem;
`;

const TransactionTable = styled(Table)`
  margin: 0;
  
  thead th {
    background-color: #f8f9fa;
    border-bottom: 2px solid #dee2e6;
    color: #495057;
    font-weight: 600;
    padding: 1rem;
    white-space: nowrap;
  }
  
  tbody td {
    padding: 1rem;
    vertical-align: middle;
  }
  
  tbody tr {
    transition: background-color 0.2s;
    
    &:hover {
      background-color: #f8f9fa;
    }
  }
`;

const PaginationWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
`;

function TransactionHistory() {
    const [loading, setLoading] = useState(true);
    const [transactions, setTransactions] = useState([]);
    const [summary, setSummary] = useState(null);
    const [currentBalance, setCurrentBalance] = useState(0);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
    });
    
    const [filters, setFilters] = useState({
        transactionType: '',
        status: '',
        startDate: '',
        endDate: ''
    });

    useEffect(() => {
        fetchTransactions();
        fetchSummary();
    }, [pagination.page, filters]);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('authToken');
            
            const params = {
                page: pagination.page,
                limit: pagination.limit,
                ...filters
            };
            
            // Remove empty filters
            Object.keys(params).forEach(key => {
                if (params[key] === '') delete params[key];
            });
            
            const response = await axios.get(
                `http://localhost:9999/api/seller-transactions/my-transactions`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    params
                }
            );
            
            if (response.data.success) {
                setTransactions(response.data.data.transactions);
                setCurrentBalance(response.data.data.currentBalance);
                setPagination(prev => ({
                    ...prev,
                    total: response.data.pagination.total,
                    totalPages: response.data.pagination.totalPages
                }));
            }
        } catch (error) {
            console.error('Error fetching transactions:', error);
            toast.error('Không thể tải lịch sử giao dịch');
        } finally {
            setLoading(false);
        }
    };

    const fetchSummary = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const params = {};
            if (filters.startDate) params.startDate = filters.startDate;
            if (filters.endDate) params.endDate = filters.endDate;
            
            const response = await axios.get(
                `http://localhost:9999/api/seller-transactions/my-summary`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    params
                }
            );
            
            if (response.data.success) {
                setSummary(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching summary:', error);
        }
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
        setPagination(prev => ({ ...prev, page: 1 })); // Reset to page 1
    };

    const handlePageChange = (newPage) => {
        setPagination(prev => ({ ...prev, page: newPage }));
    };

    const formatCurrency = (amount) => {
        return `${amount?.toLocaleString() || 0} VND`;
    };

    const getTransactionTypeLabel = (type) => {
        const types = {
            'ORDER_PAYMENT': 'Thanh toán đơn hàng',
            'REFUND_DEDUCTION': 'Trừ tiền hoàn hàng',
            'WITHDRAWAL': 'Rút tiền',
            'ADJUSTMENT': 'Điều chỉnh',
            'PENALTY': 'Phạt',
            'BONUS': 'Thưởng',
            'COMMISSION_REFUND': 'Hoàn phí'
        };
        return types[type] || type;
    };

    const getStatusBadge = (status) => {
        const variants = {
            'COMPLETED': 'success',
            'PENDING': 'warning',
            'FAILED': 'danger',
            'CANCELLED': 'secondary'
        };
        
        const labels = {
            'COMPLETED': 'Hoàn thành',
            'PENDING': 'Đang xử lý',
            'FAILED': 'Thất bại',
            'CANCELLED': 'Đã hủy'
        };
        
        return <Badge bg={variants[status] || 'secondary'}>{labels[status] || status}</Badge>;
    };

    const getTransactionTypeBadge = (type) => {
        const variants = {
            'ORDER_PAYMENT': 'primary',
            'REFUND_DEDUCTION': 'danger',
            'WITHDRAWAL': 'info',
            'ADJUSTMENT': 'warning',
            'PENALTY': 'danger',
            'BONUS': 'success',
            'COMMISSION_REFUND': 'success'
        };
        
        return <Badge bg={variants[type] || 'secondary'}>{getTransactionTypeLabel(type)}</Badge>;
    };

    return (
        <>
            <PageHeader>
                <h4><FaReceipt /> Lịch Sử Giao Dịch</h4>
                <p>Theo dõi tất cả các giao dịch tiền vào ví của bạn</p>
            </PageHeader>

            {/* Summary Stats */}
            {summary && (
                <Row className="mb-4">
                    <Col md={4}>
                        <StatsCard>
                            <Card.Body className="d-flex align-items-center">
                                <StatsIcon gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
                                    <FaMoneyBillWave />
                                </StatsIcon>
                                <div className="ms-3">
                                    <div style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>Số dư hiện tại</div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#2c3e50' }}>
                                        {formatCurrency(summary.currentBalance)}
                                    </div>
                                </div>
                            </Card.Body>
                        </StatsCard>
                    </Col>
                    <Col md={4}>
                        <StatsCard>
                            <Card.Body className="d-flex align-items-center">
                                <StatsIcon gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)">
                                    <FaChartLine />
                                </StatsIcon>
                                <div className="ms-3">
                                    <div style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>Tổng tiền nhận</div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#2c3e50' }}>
                                        {formatCurrency(summary.orderPayments.totalNet)}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#95a5a6' }}>
                                        {summary.orderPayments.count} giao dịch
                                    </div>
                                </div>
                            </Card.Body>
                        </StatsCard>
                    </Col>
                    <Col md={4}>
                        <StatsCard>
                            <Card.Body className="d-flex align-items-center">
                                <StatsIcon gradient="linear-gradient(135deg, #fa709a 0%, #fee140 100%)">
                                    <FaMoneyBillWave />
                                </StatsIcon>
                                <div className="ms-3">
                                    <div style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>Tổng phí sàn</div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#e74c3c' }}>
                                        {formatCurrency(summary.orderPayments.totalPlatformFee)}
                                    </div>
                                </div>
                            </Card.Body>
                        </StatsCard>
                    </Col>
                    
                </Row>
            )}

            {/* Filters */}
            <FilterSection>
                <Card.Body>
                    <div className="d-flex align-items-center mb-3">
                        <FaFilter className="me-2" />
                        <h6 className="mb-0">Bộ lọc</h6>
                    </div>
                    <Row>
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label style={{ fontSize: '0.9rem', fontWeight: '500' }}>Loại giao dịch</Form.Label>
                                <Form.Select
                                    value={filters.transactionType}
                                    onChange={(e) => handleFilterChange('transactionType', e.target.value)}
                                    size="sm"
                                >
                                    <option value="">Tất cả</option>
                                    <option value="ORDER_PAYMENT">Thanh toán đơn hàng</option>
                                    <option value="REFUND_DEDUCTION">Trừ tiền hoàn hàng</option>
                                    <option value="WITHDRAWAL">Rút tiền</option>
                                    <option value="ADJUSTMENT">Điều chỉnh</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={2}>
                            <Form.Group>
                                <Form.Label style={{ fontSize: '0.9rem', fontWeight: '500' }}>Trạng thái</Form.Label>
                                <Form.Select
                                    value={filters.status}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                    size="sm"
                                >
                                    <option value="">Tất cả</option>
                                    <option value="COMPLETED">Hoàn thành</option>
                                    <option value="PENDING">Đang xử lý</option>
                                    <option value="FAILED">Thất bại</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label style={{ fontSize: '0.9rem', fontWeight: '500' }}>Từ ngày</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={filters.startDate}
                                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                                    size="sm"
                                />
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label style={{ fontSize: '0.9rem', fontWeight: '500' }}>Đến ngày</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={filters.endDate}
                                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                                    size="sm"
                                />
                            </Form.Group>
                        </Col>
                        
                    </Row>
                </Card.Body>
            </FilterSection>

            {/* Transactions Table */}
            <Card style={{ border: 'none', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }}>
                <Card.Body style={{ padding: 0 }}>
                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" />
                            <p className="mt-3 text-muted">Đang tải dữ liệu...</p>
                        </div>
                    ) : transactions.length === 0 ? (
                        <div className="text-center py-5">
                            <FaReceipt style={{ fontSize: '3rem', color: '#dee2e6' }} />
                            <p className="mt-3 text-muted">Chưa có giao dịch nào</p>
                        </div>
                    ) : (
                        <>
                            <div style={{ overflowX: 'auto' }}>
                                <TransactionTable responsive hover>
                                    <thead>
                                        <tr>
                                            <th>Mã GD</th>
                                            <th>Loại</th>
                                            <th>Đơn hàng</th>
                                            <th>Ngày</th>
                                            <th className="text-end">Tổng tiền</th>
                                            <th className="text-end">Phí sàn</th>
                                            <th className="text-end">Thực nhận</th>
                                            <th className="text-center">Trạng thái</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {transactions.map((transaction) => (
                                            <tr key={transaction._id}>
                                                <td>
                                                    <code style={{
                                                        fontSize: '0.85rem',
                                                        color: '#667eea',
                                                        fontWeight: '600'
                                                    }}>
                                                        {transaction.transactionCode}
                                                    </code>
                                                </td>
                                                <td>
                                                    {getTransactionTypeBadge(transaction.transactionType)}
                                                </td>
                                                <td>
                                                    {transaction.orderId ? (
                                                        <div>
                                                            <div style={{ fontSize: '0.9rem', fontWeight: '500' }}>
                                                                #{String(transaction.orderId._id || transaction.orderId).slice(-6)}
                                                            </div>
                                                            <div style={{ fontSize: '0.75rem', color: '#95a5a6' }}>
                                                                {transaction.orderId.createdAt ? dayjs(transaction.orderId.createdAt).format('DD/MM/YYYY') : '-'}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted">-</span>
                                                    )}
                                                </td>
                                                <td>
                                                    <div style={{ fontSize: '0.9rem' }}>
                                                        {dayjs(transaction.createdAt).format('DD/MM/YYYY')}
                                                    </div>
                                                    <div style={{ fontSize: '0.75rem', color: '#95a5a6' }}>
                                                        {dayjs(transaction.createdAt).format('HH:mm')}
                                                    </div>
                                                </td>
                                                <td className="text-end">
                                                    <div style={{ fontWeight: '500' }}>
                                                        {formatCurrency(transaction.amounts.grossAmount)}
                                                    </div>
                                                </td>
                                                <td className="text-end">
                                                    <div style={{ color: '#e74c3c', fontWeight: '500' }}>
                                                        {formatCurrency(transaction.amounts.platformFee)}
                                                    </div>
                                                    {transaction.amounts.platformFeeRate && (
                                                        <div style={{ fontSize: '0.75rem', color: '#95a5a6' }}>
                                                            ({transaction.amounts.platformFeeRate}%)
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="text-end">
                                                    <div style={{
                                                        fontWeight: '600',
                                                        color: transaction.amounts.netAmount >= 0 ? '#27ae60' : '#e74c3c',
                                                        fontSize: '1rem'
                                                    }}>
                                                        {transaction.amounts.netAmount >= 0 ? '+' : ''}
                                                        {formatCurrency(transaction.amounts.netAmount)}
                                                    </div>
                                                </td>
                                                <td className="text-center">
                                                    {getStatusBadge(transaction.status)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </TransactionTable>
                            </div>

                            {/* Pagination */}
                            <PaginationWrapper>
                                <div style={{ fontSize: '0.9rem', color: '#7f8c8d' }}>
                                    Hiển thị {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} trong tổng số {pagination.total} giao dịch
                                </div>
                                <div className="d-flex gap-2">
                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        onClick={() => handlePageChange(pagination.page - 1)}
                                        disabled={pagination.page === 1}
                                    >
                                        Trang trước
                                    </Button>
                                    <div className="d-flex align-items-center px-3" style={{ fontSize: '0.9rem', fontWeight: '500' }}>
                                        Trang {pagination.page} / {pagination.totalPages}
                                    </div>
                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        onClick={() => handlePageChange(pagination.page + 1)}
                                        disabled={pagination.page >= pagination.totalPages}
                                    >
                                        Trang sau
                                    </Button>
                                </div>
                            </PaginationWrapper>
                        </>
                    )}
                </Card.Body>
            </Card>
        </>
    );
}

export default TransactionHistory;

