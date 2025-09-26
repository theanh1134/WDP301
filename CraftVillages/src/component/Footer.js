// Footer.js
import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';

function Footer() {
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
                            <Form className="d-flex w-100">
                                <Form.Control
                                    type="email"
                                    placeholder="Enter Your Email Address"
                                    style={styles.subscribeInput}
                                />
                                <Button variant="link" style={styles.subscribeButton}>
                                    SUBSCRIBE
                                </Button>
                            </Form>
                        </div>
                    </Col>
                </Row>
            </Container>
        </footer>
    );
}

export default Footer;