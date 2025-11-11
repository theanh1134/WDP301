import React, { useState } from 'react';
import styled from 'styled-components';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    FaHome, FaMoneyBillWave, FaStore, FaShoppingCart, FaUsers,
    FaChartLine, FaCog, FaBell, FaSearch, FaSignOutAlt,
    FaUserCircle, FaChevronDown, FaPercentage, FaFileInvoice,
    FaBoxOpen, FaUndo, FaTags, FaStar, FaBalanceScale
} from 'react-icons/fa';
import { Dropdown } from 'react-bootstrap';
import authService from '../../services/authService';

const LayoutWrapper = styled.div`
    display: flex;
    min-height: 100vh;
    background-color: #f8f9fa;
`;

const Sidebar = styled.div`
    width: 260px;
    background: linear-gradient(180deg, #2c3e50 0%, #34495e 100%);
    position: fixed;
    height: 100vh;
    overflow-y: auto;
    z-index: 1000;
    box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);

    &::-webkit-scrollbar {
        width: 6px;
    }

    &::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.1);
    }

    &::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.3);
        border-radius: 3px;
    }
`;

const SidebarHeader = styled.div`
    padding: 1.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    
    h4 {
        color: white;
        margin: 0;
        font-size: 1.25rem;
        font-weight: 700;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    p {
        color: rgba(255, 255, 255, 0.7);
        margin: 0.5rem 0 0 0;
        font-size: 0.875rem;
    }
`;

const MenuSection = styled.div`
    padding: 1rem 0;
`;

const MenuLabel = styled.div`
    padding: 0.5rem 1.5rem;
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const MenuItem = styled.div`
    padding: 0.875rem 1.5rem;
    display: flex;
    align-items: center;
    cursor: pointer;
    transition: all 0.2s ease;
    color: ${props => props.active ? 'white' : 'rgba(255, 255, 255, 0.8)'};
    background-color: ${props => props.active ? 'rgba(255, 255, 255, 0.1)' : 'transparent'};
    border-left: 3px solid ${props => props.active ? '#3498db' : 'transparent'};
    
    &:hover {
        background-color: rgba(255, 255, 255, 0.1);
        color: white;
    }
    
    svg {
        margin-right: 0.875rem;
        font-size: 1.125rem;
        min-width: 20px;
    }
    
    span {
        font-size: 0.9375rem;
        font-weight: ${props => props.active ? '600' : '400'};
    }
`;

const MainContent = styled.div`
    flex: 1;
    margin-left: 260px;
    display: flex;
    flex-direction: column;
`;

const TopBar = styled.div`
    background: white;
    padding: 1rem 2rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0;
    z-index: 999;
`;

const SearchBar = styled.div`
    flex: 1;
    max-width: 500px;
    position: relative;
    
    input {
        width: 100%;
        padding: 0.625rem 1rem 0.625rem 2.75rem;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        font-size: 0.9375rem;
        transition: all 0.2s ease;
        
        &:focus {
            outline: none;
            border-color: #3498db;
            box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
        }
    }
    
    svg {
        position: absolute;
        left: 1rem;
        top: 50%;
        transform: translateY(-50%);
        color: #95a5a6;
        font-size: 1rem;
    }
`;

const TopBarActions = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
`;

const IconButton = styled.button`
    width: 40px;
    height: 40px;
    border-radius: 8px;
    border: none;
    background: #f8f9fa;
    color: #7f8c8d;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
    
    &:hover {
        background: #e9ecef;
        color: #2c3e50;
    }
`;

const NotificationBadge = styled.span`
    position: absolute;
    top: -4px;
    right: -4px;
    background: #e74c3c;
    color: white;
    font-size: 0.625rem;
    font-weight: 600;
    padding: 0.125rem 0.375rem;
    border-radius: 10px;
    min-width: 18px;
    text-align: center;
`;

const UserMenu = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
        background: #f8f9fa;
    }
    
    .user-avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 1.125rem;
    }
    
    .user-info {
        display: flex;
        flex-direction: column;
        
        .user-name {
            font-size: 0.9375rem;
            font-weight: 600;
            color: #2c3e50;
        }
        
        .user-role {
            font-size: 0.75rem;
            color: #7f8c8d;
        }
    }
