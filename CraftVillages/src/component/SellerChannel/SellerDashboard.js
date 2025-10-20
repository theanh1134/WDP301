import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Form, InputGroup, Badge, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import shopService from '../../services/shopService';
import authService from '../../services/authService';
import productService from '../../services/productService';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import {
    FaBox, FaShoppingCart, FaBullhorn, FaChartLine,
    FaMoneyBillWave, FaComments, FaCog, FaSearch, FaBell,
    FaQuestionCircle, FaChevronDown, FaChevronRight, FaFileInvoice,
    FaEdit, FaTrash, FaEye, FaPlus, FaFilter, FaDownload, FaBoxOpen
} from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import AddInventoryModal from './AddInventoryModal';
import OrderManagement from './OrderManagement';
import Revenue from './Revenue';
import Analytics from './Analytics';

// Styled Components
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

  h5 {
    margin: 0;
    font-size: 1rem;
    color: #333;
    font-weight: 600;
  }

  p {
    margin: 0.25rem 0 0 0;
    font-size: 0.85rem;
    color: #888;
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
  background-color: white;
  padding: 1rem 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 99;
`;

const SearchBar = styled(InputGroup)`
  max-width: 400px;

  input {
    border: 1px solid #e0e0e0;
    font-size: 0.9rem;

    &:focus {
      border-color: #b8860b;
      box-shadow: 0 0 0 0.2rem rgba(184, 134, 11, 0.15);
    }
  }
`;

const TopBarActions = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  color: #666;
  font-size: 1.2rem;
  cursor: pointer;
  position: relative;
  transition: color 0.2s ease;

  &:hover {
    color: #b8860b;
  }

  .badge {
    position: absolute;
    top: -5px;
    right: -5px;
    background-color: #ff4d4f;
    color: white;
    border-radius: 10px;
    padding: 2px 6px;
    font-size: 0.7rem;
  }
`;

const ContentArea = styled.div`
  padding: 2rem;
  flex: 1;
`;

const PageHeader = styled.div`
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;

  h4 {
    margin: 0;
    color: #333;
    font-weight: 600;
    font-size: 1.5rem;
  }

  p {
    margin: 0.5rem 0 0 0;
    color: #888;
    font-size: 0.9rem;
  }
`;

const ContentCard = styled(Card)`
  border: none;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 1.5rem;

  .card-header {
    background-color: white;
    border-bottom: 1px solid #f0f0f0;
    padding: 1rem 1.5rem;
    font-weight: 600;
    color: #333;
  }

  .card-body {
    padding: 1.5rem;
  }
`;

const FilterBar = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  align-items: center;
  flex-wrap: wrap;
`;

const FilterButton = styled(Button)`
  border: 1px solid #e0e0e0;
  background-color: ${props => props.active ? '#b8860b' : 'white'};
  color: ${props => props.active ? 'white' : '#666'};
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${props => props.active ? '#d4af37' : '#f8f8f8'};
    border-color: ${props => props.active ? '#d4af37' : '#b8860b'};
    color: ${props => props.active ? 'white' : '#b8860b'};
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;

  svg {
    font-size: 4rem;
    color: #ddd;
    margin-bottom: 1rem;
  }

  h5 {
    color: #999;
    font-weight: 500;
    margin-bottom: 0.5rem;
  }

  p {
    color: #bbb;
    font-size: 0.9rem;
  }
`;

// Product Card Component
const ProductCardWrapper = styled.div`
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
  }
`;

const ProductImage = styled.div`
  width: 100%;
  height: 200px;
  background-color: #f5f5f5;
  position: relative;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .badge-overlay {
    position: absolute;
    top: 10px;
    right: 10px;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
`;

const ProductInfo = styled.div`
  padding: 1rem;

  .product-name {
    font-size: 0.95rem;
    font-weight: 600;
    color: #333;
    margin-bottom: 0.5rem;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    min-height: 2.8rem;
  }

  .product-price {
    font-size: 1.1rem;
    font-weight: 700;
    color: #b8860b;
    margin-bottom: 0.75rem;
  }

  .product-stats {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 0.75rem;
    border-top: 1px solid #f0f0f0;
    font-size: 0.85rem;
    color: #666;

    .stat-item {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }
  }

  .product-actions {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.75rem;

    button {
      flex: 1;
      padding: 0.5rem;
      font-size: 0.85rem;
      border-radius: 4px;
      border: 1px solid #e0e0e0;
      background: white;
      color: #666;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.25rem;

      &:hover {
        background: #f8f8f8;
        border-color: #b8860b;
        color: #b8860b;
      }

      &.primary {
        background: #b8860b;
        color: white;
        border-color: #b8860b;

        &:hover {
          background: #d4af37;
          border-color: #d4af37;
        }
      }

      &.danger {
        &:hover {
          background: #fff5f5;
          border-color: #dc3545;
          color: #dc3545;
        }
      }
    }
  }
`;

// Helper function to get image URL
const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://via.placeholder.com/200?text=No+Image';

    // If imagePath is an object with url property
    if (typeof imagePath === 'object' && imagePath.url) {
        imagePath = imagePath.url;
    }

    // If imagePath is not a string, return placeholder
    if (typeof imagePath !== 'string') {
        return 'https://via.placeholder.com/200?text=No+Image';
    }

    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }
    return `http://localhost:9999${imagePath}`;
};

