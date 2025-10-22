// src/components/layout/Sidebar.js
import React from "react";
import styled from "styled-components";
import {
  FaBox, FaShoppingCart, FaBullhorn, FaChartLine,
  FaMoneyBillWave, FaComments, FaCog, FaChevronDown, FaChevronRight
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const SidebarWrapper = styled.div`
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
  h5 { margin: 0; font-size: 1rem; color: #333; font-weight: 600; }
  p { margin: 0.25rem 0 0; font-size: 0.85rem; color: #888; }
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
  color: ${props => props.active ? "#b8860b" : "#555"};
  background-color: ${props => props.active ? "#fff8e6" : "transparent"};
  border-left: 3px solid ${props => props.active ? "#b8860b" : "transparent"};
  &:hover {
    background-color: #f8f8f8;
    color: #b8860b;
  }
  svg { margin-right: 0.75rem; font-size: 1rem; }
  span { font-size: 0.9rem; font-weight: ${props => props.active ? "600" : "400"}; }
`;

const SubMenuItem = styled(MenuItem)`
  padding-left: 2.5rem;
  font-size: 0.85rem;
`;

const Sidebar = ({
  sellerData,
  expandedMenus,
  toggleMenu,
  activeMenu,
  handleMenuClick,
  navigate
}) => {
    // const navigate = useNavigate();

  return (
    <SidebarWrapper>
      <SidebarHeader>
        <h5>🏺 {sellerData.shopName}</h5>
        <p>{sellerData.email}</p>
      </SidebarHeader>

      {/* Quản Lý Đơn Hàng */}
      <MenuSection>
        <MenuItem onClick={() => toggleMenu("orderManagement")}>
          <FaShoppingCart />
          <span style={{ flex: 1 }}>Quản Lý Cửa Hàng</span>
          {expandedMenus.orderManagement ? <FaChevronDown /> : <FaChevronRight />}
        </MenuItem>
        {expandedMenus.orderManagement && (
          <>
            <SubMenuItem
              onClick={() => navigate('/staff-seller')}
            >
              <span>Tất Cả Cửa Hàng</span>
            </SubMenuItem>
            {/* <SubMenuItem
            >
              <span>Duyệt cửa hàng</span>
            </SubMenuItem> */}
          </>
        )}
      </MenuSection>

      {/* Quản Lý Sản Phẩm */}
      <MenuSection>
        <MenuItem onClick={() => toggleMenu("productManagement")}>
          <FaBox />
          <span style={{ flex: 1 }}>Quản Lý Hoàn Hàng</span>
          {expandedMenus.productManagement ? <FaChevronDown /> : <FaChevronRight />}
        </MenuItem>
        {expandedMenus.productManagement && (
          <>
            <SubMenuItem>
              <span>Tất Cả Sản Phẩm</span>
            </SubMenuItem>
          </>
        )}
      </MenuSection>




    </SidebarWrapper>
  );
};

export default Sidebar;