`;

const ContentArea = styled.div`
    padding: 2rem;
    flex: 1;
`;

const AdminLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchQuery, setSearchQuery] = useState('');
    const currentUser = authService.getCurrentUser();

    const menuItems = [
        {
            section: 'TỔNG QUAN',
            items: [
                { icon: FaHome, label: 'Dashboard', path: '/admin-dashboard' },
            ]
        },
        {
            section: 'DOANH THU',
            items: [
                { icon: FaMoneyBillWave, label: 'Tổng Quan Doanh Thu', path: '/admin-dashboard/revenue' },
                { icon: FaPercentage, label: 'Phân Tích Hoa Hồng', path: '/admin-dashboard/commission' },

            ]
        },
        {
            section: 'QUẢN LÝ',
            items: [
                { icon: FaStore, label: 'Quản Lý Sellers', path: '/admin-dashboard/sellers' },
                { icon: FaBalanceScale, label: 'Quản Lý Hoa Hồng', path: '/admin-dashboard/commission-management' },
            ]
        },
        {
            section: 'PHÂN TÍCH',
            items: [
                { icon: FaUsers, label: 'Phân Tích Khách Hàng', path: '/admin-dashboard/customer-analytics' },
            ]
        },

        {
            section: 'HỆ THỐNG',
            items: [
                { icon: FaFileInvoice, label: 'Báo Cáo', path: '/admin-dashboard/reports' },
                { icon: FaCog, label: 'Cài Đặt', path: '/admin-dashboard/settings' },
            ]
        }
    ];

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    const isActive = (path) => {
        return location.pathname === path;
    };

    return (
        <LayoutWrapper>
            <Sidebar>
                <SidebarHeader>
                    <h4>
                        <FaChartLine />
                        Admin Business
                    </h4>
                    <p>Quản lý & Phân tích</p>
                </SidebarHeader>

                {menuItems.map((section, idx) => (
                    <MenuSection key={idx}>
                        <MenuLabel>{section.section}</MenuLabel>
                        {section.items.map((item, itemIdx) => (
                            <MenuItem
                                key={itemIdx}
                                active={isActive(item.path)}
                                onClick={() => navigate(item.path)}
                            >
                                <item.icon />
                                <span>{item.label}</span>
                            </MenuItem>
                        ))}
                    </MenuSection>
                ))}
            </Sidebar>

            <MainContent>
                <TopBar>
                    <SearchBar>
                        <FaSearch />
                        <input
                            type="text"
                            placeholder="Tìm kiếm..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </SearchBar>

                    <TopBarActions>
                        <IconButton>
                            <FaBell />
                            <NotificationBadge>5</NotificationBadge>
                        </IconButton>

                        <Dropdown align="end">
                            <Dropdown.Toggle as={UserMenu} id="user-dropdown">
                                <div className="user-avatar">
                                    <FaUserCircle />
                                </div>
                                <div className="user-info">
                                    <div className="user-name">{currentUser?.fullName || 'Admin'}</div>
                                    <div className="user-role">Admin Business</div>
                                </div>
                                <FaChevronDown style={{ fontSize: '0.75rem', color: '#7f8c8d' }} />
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                                <Dropdown.Item onClick={() => navigate('/admin-dashboard/profile')}>
                                    <FaUserCircle style={{ marginRight: '0.5rem' }} />
                                    Hồ Sơ
                                </Dropdown.Item>
                                <Dropdown.Item onClick={() => navigate('/admin-dashboard/settings')}>
                                    <FaCog style={{ marginRight: '0.5rem' }} />
                                    Cài Đặt
                                </Dropdown.Item>
                                <Dropdown.Divider />
                                <Dropdown.Item onClick={handleLogout}>
                                    <FaSignOutAlt style={{ marginRight: '0.5rem' }} />
                                    Đăng Xuất
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </TopBarActions>
                </TopBar>

                <ContentArea>
                    <Outlet />
                </ContentArea>
            </MainContent>
        </LayoutWrapper>
    );
};

export default AdminLayout;

