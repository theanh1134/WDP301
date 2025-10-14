// Footer.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col, Button } from 'react-bootstrap';
import authService from '../services/authService';

function Footer() {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    
    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem('authToken');
            const user = authService.getCurrentUser();

            if (token && user) {
                setIsAuthenticated(true);
                setIsEmailVerified(user.isEmailVerified || false);
            } else {
                setIsAuthenticated(false);
                setIsEmailVerified(false);
            }
        };

        checkAuth();
    }, []);
    
    const handleSellerRegistration = () => {
        // Nếu đã đăng nhập và email đã xác thực, chuyển đến dashboard
        if (isAuthenticated && isEmailVerified) {
            navigate('/seller-dashboard');
        } else {
            // Nếu chưa đăng nhập hoặc email chưa xác thực, chuyển đến trang đăng ký
            navigate('/seller-registration');
        }
    };

    const styles = {
        footer: {
            padding: '50px 0',
            backgroundColor: '#fff',
            fontFamily: 'Arial, sans-serif',
            borderTop: '1px solid #eaeaea',
            color: '#333'
        },
        logo: {
            fontWeight: 'bold',
            fontSize: '24px',
            marginBottom: '20px'
        },
        address: {
            fontSize: '14px',
            color: '#777',
            marginBottom: '40px'
        },
        sectionTitle: {
            fontSize: '14px',
            color: '#777',
            marginBottom: '20px'
        },
        menuItem: {
            display: 'block',
            textDecoration: 'none',
            color: '#333',
            marginBottom: '15px',
            fontSize: '15px'
        },
        subscribeContainer: {
            display: 'flex',
            alignItems: 'center'
        },
        subscribeInput: {
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            borderBottom: '1px solid #ddd',
            borderRadius: 0,
            boxShadow: 'none',
            backgroundColor: 'transparent',
            fontSize: '14px',
            padding: '8px 0'
        },
        subscribeButton: {
            background: 'none',
            border: 'none',
            color: '#333',
            fontWeight: 'bold',
            fontSize: '12px',
            padding: '0 0 0 10px',
            letterSpacing: '1px'
        }
    };

    return (
        <footer style={styles.footer}>
            <Container>
                <Row>
                    <Col md={3}>
                        <div style={styles.logo}>TVCMS.</div>
                        <div style={styles.address}>Hòa Lạc, Hà Nội</div>
                    </Col>

                    <Col md={3}>
                        <div style={styles.sectionTitle}>Links</div>
                        <a href="/home" style={styles.menuItem}>Home</a>
                        <a href="/shop" style={styles.menuItem}>Shop</a>
                        <a href="/about" style={styles.menuItem}>About</a>
                        <a href="/contact" style={styles.menuItem}>Contact</a>
                    </Col>

                    <Col md={3}>
                        <div style={styles.sectionTitle}>Help</div>
                        <a href="/payment-options" style={styles.menuItem}>Payment Options</a>
                        <a href="/returns" style={styles.menuItem}>Returns</a>
                        <a href="/privacy-policies" style={styles.menuItem}>Privacy Policies</a>
                    </Col>

                    <Col md={3}>
                        <div style={styles.sectionTitle}>New Seller</div>
                        <div style={styles.subscribeContainer}>
                            <Button 
                                variant="danger" 
                                onClick={handleSellerRegistration}
                                className="w-100 py-2"
                                style={{
                                    borderRadius: '25px',
                                    fontWeight: 'bold',
                                    fontSize: '14px'
                                }}
                            >
                               Bắt Đầu Bán Ngay
                            </Button>
                        </div>
                    </Col>
                </Row>
            </Container>
        </footer>
    );
}

export default Footer;