import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Form, InputGroup, Badge, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import shipperService from '../../services/shipperService';
import { toast } from 'react-toastify';
import styled, { keyframes } from 'styled-components';
import {
    FaTruck, FaMapMarkerAlt, FaClock, 
    FaStar, FaBell, FaCog, FaSearch, FaChevronDown, 
    FaChevronRight, FaCheckCircle, FaEye,
    FaUser, FaMotorcycle, FaCar, FaBicycle
} from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import OrderDetail from './OrderDetail';
import Earnings from './Earnings';
import EditShipperProfile from './EditShipperProfile';

// Animations
const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
`;

const slideDown = keyframes`
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// Styled Components - Sử dụng theme tương tự Seller Dashboard
const DashboardWrapper = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #f8f9fa;
`;

const Sidebar = styled.div`
  width: 260px;
  background: linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%);
  box-shadow: 4px 0 16px rgba(0, 0, 0, 0.1);
  position: fixed;
  height: 100vh;
  overflow-y: auto;
  z-index: 100;
  border-right: 1px solid #e9ecef;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, #b8860b, #d4af37);
    border-radius: 3px;

    &:hover {
      background: #a07905;
    }
  }
`;

const SidebarHeader = styled.div`
  padding: 2rem 1.25rem;
  border-bottom: 3px solid #b8860b;
  background: linear-gradient(135deg, #b8860b 0%, #d4af37 100%);
  color: white;
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 4px 12px rgba(184, 134, 11, 0.2);

  h5 {
    margin: 0;
    font-size: 1.2rem;
    font-weight: 800;
    letter-spacing: 0.5px;
  }

  p {
    margin: 0.75rem 0 0 0;
    font-size: 0.8rem;
    opacity: 0.95;
    font-weight: 500;
  }
`;

const MenuSection = styled.div`
  padding: 1rem 0;
  border-bottom: 1px solid #e9ecef;

  &:last-child {
    border-bottom: none;
  }
`;

const MenuItem = styled.div`
  padding: 1rem 1.25rem;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: ${props => props.active ? '#b8860b' : '#555'};
  background-color: ${props => props.active ? 'linear-gradient(135deg, #fff9f0 0%, #fffbf5 100%)' : 'transparent'};
  border-left: 4px solid ${props => props.active ? '#b8860b' : 'transparent'};
  font-weight: ${props => props.active ? '700' : '500'};
  position: relative;

  &:hover {
    background: linear-gradient(135deg, #f9f9f9 0%, #f5f5f5 100%);
    color: #b8860b;
    border-left-color: #d4af37;
    padding-left: 1.5rem;
  }

  svg {
    margin-right: 0.9rem;
    font-size: 1.15rem;
  }

  span {
    font-size: 0.95rem;
  }
`;

const SubMenuItem = styled(MenuItem)`
  padding-left: 3rem;
  font-size: 0.9rem;
  border-left-width: 2px;

  svg {
    font-size: 0.95rem;
    margin-right: 0.75rem;
  }
`;

const MainContent = styled.div`
  margin-left: 260px;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const TopBar = styled.div`
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  padding: 1.75rem 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid #e9ecef;
  position: sticky;
  top: 0;
  z-index: 50;

  h4 {
    margin: 0;
    color: #333;
    font-weight: 800;
    font-size: 1.3rem;
  }

  small {
    color: #999;
    font-size: 0.85rem;
  }
`;

const ContentArea = styled.div`
  padding: 2.5rem;
  flex: 1;
  overflow-y: auto;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.75rem;
  margin-bottom: 3rem;
  animation: ${fadeIn} 0.6s ease-in-out;
`;

const StatCard = styled(Card)`
  border: none;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  border-radius: 16px;
  overflow: hidden;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #b8860b, #d4af37);
  }

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
  }

  .card-body {
    padding: 2rem 1.75rem;
    background: linear-gradient(135deg, #ffffff 0%, #f9f9f9 100%);
  }

  .stat-icon {
    width: 64px;
    height: 64px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    margin-bottom: 1.5rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    transition: all 0.3s ease;
  }

  &:hover .stat-icon {
    transform: scale(1.1) rotate(-5deg);
  }

  .stat-value {
    font-size: 2.3rem;
    font-weight: 800;
    margin-bottom: 0.5rem;
    color: #333;
    line-height: 1.2;
  }

  .stat-label {
    color: #666;
    font-size: 0.92rem;
    font-weight: 600;
  }
`;

const OrderCard = styled(Card)`
  border: none;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  margin-bottom: 1.5rem;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  border-radius: 16px;
  overflow: hidden;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: linear-gradient(180deg, #b8860b, #d4af37);
  }

  &:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    transform: translateX(4px);
  }

  .order-header {
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    padding: 1.5rem;
    border-bottom: 2px solid #dee2e6;
  }

  .order-body {
    padding: 1.5rem;
  }

  h6 {
    margin-bottom: 0.25rem;
    color: #333;
    font-weight: 800;
    font-size: 1.05rem;
  }
`;

const StatusBadge = styled(Badge)`
  font-size: 0.8rem;
  padding: 0.7rem 1.2rem;
  border-radius: 20px;
  font-weight: 700;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const VehicleIcon = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #e3f2fd, #bbdefb);
  color: #1976d2;
  margin-right: 0.75rem;
  font-size: 1.3rem;
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.2);
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

    // Search and filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');

    // Mock data - sẽ thay thế bằng API calls
    const [stats, setStats] = useState({
        totalOrders: 0,
        completedOrders: 0,
        pendingOrders: 0,
        totalEarnings: 0,
        rating: 0
    });

    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showOrderDetail, setShowOrderDetail] = useState(false);

    // Edit profile modal state
    const [showEditProfile, setShowEditProfile] = useState(false);

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
                const userRole = user.role || user.roleId?.roleName;
                if (userRole !== 'SHIPPER') {
                    toast.error('Bạn không có quyền truy cập trang này');
                    navigate('/');
                    return;
                }

                // Set initial user state
                setCurrentUser(user);
                console.log('User from localStorage:', user);
                console.log('User role:', user.role || user.roleId?.roleName);
                
                // Load shipper data directly from API first to ensure we have latest data
                console.log('Loading fresh shipper data from API...');
                await loadShipperData(user._id || user.id);
                
                // Then load statistics and orders
                await loadShipperStats(user._id || user.id);
                await loadOrders(user._id || user.id);

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
            console.log('Loading real dashboard stats for userId:', userId);
            const response = await shipperService.getDashboardStats(userId);
            console.log('Dashboard stats response:', response);
            
            if (response && response.success) {
                setStats({
                    totalOrders: response.data.totalOrders || 0,
                    completedOrders: response.data.completedOrders || 0,
                    pendingOrders: response.data.pendingOrders || 0,
                    totalEarnings: response.data.totalEarnings || 0,
                    rating: response.data.rating || 0
                });
            } else {
                console.error('Failed to load stats:', response?.message);
                // Set default values if API fails
                setStats({
                    totalOrders: 0,
                    completedOrders: 0,
                    pendingOrders: 0,
                    totalEarnings: 0,
                    rating: 0
                });
            }
        } catch (error) {
            console.error('Error loading stats:', error);
            toast.error('Không thể tải thống kê');
            // Set default values on error
            setStats({
                totalOrders: 0,
                completedOrders: 0,
                pendingOrders: 0,
                totalEarnings: 0,
                rating: 0
            });
        }
    };

    const loadOrders = async (userId) => {
        try {
            console.log('Loading real orders for userId:', userId);
            const response = await shipperService.getAssignedOrders(userId);
            console.log('Orders response:', response);
            
            if (response && response.success) {
                // Transform API data to match component format
                const transformedOrders = (response.data || []).map(shipment => {
                    console.log('Processing shipment:', shipment);
                    
                    // Get delivery address from order
                    const deliveryAddr = shipment.orderId?.shippingAddress?.fullAddress || 
                                        shipment.deliveryLocation?.address || '';
                    const phone = shipment.orderId?.shippingAddress?.phoneNumber || 
                                 shipment.orderId?.buyerInfo?.phoneNumber || 'N/A';
                    
                    // Format items list
                    let itemsList = 'N/A';
                    if (shipment.orderId?.items && Array.isArray(shipment.orderId.items)) {
                        itemsList = shipment.orderId.items.map(item => 
                            `${item.productName || 'Sản phẩm'} x${item.quantity}`
                        ).join(', ');
                    }
                    
                    return {
                        id: shipment._id,
                        orderId: shipment.orderId?.orderNumber || shipment.orderId?._id || shipment._id,
                        customerName: shipment.orderId?.shippingAddress?.recipientName || 
                                     shipment.orderId?.buyerInfo?.fullName || 'Khách hàng',
                        address: deliveryAddr,
                        phone: phone,
                        items: itemsList,
                        totalAmount: shipment.orderId?.finalAmount || shipment.orderId?.subtotal || 0,
                        shippingFee: shipment.shippingFee?.total || 
                                    shipment.shippingFee?.baseFee || 
                                    shipment.orderId?.shippingFee || 0,
                        status: shipment.status,
                        estimatedDelivery: shipment.estimatedDeliveryTime || new Date(),
                        distance: shipment.distance ? `${shipment.distance.toFixed(1)} km` : 'N/A'
                    };
                });
                
                console.log('Transformed orders:', transformedOrders);
                setOrders(transformedOrders);
            } else {
                console.error('Failed to load orders:', response?.message);
                setOrders([]);
            }
        } catch (error) {
            console.error('Error loading orders:', error);
            toast.error('Không thể tải danh sách đơn hàng');
            setOrders([]);
        }
    };
    
    // Fetch shipper data from API
    const loadShipperData = async (userId) => {
        try {
            console.log('Loading shipper data for userId:', userId);
            const response = await shipperService.getProfile(userId);
            console.log('API Response for shipper data:', response);
            
            if (response && response.success) {
                // Extract shipper data from response
                const shipperInfo = response.data.shipper;
                
                // Log documents if they exist
                if (shipperInfo && shipperInfo.documents) {
                    console.log('Shipper documents received:', shipperInfo.documents);
                    
                    // Convert document paths to full URLs for display
                    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:9999';
                    
                    Object.keys(shipperInfo.documents).forEach(docType => {
                        const docPath = shipperInfo.documents[docType];
                        if (docPath) {
                            console.log(`Document ${docType} URL:`, `${API_URL}${docPath}`);
                        }
                    });
                } else {
                    console.log('No documents found in shipper data');
                }
                
                // Update state
                setShipperData(shipperInfo);
                
                // Update user in localStorage with new shipper info
                const user = authService.getCurrentUser();
                if (user) {
                    const updatedUser = {
                        ...user,
                        shipperInfo: shipperInfo
                    };
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                    setCurrentUser(updatedUser);
                    
                    // Verify the data was updated in localStorage
                    const updatedStorageUser = JSON.parse(localStorage.getItem('user'));
                    console.log('Updated user in localStorage:', updatedStorageUser);
                    console.log('ShipperInfo in localStorage:', updatedStorageUser?.shipperInfo);
                }
            } else {
                console.error('Failed to load shipper data:', response?.message || 'Unknown error');
            }
        } catch (error) {
            console.error('Error fetching shipper data:', error);
            toast.error('Không thể tải thông tin shipper');
        }
    };

    // Filter and search orders
    const filteredOrders = orders.filter(order => {
        // Search filter
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = !searchTerm || 
            order.orderId.toLowerCase().includes(searchLower) ||
            order.customerName.toLowerCase().includes(searchLower) ||
            order.address.toLowerCase().includes(searchLower) ||
            order.items.toLowerCase().includes(searchLower) ||
            order.phone.includes(searchTerm);

        // Status filter
        const matchesStatus = filterStatus === 'ALL' || order.status === filterStatus;

        return matchesSearch && matchesStatus;
    });

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

    const handleUpdateOrderStatus = async (shipmentId, status, notes, photos) => {
        try {
            // Call API to update order status
            console.log('Updating shipment status:', { shipmentId, status, notes, photos });
            await shipperService.updateOrderStatus(shipmentId, status, notes, photos);
            
            // Update local state
            setOrders(prev => prev.map(order => 
                order.id === shipmentId ? { ...order, status } : order
            ));
            
            // Reload orders to get fresh data
            await loadOrders(currentUser._id || currentUser.id);
            
            toast.success('Cập nhật trạng thái đơn hàng thành công');
        } catch (error) {
            console.error('Error updating order status:', error);
            console.error('Error details:', error.response?.data);
            const errorMsg = error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật trạng thái';
            toast.error(errorMsg);
        }
    };

    const renderDashboard = () => (
        <div>
            <div className="mb-5">
                <h2 className="mb-2" style={{ fontWeight: '800', fontSize: '2rem', color: '#333' }}>📊 Dashboard Shipper</h2>
                <p className="text-muted" style={{ fontSize: '1rem' }}>Quản lý đơn hàng và theo dõi hiệu suất của bạn</p>
            </div>
            
            {/* Stats Cards */}
            <StatsGrid>
                <StatCard>
                    <div className="card-body">
                        <div className="stat-icon" style={{ backgroundColor: '#e3f2fd', color: '#1976d2' }}>
                            <FaTruck />
                        </div>
                        <div className="stat-value">{stats.totalOrders}</div>
                        <div className="stat-label">Tổng đơn hàng</div>
                    </div>
                </StatCard>

                <StatCard>
                    <div className="card-body">
                        <div className="stat-icon" style={{ backgroundColor: '#e8f5e8', color: '#2e7d32' }}>
                            <FaCheckCircle />
                        </div>
                        <div className="stat-value">{stats.completedOrders}</div>
                        <div className="stat-label">Đã hoàn thành</div>
                    </div>
                </StatCard>

                <StatCard>
                    <div className="card-body">
                        <div className="stat-icon" style={{ backgroundColor: '#fff3e0', color: '#f57c00' }}>
                            <FaClock />
                        </div>
                        <div className="stat-value">{stats.pendingOrders}</div>
                        <div className="stat-label">Đang xử lý</div>
                    </div>
                </StatCard>

                {/* Temporarily hidden - Revenue card 
                <StatCard>
                    <div className="card-body">
                        <div className="stat-icon" style={{ backgroundColor: '#f3e5f5', color: '#7b1fa2' }}>
                            <FaMoneyBillWave />
                        </div>
                        <div className="stat-value" style={{ fontSize: '1.5rem' }}>{(stats.totalEarnings / 1000000).toFixed(1)}M</div>
                        <div className="stat-label">Tổng thu nhập (VND)</div>
                    </div>
                </StatCard>
                */}

                <StatCard>
                    <div className="card-body">
                        <div className="stat-icon" style={{ backgroundColor: '#fff8e1', color: '#f9a825' }}>
                            <FaStar />
                        </div>
                        <div className="stat-value">{stats.rating}</div>
                        <div className="stat-label">Đánh giá trung bình</div>
                    </div>
                </StatCard>


            </StatsGrid>

            {/* Recent Orders */}
            <Card style={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
                <Card.Header style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', borderBottom: '3px solid #b8860b', padding: '1.75rem', borderRadius: '16px 16px 0 0' }}>
                    <h5 className="mb-0" style={{ fontWeight: '800', color: '#333', fontSize: '1.15rem' }}>📋 Đơn hàng gần đây</h5>
                </Card.Header>
                <Card.Body style={{ padding: '2rem' }}>
                    {orders.length === 0 ? (
                        <div className="text-center py-5">
                            <FaTruck size={64} className="text-muted mb-3" style={{ opacity: 0.2 }} />
                            <p className="text-muted" style={{ fontSize: '1.05rem', fontWeight: '500' }}>Chưa có đơn hàng nào</p>
                        </div>
                    ) : (
                        orders.map(order => (
                            <OrderCard key={order.id}>
                                <div className="order-header">
                                    <div className="d-flex justify-content-between align-items-start">
                                        <div>
                                            <h6 style={{ color: '#b8860b' }}>#{order.orderId}</h6>
                                            <small className="text-muted">{order.customerName}</small>
                                        </div>
                                        <div className="text-end">
                                            {getStatusBadge(order.status)}
                                            <div className="mt-2">
                                                <small className="text-muted d-block" style={{ fontWeight: '600' }}>
                                                    <FaMapMarkerAlt className="me-1" />
                                                    {order.distance}
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="order-body">
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <p className="mb-2" style={{ color: '#999', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>📦 Sản phẩm</p>
                                            <p className="mb-3 text-muted" style={{ fontWeight: '500' }}>{order.items}</p>
                                            <p className="mb-2" style={{ color: '#999', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>📍 Địa chỉ</p>
                                            <p className="mb-3 text-muted" style={{ fontWeight: '500' }}>{order.address}</p>
                                            <p style={{ color: '#999', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>📞 SĐT</p>
                                            <p style={{ fontWeight: '600', color: '#333' }}>{order.phone}</p>
                                        </div>
                                        <div className="col-md-6">
                                            <p className="mb-2" style={{ color: '#999', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>💰 Tổng tiền</p>
                                            <p className="mb-3" style={{ fontSize: '1.3rem', fontWeight: '800', color: '#2e7d32' }}>{order.totalAmount.toLocaleString()} VND</p>
                                            <p className="mb-2" style={{ color: '#999', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>🚚 Phí ship</p>
                                            <p className="mb-3" style={{ fontWeight: '700', fontSize: '1.05rem', color: '#b8860b' }}>{order.shippingFee.toLocaleString()} VND</p>
                                            <p style={{ color: '#999', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>⏰ Dự kiến giao</p>
                                            <p className="text-muted" style={{ fontWeight: '500' }}>{new Date(order.estimatedDelivery).toLocaleString('vi-VN')}</p>
                                        </div>
                                    </div>
                                    <div className="mt-4 d-flex gap-2">
                                        <Button 
                                            variant="outline-primary" 
                                            size="sm"
                                            onClick={() => handleOrderClick(order)}
                                            style={{ borderRadius: '8px', fontWeight: '700', padding: '0.5rem 1rem' }}
                                        >
                                            <FaEye className="me-2" />
                                            Xem chi tiết
                                        </Button>
                                        {order.status === 'PICKED_UP' && (
                                            <Button 
                                                variant="success" 
                                                size="sm"
                                                onClick={() => handleOrderClick(order)}
                                                style={{ borderRadius: '8px', fontWeight: '700', padding: '0.5rem 1rem' }}
                                            >
                                                <FaCheckCircle className="me-2" />
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
                <div>
                    <h2 style={{ fontWeight: '700', marginBottom: '0.5rem' }}>📊 Quản lý đơn hàng</h2>
                    <p className="text-muted">Danh sách tất cả các đơn hàng được assign cho bạn</p>
                </div>
                <div className="d-flex gap-2">
                    <InputGroup style={{ width: '320px' }}>
                        <InputGroup.Text style={{ background: 'white', borderRight: 'none', borderRadius: '6px 0 0 6px' }}>
                            <FaSearch style={{ color: '#999' }} />
                        </InputGroup.Text>
                        <Form.Control 
                            placeholder="Tìm kiếm đơn hàng..." 
                            style={{ borderLeft: 'none', borderRadius: '0 6px 6px 0' }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </InputGroup>
                    <Form.Select
                        style={{ width: '150px', borderRadius: '6px' }}
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="ALL">Tất cả</option>
                        <option value="ASSIGNED">Đã nhận</option>
                        <option value="PICKED_UP">Đã lấy hàng</option>
                        <option value="OUT_FOR_DELIVERY">Đang giao</option>
                        <option value="DELIVERED">Đã giao</option>
                        <option value="FAILED">Giao thất bại</option>
                    </Form.Select>
                </div>
            </div>

            <Card style={{ borderRadius: '12px', border: 'none', boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}>
                <Card.Body style={{ padding: '1.5rem' }}>
                    <div className="table-responsive">
                        <Table hover style={{ marginBottom: 0 }}>
                            <thead style={{ background: '#f8f9fa' }}>
                                <tr>
                                    <th style={{ fontWeight: '700', color: '#333', paddingBottom: '1rem' }}>Mã đơn</th>
                                    <th style={{ fontWeight: '700', color: '#333', paddingBottom: '1rem' }}>Khách hàng</th>
                                    <th style={{ fontWeight: '700', color: '#333', paddingBottom: '1rem' }}>Địa chỉ</th>
                                    <th style={{ fontWeight: '700', color: '#333', paddingBottom: '1rem' }}>Sản phẩm</th>
                                    <th style={{ fontWeight: '700', color: '#333', paddingBottom: '1rem' }}>Trạng thái</th>
                                    <th style={{ fontWeight: '700', color: '#333', paddingBottom: '1rem' }}>Phí ship</th>
                                    <th style={{ fontWeight: '700', color: '#333', paddingBottom: '1rem' }}>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.length > 0 ? (
                                    filteredOrders.map(order => (
                                        <tr key={order.id} style={{ borderTop: '1px solid #e9ecef' }}>
                                            <td style={{ paddingTop: '1rem', paddingBottom: '1rem' }}>
                                                <strong style={{ color: '#b8860b' }}>{order.orderId}</strong>
                                            </td>
                                            <td>
                                                <div style={{ fontWeight: '600' }}>{order.customerName}</div>
                                                <small className="text-muted">{order.phone}</small>
                                            </td>
                                            <td>
                                                <div style={{ maxWidth: '200px', color: '#666' }}>
                                                    <small>{order.address}</small>
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ maxWidth: '150px', color: '#666' }}>
                                                    <small>{order.items}</small>
                                                </div>
                                            </td>
                                            <td>{getStatusBadge(order.status)}</td>
                                            <td style={{ fontWeight: '600', color: '#2e7d32' }}>
                                                {order.shippingFee.toLocaleString()} VND
                                            </td>
                                            <td>
                                                <Button 
                                                    variant="outline-primary" 
                                                    size="sm"
                                                    onClick={() => handleOrderClick(order)}
                                                    style={{ borderRadius: '6px' }}
                                                >
                                                    <FaEye />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="text-center py-4">
                                            <div style={{ color: '#999' }}>
                                                <p style={{ margin: 0 }}>Không tìm thấy đơn hàng nào</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </div>
                </Card.Body>
            </Card>
        </div>
    );

    const renderProfile = () => (
        <div>
            <h2 className="mb-4" style={{ fontWeight: '700' }}>👤 Thông tin cá nhân</h2>
            
            <div className="row">
                <div className="col-md-4 mb-4">
                    <Card style={{ borderRadius: '12px', border: 'none', boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}>
                        <Card.Body className="text-center" style={{ padding: '2rem 1.5rem' }}>
                            <div className="mb-4">
                                <div style={{ 
                                    width: '120px', 
                                    height: '120px', 
                                    borderRadius: '50%', 
                                    backgroundColor: '#e3f2fd',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto',
                                    fontSize: '3rem',
                                    color: '#1976d2',
                                    boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)'
                                }}>
                                    <FaUser />
                                </div>
                            </div>
                            <h5 style={{ fontWeight: '700', marginBottom: '0.5rem' }}>{currentUser?.fullName}</h5>
                            <p className="text-muted" style={{ marginBottom: '0.25rem' }}>{currentUser?.email}</p>
                            <p className="text-muted">{currentUser?.phoneNumber}</p>
                            
                            <hr style={{ margin: '1.5rem 0' }} />
                            
                            <div style={{ padding: '1rem 0' }}>
                                <p style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: '#999' }}>PHƯƠNG TIỆN</p>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                                    <VehicleIcon>
                                        {getVehicleIcon(shipperData?.vehicleType)}
                                    </VehicleIcon>
                                    <strong>{shipperData?.vehicleNumber || 'N/A'}</strong>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </div>
                
                <div className="col-md-8 mb-4">
                    <Card style={{ borderRadius: '12px', border: 'none', boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}>
                        <Card.Header style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', borderBottom: '2px solid #dee2e6', padding: '1.5rem', borderRadius: '12px 12px 0 0' }}>
                            <h5 className="mb-0" style={{ fontWeight: '700', color: '#333' }}>🚚 Thông tin shipper</h5>
                        </Card.Header>
                        <Card.Body style={{ padding: '2rem' }}>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <p style={{ marginBottom: '0.5rem', color: '#999', fontSize: '0.85rem', fontWeight: '600' }}>BẰNG LÁI</p>
                                    <p style={{ fontWeight: '600', color: '#333' }}>{shipperData?.licenseNumber || 'N/A'}</p>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <p style={{ marginBottom: '0.5rem', color: '#999', fontSize: '0.85rem', fontWeight: '600' }}>LOẠI XE</p>
                                    <p style={{ fontWeight: '600', color: '#333' }}>{shipperData?.vehicleType || 'N/A'}</p>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <p style={{ marginBottom: '0.5rem', color: '#999', fontSize: '0.85rem', fontWeight: '600' }}>BIỂN SỐ</p>
                                    <p style={{ fontWeight: '600', color: '#333' }}>{shipperData?.vehicleNumber || 'N/A'}</p>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <p style={{ marginBottom: '0.5rem', color: '#999', fontSize: '0.85rem', fontWeight: '600' }}>KHU VỰC PHỤC VỤ</p>
                                    <p style={{ fontWeight: '600', color: '#333' }}>{shipperData?.serviceAreas?.join(', ') || 'N/A'}</p>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <p style={{ marginBottom: '0.5rem', color: '#999', fontSize: '0.85rem', fontWeight: '600' }}>TRỌNG LƯỢNG TỐI ĐA</p>
                                    <p style={{ fontWeight: '600', color: '#333' }}>{shipperData?.maxWeight || 'N/A'} kg</p>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <p style={{ marginBottom: '0.5rem', color: '#999', fontSize: '0.85rem', fontWeight: '600' }}>THỂ TÍCH TỐI ĐA</p>
                                    <p style={{ fontWeight: '600', color: '#333' }}>{shipperData?.maxVolume || 'N/A'} L</p>
                                </div>
                            </div>
                            
                            <hr style={{ margin: '1.5rem 0' }} />
                            
                            <div className="row">
                                <div className="col-md-8">
                                    <p style={{ marginBottom: '0.5rem', color: '#999', fontSize: '0.85rem', fontWeight: '600' }}>GIỜ LÀM VIỆC</p>
                                    <p style={{ fontWeight: '600', color: '#333' }}>
                                        {shipperData?.workingHours?.start || 'N/A'} - {shipperData?.workingHours?.end || 'N/A'}
                                    </p>
                                </div>
                
                            </div>
                            
                            <Button 
                                variant="primary" 
                                className="mt-4"
                                onClick={() => setShowEditProfile(true)}
                                style={{ borderRadius: '6px', fontWeight: '600' }}
                            >
                                <FaCog className="me-2" />
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

                {/* Temporarily hidden - Earnings menu
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
                */}

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

            {/* Edit Profile Modal */}
            <EditShipperProfile
                show={showEditProfile}
                onHide={() => setShowEditProfile(false)}
                shipperData={shipperData}
                currentUser={currentUser}
                onSave={async (updateData) => {
                    // Call API to update shipper info
                    try {
                        // Call the API to update profile
                        const userId = currentUser?._id || currentUser?.id;
                        console.log('Updating shipper profile with userId:', userId);
                        console.log('Update data:', updateData);
                        
                        // Use the direct profile update endpoint
                        const response = await shipperService.updateProfile(userId, updateData);
                        console.log('API Response:', response);
                        
                        if (response && response.success) {
                            // Extract data from response
                            const { user: updatedUser, shipper: updatedShipper } = response.data;
                            console.log('Updated user data:', updatedUser);
                            console.log('Updated shipper data:', updatedShipper);
                            
                            // Update local state
                            setShipperData(updatedShipper);
                            
                            // Also update currentUser if user data changed
                            if (updatedUser) {
                                const userToUpdate = {
                                    ...currentUser,
                                    fullName: updatedUser.fullName || currentUser.fullName,
                                    phoneNumber: updatedUser.phoneNumber || currentUser.phoneNumber,
                                    shipperInfo: updatedShipper
                                };
                                setCurrentUser(userToUpdate);
                                localStorage.setItem('user', JSON.stringify(userToUpdate));
                            }
                            
                            toast.success('Cập nhật thông tin thành công');
                        } else {
                            // Fallback update using provided data
                            console.log('Using fallback update with provided data');
                            
                            // Update local state with response data if available, otherwise use updateData
                            setShipperData(prev => ({
                                ...prev,
                                ...updateData
                            }));
                            
                            // Update localStorage to persist changes after logout/login
                            const user = authService.getCurrentUser();
                            if (user) {
                                // Update user object with new shipper data
                                const updatedUser = {
                                    ...user,
                                    shipperInfo: {
                                        ...(user.shipperInfo || {}),
                                        ...updateData
                                    }
                                };
                                
                                // Store updated user data in localStorage
                                localStorage.setItem('user', JSON.stringify(updatedUser));
                                setCurrentUser(updatedUser);
                            }
                            
                            toast.success('Cập nhật thông tin thành công (local)');
                        }
                    } catch (error) {
                        console.error('Error updating shipper info:', error);
                        toast.error(`Lỗi khi cập nhật: ${error.message || 'Không thể kết nối đến server'}`);
                    }
                }}
            />
        </DashboardWrapper>
    );
}

export default ShipperDashboard;
