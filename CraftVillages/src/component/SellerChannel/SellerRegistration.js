import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, ProgressBar } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { sendVerificationEmail } from '../../services/emailService';
import 'bootstrap/dist/css/bootstrap.min.css';

function SellerRegistration() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        // Step 1: Shop Information
        shopName: '',
        pickupAddress: '',
        email: '',
        phone: '',
        // Step 2: Shipping Settings
        shippingMethods: [],
        // Step 3: Tax Information
        taxCode: '',
        businessType: '',
        // Step 4: Identity Information - Email Verification
        fullName: '',
        verificationCode: '',
        generatedCode: '', // Store the generated code
        isEmailVerified: false,
        // Step 5: Additional Info
        businessDescription: '',
        categories: []
    });
    
    const [isCodeSent, setIsCodeSent] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [showValidation, setShowValidation] = useState(false);

    const steps = [
        { number: 1, title: 'Thông tin Shop', description: 'Shop Information' },
        { number: 2, title: 'Cài đặt vận chuyển', description: 'Shipping Settings' },
        { number: 3, title: 'Thông tin thuế', description: 'Tax Information' },
        { number: 4, title: 'Thông tin định danh', description: 'Identity Information' },
        { number: 5, title: 'Hoàn tất', description: 'Complete' }
    ];

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? 
                (checked ? [...prev[name], value] : prev[name].filter(item => item !== value)) : 
                value
        }));
    };


    const handleResendCode = async () => {
        try {
            // Generate random 6-digit code
            const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
            
            // Store the generated code for verification
            setFormData(prev => ({
                ...prev,
                generatedCode: verificationCode
            }));
            
            // Send email with verification code
            const emailData = {
                email: formData.email,
                fullName: formData.shopName || 'Người bán',
                code: verificationCode
            };
            const result = await sendVerificationEmail(emailData);
            
            if (result.success) {
                setIsCodeSent(true);
                setCountdown(60); // 60 seconds countdown
                
                const timer = setInterval(() => {
                    setCountdown(prev => {
                        if (prev <= 1) {
                            clearInterval(timer);
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);
            } else {
                alert('Có lỗi khi gửi email. Vui lòng thử lại!');
            }
        } catch (error) {
            console.error('Error sending email:', error);
            alert('Có lỗi khi gửi email. Vui lòng thử lại!');
        }
    };

    const handleVerifyEmail = () => {
        // Verify the entered code against the generated code
        if (formData.verificationCode === formData.generatedCode && formData.verificationCode.length === 6) {
            setFormData(prev => ({
                ...prev,
                isEmailVerified: true
            }));
            alert('Email đã được xác nhận thành công!');
        } else {
            alert('Mã xác nhận không đúng. Vui lòng thử lại!');
        }
    };

    const validateCurrentStep = () => {
        switch (currentStep) {
            case 1:
                return formData.shopName.trim() !== '' && 
                       formData.pickupAddress.trim() !== '' && 
                       formData.email.trim() !== '' && 
                       formData.phone.trim() !== '';
            case 2:
                return formData.shippingMethods.length > 0;
            case 3:
                return formData.businessType !== '';
            case 4:
                return formData.isEmailVerified;
            default:
                return true;
        }
    };

    const nextStep = () => {
        if (currentStep < 5) {
            if (validateCurrentStep()) {
                setCurrentStep(currentStep + 1);
                setShowValidation(false); // Reset validation when moving to next step
                
                // Auto-send verification code when reaching step 4
                if (currentStep === 3) {
                    handleResendCode();
                }
            } else {
                setShowValidation(true); // Show validation errors
                // Show specific error messages for each step
                switch (currentStep) {
                    case 1:
                        alert('Vui lòng điền đầy đủ thông tin shop!');
                        break;
                    case 2:
                        alert('Vui lòng chọn ít nhất một phương thức vận chuyển!');
                        break;
                    case 3:
                        alert('Vui lòng chọn loại hình kinh doanh!');
                        break;
                    case 4:
                        alert('Vui lòng xác nhận email trước khi tiếp tục!');
                        break;
                    default:
                        alert('Vui lòng điền đầy đủ thông tin!');
                        break;
                }
            }
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
            setShowValidation(false); // Reset validation when going back
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form submitted:', formData);
        // Here you would typically send the data to your backend
        alert('Đăng ký thành công! Chào mừng bạn đến với cộng đồng người bán.');
        navigate('/seller-dashboard');
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div>
                        <h4 className="mb-4">Thông tin Shop</h4>
                        <Form.Group className="mb-3">
                            <Form.Label>Tên shop <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                type="text"
                                name="shopName"
                                value={formData.shopName}
                                onChange={handleInputChange}
                                placeholder="Tên shop"
                                maxLength={30}
                                required
                                isInvalid={showValidation && formData.shopName.trim() === ''}
                            />
                            <Form.Text className="text-muted">
                                {formData.shopName.length}/30
                            </Form.Text>
                            {showValidation && formData.shopName.trim() === '' && (
                                <Form.Text className="text-danger">
                                    Vui lòng nhập tên shop
                                </Form.Text>
                            )}
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Địa chỉ lấy hàng <span className="text-danger">*</span></Form.Label>
                            <div className="d-flex">
                                <Form.Control
                                    type="text"
                                    name="pickupAddress"
                                    value={formData.pickupAddress}
                                    onChange={handleInputChange}
                                    placeholder="Nhập địa chỉ lấy hàng"
                                    required
                                    isInvalid={showValidation && formData.pickupAddress.trim() === ''}
                                />
                                <Button variant="outline-secondary" className="ms-2">+ Thêm</Button>
                            </div>
                            {showValidation && formData.pickupAddress.trim() === '' && (
                                <Form.Text className="text-danger">
                                    Vui lòng nhập địa chỉ lấy hàng
                                </Form.Text>
                            )}
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Email <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="Nhập vào"
                                required
                                isInvalid={showValidation && formData.email.trim() === ''}
                            />
                            {showValidation && formData.email.trim() === '' && (
                                <Form.Text className="text-danger">
                                    Vui lòng nhập email
                                </Form.Text>
                            )}
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Số điện thoại <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                placeholder="+84"
                                required
                                isInvalid={showValidation && formData.phone.trim() === ''}
                            />
                            {showValidation && formData.phone.trim() === '' && (
                                <Form.Text className="text-danger">
                                    Vui lòng nhập số điện thoại
                                </Form.Text>
                            )}
                        </Form.Group>
                    </div>
                );

            case 2:
                return (
                    <div>
                        <h4 className="mb-4">Cài đặt vận chuyển</h4>
                        <Form.Group className="mb-3">
                            <Form.Label>Phương thức vận chuyển <span className="text-danger">*</span></Form.Label>
                            {['Standard Shipping', 'Express Shipping', 'Same Day Delivery'].map(method => (
                                <Form.Check
                                    key={method}
                                    type="checkbox"
                                    id={method}
                                    name="shippingMethods"
                                    value={method}
                                    label={method}
                                    onChange={handleInputChange}
                                />
                            ))}
                            {showValidation && formData.shippingMethods.length === 0 && (
                                <Form.Text className="text-danger">
                                    Vui lòng chọn ít nhất một phương thức vận chuyển
                                </Form.Text>
                            )}
                        </Form.Group>
                    </div>
                );

            case 3:
                return (
                    <div>
                        <h4 className="mb-4">Thông tin thuế</h4>
                        <Form.Group className="mb-3">
                            <Form.Label>Mã số thuế</Form.Label>
                            <Form.Control
                                type="text"
                                name="taxCode"
                                value={formData.taxCode}
                                onChange={handleInputChange}
                                placeholder="Nhập mã số thuế"
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Loại hình kinh doanh <span className="text-danger">*</span></Form.Label>
                            <Form.Select
                                name="businessType"
                                value={formData.businessType}
                                onChange={handleInputChange}
                                isInvalid={showValidation && formData.businessType === ''}
                            >
                                <option value="">Chọn loại hình</option>
                                <option value="handicrafts">Thủ công mỹ nghệ</option>
                                <option value="ceramics">Gốm sứ</option>
                                <option value="textiles">Dệt may - Lụa</option>
                                <option value="rattan">Mây tre đan</option>
                                <option value="hats">Nón lá</option>
                                <option value="woodcraft">Mộc mỹ nghệ</option>
                                <option value="other">Khác</option>
                            </Form.Select>
                            {showValidation && formData.businessType === '' && (
                                <Form.Text className="text-danger">
                                    Vui lòng chọn loại hình kinh doanh
                                </Form.Text>
                            )}
                        </Form.Group>
                    </div>
                );

            case 4:
                return (
                    <div>
                        <h4 className="mb-4">Xác Nhận Email</h4>
                        <p className="text-muted mb-4">
                            Chúng tôi đã gửi mã xác nhận đến email của bạn. Vui lòng kiểm tra hộp thư và nhập mã 6 chữ số để hoàn tất đăng ký.
                        </p>
                        
                        <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <div className="d-flex align-items-center">
                                <i className="fas fa-envelope text-primary me-2"></i>
                                <Form.Control
                                    type="email"
                                    value={formData.email}
                                    disabled
                                    style={{ backgroundColor: '#f8f9fa' }}
                                />
                            </div>
                            <Form.Text className="text-muted">
                                Mã xác nhận sẽ được gửi đến email này
                            </Form.Text>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Mã xác nhận <span className="text-danger">*</span></Form.Label>
                            <div className="d-flex align-items-center">
                                <i className="fas fa-envelope text-muted me-2"></i>
                                <Form.Control
                                    type="text"
                                    name="verificationCode"
                                    value={formData.verificationCode}
                                    onChange={handleInputChange}
                                    placeholder="Nhập mã 6 chữ số"
                                    maxLength={6}
                                    required
                                />
                            </div>
                        </Form.Group>

                        <div className="d-flex justify-content-between align-items-center">
                            <Button 
                                variant="outline-primary" 
                                onClick={handleResendCode}
                                disabled={countdown > 0}
                                size="sm"
                            >
                                {countdown > 0 ? `Gửi lại sau ${countdown}s` : (isCodeSent ? 'Gửi lại mã xác nhận' : 'Gửi mã xác nhận')}
                            </Button>
                            
                            <Button 
                                variant="success" 
                                onClick={handleVerifyEmail}
                                disabled={!formData.verificationCode || formData.verificationCode.length !== 6}
                                size="sm"
                            >
                                Xác Nhận Email
                            </Button>
                        </div>
                        
                        {formData.isEmailVerified && (
                            <div className="alert alert-success mt-3">
                                <i className="fas fa-check-circle me-2"></i>
                                Email đã được xác nhận thành công!
                            </div>
                        )}
                    </div>
                );

            case 5:
                return (
                    <div>
                        <h4 className="mb-4">Hoàn tất đăng ký</h4>
                        <div className="text-center">
                            <div className="mb-4">
                                <i className="fas fa-check-circle text-success" style={{ fontSize: '4rem' }}></i>
                            </div>
                            <h5>Chúc mừng! Bạn đã hoàn tất đăng ký</h5>
                            <p className="text-muted">
                                Chúng tôi sẽ xem xét thông tin của bạn và liên hệ trong vòng 24 giờ.
                            </p>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    const styles = {
        container: {
            minHeight: '100vh',
            backgroundColor: '#f8f9fa',
            padding: '2rem 0'
        },
        card: {
            border: 'none',
            borderRadius: '10px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        },
        progressBar: {
            height: '8px',
            borderRadius: '4px'
        },
        stepIndicator: {
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '2rem'
        },
        step: {
            textAlign: 'center',
            flex: 1
        },
        activeStep: {
            color: '#dc3545',
            fontWeight: 'bold'
        },
        inactiveStep: {
            color: '#6c757d'
        },
        buttonGroup: {
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '2rem'
        }
    };

    return (
        <div style={styles.container}>
            <Container>
                <Row className="justify-content-center">
                    <Col md={8} lg={6}>
                        <Card style={styles.card}>
                            <Card.Body className="p-4">
                                <div className="text-center mb-4">
                                    <h2 className="mb-2">Đăng ký trở thành Người bán</h2>
                                    <p className="text-muted">Để đăng ký bán hàng, bạn cần cung cấp một số thông tin cơ bản</p>
                                </div>

                                {/* Progress Bar */}
                                <ProgressBar 
                                    now={(currentStep / 5) * 100} 
                                    style={styles.progressBar}
                                    variant="danger"
                                />

                                {/* Step Indicators */}
                                <div style={styles.stepIndicator}>
                                    {steps.map((step, index) => (
                                        <div key={step.number} style={styles.step}>
                                            <div 
                                                className={`${currentStep === step.number ? styles.activeStep : styles.inactiveStep}`}
                                            >
                                                <div className="fw-bold">{step.number}</div>
                                                <div style={{ fontSize: '0.8rem' }}>{step.title}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Form Content */}
                                <Form onSubmit={handleSubmit}>
                                    {renderStepContent()}

                                    {/* Navigation Buttons */}
                                    <div style={styles.buttonGroup}>
                                        {currentStep > 1 && (
                                            <Button 
                                                variant="outline-secondary" 
                                                onClick={prevStep}
                                            >
                                                Quay lại
                                            </Button>
                                        )}
                                        
                                        <div className="ms-auto">
                                            {currentStep < 5 ? (
                                                <Button 
                                                    variant="danger" 
                                                    onClick={nextStep}
                                                    className="px-4"
                                                >
                                                    Tiếp theo
                                                </Button>
                                            ) : (
                                                <Button 
                                                    type="submit" 
                                                    variant="success"
                                                    className="px-4"
                                                >
                                                    Hoàn tất đăng ký
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}

export default SellerRegistration;