import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Table, Badge, Modal, Spinner, InputGroup } from 'react-bootstrap';
import { FaSearch, FaFilter, FaShippingFast, FaEye, FaCheckCircle, FaBoxOpen } from 'react-icons/fa';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import staffOrderService from '../../services/staffOrderService';

const DashboardWrapper = styled.div`
    min-height: 100vh;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    padding: 2rem 0;
`;

const StatsCard = styled(Card)`
    border: none;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transition: transform 0.2s;
    margin-bottom: 1.5rem;

    &:hover {
        transform: translateY(-4px);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
    }
`;

const StatValue = styled.div`
    font-size: 2rem;
    font-weight: 700;
    color: #b8860b;
    margin: 0.5rem 0;
`;

const StatLabel = styled.div`
    color: #666;
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const ContentCard = styled(Card)`
    border: none;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    margin-bottom: 2rem;
`;

const FilterBar = styled.div`
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    align-items: center;
`;

const OrderTable = styled(Table)`
    margin: 0;

    th {
        background: #f8f9fa;
        color: #495057;
        font-weight: 600;
        border: none;
        padding: 1rem;
        white-space: nowrap;
    }

    td {
        vertical-align: middle;
        padding: 1rem;
        border-top: 1px solid #dee2e6;
    }

    tbody tr {
        transition: background-color 0.2s;

        &:hover {
            background-color: #f8f9fa;
        }
    }
`;

const ActionButton = styled(Button)`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.85rem;
    padding: 0.5rem 1rem;