// Product Card Component
function ProductCard({ product, onRefresh, shopId, onAddInventory }) {
    const navigate = useNavigate();

    const handleView = () => {
        // Navigate to product statistics page for seller
        navigate(`/product-statistics/${product._id}`);
    };

    const handleEdit = () => {
        // Navigate to edit product page with product ID
        navigate(`/edit-product/${product._id}`);
    };

    const handleDelete = async () => {
        if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
            try {
                const response = await productService.deleteProduct(product._id, shopId);
                if (response.success) {
                    toast.success('Xóa sản phẩm thành công');
                    onRefresh();
                } else {
                    toast.error(response.message || 'Không thể xóa sản phẩm');
                }
            } catch (error) {
                console.error('Delete error:', error);
                toast.error(error.message || 'Không thể xóa sản phẩm');
            }
        }
    };

    const handleAddInventory = () => {
        if (onAddInventory) {
            onAddInventory(product);
        }
    };

    return (
        <ProductCardWrapper>
            <ProductImage onClick={handleView}>
                <img
                    src={getImageUrl(product.images?.[0] || product.image)}
                    alt={product.productName}
                    onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/200?text=No+Image';
                    }}
                />
                <div className="badge-overlay">
                    {(product.stock || product.quantity || product.totalQuantityAvailable || 0) === 0 && (
                        <Badge bg="danger">Hết hàng</Badge>
                    )}
                    {product.isActive === false && (
                        <Badge bg="secondary">Đã ẩn</Badge>
                    )}
                </div>
            </ProductImage>
            <ProductInfo>
                <div className="product-name">{product.productName || product.name}</div>
                <div className="product-price">
                    {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND'
                    }).format(product.sellingPrice || product.price || 0)}
                </div>
                <div className="product-stats">
                    <div className="stat-item">
                        <FaBox size={12} />
                        <span>Kho: {product.stock || product.quantity || product.totalQuantityAvailable || 0}</span>
                    </div>
                    <div className="stat-item">
                        <FaShoppingCart size={12} />
                        <span>Đã bán: {product.sold || 0}</span>
                    </div>
                </div>
                <div className="product-actions">
                    <button onClick={handleView}>
                        <FaEye /> Xem
                    </button>
                    <button onClick={handleEdit}>
                        <FaEdit /> Sửa
                    </button>
                    <button onClick={handleAddInventory} style={{ backgroundColor: 'white' }}>
                        <FaBoxOpen /> Nhập hàng
                    </button>
                    <button className="danger" onClick={handleDelete}>
                        <FaTrash /> Xóa
                    </button>
                </div>
            </ProductInfo>
        </ProductCardWrapper>
    );
}

