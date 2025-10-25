// src/components/layout/DashboardLayout.js
import React, { useState } from "react";
import styled from "styled-components";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./Siderbar";
import Header from "./Header";

const DashboardWrapper = styled.div`
  display: flex;
`;

const MainContent = styled.div`
  flex: 1;
  margin-left: 220px;
  display: flex;
  flex-direction: column;
`;

const ContentArea = styled.div`
  padding: 2rem;
  background-color: #f9f9f9;
  min-height: calc(100vh - 80px);
`;

const DashboardLayout = () => {
  const navigate = useNavigate();
  const [expandedMenus, setExpandedMenus] = useState({});
  const [activeMenu, setActiveMenu] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const sellerData = {
    shopName: "Tech Store",
    email: "techstore@example.com",
  };

  const currentUser = { fullName: "Nguyễn Văn A" };

  const toggleMenu = (menu) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }));
  };

  const handleMenuClick = (menu, path) => {
    setActiveMenu(menu);
    if (path) navigate(path);
  };

  return (
    <DashboardWrapper>
      <Sidebar
        sellerData={sellerData}
        expandedMenus={expandedMenus}
        toggleMenu={toggleMenu}
        activeMenu={activeMenu}
        handleMenuClick={handleMenuClick}
        navigate={navigate}
      />

      <MainContent>
        <Header
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          currentUser={currentUser}
        />
        <ContentArea>
          {/* Đây là nơi các trang con được render */}
          <Outlet />
        </ContentArea>
      </MainContent>
    </DashboardWrapper>
  );
};

export default DashboardLayout;
