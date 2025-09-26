// Login.js
import React from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
// Import hình ảnh
import pic1 from '../assets/images/pic1.png';

function Login() {
    const styles = {
        container: {
            minHeight: '100vh',
            display: 'flex',
            padding: 0,
            margin: 0,
            maxWidth: '100%'
        },
        imageGrid: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gridTemplateRows: '1fr 1fr',
            gap: '2px',
            width: '50%',
            height: '100vh',
            overflow: 'hidden',
            objectFit:'cover'
        },
        imageContainer: {
            overflow: 'hidden',
            // Đổi thành một grid cell lớn chiếm toàn bộ không gian bên trái
            gridColumn: '1 / 3',
            gridRow: '1 / 3'
        },
        image: {
            width: '100%',
            height: '100%',
            objectFit: 'cover'
        },
        formContainer: {
            width: '50%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '0 50px'
        },
        formContent: {
            width: '100%',
            maxWidth: '400px'
        },
        heading: {
            fontSize: '28px',
            fontWeight: 'bold',
            marginBottom: '20px',
            color: '#333'
        },
        subHeading: {
            fontSize: '16px',
            color: '#666',
            marginBottom: '30px'
        },
        formControl: {
            marginBottom: '20px',
            padding: '10px 0',
            borderRadius: '0',
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            borderBottom: '1px solid #ddd',
            boxShadow: 'none'
        },
        loginButton: {
            backgroundColor: '#e74c3c',
            border: 'none',
            borderRadius: '4px',
            padding: '10px 0',
            width: '100%',
            fontWeight: '500',
            marginTop: '10px',
            marginBottom: '20px'
        },
        forgotPassword: {
            textAlign: 'right',
            color: '#e74c3c',
            textDecoration: 'none',
            fontSize: '14px'
        }
    };

    return (
        <Container fluid style={styles.container}>
            {/* Left side - Single Image */}
            <div style={styles.imageGrid}>
                <div style={styles.imageContainer}>
                    <img
                        src={pic1}
                        alt="Traditional craft village"
                        style={styles.image}
                    />
                </div>
            </div>

            {/* Right side - Login Form */}
            <div style={styles.formContainer}>
                <div style={styles.formContent}>
                    <h1 style={styles.heading}>Đăng Nhập</h1>
                    <p style={styles.subHeading}>Enter your details below</p>

                    <Form>
                        <Form.Group>
                            <Form.Control
                                type="text"
                                placeholder="Email or Phone Number"
                                style={styles.formControl}
                            />
                        </Form.Group>

                        <Form.Group>
                            <Form.Control
                                type="password"
                                placeholder="Password"
                                style={styles.formControl}
                            />
                        </Form.Group>

                        <div className="d-flex justify-content-between align-items-center">
                            <Button
                                variant="primary"
                                type="submit"
                                style={styles.loginButton}
                            >
                                Log In
                            </Button>

                            <a href="/forgot-password" style={styles.forgotPassword}>
                                Forget Password?
                            </a>
                        </div>
                    </Form>
                </div>
            </div>
        </Container>
    );
}

export default Login;