function SellerDashboard() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [shopData, setShopData] = useState(null);
    const [activeMenu, setActiveMenu] = useState('all-orders');
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedMenus, setExpandedMenus] = useState({
        orderManagement: true,
        productManagement: false,
        marketing: false,
        finance: false,
        customerCare: false,
        settings: false
    });

    const [sellerData, setSellerData] = useState({
        shopName: 'Loading...',
        email: '',
        phone: '',
        status: 'active',
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0
    });

    const [products, setProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [productFilter, setProductFilter] = useState('all'); // all, active, inactive, out-of-stock
    const [productSearchQuery, setProductSearchQuery] = useState('');
    const [showAddInventoryModal, setShowAddInventoryModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);



    // Load user and shop data
    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                const user = authService.getCurrentUser();
                if (!user) {
                    toast.error('Vui lòng đăng nhập');
                    navigate('/login');
                    return;
                }
                setCurrentUser(user);

                // Get shop data
                const shopResponse = await shopService.checkUserShop(user._id);

                if (!shopResponse.success || !shopResponse.data) {
                    toast.warning('Bạn chưa đăng ký shop. Chuyển đến trang đăng ký...');
                    setTimeout(() => navigate('/seller-registration'), 1500);
                    return;
                }

                setShopData(shopResponse.data);
                setSellerData({
                    shopName: shopResponse.data.shopName,
                    email: user.email,
                    phone: user.phoneNumber,
                    status: shopResponse.data.isActive ? 'active' : 'inactive',
                    totalProducts: shopResponse.data.statistics?.totalProducts || 0,
                    totalOrders: shopResponse.data.statistics?.totalOrders || 0,
                    totalRevenue: 0, // Will be calculated from orders
                    pendingOrders: 0 // Will be calculated from orders
                });

                setLoading(false);
            } catch (error) {
                console.error('Error loading dashboard:', error);
                toast.error('Không thể tải dữ liệu dashboard');
                setLoading(false);
            }
        };

        loadDashboardData();
    }, [navigate]);

    // Load products when activeMenu changes to 'all-products'
    useEffect(() => {
        if (activeMenu === 'all-products' && shopData) {
            loadProducts();
        }
    }, [activeMenu, shopData]);

    const loadProducts = async () => {
        if (!shopData) return;

        setLoadingProducts(true);
        try {
            const response = await axios.get(`http://localhost:9999/products?shopId=${shopData._id}`);
            console.log('Products response:', response.data);
            if (response.data.success) {
                const products = response.data.data.products || [];
                console.log('First product:', products[0]);
                setProducts(products);
            }
        } catch (error) {
            console.error('Error loading products:', error);
            toast.error('Không thể tải danh sách sản phẩm');
        } finally {
            setLoadingProducts(false);
        }
    };

    const toggleMenu = (menuKey) => {
        setExpandedMenus(prev => ({
            ...prev,
            [menuKey]: !prev[menuKey]
        }));
    };

    const handleMenuClick = (menuId) => {
        setActiveMenu(menuId);
    };

    const handleAddInventory = (product) => {
        setSelectedProduct(product);
        setShowAddInventoryModal(true);
    };

    const handleInventorySuccess = (data) => {
        toast.success(`Đã nhập ${data.newBatch.quantity} sản phẩm vào kho`);
        loadProducts(); // Reload products to show updated stock
    };

    const orderTabs = [
        { id: 'all', label: 'Tất cả', count: 0 },
        { id: 'new', label: 'Chờ xác nhận', count: 0 },
        { id: 'pickup', label: 'Chờ lấy hàng', count: 0 },
        { id: 'shipping', label: 'Đang giao', count: 0 },
        { id: 'delivered', label: 'Đã giao', count: 0 },
        { id: 'cancelled', label: 'Đã hủy', count: 0 },
        { id: 'return', label: 'Trả hàng/Hoàn tiền', count: 0 }
    ];

    // Loading state
    if (loading) {
        return (
            <DashboardWrapper>
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    width: '100%',
                    flexDirection: 'column',
                    gap: '1rem'
                }}>
                    <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p style={{ color: '#666', fontSize: '1rem' }}>Đang tải dữ liệu...</p>
                </div>
            </DashboardWrapper>
        );
    }

    return (
        <DashboardWrapper>
            {/* Sidebar */}
            <Sidebar>
                <SidebarHeader>
                    <h5>🏺 {sellerData.shopName}</h5>
                    <p>{sellerData.email}</p>
                </SidebarHeader>

                {/* Quản Lý Đơn Hàng */}
                <MenuSection>
                    <MenuItem onClick={() => toggleMenu('orderManagement')}>
                        <FaShoppingCart />
                        <span style={{ flex: 1 }}>Quản Lý Đơn Hàng</span>
                        {expandedMenus.orderManagement ? <FaChevronDown /> : <FaChevronRight />}
                    </MenuItem>
                    {expandedMenus.orderManagement && (
                        <>
                            <SubMenuItem
                                active={activeMenu === 'all-orders'}
                                onClick={() => handleMenuClick('all-orders')}
                            >
                                <span>Tất cả</span>
                            </SubMenuItem>
                            <SubMenuItem
                                active={activeMenu === 'cancelled-orders'}
                                onClick={() => handleMenuClick('cancelled-orders')}
                            >
                                <span>Đơn hủy</span>
                            </SubMenuItem>
                            <SubMenuItem
                                active={activeMenu === 'return-refund'}
                                onClick={() => handleMenuClick('return-refund')}
                            >
                                <span>Trả hàng/Hoàn tiền</span>
                            </SubMenuItem>
                        </>
                    )}
                </MenuSection>

                {/* Quản Lý Sản Phẩm */}
                <MenuSection>
                    <MenuItem onClick={() => toggleMenu('productManagement')}>
                        <FaBox />
                        <span style={{ flex: 1 }}>Quản Lý Sản Phẩm</span>
                        {expandedMenus.productManagement ? <FaChevronDown /> : <FaChevronRight />}
                    </MenuItem>
                    {expandedMenus.productManagement && (
                        <>
                            <SubMenuItem
                                active={activeMenu === 'all-products'}
                                onClick={() => handleMenuClick('all-products')}
                            >
                                <span>Tất Cả Sản Phẩm</span>
                            </SubMenuItem>
                            <SubMenuItem
                                active={activeMenu === 'add-product'}
                                onClick={() => navigate('/add-product')}
                            >
                                <span>Thêm Sản Phẩm</span>
                            </SubMenuItem>
                        </>
                    )}
                </MenuSection>

                {/* Kênh Marketing */}
                <MenuSection>
                    <MenuItem onClick={() => toggleMenu('marketing')}>
                        <FaBullhorn />
                        <span style={{ flex: 1 }}>Kênh Marketing</span>
                        {expandedMenus.marketing ? <FaChevronDown /> : <FaChevronRight />}
                    </MenuItem>
                </MenuSection>

                {/* Tài Chính */}
                <MenuSection>
                    <MenuItem onClick={() => toggleMenu('finance')}>
                        <FaMoneyBillWave />
                        <span style={{ flex: 1 }}>Tài Chính</span>
                        {expandedMenus.finance ? <FaChevronDown /> : <FaChevronRight />}
                    </MenuItem>
                    {expandedMenus.finance && (
                        <>
                            <SubMenuItem
                                active={activeMenu === 'revenue'}
                                onClick={() => handleMenuClick('revenue')}
                            >
                                <span>Doanh Thu</span>
                            </SubMenuItem>

                        </>
                    )}
                </MenuSection>

                {/* Dữ Liệu */}
                <MenuSection>
                    <MenuItem
                        active={activeMenu === 'analytics'}
                        onClick={() => handleMenuClick('analytics')}
                    >
                        <FaChartLine />
                        <span>Dữ Liệu</span>
                    </MenuItem>
                </MenuSection>

                {/* Chăm Sóc Khách Hàng */}
                <MenuSection>
                    <MenuItem onClick={() => toggleMenu('customerCare')}>
                        <FaComments />
                        <span style={{ flex: 1 }}>Chăm Sóc Khách Hàng</span>
                        {expandedMenus.customerCare ? <FaChevronDown /> : <FaChevronRight />}
                    </MenuItem>
                </MenuSection>

                {/* Cài Đặt */}
                <MenuSection>
                    <MenuItem onClick={() => toggleMenu('settings')}>
                        <FaCog />
                        <span style={{ flex: 1 }}>Cài Đặt Shop</span>
                        {expandedMenus.settings ? <FaChevronDown /> : <FaChevronRight />}
                    </MenuItem>
                </MenuSection>
            </Sidebar>

            {/* Main Content */}
            <MainContent>
                {/* Top Bar */}
                <TopBar>
                    <SearchBar>
                        <Form.Control
                            type="text"
                            placeholder="Tìm kiếm đơn hàng, sản phẩm..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <InputGroup.Text style={{ background: 'white', border: '1px solid #e0e0e0', borderLeft: 'none' }}>
                            <FaSearch style={{ color: '#999' }} />
                        </InputGroup.Text>
                    </SearchBar>

                    <TopBarActions>
                        <IconButton>
                            <FaBell />
                            <span className="badge">3</span>
                        </IconButton>
                        <IconButton>
                            <FaQuestionCircle />
                        </IconButton>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '20px',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            <div style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #b8860b 0%, #d4af37 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: '1rem',
                                boxShadow: '0 2px 8px rgba(184, 134, 11, 0.3)'
                            }}>
                                {currentUser?.fullName?.charAt(0)?.toUpperCase() || 'A'}
                            </div>
                            <span style={{
                                fontSize: '0.9rem',
                                color: '#333',
                                fontWeight: '500'
                            }}>
                                {currentUser?.fullName || 'Admin'}
                            </span>
                        </div>
                    </TopBarActions>
                </TopBar>

                {/* Content Area */}
                <ContentArea>
                    {activeMenu === 'all-products' ? (
                        // Products Management View
                        <>
                            <PageHeader>
                                <div>
                                    <h4>Tất cả sản phẩm</h4>
                                    <p>Quản lý và theo dõi tất cả sản phẩm của shop</p>
                                </div>
                                <Button
                                    style={{
                                        backgroundColor: '#b8860b',
                                        border: 'none',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}
                                    onClick={() => navigate('/add-product')}
                                >
                                    <FaPlus /> Thêm sản phẩm mới
                                </Button>
                            </PageHeader>

                            {/* Product Filter Bar */}
                            <FilterBar>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', flex: 1 }}>
                                    <FilterButton
                                        active={productFilter === 'all'}
                                        onClick={() => setProductFilter('all')}
                                    >
                                        Tất cả ({products.length})
                                    </FilterButton>
                                    <FilterButton
                                        active={productFilter === 'active'}
                                        onClick={() => setProductFilter('active')}
                                    >
                                        Đang hoạt động
                                    </FilterButton>
                                    <FilterButton
                                        active={productFilter === 'inactive'}
                                        onClick={() => setProductFilter('inactive')}
                                    >
                                        Đã ẩn
                                    </FilterButton>
                                    <FilterButton
                                        active={productFilter === 'out-of-stock'}
                                        onClick={() => setProductFilter('out-of-stock')}
                                    >
                                        Hết hàng
                                    </FilterButton>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <InputGroup size="sm" style={{ width: '300px' }}>
                                        <Form.Control
                                            placeholder="Tìm kiếm theo tên sản phẩm..."
                                            value={productSearchQuery}
                                            onChange={(e) => setProductSearchQuery(e.target.value)}
                                            style={{ fontSize: '0.9rem' }}
                                        />
                                        <InputGroup.Text style={{ background: 'white', border: '1px solid #e0e0e0', borderLeft: 'none' }}>
                                            <FaSearch style={{ color: '#999' }} />
                                        </InputGroup.Text>
                                    </InputGroup>
                                    <Button
                                        variant="outline-secondary"
                                        size="sm"
                                        style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                    >
                                        <FaFilter /> Lọc
                                    </Button>
                                    <Button
                                        variant="outline-secondary"
                                        size="sm"
                                        style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                    >
                                        <FaDownload /> Xuất
                                    </Button>
                                </div>
                            </FilterBar>

                            {/* Products Grid/Table */}
                            <ContentCard>
                                <Card.Body style={{ padding: '1.5rem' }}>
                                    {loadingProducts ? (
                                        <div style={{ textAlign: 'center', padding: '3rem' }}>
                                            <Spinner animation="border" variant="warning" />
                                            <p style={{ marginTop: '1rem', color: '#999' }}>Đang tải sản phẩm...</p>
                                        </div>
                                    ) : products.length === 0 ? (
                                        <EmptyState>
                                            <FaBox />
                                            <h5>Chưa có sản phẩm nào</h5>
                                            <p>Hãy thêm sản phẩm đầu tiên để bắt đầu bán hàng</p>
                                            <Button
                                                style={{
                                                    backgroundColor: '#b8860b',
                                                    border: 'none',
                                                    marginTop: '1rem'
                                                }}
                                                onClick={() => navigate('/add-product')}
                                            >
                                                <FaPlus style={{ marginRight: '0.5rem' }} />
                                                Thêm sản phẩm ngay
                                            </Button>
                                        </EmptyState>
                                    ) : (
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                                            gap: '1.5rem'
                                        }}>
                                            {products
                                                .filter(product => {
                                                    if (productSearchQuery) {
                                                        return product.productName?.toLowerCase().includes(productSearchQuery.toLowerCase());
                                                    }
                                                    return true;
                                                })
                                                .map(product => (
                                                    <ProductCard
                                                        key={product._id}
                                                        product={product}
                                                        onRefresh={loadProducts}
                                                        shopId={shopData?._id}
                                                        onAddInventory={handleAddInventory}
                                                    />
                                                ))}
                                        </div>
                                    )}
                                </Card.Body>
                            </ContentCard>
                        </>
                    ) : activeMenu === 'revenue' ? (
                        // Revenue Management View
                        <>
                            <Revenue shopId={shopData?._id} />
                        </>
                    ) : activeMenu === 'analytics' ? (
                        // Analytics View
                        <>
                            <Analytics shopId={shopData?._id} />
                        </>
                    ) : (
                        // Orders Management View - NEW
                        <>
                            <PageHeader>
                                <h4>Quản lý đơn hàng</h4>
                                <p>Quản lý và theo dõi tất cả đơn hàng của shop</p>
                            </PageHeader>

                            <OrderManagement shopId={shopData?._id} />
                        </>
                    )}
                </ContentArea>
            </MainContent>

            {/* Add Inventory Modal */}
            <AddInventoryModal
                show={showAddInventoryModal}
                onHide={() => setShowAddInventoryModal(false)}
                product={selectedProduct}
                onSuccess={handleInventorySuccess}
            />
        </DashboardWrapper>
    );
}

export default SellerDashboard;
