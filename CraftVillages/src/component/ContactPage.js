import React, { useState } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { FaMapMarkerAlt, FaPhoneAlt, FaClock } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from './Header';

const ContactPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });

    const [validated, setValidated] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const form = e.currentTarget;

        if (form.checkValidity() === false) {
            e.stopPropagation();
            setValidated(true);
            return;
        }

        // Xử lý gửi form
        console.log('Form data submitted:', formData);
        alert('Form đã được gửi thành công!');

        // Reset form
        setFormData({
            name: '',
            email: '',
            subject: '',
            message: '',
        });
        setValidated(false);
    };

    return (
        <>
        <Header/>
        <Container className="py-5">
            <Row className="justify-content-center text-center mb-5">
                <Col md={8}>
                    <h1 className="contact-heading">Liên hệ với chúng tôi</h1>
                    <p className="contact-description text-muted">
                        Để biết thêm thông tin về sản phẩm và dịch vụ của chúng tôi, vui lòng gửi email cho
                        chúng tôi. Đội ngũ nhân viên của chúng tôi luôn sẵn sàng hỗ trợ bạn. Đừng ngần ngại!
                    </p>
                </Col>
            </Row>

            <Row className="mt-5">
                <Col md={5} lg={4}>
                    <div className="contact-info mb-5">
                        <div className="contact-item d-flex mb-4">
                            <div className="icon me-3">
                                <FaMapMarkerAlt size={24} />
                            </div>
                            <div className="content">
                                <h5 className="mb-2">Address</h5>
                                <p className="mb-0">Hóa lạc Hà Nội</p>
                            </div>
                        </div>

                        <div className="contact-item d-flex mb-4">
                            <div className="icon me-3">
                                <FaPhoneAlt size={24} />
                            </div>
                            <div className="content">
                                <h5 className="mb-2">Phone</h5>
                                <p className="mb-0">Mobile: +(84) 546-6789</p>
                                <p className="mb-0">Hotline: +(84) 456-6789</p>
                            </div>
                        </div>

                        <div className="contact-item d-flex mb-4">
                            <div className="icon me-3">
                                <FaClock size={24} />
                            </div>
                            <div className="content">
                                <h5 className="mb-2">Working Time</h5>
                                <p className="mb-0">Thứ Hai - Thứ Sáu: 9:00 - 22:00</p>
                                <p className="mb-0">Thứ Bảy - Chủ Nhật: 9:00 - 21:00</p>
                            </div>
                        </div>
                    </div>
                </Col>

                <Col md={7} lg={8}>
                    <Form noValidate validated={validated} onSubmit={handleSubmit}>
                        <Form.Group className="mb-4" controlId="contactName">
                            <Form.Label>Tên</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                placeholder="Abc"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                            <Form.Control.Feedback type="invalid">
                                Vui lòng nhập tên của bạn.
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-4" controlId="contactEmail">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                placeholder="Abc@def.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                            <Form.Control.Feedback type="invalid">
                                Vui lòng nhập email hợp lệ.
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-4" controlId="contactSubject">
                            <Form.Label>Tiêu đề</Form.Label>
                            <Form.Control
                                type="text"
                                name="subject"
                                placeholder="This is an optional"
                                value={formData.subject}
                                onChange={handleChange}
                            />
                        </Form.Group>

                        <Form.Group className="mb-4" controlId="contactMessage">
                            <Form.Label>Nội dung</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={5}
                                name="message"
                                placeholder="Hi! I'd like to ask about"
                                value={formData.message}
                                onChange={handleChange}
                                required
                            />
                            <Form.Control.Feedback type="invalid">
                                Vui lòng nhập nội dung tin nhắn.
                            </Form.Control.Feedback>
                        </Form.Group>

                        <div className="d-grid">
                            <Button
                                type="submit"
                                variant="primary"
                                className="submit-button py-3"
                            >
                                Gửi
                            </Button>
                        </div>
                    </Form>
                </Col>
            </Row>
        </Container>
        </>
    );
};

export default ContactPage;