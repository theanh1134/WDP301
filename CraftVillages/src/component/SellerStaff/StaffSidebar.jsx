import { Layout, Menu } from "antd";
import {
  DashboardOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import "./StaffSidebar.scss";
import { Navbar } from "react-bootstrap";
import styled, { keyframes } from "styled-components";

const { Sider } = Layout;


const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }
`;

const LogoIcon = styled.span`
  color: #b8860b;
  font-weight: bold;
  font-size: 1.8rem;
  margin-right: 8px;
  transition: all 0.3s ease;

  &:hover {
    color: #d4af37;
  }
`;

const LogoText = styled.span`
  font-weight: 700;
  font-size: 1.6rem;
  color: #333;
  background: linear-gradient(135deg, #b8860b 0%, #d4af37 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const StaffSidebar = ({ collapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { key: "/staff-seller", icon: <UserOutlined />, label: "Users" },
    { key: "/staff-seller/products", icon: <DashboardOutlined />, label: "Products" },
    { key: "/logout", icon: <LogoutOutlined />, label: "Logout" },
  ];

  return (
    <Sider
      collapsed={collapsed}
      className="admin-sider"
    >
      <Navbar.Brand href="/" className="me-4">
        <LogoContainer className="admin-logo">
          <LogoIcon>🏺</LogoIcon>
          <LogoText  className={collapsed ? "hide" : ""}>TVCMS</LogoText>
        </LogoContainer>
      </Navbar.Brand>

      <Menu
        theme="light"
        mode="inline"
        selectedKeys={[
          location.pathname === '/admin' 
            ? '/admin' 
            : `/${location.pathname.split('/')[1]}/${location.pathname.split('/')[2]}`
        ]}
        items={menuItems}
        onClick={(item) => navigate(item.key)}
      />
    </Sider>
  );
};

export default StaffSidebar;
