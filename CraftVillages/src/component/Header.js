import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { FaUser, FaSearch, FaShoppingCart } from 'react-icons/fa';
import styled from 'styled-components';
import 'bootstrap/dist/css/bootstrap.min.css';

// Styled components
const LogoContainer = styled.div`
  display: flex;
  align-items: center;
`;

const LogoIcon = styled.span`
  color: #FFD700; /* Màu vàng cho biểu tượng */
  font-weight: bold;
  font-size: 1.5rem;
  margin-right: 5px;
  transform: rotate(90deg);
`;

const LogoText = styled.span`
  font-weight: bold;
  font-size: 1.5rem;
  color: #000;
`;

const NavIcon = styled(Button)`
  color: #212529;
  font-size: 1.2rem;
  margin: 0 10px;
  padding: 5px;
  background: none;
  border: none;
  
  &:hover, &:focus {
    color: #FFD700;
    background: none;
    box-shadow: none;
  }
`;

const StyledNavLink = styled(Nav.Link)`
  color: #212529;
  font-weight: 500;
  margin: 0 15px;
  
  &:hover {
    color: #FFD700;
  }
`;

function Header() {
  // Nếu không muốn sử dụng styled-components, có thể dùng inline styles như dưới đây
  const styles = {
    navbar: {
      boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
      padding: '15px 0'
    },
    navContainer: {
      maxWidth: '1200px'
    },
    navLinks: {
      margin: '0 auto'
    },
    iconGroup: {
      display: 'flex',
      alignItems: 'center'
    }
  };

  return (
    <Navbar bg="white" expand="lg" style={styles.navbar} className="border-bottom">
      <Container style={styles.navContainer}>
        {/* Logo */}
        <Navbar.Brand href="#home" className="me-5">
          <LogoContainer>
            <LogoIcon>⟨⟨</LogoIcon>
            <LogoText>TVCMS</LogoText>
          </LogoContainer>
        </Navbar.Brand>
        
        {/* Navigation Links */}
        <Nav style={styles.navLinks}>
          <StyledNavLink href="#trang-chu">Trang chủ</StyledNavLink>
          <StyledNavLink href="#cua-hang">Cửa hàng</StyledNavLink>
          <StyledNavLink href="#thong-tin">Thông tin</StyledNavLink>
          <StyledNavLink href="#lien-he">Liên hệ</StyledNavLink>
        </Nav>
        
        {/* Icons on right */}
        <div style={styles.iconGroup}>
          <NavIcon>
            <FaUser />
          </NavIcon>
          <NavIcon>
            <FaSearch />
          </NavIcon>
          <NavIcon>
            <FaShoppingCart />
          </NavIcon>
        </div>
      </Container>
    </Navbar>
  );
}

export default Header;