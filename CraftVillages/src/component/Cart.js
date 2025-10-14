import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Table, Button, Form, Image, Card, InputGroup, Alert, Toast } from 'react-bootstrap';
import { FaTrash, FaArrowLeft, FaShoppingBag, FaTruck, FaUndo, FaShieldAlt, FaHeart, FaTags, FaGift, FaPlus, FaMinus, FaCheckCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from './Header';
import Footer from './Footer';
import axios from 'axios';

function Cart() {
    const [cartDetail, setCartDetail] = useState({})
    const [cartItems, setCartItems] = useState([
        {
            id: 1,
            name: 'Nón lá Huế',
            image: 'https://i.pinimg.com/736x/b5/96/d4/b596d46dabe0bc0e1271a366fa4e45eb.jpg',
            price: 80000,
            originalPrice: 100000,
            quantity: 1,
            total: 80000,
            inStock: true,
            category: 'Nón lá',
            material: 'Lá cọ, tre',
            origin: 'Huế',
            weight: '200g',
            size: 'M (56-58cm)',
            description: 'Nón lá Huế truyền thống được làm thủ công từ lá cọ và khung tre'
        },
        {
            id: 2,
            name: 'Nón lá truyền thống',
            image: 'https://i.pinimg.com/1200x/4f/54/4d/4f544d2d569a546d345bc89699699691.jpg',
            price: 120000,
            originalPrice: 120000,
            quantity: 1,
            total: 120000,
            inStock: true,
            category: 'Nón lá',
            material: 'Lá cọ, tre',
            origin: 'Quảng Nam',
            weight: '180g',
            size: 'L (58-60cm)',
            description: 'Nón lá truyền thống với thiết kế tinh tế và bền đẹp'
        }
    ]);

    const [promoCode, setPromoCode] = useState('');
    const [promoApplied, setPromoApplied] = useState(false);
    const [discount, setDiscount] = useState(0);
    const [showPromoError, setShowPromoError] = useState(false);
    const [removingItems, setRemovingItems] = useState(new Set());
    const [updatingItems, setUpdatingItems] = useState(new Set());
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        getApiDetail();
    },[])

    const getApiDetail = async () => {

    const value = localStorage.getItem("user");
    const user = value ? JSON.parse(value) : null;

    const a = "68ecbfd70c4c63b9aa2fe139"
      try {
        const res = await axios.get(`http://localhost:9999/carts/${a}`);
        const data = res.data.cart;
        console.log(res.data.cart)
        setCartDetail(data);
      } catch (err) {
        console.error("Error fetching product detail:", err);
      }
      
    };

    // Enhanced functions with animations
    const showNotification = (message) => {
        setToastMessage(message);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const updateQuantity = async (id, newQuantity) => {
        const payload = {
            userId: cartDetail.userId, productId:id, quantity: newQuantity
        }

        const res = await axios.put(`http://localhost:9999/carts/quantity`, payload);

        if (res.status === 200) {
            getApiDetail();
            showNotification('Đã cập nhật số lượng sản phẩm');

        }
    };

    const removeItem = async (id) => {
        const res = await axios.delete(`http://localhost:9999/carts/${cartDetail.userId}/item/${id}`);

        // Animate removal
        if(res.status === 200) {
            getApiDetail();
            showNotification(`Đã xóa khỏi giỏ hàng`);
        }
    };

    const moveToWishlist = (id) => {
        const item = cartItems.find(item => item.productId === id);
        setRemovingItems(prev => new Set([...prev, id]));

        setTimeout(() => {
            removeItem(id);
            showNotification(`Đã thêm ${item?.name} vào danh sách yêu thích`);
        }, 300);
    };

    const getSubtotal = () => {
        return cartItems.reduce((sum, item) => sum + item.total, 0);
    };

    const getTotal = () => {
        const subtotal = getSubtotal();
        return subtotal - discount;
    };

    const getItemCount = () => {
        // return cartItems.reduce((count, item) => count + item.quantity, 0);
    };

    const getSavings = () => {
        return cartItems.reduce((sum, item) => {
            const originalTotal = item.originalPrice * item.quantity;
            const currentTotal = item.priceAtAdd * item.quantity;
            return sum + (originalTotal - currentTotal);
        }, 0) + discount;
    };

    const handlePromoCodeApply = () => {
        // Giả lập mã khuyến mãi "WELCOME10" giảm 10% tổng giá trị đơn hàng
        if (promoCode.toUpperCase() === 'WELCOME10') {
            const discountAmount = Math.round(getSubtotal() * 0.1);
            setDiscount(discountAmount);
            setPromoApplied(true);
            setShowPromoError(false);
        } else {
            setShowPromoError(true);
            setPromoApplied(false);
            setDiscount(0);
        }
    };


    const styles = {
        // Enhanced Header Banner
        headerBanner: {
            background: 'linear-gradient(135deg, rgba(184, 134, 11, 0.8), rgba(212, 175, 55, 0.6)), url(https://i.pinimg.com/originals/3e/1c/41/3e1c41dba63ab7e3add0ad5cb6d6c4a4.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            height: '280px',
            position: 'relative',
            marginBottom: '50px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden'
        },
        cartTitle: {
            fontSize: '3rem',
            fontWeight: '800',
            color: 'white',
            marginBottom: '10px',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
            animation: 'fadeInUp 1s ease-out'
        },
        breadcrumb: {
            color: 'white',
            opacity: 0.95,
            fontSize: '1.1rem'
        },
        breadcrumbLink: {
            color: 'white',
            textDecoration: 'none',
            transition: 'all 0.3s ease',
            position: 'relative'
        },
        productImage: {
            width: '90px',
            height: '90px',
            objectFit: 'cover',
            borderRadius: '6px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
        },
        tableHeader: {
            backgroundColor: '#f9f5f0',
            padding: '15px',
            fontWeight: '600',
            color: '#333'
        },
        tableCell: {
            verticalAlign: 'middle',
            padding: '15px',
            borderTop: '1px solid #eee'
        },
        quantityInput: {
            width: '70px',
            textAlign: 'center',
            borderRadius: '4px',
            border: '1px solid #ddd'
        },
        removeButton: {
            color: '#dc3545',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '5px',
            borderRadius: '50%',
            transition: 'all 0.2s'
        },
        wishlistButton: {
            color: '#6c757d',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            marginTop: '5px',
            fontSize: '0.85rem',
            transition: 'all 0.2s'
        },
        summaryCard: {
            backgroundColor: '#f9f5f0',
            padding: '25px',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
        },
        summaryTitle: {
            fontSize: '1.4rem',
            marginBottom: '20px',
            fontWeight: 'bold',
            color: '#333',
            borderBottom: '1px solid #e5e5e5',
            paddingBottom: '10px'
        },
        summaryRow: {
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '15px',
            fontSize: '0.95rem'
        },
        summaryTotal: {
            display: 'flex',
            justifyContent: 'space-between',
            paddingTop: '15px',
            marginTop: '15px',
            borderTop: '1px solid #ddd',
            fontWeight: 'bold',
            color: '#000',
            fontSize: '1.1rem'
        },
        checkoutButton: {
            backgroundColor: '#b8860b',
            color: 'white',
            border: 'none',
            padding: '12px',
            width: '100%',
            fontSize: '1rem',
            fontWeight: '600',
            marginTop: '15px',
            transition: 'all 0.3s',
            borderRadius: '4px'
        },
        continueShoppingBtn: {
            color: '#555',
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            marginTop: '20px',
            fontWeight: '500',
            transition: 'all 0.3s'
        },
        discountedPrice: {
            fontSize: '0.9rem',
            textDecoration: 'line-through',
            color: '#999',
            marginLeft: '8px'
        },
        discountBadge: {
            backgroundColor: '#e74c3c',
            color: 'white',
            fontSize: '0.75rem',
            padding: '3px 8px',
            borderRadius: '3px',
            marginLeft: '8px',
            fontWeight: 'bold'
        },
        benefitIcon: {
            marginRight: '10px',
            color: '#b8860b'
        },
        benefitItem: {
            display: 'flex',
            alignItems: 'center',
            marginBottom: '10px',
            fontSize: '0.9rem'
        },
        emptyCartContainer: {
            textAlign: 'center',
            padding: '60px 0',
            marginBottom: '40px'
        },
        emptyCartIcon: {
            fontSize: '5rem',
            color: '#ddd',
            marginBottom: '20px'
        },
        promoCode: {
            border: '1px solid #ddd',
            borderRadius: '4px'
        }
    };

    return (
        <div>
            <Header />

            {/* Enhanced CSS Animations */}
            <style>
                {`
                    @keyframes fadeInUp {
                        from {
                            opacity: 0;
                            transform: translateY(30px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }

                    @keyframes slideOut {
                        from {
                            opacity: 1;
                            transform: translateX(0) scale(1);
                        }
                        to {
                            opacity: 0;
                            transform: translateX(-100px) scale(0.8);
                        }
                    }

                    @keyframes bounce {
                        0%, 20%, 50%, 80%, 100% {
                            transform: translateY(0);
                        }
                        40% {
                            transform: translateY(-10px);
                        }
                        60% {
                            transform: translateY(-5px);
                        }
                    }

                    @keyframes pulse {
                        0% { transform: scale(1); }
                        50% { transform: scale(1.05); }
                        100% { transform: scale(1); }
                    }

                    .cart-item {
                        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                        animation: fadeInUp 0.6s ease-out;
                    }

                    .cart-item.removing {
                        animation: slideOut 0.5s ease-in-out forwards;
                    }

                    .cart-item.updating {
                        animation: pulse 0.3s ease-in-out;
                    }

                    .cart-item:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
                    }

                    .quantity-btn {
                        transition: all 0.2s ease;
                    }

                    .quantity-btn:hover {
                        transform: scale(1.1);
                        background-color: #b8860b !important;
                        border-color: #b8860b !important;
                    }

                    .remove-btn {
                        transition: all 0.3s ease;
                    }

                    .remove-btn:hover {
                        transform: scale(1.1);
                        background-color: #e74c3c !important;
                        border-color: #e74c3c !important;
                    }

                    .promo-success {
                        animation: bounce 0.6s ease-out;
                    }

                    .checkout-btn {
                        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                        position: relative;
                        overflow: hidden;
                    }

                    .checkout-btn:hover {
                        transform: translateY(-3px);
                        box-shadow: 0 12px 35px rgba(184, 134, 11, 0.4);
                    }

                    .checkout-btn::before {
                        content: '';
                        position: absolute;
                        top: 0;
                        left: -100%;
                        width: 100%;
                        height: 100%;
                        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
                        transition: left 0.6s ease;
                    }

                    .checkout-btn:hover::before {
                        left: 100%;
                    }

                    .toast-notification {
                        position: fixed;
                        top: 100px;
                        right: 20px;
                        z-index: 1050;
                        animation: fadeInUp 0.3s ease-out;
                    }
                `}
            </style>

            <div className="cart-page pb-5" style={{ backgroundColor: '#fafafa' }}>
                <div style={styles.headerBanner}>
                    <h1 style={styles.cartTitle}>Giỏ hàng</h1>
                    <div style={styles.breadcrumb}>
                        <Link to="/" style={styles.breadcrumbLink}>Trang Chủ</Link> &gt; <span>Giỏ hàng</span>
                    </div>
                </div>

                <Container>
                    {cartDetail?.items?.length === 0 ? (
                        <div style={styles.emptyCartContainer}>
                            <div style={styles.emptyCartIcon}>
                                <FaShoppingBag />
                            </div>
                            <h3>Giỏ hàng của bạn đang trống</h3>
                            <p className="mb-4 text-muted">Thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm</p>
                            <Link to="/products">
                                <Button variant="primary" size="lg">
                                    Tiếp tục mua sắm
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <Row>
                            <Col lg={8} className="mb-4">
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h4 className="mb-0">Giỏ hàng của bạn ({cartDetail?.items?.length} sản phẩm)</h4>
                                    <Link to="/products" style={styles.continueShoppingBtn}>
                                        <FaArrowLeft style={{ marginRight: '8px' }} /> Tiếp tục mua sắm
                                    </Link>
                                </div>

                                <Card className="mb-4 border-0 shadow-sm">
                                    <Card.Body className="p-0">
                                        <Table responsive className="mb-0">
                                            <thead>
                                                <tr>
                                                    <th style={styles.tableHeader}>Sản phẩm</th>
                                                    <th style={styles.tableHeader}>Giá</th>
                                                    <th style={styles.tableHeader}>Số lượng</th>
                                                    <th style={styles.tableHeader}>Đơn giá</th>
                                                    <th style={styles.tableHeader}></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {cartDetail?.items?.map(item => {
                                                    {/* const discountPercent = item.originalPrice > item.priceAtAdd
                                                        ? Math.round((1 - item.priceAtAdd / item.originalPrice) * 100)
                                                        : 0; */}

                                                    return (
                                                        <tr
                                                            key={item.productId}
                                                            className={`cart-item ${removingItems.has(item.productId) ? 'removing' : ''} ${updatingItems.has(item.productId) ? 'updating' : ''}`}
                                                        >
                                                            <td style={styles.tableCell}>
                                                                <div className="d-flex align-items-center">
                                                                    <Image src={item.thumbnailUrl} alt={item.productName} style={styles.productImage} />
                                                                    <div className="ms-3">
                                                                        <Link to={`/products/${item.productId}`} className="text-decoration-none">
                                                                            <h6 className="mb-1">{item.productName}</h6>
                                                                        </Link>
                                                                        {/* {!item.inStock && (
                                                                            <div className="text-danger small">Hết hàng</div>
                                                                        )} */}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td style={styles.tableCell}>
                                                                <div>
                                                                    <span>{item.priceAtAdd?.toLocaleString()} VND</span>
                                                                    {/* {discountPercent > 0 && ( */}
                                                                        <>
                                                                            {/* <span style={styles.discountedPrice}>{item.priceAtAddAtAdd.toLocaleString()} VND</span> */}
                                                                            {/* <span style={styles.discountBadge}>-{discountPercent}%</span> */}
                                                                        </>
                                                                    {/* )} */}
                                                                </div>
                                                            </td>
                                                            <td style={styles.tableCell}>
                                                                <InputGroup className="quantity-selector" style={styles.quantityInput}>
                                                                    <Button
                                                                        variant="outline-secondary"
                                                                        size="sm"
                                                                        className="quantity-btn"
                                                                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                                                        disabled={item.quantity <= 1 || updatingItems.has(item.productId)}
                                                                        aria-label="Giảm số lượng"
                                                                        style={{
                                                                            borderColor: '#b8860b',
                                                                            color: '#b8860b'
                                                                        }}
                                                                    >
                                                                        <FaMinus />
                                                                    </Button>
                                                                    <Form.Control
                                                                        className="text-center border-0"
                                                                        value={updatingItems.has(item.productId) ? '...' : item.quantity}
                                                                        onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value) || 1)}
                                                                        aria-label="Số lượng sản phẩm"
                                                                        min="1"
                                                                        disabled={updatingItems.has(item.productId)}
                                                                        style={{
                                                                            fontWeight: '600',
                                                                            fontSize: '1rem'
                                                                        }}
                                                                    />
                                                                    <Button
                                                                        variant="outline-secondary"
                                                                        size="sm"
                                                                        className="quantity-btn"
                                                                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                                                        disabled={updatingItems.has(item.productId)}
                                                                        aria-label="Tăng số lượng"
                                                                        style={{
                                                                            borderColor: '#b8860b',
                                                                            color: '#b8860b'
                                                                        }}
                                                                    >
                                                                        <FaPlus />
                                                                    </Button>
                                                                </InputGroup>
                                                            </td>
                                                            <td style={styles.tableCell}>
                                                                <strong>{(+item?.priceAtAdd *+item?.quantity ).toLocaleString()} VND</strong>
                                                            </td>
                                                            <td style={styles.tableCell}>
                                                                <div className="d-flex flex-column align-items-center">
                                                                    <button
                                                                        style={styles.removeButton}
                                                                        onClick={() => removeItem(item.productId)}
                                                                        aria-label="Xóa sản phẩm"
                                                                    >
                                                                        <FaTrash />
                                                                    </button>
                                                                    <button
                                                                        style={styles.wishlistButton}
                                                                        onClick={() => moveToWishlist(item.productId)}
                                                                        aria-label="Thêm vào danh sách yêu thích"
                                                                    >
                                                                        <FaHeart className="me-1" /> Lưu
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </Table>
                                    </Card.Body>
                                </Card>

                                <Card className="mb-4 border-0 shadow-sm">
                                    <Card.Body>
                                        <h5 className="mb-3">Mã khuyến mãi</h5>
                                        {showPromoError && (
                                            <Alert variant="danger" className="py-2">
                                                Mã khuyến mãi không hợp lệ
                                            </Alert>
                                        )}
                                        {promoApplied && (
                                            <Alert variant="success" className="py-2">
                                                Đã áp dụng mã giảm giá WELCOME10!
                                            </Alert>
                                        )}
                                        <InputGroup>
                                            <Form.Control
                                                placeholder="Nhập mã khuyến mãi"
                                                value={promoCode}
                                                onChange={(e) => setPromoCode(e.target.value)}
                                                style={styles.promoCode}
                                            />
                                            <Button
                                                variant="outline-secondary"
                                                onClick={handlePromoCodeApply}
                                            >
                                                Áp dụng
                                            </Button>
                                        </InputGroup>
                                        <div className="text-muted mt-2 small">
                                            <FaTags className="me-2" />
                                            Thử mã "WELCOME10" để được giảm 10% đơn hàng
                                        </div>
                                    </Card.Body>
                                </Card>

                            </Col>

                            <Col lg={4}>
                                <Card className="border-0 shadow-sm mb-4">
                                    <Card.Body style={styles.summaryCard}>
                                        <h3 style={styles.summaryTitle}>Tổng giỏ hàng</h3>

                                        <div style={styles.summaryRow}>
                                            <span>Tạm tính ({getItemCount()} sản phẩm)</span>
                                            <span>{getSubtotal().toLocaleString()} VND</span>
                                        </div>

                                        {discount > 0 && (
                                            <div style={styles.summaryRow}>
                                                <span>Giảm giá</span>
                                                <span className="text-danger">-{discount.toLocaleString()} VND</span>
                                            </div>
                                        )}

                                        <div style={styles.summaryRow}>
                                            <span>Phí vận chuyển</span>
                                            <span>Miễn phí</span>
                                        </div>

                                        <div style={{ ...styles.summaryRow, fontWeight: '500' }}>
                                            <span>Tiết kiệm</span>
                                            <span className="text-success">{getSavings().toLocaleString()} VND</span>
                                        </div>

                                        <div style={styles.summaryTotal}>
                                            <span>Tổng cộng</span>
                                            <span>{getTotal().toLocaleString()} VND</span>
                                        </div>

                                        <Button
                                            style={styles.checkoutButton}
                                            href="/checkout"
                                            className="hover-effect"
                                        >
                                            Thanh toán
                                        </Button>

                                        <div className="text-center mt-3">
                                            <small className="text-muted">Bằng cách thanh toán, bạn đồng ý với <a href="/terms" className="text-decoration-none">Điều khoản</a> của chúng tôi</small>
                                        </div>
                                    </Card.Body>
                                </Card>

                                <Card className="border-0 shadow-sm mb-4">
                                    <Card.Body>
                                        <h5 className="mb-3 fw-bold">Thông tin vận chuyển</h5>
                                        <div style={styles.benefitItem}>
                                            <FaTruck style={styles.benefitIcon} />
                                            <span>Miễn phí vận chuyển cho đơn hàng từ 500.000đ</span>
                                        </div>
                                        <div style={styles.benefitItem}>
                                            <FaUndo style={styles.benefitIcon} />
                                            <span>Đổi trả trong 30 ngày nếu không hài lòng</span>
                                        </div>
                                        <div style={styles.benefitItem}>
                                            <FaShieldAlt style={styles.benefitIcon} />
                                            <span>Thanh toán an toàn & bảo mật</span>
                                        </div>
                                        <div style={styles.benefitItem}>
                                            <FaGift style={styles.benefitIcon} />
                                            <span>Hỗ trợ gói quà và thêm thiệp</span>
                                        </div>
                                    </Card.Body>
                                </Card>

                                <Card className="border-0 shadow-sm mb-4 bg-light">
                                    <Card.Body className="py-3">
                                        <h6 className="mb-0">Cần hỗ trợ?</h6>
                                        <p className="mb-0 small">Gọi <a href="tel:1900123456" className="text-decoration-none">1900 123 456</a> (8h-20h)</p>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    )}
                    <Footer />
                </Container>

                {/* Toast Notification */}
                {showToast && (
                    <div className="toast-notification">
                        <Alert
                            variant="success"
                            className="d-flex align-items-center"
                            style={{
                                background: 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)',
                                border: 'none',
                                color: 'white',
                                borderRadius: '10px',
                                boxShadow: '0 8px 25px rgba(46, 204, 113, 0.3)'
                            }}
                        >
                            <FaCheckCircle className="me-2" />
                            {toastMessage}
                        </Alert>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Cart;