`;

const OrderStaff = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statistics, setStatistics] = useState({
        total: 0,
        pending: 0,
        assigned: 0,
        delivering: 0
    });
    
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('CONFIRMED');
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [availableShippers, setAvailableShippers] = useState([]);
    const [selectedShipper, setSelectedShipper] = useState(null);
    const [assignLoading, setAssignLoading] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);

    const loadOrders = async () => {
        setLoading(true);
        try {
            const params = {
                status: statusFilter,
                search: searchQuery
            };
            
            const response = await staffOrderService.getAllStaffOrders(params);
            setOrders(response.data || []);
        } catch (error) {
            console.error('Error loading orders:', error);
            toast.error('Không thể tải danh sách đơn hàng');
        } finally {
            setLoading(false);
        }
    };

    const loadStatistics = async () => {
        try {
            const response = await staffOrderService.getStatistics();
            setStatistics(response.data || statistics);
        } catch (error) {
            console.error('Error loading statistics:', error);
        }
    };

    useEffect(() => {
        loadOrders();
        loadStatistics();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statusFilter, searchQuery]);

    const loadAvailableShippers = async () => {
        try {
            const response = await staffOrderService.getAvailableShippers();
            setAvailableShippers(response.data || []);
        } catch (error) {
            console.error('Error loading shippers:', error);
            toast.error('Không thể tải danh sách shipper');
        }
    };

    const handleAssignClick = (order) => {
        setSelectedOrder(order);
        setShowAssignModal(true);
        loadAvailableShippers();
    };

    const handleAssignOrder = async () => {
        if (!selectedShipper) {
            toast.warning('Vui lòng chọn shipper');
            return;
        }

        setAssignLoading(true);
        try {
            await staffOrderService.assignOrderToShipper(selectedOrder._id, selectedShipper);
            toast.success('Đã phân công đơn hàng cho shipper thành công!');
            setShowAssignModal(false);
            setSelectedOrder(null);
            setSelectedShipper(null);
            loadOrders();
            loadStatistics();
        } catch (error) {
            console.error('Error assigning order:', error);
            const errorMsg = error.response?.data?.message || 'Không thể phân công đơn hàng';
            toast.error(errorMsg);
        } finally {
            setAssignLoading(false);
        }
    };

    const handleViewDetail = (order) => {
        setSelectedOrder(order);
        setShowDetailModal(true);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            'CONFIRMED': { variant: 'success', text: 'Đã xác nhận', icon: <FaCheckCircle /> },
            'ASSIGNED': { variant: 'info', text: 'Đã phân công', icon: <FaShippingFast /> },
            'SHIPPED': { variant: 'primary', text: 'Đang giao', icon: <FaBoxOpen /> },
            'DELIVERED': { variant: 'secondary', text: 'Đã giao', icon: <FaCheckCircle /> }
        };

        const config = statusConfig[status] || { variant: 'secondary', text: status };

        return (
            <Badge bg={config.variant} style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}>
                {config.icon} {config.text}
            </Badge>
        );
    };

    return (
        <DashboardWrapper>
            <Container fluid>
                {/* Page Header */}
                <Row className="mb-4">
                    <Col>
                        <h2 style={{ color: '#333', fontWeight: '700' }}>
                            📦 Quản Lý Đơn Hàng - Staff
                        </h2>
                        <p style={{ color: '#666' }}>
                            Thu thập và phân phối đơn hàng cho shipper giao hàng
                        </p>
                    </Col>
                </Row>

                {/* Statistics Cards */}
                <Row className="mb-4">
                    <Col md={3}>
                        <StatsCard>
                            <Card.Body>
                                <StatLabel>Tổng đơn hàng</StatLabel>
                                <StatValue>{statistics.total}</StatValue>
                                <small className="text-muted">Tất cả đơn đã xác nhận</small>
                            </Card.Body>
                        </StatsCard>
                    </Col>
                    <Col md={3}>
                        <StatsCard>
                            <Card.Body>
                                <StatLabel>Chờ phân công</StatLabel>
                                <StatValue style={{ color: '#ffa500' }}>{statistics.pending}</StatValue>
                                <small className="text-muted">Cần assign shipper</small>
                            </Card.Body>
                        </StatsCard>
                    </Col>
                    <Col md={3}>
                        <StatsCard>
                            <Card.Body>
                                <StatLabel>Đã phân công</StatLabel>
                                <StatValue style={{ color: '#17a2b8' }}>{statistics.assigned}</StatValue>
                                <small className="text-muted">Shipper đã nhận</small>
                            </Card.Body>
                        </StatsCard>
                    </Col>
                    <Col md={3}>
                        <StatsCard>
                            <Card.Body>
                                <StatLabel>Đang giao hàng</StatLabel>
                                <StatValue style={{ color: '#28a745' }}>{statistics.delivering}</StatValue>
                                <small className="text-muted">Trên đường giao</small>
                            </Card.Body>
                        </StatsCard>
                    </Col>
                </Row>

                {/* Filters and Search */}
                <ContentCard>
                    <Card.Body>
                        <FilterBar>
                            <InputGroup style={{ maxWidth: '400px' }}>
                                <InputGroup.Text>
                                    <FaSearch />
                                </InputGroup.Text>
                                <Form.Control
                                    placeholder="Tìm theo mã đơn, khách hàng..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </InputGroup>

                            <Form.Select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                style={{ maxWidth: '200px' }}
                            >
                                <option value="">Tất cả trạng thái</option>
                                <option value="CONFIRMED">Đã xác nhận</option>
                                <option value="ASSIGNED">Đã phân công</option>
                                <option value="SHIPPED">Đang giao</option>
                                <option value="DELIVERED">Đã giao</option>
                            </Form.Select>

                            <Button 
                                variant="outline-primary" 
                                onClick={loadOrders}
                                style={{ marginLeft: 'auto' }}
                            >
                                <FaFilter /> Lọc
                            </Button>
                        </FilterBar>
                    </Card.Body>
                </ContentCard>

                {/* Orders Table */}
                <ContentCard>
                    <Card.Body>
                        {loading ? (
                            <div className="text-center py-5">
                                <Spinner animation="border" variant="primary" />
                                <p className="mt-3">Đang tải đơn hàng...</p>
                            </div>
                        ) : orders.length === 0 ? (
                            <div className="text-center py-5">
                                <FaBoxOpen size={60} color="#ccc" />
                                <h5 className="mt-3">Không có đơn hàng nào</h5>
                                <p className="text-muted">Chưa có đơn hàng phù hợp với bộ lọc</p>
                            </div>
                        ) : (
                            <OrderTable responsive hover>
                                <thead>
                                    <tr>
                                        <th>Mã đơn hàng</th>
                                        <th>Khách hàng</th>
                                        <th>Địa chỉ giao hàng</th>
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
                                                <strong style={{ color: '#b8860b' }}>
                                                    #{order._id.slice(-8).toUpperCase()}
                                                </strong>
                                            </td>
                                            <td>
                                                <div>{order.buyerInfo?.fullName}</div>
                                                <small className="text-muted">
                                                    {order.shippingAddress?.phoneNumber}
                                                </small>
                                            </td>
                                            <td style={{ maxWidth: '250px' }}>
                                                <small>{order.shippingAddress?.fullAddress}</small>
                                            </td>
                                            <td>
                                                <strong>{formatCurrency(order.finalAmount)}</strong>
                                            </td>
                                            <td>
                                                {getStatusBadge(order.status)}
                                            </td>
                                            <td>
                                                <small>{formatDate(order.createdAt)}</small>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <ActionButton
                                                        variant="outline-info"
                                                        size="sm"
                                                        onClick={() => handleViewDetail(order)}
                                                    >
                                                        <FaEye /> Xem
                                                    </ActionButton>
                                                    {order.status === 'CONFIRMED' && (
                                                        <ActionButton
                                                            variant="success"
                                                            size="sm"
                                                            onClick={() => handleAssignClick(order)}
                                                        >
                                                            <FaShippingFast /> Phân công
                                                        </ActionButton>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </OrderTable>
                        )}
                    </Card.Body>
                </ContentCard>

                {/* Assign Shipper Modal */}
                <Modal show={showAssignModal} onHide={() => setShowAssignModal(false)} size="lg">
                    <Modal.Header closeButton>
                        <Modal.Title>
                            <FaShippingFast /> Phân công Shipper
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {selectedOrder && (
                            <>
                                <div className="mb-3">
                                    <h6>Thông tin đơn hàng</h6>
                                    <p className="mb-1">
                                        <strong>Mã đơn:</strong> #{selectedOrder._id.slice(-8).toUpperCase()}
                                    </p>
                                    <p className="mb-1">
                                        <strong>Khách hàng:</strong> {selectedOrder.buyerInfo?.fullName}
                                    </p>
                                    <p className="mb-1">
                                        <strong>Địa chỉ:</strong> {selectedOrder.shippingAddress?.fullAddress}
                                    </p>
                                    <p className="mb-1">
                                        <strong>Tổng tiền:</strong> {formatCurrency(selectedOrder.finalAmount)}
                                    </p>
                                </div>

                                <hr />

                                <h6 className="mb-3">Chọn Shipper</h6>
                                {availableShippers.length === 0 ? (
                                    <div className="text-center py-3">
                                        <p className="text-muted">Không có shipper nào đang online</p>
                                    </div>
                                ) : (
                                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                        {availableShippers.map((shipper) => (
                                            <Card
                                                key={shipper._id}
                                                className="mb-2"
                                                style={{
                                                    cursor: 'pointer',
                                                    border: selectedShipper === shipper._id ? '2px solid #b8860b' : '1px solid #dee2e6'
                                                }}
                                                onClick={() => setSelectedShipper(shipper._id)}
                                            >
                                                <Card.Body>
                                                    <Row>
                                                        <Col md={8}>
                                                            <h6>{shipper.userId?.fullName}</h6>
                                                            <p className="mb-1">
                                                                <small>
                                                                    <strong>Phương tiện:</strong> {shipper.vehicleType} - {shipper.vehicleNumber}
                                                                </small>
                                                            </p>
                                                            <p className="mb-0">
                                                                <small>
                                                                    <strong>Khu vực:</strong> {shipper.serviceAreas?.join(', ') || 'Tất cả'}
                                                                </small>
                                                            </p>
                                                        </Col>
                                                        <Col md={4} className="text-end">
                                                            <Badge bg="success" className="mb-2">
                                                                Online
                                                            </Badge>
                                                            <div>
                                                                <small>⭐ {shipper.rating?.average || 5.0}/5</small>
                                                            </div>
                                                            <div>
                                                                <small>📦 {shipper.totalDeliveries || 0} đơn</small>
                                                            </div>
                                                        </Col>
                                                    </Row>
                                                </Card.Body>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowAssignModal(false)}>
                            Hủy
                        </Button>
                        <Button
                            variant="success"
                            onClick={handleAssignOrder}
                            disabled={!selectedShipper || assignLoading}
                        >
                            {assignLoading ? (
                                <>
                                    <Spinner animation="border" size="sm" /> Đang phân công...
                                </>
                            ) : (
                                <>
                                    <FaShippingFast /> Phân công ngay
                                </>
                            )}
                        </Button>
                    </Modal.Footer>
                </Modal>

                {/* Order Detail Modal */}
                <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg">
                    <Modal.Header closeButton>
                        <Modal.Title>Chi tiết đơn hàng</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {selectedOrder && (
                            <>
                                <h6>Thông tin đơn hàng</h6>
                                <p><strong>Mã đơn:</strong> #{selectedOrder._id.slice(-8).toUpperCase()}</p>
                                <p><strong>Trạng thái:</strong> {getStatusBadge(selectedOrder.status)}</p>
                                <p><strong>Ngày đặt:</strong> {formatDate(selectedOrder.createdAt)}</p>

                                <hr />

                                <h6>Thông tin khách hàng</h6>
                                <p><strong>Họ tên:</strong> {selectedOrder.buyerInfo?.fullName}</p>
                                <p><strong>Người nhận:</strong> {selectedOrder.shippingAddress?.recipientName}</p>
                                <p><strong>Số điện thoại:</strong> {selectedOrder.shippingAddress?.phoneNumber}</p>
                                <p><strong>Địa chỉ:</strong> {selectedOrder.shippingAddress?.fullAddress}</p>

                                <hr />

                                <h6>Sản phẩm</h6>
                                <Table size="sm">
                                    <thead>
                                        <tr>
                                            <th>Sản phẩm</th>
                                            <th>Số lượng</th>
                                            <th>Đơn giá</th>
                                            <th>Thành tiền</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedOrder.items?.map((item, index) => (
                                            <tr key={index}>
                                                <td>{item.productName}</td>
                                                <td>{item.quantity}</td>
                                                <td>{formatCurrency(item.priceAtPurchase)}</td>
                                                <td>{formatCurrency(item.priceAtPurchase * item.quantity)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td colSpan="3" className="text-end"><strong>Tổng cộng:</strong></td>
                                            <td><strong>{formatCurrency(selectedOrder.finalAmount)}</strong></td>
                                        </tr>
                                    </tfoot>
                                </Table>
                            </>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
                            Đóng
                        </Button>
                    </Modal.Footer>
                </Modal>
            </Container>
        </DashboardWrapper>
    );
};

export default OrderStaff;