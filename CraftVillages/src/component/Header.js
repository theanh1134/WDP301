import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, Button, Badge, Dropdown, Image } from 'react-bootstrap';
import { FaUser, FaSearch, FaShoppingCart, FaBars } from 'react-icons/fa';
import styled, { keyframes } from 'styled-components';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useCart } from '../contexts/CartContext';
import authService from '../services/authService';

// Keyframes for animations
const slideDown = keyframes`
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const bounce = keyframes`
  0%, 20%, 60%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  80% {
    transform: translateY(-5px);
  }
`;

const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(184, 134, 11, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(184, 134, 11, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(184, 134, 11, 0);
  }
`;

// Enhanced Styled components
const StyledNavbar = styled(Navbar)`
  background: ${props => props.scrolled ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 1)'} !important;
  backdrop-filter: ${props => props.scrolled ? 'blur(10px)' : 'none'};
  box-shadow: ${props => props.scrolled ? '0 8px 32px rgba(0, 0, 0, 0.1)' : '0 2px 5px rgba(0,0,0,0.05)'};
  padding: ${props => props.scrolled ? '8px 0' : '15px 0'};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  animation: ${slideDown} 0.6s ease-out;
`;

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
    animation: ${bounce} 1s ease-in-out;
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

const NavIcon = styled(Button)`
  color: #555;
  font-size: 1.3rem;
  margin: 0 8px;
  padding: 10px;
  background: none;
  border: none;
  border-radius: 50%;
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover, &:focus {
    color: #b8860b;
    background: rgba(184, 134, 11, 0.1);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(184, 134, 11, 0.2);
  }

  &:active {
    transform: translateY(0);
  }
`;

const CartIcon = styled(NavIcon)`
  &:hover {
    animation: ${pulse} 2s infinite;
  }
`;

const StyledNavLink = styled(Nav.Link)`
  color: #555 !important;
  font-weight: 500;
  margin: 0 20px;
  padding: 8px 0 !important;
  position: relative;
  text-decoration: none;
  transition: all 0.3s ease;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    width: 0;
    height: 2px;
    background: linear-gradient(135deg, #b8860b 0%, #d4af37 100%);
    transition: all 0.3s ease;
    transform: translateX(-50%);
  }

  &:hover {
    color: #b8860b !important;
    transform: translateY(-1px);

    &::after {
      width: 100%;
    }
  }

  &.active {
    color: #b8860b !important;

    &::after {
      width: 100%;
    }
  }
`;

const SearchBar = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  background: rgba(248, 249, 250, 0.8);
  border-radius: 25px;
  padding: 8px 16px;
  margin: 0 20px;
  transition: all 0.3s ease;
  border: 1px solid transparent;

  &:focus-within {
    background: white;
    border-color: #b8860b;
    box-shadow: 0 0 0 3px rgba(184, 134, 11, 0.1);
  }

  input {
    border: none;
    background: none;
    outline: none;
    padding: 4px 8px;
    font-size: 0.9rem;
    width: 200px;

    &::placeholder {
      color: #999;
    }
  }

  .search-icon {
    color: #999;
    margin-right: 8px;
  }
`;

const CartBadge = styled(Badge)`
  position: absolute;
  top: -5px;
  right: -5px;
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  border: 2px solid white;
  font-size: 0.7rem;
  min-width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

function Header() {
  const [scrolled, setScrolled] = useState(false);
  const { cart, getCartItemsCount } = useCart();
  const [currentUser, setCurrentUser] = useState(null);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Load current user from localStorage/authService
  useEffect(() => {
    const user = authService.getCurrentUser?.() || null;
    setCurrentUser(user);
    const onStorage = () => setCurrentUser(authService.getCurrentUser?.() || null);
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const styles = {
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
    <>
      {/* Add padding to body to compensate for fixed header */}
      <div style={{ paddingTop: scrolled ? '70px' : '85px' }}>
        <StyledNavbar expand="lg" scrolled={scrolled.toString()} className="border-bottom">
          <Container style={styles.navContainer}>
            {/* Logo */}
            <Navbar.Brand href="/" className="me-4">
              <LogoContainer>
                <LogoIcon>🏺</LogoIcon>
                <LogoText>TVCMS</LogoText>
              </LogoContainer>
            </Navbar.Brand>

            {/* Mobile Toggle */}
            <Navbar.Toggle aria-controls="basic-navbar-nav">
              <FaBars />
            </Navbar.Toggle>

            <Navbar.Collapse id="basic-navbar-nav">
              {/* Navigation Links */}
              <Nav style={styles.navLinks}>
                <StyledNavLink href="/" className="active">Trang chủ</StyledNavLink>
                <StyledNavLink href="#cua-hang">Cửa hàng</StyledNavLink>
                <StyledNavLink href="/blog">Thông tin</StyledNavLink>
                <StyledNavLink href="/contact">Liên hệ</StyledNavLink>
              </Nav>

          

              {/* Icons on right */}
              <div style={styles.iconGroup}>
                {currentUser ? (
                  <Dropdown align="end">
                    <Dropdown.Toggle as={NavIcon} id="user-menu" title={currentUser.fullName || currentUser.name || currentUser.email}>
                      <Image src={currentUser.avatarUrl || 'https://ui-avatars.com/api/?background=d4af37&color=fff&name=' + encodeURIComponent(currentUser.fullName || currentUser.name || 'U')} roundedCircle width={28} height={28} />
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Header>
                        {(currentUser.fullName || currentUser.name || currentUser.email)}
                      </Dropdown.Header>
                      <Dropdown.Item href="/profile">Trang cá nhân</Dropdown.Item>
                      <Dropdown.Item href="/orders">Đơn hàng của tôi</Dropdown.Item>
                      <Dropdown.Divider />
                      <Dropdown.Item onClick={() => { authService.logout?.(); window.location.href = '/'; }}>Đăng xuất</Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                ) : (
                  <NavIcon href='/login' title="Tài khoản">
                    <FaUser />
                  </NavIcon>
                )}
                <NavIcon className="d-lg-none" title="Tìm kiếm">
                  <FaSearch />
                </NavIcon>
                <CartIcon href='/cart' title="Giỏ hàng" style={{ position: 'relative' }}>
                  <FaShoppingCart />
                  {cart?.items?.length > 0 && (
                    <CartBadge>{getCartItemsCount()}</CartBadge>
                  )}
                </CartIcon>
              </div>
            </Navbar.Collapse>
          </Container>
        </StyledNavbar>
      </div>
    </>
  );
}

export default Header;