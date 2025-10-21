import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Form, InputGroup, Badge, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
// import shipperService from '../../services/shipperService';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import {
    FaTruck, FaMapMarkerAlt, FaClock, FaMoneyBillWave, 
    FaStar, FaBell, FaCog, FaSearch, FaChevronDown, 
    FaChevronRight, FaCheckCircle, FaEye, FaFilter,
    FaUser, FaMotorcycle, FaCar, FaBicycle
} from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import OrderDetail from './OrderDetail';
import Earnings from './Earnings';

// Styled Components - Sử dụng theme tương tự Seller Dashboard
const DashboardWrapper = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #f5f5f5;
`;

const Sidebar = styled.div`
  width: 220px;
  background-color: white;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
  position: fixed;
  height: 100vh;
  overflow-y: auto;
  z-index: 100;
`;

const SidebarHeader = styled.div`
  padding: 1.5rem 1rem;
  border-bottom: 1px solid #f0f0f0;
  background: linear-gradient(135deg, #b8860b 0%, #d4af37 100%);
  color: white;

  h5 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
  }

  p {
    margin: 0.25rem 0 0 0;
    font-size: 0.85rem;
    opacity: 0.9;
  }
`;

const MenuSection = styled.div`
  padding: 0.5rem 0;
  border-bottom: 1px solid #f0f0f0;
`;

const MenuItem = styled.div`
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: ${props => props.active ? '#b8860b' : '#555'};
  background-color: ${props => props.active ? '#fff8e6' : 'transparent'};
  border-left: 3px solid ${props => props.active ? '#b8860b' : 'transparent'};

  &:hover {
    background-color: #f8f8f8;
    color: #b8860b;
  }

  svg {
    margin-right: 0.75rem;
    font-size: 1rem;
  }

  span {
    font-size: 0.9rem;
    font-weight: ${props => props.active ? '600' : '400'};
  }
`;

const SubMenuItem = styled(MenuItem)`
  padding-left: 2.5rem;
  font-size: 0.85rem;
`;

const MainContent = styled.div`
  margin-left: 220px;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const TopBar = styled.div`
  background: white;
  padding: 1rem 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: between;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
`;

const ContentArea = styled.div`
  padding: 2rem;
  flex: 1;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled(Card)`
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }

  .card-body {
    padding: 1.5rem;
  }

  .stat-icon {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }

  .stat-value {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }

  .stat-label {
    color: #666;
    font-size: 0.9rem;
  }
`;

const OrderCard = styled(Card)`
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .order-header {
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    padding: 1rem;
    border-bottom: 1px solid #dee2e6;
  }

  .order-body {
    padding: 1rem;
  }
`;

const StatusBadge = styled(Badge)`
  font-size: 0.75rem;
  padding: 0.5rem 0.75rem;
  border-radius: 20px;
`;

const VehicleIcon = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: #e3f2fd;
  color: #1976d2;
  margin-right: 0.5rem;
`;

