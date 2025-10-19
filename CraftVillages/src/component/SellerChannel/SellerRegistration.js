import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, ProgressBar, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { sendVerificationEmail } from '../../services/emailService';
import shopService from '../../services/shopService';
import authService from '../../services/authService';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import 'bootstrap/dist/css/bootstrap.min.css';

// Styled Components
const StyledCard = styled(Card)`
  border: none;
  border-radius: 15px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const StyledProgressBar = styled(ProgressBar)`
  height: 10px;
  border-radius: 10px;
  background-color: #f0f0f0;

  .progress-bar {
    background: linear-gradient(135deg, #b8860b 0%, #d4af37 100%);
  }
`;

const StepIndicator = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 2rem 0;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 20px;
    left: 0;
    right: 0;
    height: 2px;
    background: #e0e0e0;
    z-index: 0;
  }
`;

const Step = styled.div`
  flex: 1;
  text-align: center;
  position: relative;
  z-index: 1;
`;

const StepCircle = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => props.active ? 'linear-gradient(135deg, #b8860b 0%, #d4af37 100%)' : props.completed ? '#4caf50' : '#e0e0e0'};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 10px;
  font-weight: bold;
  transition: all 0.3s ease;
  box-shadow: ${props => props.active ? '0 4px 12px rgba(184, 134, 11, 0.4)' : 'none'};
`;

const StepTitle = styled.div`
  font-size: 0.85rem;
  font-weight: ${props => props.active ? '600' : '400'};
  color: ${props => props.active ? '#b8860b' : '#666'};
  margin-top: 5px;
`;

const PrimaryButton = styled(Button)`
  background: linear-gradient(135deg, #b8860b 0%, #d4af37 100%);
  border: none;
  padding: 12px 30px;
  font-weight: 600;
  border-radius: 25px;
  transition: all 0.3s ease;

  &:hover {
    background: linear-gradient(135deg, #d4af37 0%, #b8860b 100%);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(184, 134, 11, 0.4);
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

function SellerRegistration() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(false);
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

    // Check if user is logged in and load user data
    useEffect(() => {
        const user = authService.getCurrentUser();
        if (!user) {
            toast.error('Vui lòng đăng nhập để đăng ký làm người bán');
            navigate('/login');
            return;
        }
        setCurrentUser(user);

        // Pre-fill form with user data
        setFormData(prev => ({
            ...prev,
            email: user.email || '',
            phone: user.phoneNumber || '',
            fullName: user.fullName || ''
        }));

        // Check if user already has a shop
        checkExistingShop(user._id);
    }, [navigate]);

    const checkExistingShop = async (userId) => {
        try {
            const response = await shopService.checkUserShop(userId);
            if (response.success && response.data) {
                toast.info('Bạn đã có shop. Chuyển đến dashboard...');
                setTimeout(() => navigate('/seller-dashboard'), 1500);
            }
        } catch (error) {
            // No shop found, continue with registration
            console.log('No existing shop, continue registration');
        }
    };

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

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!currentUser) {
            toast.error('Vui lòng đăng nhập để tiếp tục');
            navigate('/login');
            return;
        }

        setLoading(true);

        try {
            // Prepare shop data
            const shopData = {
                sellerId: currentUser._id,
                shopName: formData.shopName,
                description: formData.businessDescription || `Shop chuyên ${formData.businessType}`,
                bannerUrl: 'https://via.placeholder.com/1200x300?text=' + encodeURIComponent(formData.shopName),
                businessType: formData.businessType,
                pickupAddress: formData.pickupAddress,
                taxCode: formData.taxCode
            };

            // Register shop
            const response = await shopService.registerShop(shopData);

            if (response.success) {
                toast.success('🎉 Đăng ký thành công! Chào mừng bạn đến với cộng đồng người bán.');

                // Wait a bit then navigate to dashboard
                setTimeout(() => {
                    navigate('/seller-dashboard');
                }, 2000);
            } else {
                toast.error(response.message || 'Đăng ký thất bại');
            }
        } catch (error) {
            console.error('Registration error:', error);
            toast.error(error.message || 'Có lỗi xảy ra khi đăng ký. Vui lòng thử lại!');
        } finally {
            setLoading(false);
        }
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
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            padding: '3rem 0'
        },
        buttonGroup: {
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '2rem',
            gap: '1rem'
        }
    };

    return (
        <div style={styles.container}>
            <Container>
                <Row className="justify-content-center">
                    <Col md={10} lg={8}>
                        <StyledCard>
                            <Card.Body className="p-5">
                                <div className="text-center mb-4">
                                    <h2 className="mb-2" style={{
                                        background: 'linear-gradient(135deg, #b8860b 0%, #d4af37 100%)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        fontWeight: 'bold',
                                        fontSize: '2rem'
                                    }}>
                                        🏺 Đăng ký trở thành Người bán
                                    </h2>
                                    <p className="text-muted">Để đăng ký bán hàng, bạn cần cung cấp một số thông tin cơ bản</p>
                                </div>

                                {/* Progress Bar */}
                                <StyledProgressBar
                                    now={(currentStep / 5) * 100}
                                    className="mb-4"
                                />

                                {/* Step Indicators */}
                                <StepIndicator>
                                    {steps.map((step, index) => (
                                        <Step key={step.number}>
                                            <StepCircle
                                                active={currentStep === step.number}
                                                completed={currentStep > step.number}
                                            >
                                                {currentStep > step.number ? '✓' : step.number}
                                            </StepCircle>
                                            <StepTitle active={currentStep === step.number}>
                                                {step.title}
                                            </StepTitle>
                                        </Step>
                                    ))}
                                </StepIndicator>

                                {/* Form Content */}
                                <Form onSubmit={handleSubmit}>
                                    {renderStepContent()}

                                    {/* Navigation Buttons */}
                                    <div style={styles.buttonGroup}>
                                        {currentStep > 1 && (
                                            <Button
                                                variant="outline-secondary"
                                                onClick={prevStep}
                                                disabled={loading}
                                                style={{ borderRadius: '25px', padding: '10px 25px' }}
                                            >
                                                ← Quay lại
                                            </Button>
                                        )}

                                        <div className="ms-auto">
                                            {currentStep < 5 ? (
                                                <PrimaryButton
                                                    onClick={nextStep}
                                                    disabled={loading}
                                                >
                                                    Tiếp theo →
                                                </PrimaryButton>
                                            ) : (
                                                <PrimaryButton
                                                    type="submit"
                                                    disabled={loading}
                                                >
                                                    {loading ? (
                                                        <>
                                                            <Spinner
                                                                as="span"
                                                                animation="border"
                                                                size="sm"
                                                                role="status"
                                                                aria-hidden="true"
                                                                className="me-2"
                                                            />
                                                            Đang xử lý...
                                                        </>
                                                    ) : (
                                                        '✓ Hoàn tất đăng ký'
                                                    )}
                                                </PrimaryButton>
                                            )}
                                        </div>
                                    </div>
                                </Form>
                            </Card.Body>
                        </StyledCard>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}

export default SellerRegistration;