import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Badge, InputGroup } from 'react-bootstrap';
import { FaLock, FaInfoCircle, FaCreditCard, FaMoneyBillWave } from 'react-icons/fa';
import './Checkout.css';

function Checkout() {
    const [paymentMethod, setPaymentMethod] = useState('bank');
    const [validated, setValidated] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        companyName: '',
        country: '',
        address: '',
        city: '',
        province: 'Western Province',
        zipCode: '',
        phone: '',
        email: '',
        notes: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = (event) => {
        const form = event.currentTarget;
        event.preventDefault();

        if (form.checkValidity() === false) {
            event.stopPropagation();
        } else {
            // Process checkout
            console.log('Processing order...', formData, paymentMethod);
            // Redirect or show success message
        }

        setValidated(true);
    };

    const orderItems = [
        { id: 1, name: 'Nón lá Huế', quantity: 1, price: 80000 }
    ];

    const calculateTotal = () => {
        return orderItems.reduce((total, item) => total + item.price * item.quantity, 0);
    };

    return (
        <div className="checkout-page">
            {/* Header Banner */}
            <div className="header-banner mb-5">
                <div className="overlay">
                    <h1 className="text-center text-white">Thanh Toán</h1>
                    <div className="text-center text-white">
                        <a href="/" className="text-white text-decoration-none">Trang chủ</a> &gt; Thanh toán
                    </div>
                </div>
            </div>

            <Container className="mb-5">
                <h2 className="mb-4">Chi tiết thanh toán</h2>
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                    <Row>
                        {/* Left Column - Customer Information */}
                        <Col lg={7} className="mb-4">
                            <Form.Group className="mb-3">
                                <Form.Label>Họ và tên</Form.Label>
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

                            <Form.Group className="mb-3">
                                <Form.Label>Tên công ty (Tùy chọn)</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="companyName"
                                    value={formData.companyName}
                                    onChange={handleChange}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
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
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Địa chỉ</Form.Label>
                                <Form.Control
                                    required
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                />
                                <Form.Control.Feedback type="invalid">
                                    Vui lòng nhập địa chỉ.
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Thành phố</Form.Label>
                                <Form.Control
                                    required
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                />
                                <Form.Control.Feedback type="invalid">
                                    Vui lòng nhập thành phố.
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Tỉnh</Form.Label>
                                <Form.Select
                                    required
                                    name="province"
                                    value={formData.province}
                                    onChange={handleChange}
                                >
                                    <option value="Western Province">Western Province</option>
                                    <option value="Hà Nội">Hà Nội</option>
                                    <option value="Hồ Chí Minh">Hồ Chí Minh</option>
                                    <option value="Đà Nẵng">Đà Nẵng</option>
                                </Form.Select>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>ZIP code</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="zipCode"
                                    value={formData.zipCode}
                                    onChange={handleChange}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Số điện thoại</Form.Label>
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

                            <Form.Group className="mb-4">
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                    required
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                                <Form.Control.Feedback type="invalid">
                                    Vui lòng nhập email hợp lệ.
                                </Form.Control.Feedback>
                            </Form.Group>

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
                            <Card className="mb-4">
                                <Card.Body>
                                    <h4 className="mb-4">Sản phẩm</h4>

                                    {orderItems.map(item => (
                                        <div key={item.id} className="d-flex justify-content-between mb-2">
                                            <div>
                                                {item.name} <span className="text-muted">x {item.quantity}</span>
                                            </div>
                                            <div>{item.price.toLocaleString()} VND</div>
                                        </div>
                                    ))}

                                    <div className="d-flex justify-content-between mb-2 mt-3">
                                        <div className="text-muted">Hóa đơn</div>
                                        <div>{calculateTotal().toLocaleString()} VND</div>
                                    </div>

                                    <div className="d-flex justify-content-between fw-bold mt-3 pt-3 border-top">
                                        <div>Tổng</div>
                                        <div className="text-primary">{calculateTotal().toLocaleString()} VND</div>
                                    </div>

                                    <div className="mt-4">
                                        <Form.Check
                                            type="radio"
                                            id="payment-bank"
                                            name="paymentMethod"
                                            label="Chuyển khoản ngân hàng trực tiếp"
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
                                            label="Thanh toán khi nhận hàng"
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
    );
}

export default Checkout;