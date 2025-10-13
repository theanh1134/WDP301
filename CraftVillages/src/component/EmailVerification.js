import React, { useState } from 'react';
import { Container, Form, Button, InputGroup, Alert } from 'react-bootstrap';
import { FaEnvelope, FaArrowLeft, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from './Header';
import Footer from './Footer';
import authService from '../services/authService';
import pic2 from '../assets/images/login.jpg';

function EmailVerification({ email, onVerificationSuccess, onBack }) {
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await authService.verifyEmail(email, code);

            if (response.success) {
                // Clear pending registration data
                localStorage.removeItem('pendingRegistration');

                setSuccess(true);
                setTimeout(() => {
                    onVerificationSuccess(response.data);
                }, 2000);
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendCode = async () => {
        setIsLoading(true);
        setError('');

        try {
            await authService.resendCode(email);
            alert('Mã xác nhận đã được gửi lại!');
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
            backgroundColor: '#f9f9f9',
            textAlign: 'center',
            letterSpacing: '2px',
            fontWeight: 'bold'
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
        resendButton: {
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
        emailDisplay: {
            fontSize: '18px',
            fontWeight: '600',
            color: '#e74c3c',
            marginBottom: '20px'
        }
    };

    if (success) {
        return (
            <>
                <Header />
                <Container fluid style={styles.container}>
                    <div style={styles.imageContainer}>
                        <img src={pic2} alt="Traditional craft village" style={styles.image} />
                        <div style={styles.overlay}>
                            <h1 style={styles.overlayHeading}>Xác Nhận Thành Công!</h1>
                            <p style={styles.overlayText}>
                                Chúc mừng! Email của bạn đã được xác nhận thành công. Bạn sẽ được chuyển đến trang chủ trong giây lát.
                            </p>
                        </div>
                    </div>

                    <div style={styles.formContainer}>
                        <div style={styles.formContent}>
                            <div style={styles.successContainer}>
                                <FaCheckCircle style={styles.successIcon} />
                                <h2 style={styles.successTitle}>Email đã được xác nhận!</h2>
                                <p style={styles.successMessage}>
                                    Tài khoản của bạn đã được kích hoạt thành công. Bạn có thể đăng nhập ngay bây giờ.
                                </p>
                            </div>
                        </div>
                    </div>
                </Container>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
            <Container fluid style={styles.container}>
                <div style={styles.imageContainer}>
                    <img src={pic2} alt="Traditional craft village" style={styles.image} />
                    <div style={styles.overlay}>
                        <h1 style={styles.overlayHeading}>Xác Nhận Email</h1>
                        <p style={styles.overlayText}>
                            Chúng tôi đã gửi mã xác nhận đến email của bạn. Vui lòng kiểm tra hộp thư và nhập mã 6 chữ số để hoàn tất đăng ký.
                        </p>
                    </div>
                </div>

                <div style={styles.formContainer}>
                    <div style={styles.formContent}>
                        <h1 style={styles.heading}>Xác Nhận Email</h1>
                        <div style={styles.headingUnderline}></div>
                        <p style={styles.subHeading}>Nhập mã xác nhận từ email</p>

                        <div style={styles.emailDisplay}>
                            📧 {email}
                        </div>

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
                                        type="text"
                                        placeholder="Nhập mã 6 chữ số"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        required
                                        maxLength="6"
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
                                disabled={isLoading || code.length !== 6}
                            >
                                {isLoading ? (
                                    <>
                                        <FaSpinner style={{ animation: 'spin 1s linear infinite' }} />
                                        Đang xác nhận...
                                    </>
                                ) : (
                                    'Xác Nhận Email'
                                )}
                            </Button>

                            <Button
                                variant="outline-secondary"
                                onClick={handleResendCode}
                                style={styles.resendButton}
                                disabled={isLoading}
                            >
                                Gửi lại mã xác nhận
                            </Button>

                            <Button
                                variant="outline-secondary"
                                onClick={onBack}
                                style={styles.backButton}
                            >
                                <FaArrowLeft />
                                Quay lại đăng ký
                            </Button>
                        </Form>
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
            <Footer />
        </>
    );
}

export default EmailVerification;

