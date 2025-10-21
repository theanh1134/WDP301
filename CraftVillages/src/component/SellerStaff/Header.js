// src/components/layout/Header.js
import React from "react";
import styled from "styled-components";
import { Form, InputGroup } from "react-bootstrap";
import { FaSearch, FaBell, FaQuestionCircle } from "react-icons/fa";

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
  &:hover { color: #b8860b; }
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

const Header = ({ searchQuery, setSearchQuery, currentUser }) => {
  return (
    <TopBar>
      <SearchBar>
        <Form.Control
          type="text"
          placeholder="Tìm kiếm đơn hàng, sản phẩm..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <InputGroup.Text
          style={{ background: "white", border: "1px solid #e0e0e0", borderLeft: "none" }}
        >
          <FaSearch style={{ color: "#999" }} />
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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            padding: "0.25rem 0.5rem",
            borderRadius: "20px",
            cursor: "pointer",
            transition: "background-color 0.2s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f5f5f5")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #b8860b 0%, #d4af37 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: "bold",
              fontSize: "1rem",
              boxShadow: "0 2px 8px rgba(184, 134, 11, 0.3)",
            }}
          >
            {currentUser?.fullName?.charAt(0)?.toUpperCase() || "A"}
          </div>
          <span style={{ fontSize: "0.9rem", color: "#333", fontWeight: "500" }}>
            {currentUser?.fullName || "Admin"}
          </span>
        </div>
      </TopBarActions>
    </TopBar>
  );
};

export default Header;
