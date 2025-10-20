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

const { Sider } = Layout;

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
      <div className="admin-logo">{collapsed ? "SS" : "Staff Seller"}</div>

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
