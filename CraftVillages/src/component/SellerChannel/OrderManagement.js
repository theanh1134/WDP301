import React, { useState, useEffect, useMemo } from 'react';
import { Card, Table, Badge, Button, Form, InputGroup, Spinner, Pagination, Dropdown } from 'react-bootstrap';
import { FaSearch, FaEye, FaFilter, FaDownload, FaShippingFast, FaCheckCircle, FaTimesCircle, FaBox, FaClock } from 'react-icons/fa';
import styled from 'styled-components';
import orderService from '../../services/orderService';
import OrderDetailModal from './OrderDetailModal';
import { toast } from 'react-toastify';

const OrderManagementWrapper = styled.div`
    padding: 0;
`;

const StatsRow = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
`;

const StatCard = styled(Card)`
    border: none;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    transition: transform 0.2s, box-shadow 0.2s;
    cursor: pointer;
    
    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.12);
    }

    &.active {
        border: 2px solid #b8860b;
        box-shadow: 0 4px 12px rgba(184, 134, 11, 0.2);
    }
`;

const StatCardBody = styled(Card.Body)`
    padding: 1.25rem;
    display: flex;
    align-items: center;
    gap: 1rem;
`;

const StatIcon = styled.div`
    width: 50px;
    height: 50px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    background: ${props => props.bg || '#f0f0f0'};
    color: ${props => props.color || '#666'};
