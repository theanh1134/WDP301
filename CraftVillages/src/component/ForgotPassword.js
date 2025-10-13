// ForgotPassword.js
import React, { useState } from 'react';
import { Container, Form, Button, InputGroup, Alert } from 'react-bootstrap';
import { FaEnvelope, FaArrowLeft, FaCheckCircle, FaSpinner, FaLock } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from './Header';
import Footer from './Footer';
import authService from '../services/authService';
// Import hình ảnh
import pic2 from '../assets/images/login.jpg';

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [validated, setValidated] = useState(false);
    const [error, setError] = useState('');
    const [showResetForm, setShowResetForm] = useState(false);
    const [resetCode, setResetCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        setError('');

        if (form.checkValidity() === false) {
            e.stopPropagation();
        } else {
            setIsLoading(true);

            try {
                const response = await authService.forgotPassword(email);

                if (response.success) {
                    setIsSubmitted(true);
                }
            } catch (error) {
                setError(error.message);
            } finally {
                setIsLoading(false);
            }
        }

        setValidated(true);
    };

    const handleVerifyResetCode = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await authService.verifyResetCode(email, resetCode);

            if (response.success) {
                setShowResetForm(true);
            }
        } catch (error) {
            setError(error.message);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp!');
            return;
        }

        setIsLoading(true);

        try {
            const response = await authService.resetPassword(email, resetCode, newPassword);

            if (response.success) {
                alert('Đặt lại mật khẩu thành công! Vui lòng đăng nhập.');
                window.location.href = '/login';
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBackToLogin = () => {
        window.location.href = '/login';
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
        inputIcon: {
            color: '#aaa'
        },
        submitButton: {
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
            boxShadow: '0 4px 15px rgba(231, 76, 60, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
        },
        backButton: {
            backgroundColor: 'transparent',
            border: '1px solid #ddd',
            borderRadius: '8px',
            height: '50px',
            fontSize: '16px',
            fontWeight: '500',
            width: '100%',
            marginBottom: '20px',
            transition: 'all 0.3s ease',
            color: '#666',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
        },
        loginLink: {
            textAlign: 'center',
            marginTop: '25px',
            fontSize: '15px',
            color: '#666'
        },
        loginLinkText: {
            color: '#e74c3c',
            fontWeight: '600',
            textDecoration: 'none',
            marginLeft: '5px'
        },
        successContainer: {
            textAlign: 'center',
            padding: '20px 0'
        },
        successIcon: {
            fontSize: '48px',
            color: '#28a745',
            marginBottom: '20px'
        },
        successTitle: {
            fontSize: '24px',
            fontWeight: '600',
            color: '#333',
            marginBottom: '15px'
        },
        successMessage: {
            fontSize: '16px',
            color: '#666',
            marginBottom: '30px',
            lineHeight: '1.5'
        },
        alertBox: {
            backgroundColor: '#d4edda',
            border: '1px solid #c3e6cb',
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '20px',
            color: '#155724'
        },
        spinner: {
            animation: 'spin 1s linear infinite'
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
                        <h1 style={styles.overlayHeading}>Quên Mật Khẩu?</h1>
                        <p style={styles.overlayText}>
                            Đừng lo lắng! Chúng tôi sẽ giúp bạn khôi phục mật khẩu một cách nhanh chóng và an toàn. Nhập email của bạn để nhận hướng dẫn đặt lại mật khẩu.
                        </p>
                    </div>
                </div>

                {/* Right side - Forgot Password Form */}
                <div style={styles.formContainer}>
                    <div style={styles.formContent}>
                        <h1 style={styles.heading}>Khôi Phục Mật Khẩu</h1>
                        <div style={styles.headingUnderline}></div>
                        <p style={styles.subHeading}>Nhập email để nhận liên kết đặt lại mật khẩu</p>

                        {error && (
                            <Alert variant="danger" className="mb-3">
                                {error}
                            </Alert>
                        )}

                        {!isSubmitted ? (
                            <Form noValidate validated={validated} onSubmit={handleSubmit}>
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
                                            placeholder="Email đăng ký tài khoản"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            style={{
                                                ...styles.formControl,
                                                borderRadius: '0 8px 8px 0',
                                                marginBottom: 0,
                                                borderLeft: 'none'
                                            }}
                                        />
                                    </InputGroup>
                                    <Form.Control.Feedback type="invalid">
                                        Vui lòng nhập email hợp lệ.
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <Button
                                    variant="primary"
                                    type="submit"
                                    style={styles.submitButton}
                                    className="btn-hover"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <FaSpinner style={styles.spinner} />
                                            Đang gửi...
                                        </>
                                    ) : (
                                        'Gửi Liên Kết Khôi Phục'
                                    )}
                                </Button>

                                <Button
                                    variant="outline-secondary"
                                    onClick={handleBackToLogin}
                                    style={styles.backButton}
                                >
                                    <FaArrowLeft />
                                    Quay lại đăng nhập
                                </Button>

                                <p style={styles.loginLink}>
                                    Nhớ mật khẩu?
                                    <a href="/login" style={styles.loginLinkText}>Đăng nhập ngay</a>
                                </p>
                            </Form>
                        ) : !showResetForm ? (
                            <div>
                                <div style={styles.successContainer}>
                                    <FaCheckCircle style={styles.successIcon} />
                                    <h2 style={styles.successTitle}>Mã đặt lại đã được gửi!</h2>
                                    <p style={styles.successMessage}>
                                        Chúng tôi đã gửi mã đặt lại mật khẩu đến email <strong>{email}</strong>.
                                        Vui lòng nhập mã 6 chữ số để tiếp tục.
                                    </p>
                                </div>

                                <Form onSubmit={handleVerifyResetCode}>
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
                                                type="text"
                                                placeholder="Nhập mã 6 chữ số"
                                                value={resetCode}
                                                onChange={(e) => setResetCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                required
                                                maxLength="6"
                                                style={{
                                                    ...styles.formControl,
                                                    borderRadius: '0 8px 8px 0',
                                                    marginBottom: 0,
                                                    borderLeft: 'none',
                                                    textAlign: 'center',
                                                    letterSpacing: '2px',
                                                    fontWeight: 'bold'
                                                }}
                                            />
                                        </InputGroup>
                                    </Form.Group>

                                    <Button
                                        variant="primary"
                                        type="submit"
                                        style={styles.submitButton}
                                        className="btn-hover"
                                        disabled={resetCode.length !== 6}
                                    >
                                        Xác nhận mã
                                    </Button>
                                </Form>

                                <Button
                                    variant="outline-secondary"
                                    onClick={handleBackToLogin}
                                    style={styles.backButton}
                                >
                                    <FaArrowLeft />
                                    Quay lại đăng nhập
                                </Button>
                            </div>
                        ) : (
                            <div>
                                <div style={styles.successContainer}>
                                    <FaCheckCircle style={styles.successIcon} />
                                    <h2 style={styles.successTitle}>Mã xác nhận thành công!</h2>
                                    <p style={styles.successMessage}>
                                        Vui lòng nhập mật khẩu mới để hoàn tất quá trình đặt lại.
                                    </p>
                                </div>

                                <Form onSubmit={handleResetPassword}>
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
                                                type="password"
                                                placeholder="Mật khẩu mới"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                required
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
                                                type="password"
                                                placeholder="Xác nhận mật khẩu mới"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                required
                                                style={{
                                                    ...styles.formControl,
                                                    borderRadius: '0 8px 8px 0',
                                                    marginBottom: 0,
                                                    borderLeft: 'none'
                                                }}
                                            />
                                        </InputGroup>
                                    </Form.Group>

                                    <Button
                                        variant="primary"
                                        type="submit"
                                        style={styles.submitButton}
                                        className="btn-hover"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Đang đặt lại...' : 'Đặt lại mật khẩu'}
                                    </Button>
                                </Form>

                                <Button
                                    variant="outline-secondary"
                                    onClick={handleBackToLogin}
                                    style={styles.backButton}
                                >
                                    <FaArrowLeft />
                                    Quay lại đăng nhập
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                <style jsx>{`
                .btn-hover:hover {
                    background-color: #d63031 !important;
                    transform: translateY(-2px);
                }
                
                .btn-hover:hover:disabled {
                    background-color: #e74c3c !important;
                    transform: none;
                }
                
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>

            </Container>

        </>
    );
}

export default ForgotPassword;
