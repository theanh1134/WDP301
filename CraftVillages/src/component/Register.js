// Register.js
import React, { useState } from 'react';
import { Container, Form, Button, InputGroup, Alert } from 'react-bootstrap';
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaUser, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from './Header';
import authService from '../services/authService';
import EmailVerification from './EmailVerification';
// Import hình ảnh
import pic2 from '../assets/images/login.jpg';

function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [accountType] = useState('buyer');
    const [validated, setValidated] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showEmailVerification, setShowEmailVerification] = useState(false);
    const [registeredEmail, setRegisteredEmail] = useState('');
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phoneNumber: '',
        address: '',
        password: '',
        confirmPassword: ''
    });

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        setError('');

        if (form.checkValidity() === false) {
            e.stopPropagation();
        } else {
            // Validate password match
            if (formData.password !== formData.confirmPassword) {
                setError('Mật khẩu xác nhận không khớp!');
                return;
            }

            // Validate terms agreement
            if (!agreedToTerms) {
                setError('Vui lòng đồng ý với điều khoản sử dụng!');
                return;
            }


            setIsLoading(true);

            try {
                const userData = {
                    fullName: formData.fullName,
                    email: formData.email,
                    phoneNumber: formData.phoneNumber,
                    address: formData.address,
                    password: formData.password,
                    accountType: accountType
                };

                const response = await authService.register(userData);

                if (response.success) {
                    // Store registration data for after verification
                    localStorage.setItem('pendingRegistration', JSON.stringify({
                        email: formData.email,
                        fullName: formData.fullName,
                        accountType: accountType
                    }));

                    setRegisteredEmail(formData.email);
                    setShowEmailVerification(true);

                    // Show appropriate message
                    if (response.data.isResend) {
                        setError('Email đã tồn tại nhưng chưa được xác nhận. Mã xác nhận mới đã được gửi đến email của bạn.');
                    }
                }
            } catch (error) {
                setError(error.message);
            } finally {
                setIsLoading(false);
            }
        }

        setValidated(true);
    };

    const handleVerificationSuccess = (data) => {
        // Redirect to login or home page
        window.location.href = '/login';
    };

    const handleBackToRegister = () => {
        setShowEmailVerification(false);
        setRegisteredEmail('');
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
        registerButton: {
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
        termsContainer: {
            display: 'flex',
            alignItems: 'center',
            marginBottom: '20px'
        },
        termsCheckbox: {
            marginRight: '10px',
            accentColor: '#e74c3c'
        },
        termsText: {
            fontSize: '14px',
            color: '#666',
            lineHeight: '1.4'
        },
        termsLink: {
            color: '#e74c3c',
            textDecoration: 'none',
            fontWeight: '500'
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
    };

    if (showEmailVerification) {
        return (
            <EmailVerification
                email={registeredEmail}
                onVerificationSuccess={handleVerificationSuccess}
                onBack={handleBackToRegister}
            />
        );
    }

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
                            Đăng ký để trở thành một phần của cộng đồng làng nghề Việt Nam. Tạo tài khoản để bắt đầu hành trình khám phá và kinh doanh.
                        </p>
                    </div>
                </div>

                {/* Right side - Registration Form */}
                <div style={styles.formContainer}>
                    <div style={styles.formContent}>
                        <h1 style={styles.heading}>Đăng Ký Tài Khoản</h1>
                        <div style={styles.headingUnderline}></div>
                        <p style={styles.subHeading}>Tạo tài khoản để bắt đầu</p>

                        {error && (
                            <Alert variant="danger" className="mb-3">
                                {error}
                            </Alert>
                        )}

                        <Form noValidate validated={validated} onSubmit={handleSubmit}>

                            {/* Full Name */}
                            <Form.Group className="mb-4">
                                <InputGroup>
                                    <InputGroup.Text style={{
                                        background: '#f9f9f9',
                                        border: '1px solid #ddd',
                                        borderRight: 'none',
                                        borderRadius: '8px 0 0 8px'
                                    }}>
                                        <FaUser style={styles.inputIcon} />
                                    </InputGroup.Text>
                                    <Form.Control
                                        type="text"
                                        placeholder="Họ và tên"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
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
                                    Vui lòng nhập họ tên.
                                </Form.Control.Feedback>
                            </Form.Group>

                            {/* Email */}
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
                                        placeholder="Email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
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

                            {/* Phone Number */}
                            <Form.Group className="mb-4">
                                <InputGroup>
                                    <InputGroup.Text style={{
                                        background: '#f9f9f9',
                                        border: '1px solid #ddd',
                                        borderRight: 'none',
                                        borderRadius: '8px 0 0 8px'
                                    }}>
                                        <FaPhone style={styles.inputIcon} />
                                    </InputGroup.Text>
                                    <Form.Control
                                        type="tel"
                                        placeholder="Số điện thoại"
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleChange}
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
                                    Vui lòng nhập số điện thoại.
                                </Form.Control.Feedback>
                            </Form.Group>

                            {/* Address */}
                            <Form.Group className="mb-4">
                                <InputGroup>
                                    <InputGroup.Text style={{
                                        background: '#f9f9f9',
                                        border: '1px solid #ddd',
                                        borderRight: 'none',
                                        borderRadius: '8px 0 0 8px'
                                    }}>
                                        <FaMapMarkerAlt style={styles.inputIcon} />
                                    </InputGroup.Text>
                                    <Form.Control
                                        type="text"
                                        placeholder="Địa chỉ"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
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
                                    Vui lòng nhập địa chỉ.
                                </Form.Control.Feedback>
                            </Form.Group>


                            {/* Password */}
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
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
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
                                <Form.Control.Feedback type="invalid">
                                    Vui lòng nhập mật khẩu.
                                </Form.Control.Feedback>
                            </Form.Group>

                            {/* Confirm Password */}
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
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Xác nhận mật khẩu"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                        style={{
                                            ...styles.formControl,
                                            borderRadius: '0 8px 8px 0',
                                            marginBottom: 0,
                                            borderLeft: 'none',
                                            paddingRight: '40px'
                                        }}
                                    />
                                    <Button
                                        onClick={toggleConfirmPasswordVisibility}
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
                                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                    </Button>
                                </InputGroup>
                                <Form.Control.Feedback type="invalid">
                                    Vui lòng xác nhận mật khẩu.
                                </Form.Control.Feedback>
                            </Form.Group>

                            {/* Terms and Conditions */}
                            <div style={styles.termsContainer}>
                                <input
                                    type="checkbox"
                                    id="terms"
                                    checked={agreedToTerms}
                                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                                    style={styles.termsCheckbox}
                                />
                                <label htmlFor="terms" style={styles.termsText}>
                                    Tôi đồng ý với{' '}
                                    <a href="/terms" style={styles.termsLink}>
                                        Điều khoản sử dụng
                                    </a>
                                    {' '}và{' '}
                                    <a href="/privacy" style={styles.termsLink}>
                                        Chính sách bảo mật
                                    </a>
                                </label>
                            </div>

                            <Button
                                variant="primary"
                                type="submit"
                                style={styles.registerButton}
                                className="btn-hover"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Đang đăng ký...' : 'Đăng Ký'}
                            </Button>

                            <p style={styles.loginLink}>
                                Đã có tài khoản?
                                <a href="/login" style={styles.loginLinkText}>Đăng nhập ngay</a>
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

export default Register;