`;

const StatInfo = styled.div`
    flex: 1;
    
    .stat-label {
        font-size: 0.85rem;
        color: #666;
        margin-bottom: 0.25rem;
    }
    
    .stat-value {
        font-size: 1.5rem;
        font-weight: 700;
        color: #333;
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
    flex-wrap: wrap;
    align-items: center;
`;

const OrderTable = styled(Table)`
    margin: 0;
    
    thead {
        background: #f8f9fa;
        
        th {
            border: none;
            padding: 1rem;
            font-size: 0.85rem;
            font-weight: 600;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
    }
    
    tbody {
        tr {
            transition: background 0.2s;
            
            &:hover {
                background: #f8f9fa;
            }
            
            td {
                padding: 1rem;
                vertical-align: middle;
                border-top: 1px solid #eee;
            }
        }
    }
`;

const ProductInfo = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    
    img {
        width: 50px;
        height: 50px;
        object-fit: cover;
        border-radius: 8px;
        border: 1px solid #eee;
    }
    
    .product-details {
        flex: 1;
        
        .product-name {
            font-weight: 600;
            color: #333;
            margin-bottom: 0.25rem;
            font-size: 0.9rem;
        }
        
        .product-meta {
            font-size: 0.8rem;
            color: #666;
        }
    }
`;

const CustomerInfo = styled.div`
    .customer-name {
        font-weight: 600;
        color: #333;
        margin-bottom: 0.25rem;
        font-size: 0.9rem;
    }
    
    .customer-phone {
        font-size: 0.8rem;
        color: #666;
    }
`;

const EmptyState = styled.div`
    text-align: center;
    padding: 4rem 2rem;
    color: #999;
    
    svg {
        font-size: 4rem;
        margin-bottom: 1rem;
        opacity: 0.3;
    }
    
    h5 {
        color: #666;
        margin-bottom: 0.5rem;
    }
    
    p {
        color: #999;
        font-size: 0.9rem;
    }
`;

function OrderManagement({ shopId }) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statistics, setStatistics] = useState(null);
    const [activeFilter, setActiveFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    useEffect(() => {
        if (shopId) {
            loadOrders();
            loadStatistics();
        }
    }, [shopId, activeFilter, searchQuery, currentPage]);

    const loadOrders = async () => {
        setLoading(true);
        try {
            const params = {
                status: activeFilter,
                search: searchQuery,
                page: currentPage,
                limit: 20
            };
            const response = await orderService.getOrdersByShop(shopId, params);
            setOrders(response.data || []);
            setTotalPages(response.pagination?.totalPages || 1);
        } catch (error) {
            console.error('Error loading orders:', error);
            toast.error('Không thể tải danh sách đơn hàng');
        } finally {
            setLoading(false);
        }
    };

    const loadStatistics = async () => {
        try {
            const stats = await orderService.getOrderStatistics(shopId);
            setStatistics(stats);
        } catch (error) {
            console.error('Error loading statistics:', error);
        }
    };

    const handleViewDetail = (order) => {
        setSelectedOrder(order);
        setShowDetailModal(true);
    };

    const handleStatusUpdate = async () => {
        await loadOrders();
        await loadStatistics();
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            'PENDING': { bg: 'warning', text: 'Chờ xác nhận', icon: <FaClock /> },
            'PROCESSING': { bg: 'info', text: 'Đang xử lý', icon: <FaBox /> },
            'CONFIRMED': { bg: 'primary', text: 'Đã xác nhận', icon: <FaCheckCircle /> },
            'SHIPPED': { bg: 'info', text: 'Đang giao', icon: <FaShippingFast /> },
            'DELIVERED': { bg: 'success', text: 'Đã giao', icon: <FaCheckCircle /> },
            'CANCELLED': { bg: 'danger', text: 'Đã hủy', icon: <FaTimesCircle /> },
            'REFUNDED': { bg: 'secondary', text: 'Hoàn tiền', icon: <FaTimesCircle /> }
        };

        const config = statusConfig[status] || statusConfig['PENDING'];
        return (
            <Badge bg={config.bg} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', width: 'fit-content' }}>
                {config.icon} {config.text}
            </Badge>
        );
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <OrderManagementWrapper>
            {/* Statistics Cards */}
            {statistics && (
                <StatsRow>
                    <StatCard className={activeFilter === 'all' ? 'active' : ''} onClick={() => setActiveFilter('all')}>
                        <StatCardBody>
                            <StatIcon bg="#e3f2fd" color="#1976d2">
                                <FaBox />
                            </StatIcon>
                            <StatInfo>
                                <div className="stat-label">Tất cả đơn hàng</div>
                                <div className="stat-value">{statistics.counts.all}</div>
                            </StatInfo>
                        </StatCardBody>
                    </StatCard>

                    <StatCard className={activeFilter === 'pending' ? 'active' : ''} onClick={() => setActiveFilter('pending')}>
                        <StatCardBody>
                            <StatIcon bg="#fff3e0" color="#f57c00">
                                <FaClock />
                            </StatIcon>
                            <StatInfo>
                                <div className="stat-label">Chờ xác nhận</div>
                                <div className="stat-value">{statistics.counts.pending}</div>
                            </StatInfo>
                        </StatCardBody>
                    </StatCard>

                    <StatCard className={activeFilter === 'shipping' ? 'active' : ''} onClick={() => setActiveFilter('shipping')}>
                        <StatCardBody>
                            <StatIcon bg="#e1f5fe" color="#0288d1">
                                <FaShippingFast />
                            </StatIcon>
                            <StatInfo>
                                <div className="stat-label">Đang giao</div>
                                <div className="stat-value">{statistics.counts.shipping}</div>
                            </StatInfo>
                        </StatCardBody>
                    </StatCard>

                    <StatCard className={activeFilter === 'delivered' ? 'active' : ''} onClick={() => setActiveFilter('delivered')}>
                        <StatCardBody>
                            <StatIcon bg="#e8f5e9" color="#388e3c">
                                <FaCheckCircle />
                            </StatIcon>
                            <StatInfo>
                                <div className="stat-label">Đã giao</div>
                                <div className="stat-value">{statistics.counts.delivered}</div>
                            </StatInfo>
                        </StatCardBody>
                    </StatCard>
                </StatsRow>
            )}

            {/* Filter Bar */}
            <FilterBar>
                <InputGroup style={{ flex: '1', maxWidth: '400px' }}>
                    <InputGroup.Text style={{ background: 'white', border: '1px solid #ddd' }}>
                        <FaSearch />
                    </InputGroup.Text>
                    <Form.Control
                        placeholder="Tìm theo mã đơn, tên khách hàng, SĐT..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1);
                        }}
                        style={{ border: '1px solid #ddd' }}
                    />
                </InputGroup>

                <Dropdown>
                    <Dropdown.Toggle variant="outline-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FaFilter /> Lọc
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        <Dropdown.Item onClick={() => setActiveFilter('all')}>Tất cả</Dropdown.Item>
                        <Dropdown.Item onClick={() => setActiveFilter('pending')}>Chờ xác nhận</Dropdown.Item>
                        <Dropdown.Item onClick={() => setActiveFilter('confirmed')}>Đã xác nhận</Dropdown.Item>
                        <Dropdown.Item onClick={() => setActiveFilter('shipping')}>Đang giao</Dropdown.Item>
                        <Dropdown.Item onClick={() => setActiveFilter('delivered')}>Đã giao</Dropdown.Item>
                        <Dropdown.Item onClick={() => setActiveFilter('cancelled')}>Đã hủy</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>

                <Button variant="outline-success" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FaDownload /> Xuất Excel
                </Button>
            </FilterBar>

            {/* Orders Table */}
            <Card style={{ border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <Card.Body style={{ padding: 0 }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '3rem' }}>
                            <Spinner animation="border" variant="primary" />
                            <p style={{ marginTop: '1rem', color: '#666' }}>Đang tải đơn hàng...</p>
                        </div>
                    ) : orders.length === 0 ? (
                        <EmptyState>
                            <FaBox />
                            <h5>Không có đơn hàng nào</h5>
                            <p>Chưa có đơn hàng nào phù hợp với bộ lọc hiện tại</p>
                        </EmptyState>
                    ) : (
                        <>
                            <OrderTable hover responsive>
                                <thead>
                                    <tr>
                                        <th>Mã đơn hàng</th>
                                        <th>Sản phẩm</th>
                                        <th>Khách hàng</th>
                                        <th>Tổng tiền</th>
                                        <th>Trạng thái</th>
                                        <th>Ngày đặt</th>
                                        <th>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order) => (
                                        <tr key={order._id}>
                                            <td>
                                                <div style={{ fontWeight: '600', color: '#b8860b' }}>
                                                    #{order._id.slice(-8).toUpperCase()}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: '#999' }}>
                                                    {order.paymentInfo.method}
                                                </div>
                                            </td>
                                            <td>
                                                {order.items.length > 0 && (
                                                    <ProductInfo>
                                                        <img
                                                            src={order.items[0].thumbnailUrl || '/placeholder.png'}
                                                            alt={order.items[0].productName}
                                                            onError={(e) => e.target.src = '/placeholder.png'}
                                                        />
                                                        <div className="product-details">
                                                            <div className="product-name">
                                                                {order.items[0].productName}
                                                            </div>
                                                            <div className="product-meta">
                                                                x{order.items[0].quantity}
                                                                {order.items.length > 1 && ` +${order.items.length - 1} sản phẩm khác`}
                                                            </div>
                                                        </div>
                                                    </ProductInfo>
                                                )}
                                            </td>
                                            <td>
                                                <CustomerInfo>
                                                    <div className="customer-name">
                                                        {order.shippingAddress.recipientName}
                                                    </div>
                                                    <div className="customer-phone">
                                                        {order.shippingAddress.phoneNumber}
                                                    </div>
                                                </CustomerInfo>
                                            </td>
                                            <td>
                                                <div style={{ fontWeight: '700', color: '#333', fontSize: '1rem' }}>
                                                    {formatCurrency(order.finalAmount)}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: '#666' }}>
                                                    {order.items.reduce((sum, item) => sum + item.quantity, 0)} sản phẩm
                                                </div>
                                            </td>
                                            <td>
                                                {getStatusBadge(order.status)}
                                            </td>
                                            <td>
                                                <div style={{ fontSize: '0.85rem', color: '#666' }}>
                                                    {formatDate(order.createdAt)}
                                                </div>
                                            </td>
                                            <td>
                                                <Button
                                                    variant="outline-primary"
                                                    size="sm"
                                                    onClick={() => handleViewDetail(order)}
                                                    style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                                                >
                                                    <FaEye /> Chi tiết
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </OrderTable>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                                    <Pagination>
                                        <Pagination.First onClick={() => setCurrentPage(1)} disabled={currentPage === 1} />
                                        <Pagination.Prev onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} />

                                        {[...Array(totalPages)].map((_, idx) => {
                                            const page = idx + 1;
                                            if (
                                                page === 1 ||
                                                page === totalPages ||
                                                (page >= currentPage - 2 && page <= currentPage + 2)
                                            ) {
                                                return (
                                                    <Pagination.Item
                                                        key={page}
                                                        active={page === currentPage}
                                                        onClick={() => setCurrentPage(page)}
                                                    >
                                                        {page}
                                                    </Pagination.Item>
                                                );
                                            } else if (page === currentPage - 3 || page === currentPage + 3) {
                                                return <Pagination.Ellipsis key={page} />;
                                            }
                                            return null;
                                        })}

                                        <Pagination.Next onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} />
                                        <Pagination.Last onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} />
                                    </Pagination>
                                </div>
                            )}
                        </>
                    )}
                </Card.Body>
            </Card>

            {/* Order Detail Modal */}
            <OrderDetailModal
                show={showDetailModal}
                onHide={() => setShowDetailModal(false)}
                order={selectedOrder}
                onStatusUpdate={handleStatusUpdate}
                shopId={shopId}
            />
        </OrderManagementWrapper>
    );
}

export default OrderManagement;

