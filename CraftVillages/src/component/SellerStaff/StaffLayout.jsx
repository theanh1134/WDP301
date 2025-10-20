import { Layout, Button } from "antd";
import { Outlet } from "react-router-dom";
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { useState } from 'react';
import './StaffLayout.scss'
import StaffSidebar from "./StaffSidebar";

const { Content, Header } = Layout;

const StaffLayout = () => {
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <Layout className="admin-layout">
      <StaffSidebar collapsed={collapsed} />

      <Layout>
        <Header className='admin-header'>
          <Button
            type="text"
            className="trigger-button"
            onClick={toggleSidebar}
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          />
          <span>Staff Seller Management</span>
        </Header>
        
        <Content className="admin-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default StaffLayout;