function ShipperDashboard() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [shipperData, setShipperData] = useState(null);
    const [activeMenu, setActiveMenu] = useState('dashboard');
    const [expandedMenus, setExpandedMenus] = useState({
        orders: true,
        earnings: false,
        profile: false,
        settings: false
    });

    // Mock data - sẽ thay thế bằng API calls
    const [stats, setStats] = useState({
        totalOrders: 0,
        completedOrders: 0,
        pendingOrders: 0,
        totalEarnings: 0,
        rating: 0,
        onlineStatus: false
    });

    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showOrderDetail, setShowOrderDetail] = useState(false);

    // Load user and shipper data
    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                const user = authService.getCurrentUser();
                if (!user) {
                    toast.error('Vui lòng đăng nhập');
                    navigate('/login');
                    return;
                }

                // Check if user has shipper role
                if (user.roleId?.roleName !== 'SHIPPER') {
                    toast.error('Bạn không có quyền truy cập trang này');
                    navigate('/');
                    return;
                }

                setCurrentUser(user);
                setShipperData(user.shipperInfo);

                // Load shipper statistics
                await loadShipperStats(user._id);
                
                // Load orders
                await loadOrders(user._id);

                setLoading(false);
            } catch (error) {
                console.error('Error loading dashboard:', error);
                toast.error('Không thể tải dữ liệu dashboard');
                setLoading(false);
            }
        };

        loadDashboardData();
    }, [navigate]);

    const loadShipperStats = async (userId) => {
        try {
            // Mock data - thay thế bằng API call thực tế
            setStats({
                totalOrders: 45,
                completedOrders: 42,
                pendingOrders: 3,
                totalEarnings: 1250000,
                rating: 4.8,
                onlineStatus: true
            });
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    };

    const loadOrders = async (userId) => {
        try {
            // Mock data - thay thế bằng API call thực tế
            setOrders([
                {
                    id: '1',
                    orderId: 'ORD-001',
                    customerName: 'Nguyễn Văn A',
                    address: '123 Lê Lợi, Quận 1, TP.HCM',
                    phone: '0901234567',
                    items: 'Khăn choàng thổ cẩm x2',
                    totalAmount: 720000,
                    shippingFee: 30000,
                    status: 'PICKED_UP',
                    estimatedDelivery: '2025-01-15T14:00:00Z',
                    distance: '5.2 km'
                },
                {
                    id: '2',
                    orderId: 'ORD-002',
                    customerName: 'Trần Thị B',
                    address: '456 Nguyễn Huệ, Quận 1, TP.HCM',
                    phone: '0907654321',
                    items: 'Hộp sơn mài cao cấp x1',
                    totalAmount: 950000,
                    shippingFee: 25000,
                    status: 'OUT_FOR_DELIVERY',
                    estimatedDelivery: '2025-01-15T16:00:00Z',
                    distance: '3.8 km'
                }
            ]);
        } catch (error) {
            console.error('Error loading orders:', error);
        }
    };

    const toggleMenu = (menuName) => {
        setExpandedMenus(prev => ({
            ...prev,
            [menuName]: !prev[menuName]
        }));
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            'ASSIGNED': { variant: 'secondary', text: 'Đã nhận' },
            'PICKED_UP': { variant: 'warning', text: 'Đã lấy hàng' },
            'OUT_FOR_DELIVERY': { variant: 'primary', text: 'Đang giao' },
            'DELIVERED': { variant: 'success', text: 'Đã giao' },
            'FAILED': { variant: 'danger', text: 'Giao thất bại' }
        };

        const config = statusConfig[status] || { variant: 'secondary', text: status };
        return <StatusBadge bg={config.variant}>{config.text}</StatusBadge>;
    };

    const getVehicleIcon = (vehicleType) => {
        switch (vehicleType) {
            case 'MOTORBIKE':
                return <FaMotorcycle />;
            case 'CAR':
                return <FaCar />;
            case 'BIKE':
                return <FaBicycle />;
            default:
                return <FaTruck />;
        }
    };

    const handleOrderClick = (order) => {
        setSelectedOrder(order);
        setShowOrderDetail(true);
    };

    const handleUpdateOrderStatus = async (orderId, status, notes, photos) => {
        try {
            // Call API to update order status
            console.log('Updating order status:', { orderId, status, notes, photos });
            // await shipperService.updateOrderStatus(orderId, status, notes, photos);
            
            // Update local state
            setOrders(prev => prev.map(order => 
                order.id === orderId ? { ...order, status } : order
            ));
            
            toast.success('Cập nhật trạng thái đơn hàng thành công');
        } catch (error) {
            console.error('Error updating order status:', error);
            toast.error('Có lỗi xảy ra khi cập nhật trạng thái');
        }
    };

    const renderDashboard = () => (
        <div>
            <h2 className="mb-4">Dashboard Shipper</h2>
            
            {/* Stats Cards */}
            <StatsGrid>
                <StatCard>
                    <div className="stat-icon" style={{ backgroundColor: '#e3f2fd', color: '#1976d2' }}>
                        <FaTruck />
                    </div>
                    <div className="stat-value">{stats.totalOrders}</div>
                    <div className="stat-label">Tổng đơn hàng</div>
                </StatCard>

                <StatCard>
                    <div className="stat-icon" style={{ backgroundColor: '#e8f5e8', color: '#2e7d32' }}>
                        <FaCheckCircle />
                    </div>
                    <div className="stat-value">{stats.completedOrders}</div>
                    <div className="stat-label">Đã hoàn thành</div>
                </StatCard>

                <StatCard>
                    <div className="stat-icon" style={{ backgroundColor: '#fff3e0', color: '#f57c00' }}>
                        <FaClock />
                    </div>
                    <div className="stat-value">{stats.pendingOrders}</div>
                    <div className="stat-label">Đang xử lý</div>
                </StatCard>

                <StatCard>
                    <div className="stat-icon" style={{ backgroundColor: '#f3e5f5', color: '#7b1fa2' }}>
                        <FaMoneyBillWave />
                    </div>
                    <div className="stat-value">{stats.totalEarnings.toLocaleString()} VND</div>
                    <div className="stat-label">Tổng thu nhập</div>
                </StatCard>

                <StatCard>
                    <div className="stat-icon" style={{ backgroundColor: '#fff8e1', color: '#f9a825' }}>
                        <FaStar />
                    </div>
                    <div className="stat-value">{stats.rating}</div>
                    <div className="stat-label">Đánh giá trung bình</div>
                </StatCard>

                <StatCard>
                    <div className="stat-icon" style={{ backgroundColor: stats.onlineStatus ? '#e8f5e8' : '#ffebee', color: stats.onlineStatus ? '#2e7d32' : '#c62828' }}>
                        <FaBell />
                    </div>
                    <div className="stat-value">{stats.onlineStatus ? 'Online' : 'Offline'}</div>
                    <div className="stat-label">Trạng thái</div>
                </StatCard>
            </StatsGrid>

            {/* Recent Orders */}
            <Card>
                <Card.Header>
                    <h5 className="mb-0">Đơn hàng gần đây</h5>
                </Card.Header>
                <Card.Body>
                    {orders.length === 0 ? (
                        <div className="text-center py-4">
                            <FaTruck size={48} className="text-muted mb-3" />
                            <p className="text-muted">Chưa có đơn hàng nào</p>
                        </div>
                    ) : (
                        orders.map(order => (
                            <OrderCard key={order.id}>
                                <div className="order-header">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h6 className="mb-1">#{order.orderId}</h6>
                                            <small className="text-muted">{order.customerName}</small>
                                        </div>
                                        <div className="text-end">
                                            {getStatusBadge(order.status)}
                                            <div className="mt-1">
                                                <small className="text-muted">
                                                    <FaMapMarkerAlt className="me-1" />
                                                    {order.distance}
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="order-body">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <p className="mb-1"><strong>Sản phẩm:</strong> {order.items}</p>
                                            <p className="mb-1"><strong>Địa chỉ:</strong> {order.address}</p>
                                            <p className="mb-0"><strong>SĐT:</strong> {order.phone}</p>
                                        </div>
                                        <div className="col-md-6">
                                            <p className="mb-1"><strong>Tổng tiền:</strong> {order.totalAmount.toLocaleString()} VND</p>
                                            <p className="mb-1"><strong>Phí ship:</strong> {order.shippingFee.toLocaleString()} VND</p>
                                            <p className="mb-0"><strong>Dự kiến giao:</strong> {new Date(order.estimatedDelivery).toLocaleString('vi-VN')}</p>
                                        </div>
                                    </div>
                                    <div className="mt-3 d-flex gap-2">
                                        <Button 
                                            variant="outline-primary" 
                                            size="sm"
                                            onClick={() => handleOrderClick(order)}
                                        >
                                            <FaEye className="me-1" />
                                            Xem chi tiết
                                        </Button>
                                        {order.status === 'PICKED_UP' && (
                                            <Button 
                                                variant="success" 
                                                size="sm"
                                                onClick={() => handleOrderClick(order)}
                                            >
                                                <FaCheckCircle className="me-1" />
                                                Xác nhận giao hàng
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </OrderCard>
                        ))
                    )}
                </Card.Body>
            </Card>
        </div>
    );

    const renderOrders = () => (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Quản lý đơn hàng</h2>
                <div className="d-flex gap-2">
                    <InputGroup style={{ width: '300px' }}>
                        <InputGroup.Text>
                            <FaSearch />
                        </InputGroup.Text>
                        <Form.Control placeholder="Tìm kiếm đơn hàng..." />
                    </InputGroup>
                    <Button variant="outline-secondary">
                        <FaFilter className="me-1" />
                        Lọc
                    </Button>
                </div>
            </div>

            <Card>
                <Card.Body>
                    <Table responsive hover>
                        <thead>
                            <tr>
                                <th>Mã đơn</th>
                                <th>Khách hàng</th>
                                <th>Địa chỉ</th>
                                <th>Sản phẩm</th>
                                <th>Trạng thái</th>
                                <th>Phí ship</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order.id}>
                                    <td>{order.orderId}</td>
                                    <td>
                                        <div>
                                            <div>{order.customerName}</div>
                                            <small className="text-muted">{order.phone}</small>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ maxWidth: '200px' }}>
                                            <small>{order.address}</small>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ maxWidth: '150px' }}>
                                            <small>{order.items}</small>
                                        </div>
                                    </td>
                                    <td>{getStatusBadge(order.status)}</td>
                                    <td>{order.shippingFee.toLocaleString()} VND</td>
                                    <td>
                                        <Button 
                                            variant="outline-primary" 
                                            size="sm"
                                            onClick={() => handleOrderClick(order)}
                                        >
                                            <FaEye />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>
        </div>
    );

    const renderProfile = () => (
        <div>
            <h2 className="mb-4">Thông tin cá nhân</h2>
            
            <div className="row">
                <div className="col-md-4">
                    <Card>
                        <Card.Body className="text-center">
                            <div className="mb-3">
                                <div style={{ 
                                    width: '100px', 
                                    height: '100px', 
                                    borderRadius: '50%', 
                                    backgroundColor: '#e3f2fd',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto',
                                    fontSize: '2rem',
                                    color: '#1976d2'
                                }}>
                                    <FaUser />
                                </div>
                            </div>
                            <h5>{currentUser?.fullName}</h5>
                            <p className="text-muted">{currentUser?.email}</p>
                            <p className="text-muted">{currentUser?.phoneNumber}</p>
                            
                            <div className="mt-3">
                                <VehicleIcon>
                                    {getVehicleIcon(shipperData?.vehicleType)}
                                </VehicleIcon>
                                <span>{shipperData?.vehicleNumber}</span>
                            </div>
                        </Card.Body>
                    </Card>
                </div>
                
                <div className="col-md-8">
                    <Card>
                        <Card.Header>
                            <h5 className="mb-0">Thông tin shipper</h5>
                        </Card.Header>
                        <Card.Body>
                            <div className="row">
                                <div className="col-md-6">
                                    <p><strong>Bằng lái:</strong> {shipperData?.licenseNumber}</p>
                                    <p><strong>Loại xe:</strong> {shipperData?.vehicleType}</p>
                                    <p><strong>Biển số:</strong> {shipperData?.vehicleNumber}</p>
                                </div>
                                <div className="col-md-6">
                                    <p><strong>Khu vực phục vụ:</strong> {shipperData?.serviceAreas?.join(', ')}</p>
                                    <p><strong>Trọng lượng tối đa:</strong> {shipperData?.maxWeight} kg</p>
                                    <p><strong>Thể tích tối đa:</strong> {shipperData?.maxVolume} L</p>
                                </div>
                            </div>
                            
                            <div className="mt-3">
                                <p><strong>Giờ làm việc:</strong> {shipperData?.workingHours?.start} - {shipperData?.workingHours?.end}</p>
                                <p><strong>Trạng thái:</strong> 
                                    <Badge bg={shipperData?.isOnline ? 'success' : 'secondary'} className="ms-2">
                                        {shipperData?.isOnline ? 'Online' : 'Offline'}
                                    </Badge>
                                </p>
                            </div>
                            
                            <Button variant="primary" className="mt-3">
                                <FaCog className="me-1" />
                                Chỉnh sửa thông tin
                            </Button>
                        </Card.Body>
                    </Card>
                </div>
            </div>
        </div>
    );

    const renderEarnings = () => (
        <Earnings userId={currentUser?._id} />
    );

    const renderContent = () => {
        switch (activeMenu) {
            case 'dashboard':
                return renderDashboard();
            case 'orders':
                return renderOrders();
            case 'earnings':
                return renderEarnings();
            case 'profile':
                return renderProfile();
            default:
                return renderDashboard();
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </div>
        );
    }

    return (
        <DashboardWrapper>
            {/* Sidebar */}
            <Sidebar>
                <SidebarHeader>
                    <h5>Shipper Dashboard</h5>
                    <p>{currentUser?.fullName}</p>
                </SidebarHeader>

                <MenuSection>
                    <MenuItem 
                        active={activeMenu === 'dashboard'} 
                        onClick={() => setActiveMenu('dashboard')}
                    >
                        <FaTruck />
                        <span>Tổng quan</span>
                    </MenuItem>
                </MenuSection>

                <MenuSection>
                    <MenuItem onClick={() => toggleMenu('orders')}>
                        {expandedMenus.orders ? <FaChevronDown /> : <FaChevronRight />}
                        <span>Đơn hàng</span>
                    </MenuItem>
                    {expandedMenus.orders && (
                        <>
                            <SubMenuItem 
                                active={activeMenu === 'orders'} 
                                onClick={() => setActiveMenu('orders')}
                            >
                                <FaTruck />
                                <span>Tất cả đơn hàng</span>
                            </SubMenuItem>
                        </>
                    )}
                </MenuSection>

                <MenuSection>
                    <MenuItem onClick={() => toggleMenu('earnings')}>
                        {expandedMenus.earnings ? <FaChevronDown /> : <FaChevronRight />}
                        <span>Thu nhập</span>
                    </MenuItem>
                    {expandedMenus.earnings && (
                        <>
                            <SubMenuItem 
                                active={activeMenu === 'earnings'} 
                                onClick={() => setActiveMenu('earnings')}
                            >
                                <FaMoneyBillWave />
                                <span>Chi tiết thu nhập</span>
                            </SubMenuItem>
                        </>
                    )}
                </MenuSection>

                <MenuSection>
                    <MenuItem 
                        active={activeMenu === 'profile'} 
                        onClick={() => setActiveMenu('profile')}
                    >
                        <FaUser />
                        <span>Thông tin cá nhân</span>
                    </MenuItem>
                </MenuSection>

                <MenuSection>
                    <MenuItem onClick={() => toggleMenu('settings')}>
                        {expandedMenus.settings ? <FaChevronDown /> : <FaChevronRight />}
                        <span>Cài đặt</span>
                    </MenuItem>
                    {expandedMenus.settings && (
                        <>
                            <SubMenuItem>
                                <FaCog />
                                <span>Cài đặt chung</span>
                            </SubMenuItem>
                            <SubMenuItem>
                                <FaBell />
                                <span>Thông báo</span>
                            </SubMenuItem>
                        </>
                    )}
                </MenuSection>
            </Sidebar>

            {/* Main Content */}
            <MainContent>
                <TopBar>
                    <div>
                        <h4 className="mb-0">Dashboard Shipper</h4>
                        <small className="text-muted">Quản lý đơn hàng và thu nhập</small>
                    </div>
                    <div className="d-flex align-items-center gap-3">
                        <Badge bg={stats.onlineStatus ? 'success' : 'secondary'}>
                            {stats.onlineStatus ? 'Online' : 'Offline'}
                        </Badge>
                        <Button variant="outline-primary" size="sm">
                            <FaBell />
                        </Button>
                        <Button variant="outline-secondary" size="sm" onClick={() => navigate('/')}>
                            Về trang chủ
                        </Button>
                    </div>
                </TopBar>

                <ContentArea>
                    {renderContent()}
                </ContentArea>
            </MainContent>

            {/* Order Detail Modal */}
            <OrderDetail
                show={showOrderDetail}
                onHide={() => setShowOrderDetail(false)}
                order={selectedOrder}
                onUpdateStatus={handleUpdateOrderStatus}
            />
        </DashboardWrapper>
    );
}

export default ShipperDashboard;
