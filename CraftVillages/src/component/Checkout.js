import React, { useEffect, useMemo, useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Badge, InputGroup } from 'react-bootstrap';
import { FaLock, FaInfoCircle, FaCreditCard, FaMoneyBillWave } from 'react-icons/fa';
import './Checkout.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import { sendOrderThankYouEmail } from '../services/emailService';
import userService from '../services/userService';
import { getImageUrl } from '../utils/imageHelper';

function Checkout() {
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [validated, setValidated] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        address: '',
        ward: '',
        district: '',
        city: '',
        country: 'Việt Nam',
        phone: '',
        notes: ''
    });
    const [cartDetail, setCartDetail] = useState({});
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    const user = useMemo(() => {
        try { return JSON.parse(localStorage.getItem('user')) || null; } catch { return null; }
    }, []);

    const navigate = useNavigate();

    useEffect(() => {
        const loadData = async () => {
            // Kiểm tra user đã đăng nhập chưa
            if (!user) {
                alert('Vui lòng đăng nhập để đặt hàng');
                navigate('/login');
                return;
            }

            try {
                setLoading(true);

                // Lấy thông tin user từ database
                const userFromDB = await userService.getUserById(user._id || user.id);
                setUserData(userFromDB);

                // Lấy cart
                await getApiDetail();

                // Prefill form từ thông tin user trong database
                if (userFromDB) {
                    const defaultAddress = Array.isArray(userFromDB.addresses) && userFromDB.addresses.length > 0
                        ? userFromDB.addresses[0]
                        : null;

                    setFormData(prev => ({
                        ...prev,
                        fullName: userFromDB.fullName || '',
                        phone: userFromDB.phoneNumber || '',
                        address: defaultAddress?.street || '',
                        ward: defaultAddress?.ward || '',
                        district: defaultAddress?.district || '',
                        city: defaultAddress?.city || '',
                        country: defaultAddress?.country || 'Việt Nam'
                    }));
                }
            } catch (error) {
                console.error('Error loading user data:', error);
                alert('Không thể tải thông tin người dùng. Vui lòng thử lại.');
            } finally {
                setLoading(false);
            }
        };

        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const getApiDetail = async () => {
        try {
            const res = await axios.get(`http://localhost:9999/carts/${user?._id || user?.id}`);
            const data = res.data.cart;
            setCartDetail(data || {});
        } catch (err) {
            console.error('Error fetching cart:', err);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));

        // Reset validation khi user bắt đầu nhập
        if (validated) {
            setValidated(false);
        }
    };

    const handleSubmit = async (event) => {
        const form = event.currentTarget;
        event.preventDefault();
        event.stopPropagation();

        // Kiểm tra validation tùy chỉnh cho các trường địa chỉ
        const isAddressValid = formData.address.trim() !== '';
        const isWardValid = formData.ward.trim() !== '';
        const isDistrictValid = formData.district.trim() !== '';
        const isCityValid = formData.city.trim() !== '';

        if (form.checkValidity() === false || !isAddressValid || !isWardValid || !isDistrictValid || !isCityValid) {
            setValidated(true);
            return;
        }

        try {
            // Kiểm tra cart có sản phẩm không
            if (!cartDetail || !cartDetail.items || cartDetail.items.length === 0) {
                alert('Giỏ hàng trống. Vui lòng thêm sản phẩm vào giỏ hàng trước khi đặt hàng.');
                navigate('/cart');
                return;
            }

            // Kiểm tra có sản phẩm nào được chọn không
            const selectedItems = cartDetail.items.filter(item => item.isSelected === true);
            if (selectedItems.length === 0) {
                alert('Vui lòng chọn ít nhất một sản phẩm để thanh toán.');
                navigate('/cart');
                return;
            }

            const payload = {
                fullName: formData.fullName,
                shippingAddress: {
                    recipientName: formData.fullName,
                    phoneNumber: formData.phone,
                    fullAddress: [formData.address, formData.ward, formData.district, formData.city, formData.country].filter(Boolean).join(', ')
                },
                paymentMethod: paymentMethod.toUpperCase(),
                note: formData.notes,
                email: userData?.email || user?.email || ''
            };

            console.log('Checkout payload:', payload);
            console.log('User ID:', user?._id || user?.id);
            console.log('User data from DB:', userData);
            console.log('Cart detail:', cartDetail);

            const res = await axios.post(`http://localhost:9999/orders/${user?._id || user?.id}/checkout`, payload);
            if (res.status === 201) {
                // Gửi mail cảm ơn qua EmailJS service (frontend)
                try {
                    await sendOrderThankYouEmail({
                        email: userData?.email || user?.email,
                        fullName: formData.fullName,
                        orderId: res.data?.order?._id,
                        amount: res.data?.order?.finalAmount || total,
                        address: payload.shippingAddress.fullAddress
                    });
                } catch (e) { /* ignore */ }

                // Chuyển sang trang thành công thay vì giỏ hàng
                navigate(`/order-success/${res.data?.order?._id}`, { state: { summary: { total } } });
            }
        } catch (error) {
            console.error('Checkout error:', error);
            console.error('Error response:', error.response?.data);
            alert(`Lỗi đặt hàng: ${error.response?.data?.message || error.message}`);
        }
    };

    // Chỉ lấy items đã được chọn (isSelected = true)
    const selectedItems = useMemo(() => {
        return (cartDetail?.items || []).filter(item => item.isSelected === true);
    }, [cartDetail]);

    const subtotal = useMemo(() => {
        return selectedItems.reduce((sum, it) => sum + (it.priceAtAdd || 0) * (it.quantity || 0), 0);
    }, [selectedItems]);
    const shippingFee = 0; // miễn phí giao hàng
    const total = subtotal + shippingFee;

    if (loading) {
        return (
            <>
                <Header />
                <div className="checkout-page">
                    <Container className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-3">Đang tải thông tin...</p>
                    </Container>
                </div>
            </>
        );
    }

    return (
        <>
            <Header />

            <div className="checkout-page">
                {/* Steps / Banner */}
                <div className="header-banner mb-4">
                    <div className="overlay">
                        <h1 className="text-center text-white">Thanh Toán</h1>
                        <div className="text-center text-white small opacity-75">Giỏ hàng → Thông tin giao hàng → Thanh toán</div>
                    </div>
                </div>

                <Container className="mb-5">
                    <h2 className="mb-4">Thông tin giao hàng</h2>
                    <Form noValidate validated={validated} onSubmit={handleSubmit}>
                        <Row>
                            {/* Left Column - Customer Information */}
                            <Col lg={7} className="mb-4">
                                <Form.Group className="mb-3">
                                    <Form.Label>Họ và tên <span style={{ color: "red" }}>*</span></Form.Label>
                                    <Form.Control
                                        required
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        Vui lòng nhập họ tên.
                                    </Form.Control.Feedback>
                                </Form.Group>

                                {/* <Form.Group className="mb-3">
                                <Form.Label>Tên công ty (Tùy chọn)</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="companyName"
                                    value={formData.companyName}
                                    onChange={handleChange}
                                />
                            </Form.Group> */}

                                {/* <Form.Group className="mb-3">
                                <Form.Label>Quốc gia / Khu vực</Form.Label>
                                <Form.Select
                                    required
                                    name="country"
                                    value={formData.country}
                                    onChange={handleChange}
                                >
                                    <option value="">Chọn quốc gia</option>
                                    <option value="VN">Việt Nam</option>
                                    <option value="US">Hoa Kỳ</option>
                                    <option value="JP">Nhật Bản</option>
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">
                                    Vui lòng chọn quốc gia.
                                </Form.Control.Feedback>
                            </Form.Group> */}

                                <Form.Group className="mb-3">
                                    <Form.Label>Địa chỉ (Số nhà, đường) <span style={{ color: "red" }}>*</span></Form.Label>
                                    <Form.Control
                                        required
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        isInvalid={validated && !formData.address.trim()}
                                    />
                                    <Form.Control.Feedback type="invalid">Vui lòng nhập địa chỉ.</Form.Control.Feedback>
                                </Form.Group>

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Phường/Xã <span style={{ color: "red" }}>*</span></Form.Label>
                                            <Form.Control
                                                required
                                                type="text"
                                                name="ward"
                                                value={formData.ward}
                                                onChange={handleChange}
                                                isInvalid={validated && !formData.ward.trim()}
                                            />
                                            <Form.Control.Feedback type="invalid">Vui lòng nhập phường/xã.</Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Quận/Huyện <span style={{ color: "red" }}>*</span></Form.Label>
                                            <Form.Control
                                                required
                                                type="text"
                                                name="district"
                                                value={formData.district}
                                                onChange={handleChange}
                                                isInvalid={validated && !formData.district.trim()}
                                            />
                                            <Form.Control.Feedback type="invalid">Vui lòng nhập quận/huyện.</Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Tỉnh/Thành phố <span style={{ color: "red" }}>*</span></Form.Label>
                                            <Form.Control
                                                required
                                                type="text"
                                                name="city"
                                                value={formData.city}
                                                onChange={handleChange}
                                                isInvalid={validated && !formData.city.trim()}
                                            />
                                            <Form.Control.Feedback type="invalid">Vui lòng nhập Tỉnh/Thành phố.</Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Quốc gia</Form.Label>
                                            <Form.Control type="text" name="country" value={formData.country} onChange={handleChange} />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Form.Group className="mb-3">


                                </Form.Group>

                                {/* <Form.Group className="mb-3">
                                <Form.Label>ZIP code</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="zipCode"
                                    value={formData.zipCode}
                                    onChange={handleChange}
                                />
                            </Form.Group> */}

                                <Form.Group className="mb-3">
                                    <Form.Label>Số điện thoại <span style={{ color: "red" }}>*</span></Form.Label>
                                    <Form.Control
                                        required
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        Vui lòng nhập số điện thoại.
                                    </Form.Control.Feedback>
                                </Form.Group>

                                {/* Notes */}

                                <Form.Group className="mb-3">
                                    <Form.Label>Thông tin bổ sung</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleChange}
                                        placeholder="Ghi chú về đơn hàng, ví dụ: thời gian hay địa điểm giao hàng chi tiết."
                                    />
                                </Form.Group>
                            </Col>

                            {/* Right Column - Order Summary */}
                            <Col lg={5}>
                                <Card className="mb-4 sticky-summary">
                                    <Card.Body>
                                        <h4 className="mb-3">Đơn hàng của bạn</h4>

                                        {selectedItems.length === 0 ? (
                                            <div className="text-center text-muted py-3">
                                                Chưa có sản phẩm nào được chọn
                                            </div>
                                        ) : (
                                            selectedItems.map(item => (
                                                <div key={item.productId} className="d-flex justify-content-between align-items-center mb-3">
                                                    <div className="d-flex align-items-center" style={{ gap: 12 }}>
                                                        {item.thumbnailUrl && (
                                                            <img src={getImageUrl(item.thumbnailUrl)} alt={item.productName} style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 6 }} />
                                                        )}
                                                        <div>
                                                            <div className="fw-semibold">{item.productName}</div>
                                                            <small className="text-muted">x {item.quantity}</small>
                                                        </div>
                                                    </div>
                                                    <div>{(item.priceAtAdd || 0).toLocaleString()} VND</div>
                                                </div>
                                            ))
                                        )}

                                        <div className="d-flex justify-content-between mb-2 mt-2">
                                            <div className="text-muted">Tạm tính</div>
                                            <div>{subtotal.toLocaleString()} VND</div>
                                        </div>
                                        <div className="d-flex justify-content-between mb-2">
                                            <div className="text-muted">Vận chuyển</div>
                                            <div>{shippingFee === 0 ? 'Miễn phí' : `${shippingFee.toLocaleString()} VND`}</div>
                                        </div>

                                        <div className="d-flex justify-content-between fw-bold mt-3 pt-3 border-top">
                                            <div>Tổng</div>
                                            <div className="text-primary">{total.toLocaleString()} VND</div>
                                        </div>

                                        <div className="mt-4">
                                            <Form.Check
                                                type="radio"
                                                id="payment-bank"
                                                name="paymentMethod"
                                                label={<span><FaCreditCard className="me-2" />Chuyển khoản ngân hàng</span>}
                                                checked={paymentMethod === 'bank'}
                                                onChange={() => setPaymentMethod('bank')}
                                                className="mb-3"
                                            />
                                            {paymentMethod === 'bank' && (
                                                <Card className="bg-light mb-3">
                                                    <Card.Body className="py-3 px-3">
                                                        <small className="text-muted">
                                                            Thực hiện thanh toán của bạn vào tài khoản ngân hàng của chúng tôi. Vui lòng sử dụng ID đơn hàng của bạn như một tham chiếu thanh toán. Đơn hàng của bạn sẽ không được gửi đi cho đến khi tiền đã được chuyển vào tài khoản của chúng tôi.
                                                        </small>
                                                    </Card.Body>
                                                </Card>
                                            )}

                                            <Form.Check
                                                type="radio"
                                                id="payment-cod"
                                                name="paymentMethod"
                                                label={<span><FaMoneyBillWave className="me-2" />Thanh toán khi nhận hàng (COD)</span>}
                                                checked={paymentMethod === 'cod'}
                                                onChange={() => setPaymentMethod('cod')}
                                                className="mb-3"
                                            />
                                            {paymentMethod === 'cod' && (
                                                <Card className="bg-light mb-3">
                                                    <Card.Body className="py-3 px-3">
                                                        <small className="text-muted">
                                                            Dữ liệu cá nhân của bạn sẽ được sử dụng để xử lý đơn hàng, hỗ trợ trải nghiệm của bạn trong toàn trang web này, và các mục đích được mô tả trong chính sách bảo mật của chúng tôi.
                                                        </small>
                                                    </Card.Body>
                                                </Card>
                                            )}
                                        </div>

                                        <Button
                                            variant="outline-primary"
                                            type="submit"
                                            className="w-100 mt-3"
                                            onClick={handleSubmit}
                                        >
                                            Đặt hàng
                                        </Button>

                                        <div className="mt-3 text-center">
                                            <small className="text-muted d-flex align-items-center justify-content-center">
                                                <FaLock className="me-1" /> Thông tin thanh toán được bảo mật
                                            </small>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </Form>
                </Container>

            </div>
        </>
    );
}

export default Checkout;