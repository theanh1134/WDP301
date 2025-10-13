// Login.js
import React, { useState } from 'react';
import { Container, Form, Button, InputGroup, Alert } from 'react-bootstrap';
import { FaEye, FaEyeSlash, FaEnvelope, FaLock } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from './Header';
import Footer from './Footer';
import authService from '../services/authService';
// Import hình ảnh
import pic1 from '../assets/images/pic1.png';
import pic2 from '../assets/images/login.jpg';

function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await authService.login(email, password);

            if (response.success) {
                // Check if user is email verified
                if (response.data && response.data.user && !response.data.user.isEmailVerified) {
                    setError('Vui lòng xác nhận email trước khi đăng nhập. Kiểm tra hộp thư của bạn.');
                    return;
                }

                // Redirect to home page or dashboard
                window.location.href = '/';
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const styles = {
        container: {
            minHeight: '100vh',
            display: 'flex',
            padding: 0,
            margin: 0,
            maxWidth: '100%',
            fontFamily: '"Poppins", sans-serif'
        },
        imageContainer: {
            width: '50%',
            height: '100vh',
            overflow: 'hidden',
            position: 'relative'
        },
        overlay: {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.5))',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'white',
            padding: '0 50px',
            textAlign: 'center'
        },
        overlayHeading: {
            fontSize: '42px',
            fontWeight: '700',
            marginBottom: '20px',
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
        },
        overlayText: {
            fontSize: '18px',
            maxWidth: '80%',
            lineHeight: '1.6',
            textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
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
            padding: '0 50px',
            background: 'linear-gradient(to right, #f9f9f9, #ffffff)'
        },
        formContent: {
            width: '100%',
            maxWidth: '450px',
            background: 'white',
            padding: '40px',
            borderRadius: '15px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        },
        logo: {
            width: '120px',
            marginBottom: '20px'
        },
        heading: {
            fontSize: '32px',
            fontWeight: 'bold',
            marginBottom: '10px',
            color: '#333',
            position: 'relative'
        },
        headingUnderline: {
            width: '50px',
            height: '4px',
            background: '#e74c3c',
            marginBottom: '25px',
            borderRadius: '2px'
        },
        subHeading: {
            fontSize: '16px',
            color: '#666',
            marginBottom: '30px'
        },
        formControl: {
            height: '50px',
            fontSize: '16px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '10px 15px',
            marginBottom: '20px',
            transition: 'all 0.3s ease',
            backgroundColor: '#f9f9f9'
        },
        formGroup: {
            marginBottom: '20px',
            position: 'relative'
        },
        inputIcon: {
            color: '#aaa'
        },
        passwordToggle: {
            background: 'none',
            border: 'none',
            color: '#aaa',
            cursor: 'pointer'
        },
        loginButton: {
            backgroundColor: '#e74c3c',
            border: 'none',
            borderRadius: '8px',
            height: '50px',
            fontSize: '16px',
            fontWeight: '600',
            width: '100%',
            marginTop: '20px',
            marginBottom: '20px',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(231, 76, 60, 0.3)'
        },
        forgotPassword: {
            textAlign: 'right',
            color: '#e74c3c',
            textDecoration: 'none',
            fontSize: '15px',
            fontWeight: '500',
            display: 'block',
            marginBottom: '10px',
            transition: 'all 0.3s ease'
        },
        divider: {
            display: 'flex',
            alignItems: 'center',
            margin: '25px 0'
        },
        dividerLine: {
            flex: 1,
            height: '1px',
            background: '#ddd'
        },
        dividerText: {
            padding: '0 15px',
            color: '#999',
            fontSize: '14px'
        },
        socialLogin: {
            display: 'flex',
            justifyContent: 'center',
            gap: '20px',
            marginTop: '15px'
        },
        socialButton: {
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid #ddd',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
        },
        signupLink: {
            textAlign: 'center',
            marginTop: '25px',
            fontSize: '15px',
            color: '#666'
        },
        signupLinkText: {
            color: '#e74c3c',
            fontWeight: '600',
            textDecoration: 'none',
            marginLeft: '5px'
        }
    };

    return (
        <>
            <Header />
            <Container fluid style={styles.container}>

                {/* Left side - Image */}
                <div style={styles.imageContainer}>
                    <img
                        src={pic2}
                        alt="Traditional craft village"
                        style={styles.image}
                    />
                    <div style={styles.overlay}>
                        <h1 style={styles.overlayHeading}>Làng Nghề Truyền Thống</h1>
                        <p style={styles.overlayText}>
                            Khám phá và kết nối với nét đẹp văn hóa làng nghề Việt Nam. Đăng nhập để trải nghiệm hành trình văn hóa độc đáo.
                        </p>
                    </div>
                </div>

                {/* Right side - Login Form */}
                <div style={styles.formContainer}>
                    <div style={styles.formContent}>
                        {/* <img src="/logo.png" alt="Logo" style={styles.logo} /> */}

                        <h1 style={styles.heading}>Đăng Nhập</h1>
                        <div style={styles.headingUnderline}></div>
                        <p style={styles.subHeading}>Nhập thông tin của bạn để tiếp tục</p>

                        {error && (
                            <Alert variant="danger" className="mb-3">
                                {error}
                            </Alert>
                        )}

                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-4">
                                <InputGroup>
                                    <InputGroup.Text style={{
                                        background: '#f9f9f9',
                                        border: '1px solid #ddd',
                                        borderRight: 'none',
                                        borderRadius: '8px 0 0 8px'
                                    }}>
                                        <FaEnvelope style={styles.inputIcon} />
                                    </InputGroup.Text>
                                    <Form.Control
                                        type="email"
                                        placeholder="Email hoặc số điện thoại"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        style={{
                                            ...styles.formControl,
                                            borderRadius: '0 8px 8px 0',
                                            marginBottom: 0,
                                            borderLeft: 'none'
                                        }}
                                    />
                                </InputGroup>
                            </Form.Group>

                            <Form.Group className="mb-4">
                                <InputGroup>
                                    <InputGroup.Text style={{
                                        background: '#f9f9f9',
                                        border: '1px solid #ddd',
                                        borderRight: 'none',
                                        borderRadius: '8px 0 0 8px'
                                    }}>
                                        <FaLock style={styles.inputIcon} />
                                    </InputGroup.Text>
                                    <Form.Control
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Mật khẩu"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        style={{
                                            ...styles.formControl,
                                            borderRadius: '0 8px 8px 0',
                                            marginBottom: 0,
                                            borderLeft: 'none',
                                            paddingRight: '40px'
                                        }}
                                    />
                                    <Button
                                        onClick={togglePasswordVisibility}
                                        style={{
                                            position: 'absolute',
                                            right: '10px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            zIndex: 10,
                                            background: 'transparent',
                                            border: 'none',
                                            color: '#aaa'
                                        }}
                                    >
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </Button>
                                </InputGroup>
                            </Form.Group>

                            <a href="/forgot-password" style={styles.forgotPassword}>
                                Quên mật khẩu?
                            </a>

                            <Button
                                variant="primary"
                                type="submit"
                                style={styles.loginButton}
                                className="btn-hover"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
                            </Button>



                            <p style={styles.signupLink}>
                                Chưa có tài khoản?
                                <a href="/register" style={styles.signupLinkText}>Đăng ký ngay</a>
                            </p>


                        </Form>
                    </div>
                </div>

                <style jsx>{`
                .btn-hover:hover {
                    background-color: #d63031 !important;
                    transform: translateY(-2px);
                }
            `}</style>

            </Container>

        </>
    );
}

export default Login;