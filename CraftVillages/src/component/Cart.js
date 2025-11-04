import React, { useState } from 'react';
import { Container, Row, Col, Table, Button, Form, Image, Card, InputGroup, Alert, Toast } from 'react-bootstrap';
import { FaTrash, FaArrowLeft, FaShoppingBag, FaTruck, FaUndo, FaShieldAlt, FaHeart, FaTags, FaGift, FaPlus, FaMinus, FaCheckCircle } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from './Header';
import Footer from './Footer';
import { useCart } from '../contexts/CartContext';
import { getImageUrl } from '../utils/imageHelper';

function Cart() {
    const navigate = useNavigate();
    const { cart, loading, error, updateQuantity, removeItem, getCartTotal, toggleItemSelection } = useCart();

    const [promoCode, setPromoCode] = useState('');
    const [promoApplied, setPromoApplied] = useState(false);
    const [discount, setDiscount] = useState(0);
    const [showPromoError, setShowPromoError] = useState(false);
    const [removingItems, setRemovingItems] = useState(new Set());
    const [updatingItems, setUpdatingItems] = useState(new Set());
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    // Enhanced functions with animations
    const showNotification = (message) => {
        setToastMessage(message);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const handleUpdateQuantity = async (productId, newQuantity, item) => {
        if (newQuantity < 1) return;

        // Check stock limit
        if (item?.stock !== undefined && newQuantity > item.stock) {
            showNotification(`Chỉ còn ${item.stock} sản phẩm trong kho`);
            return;
        }

        // Check maxQuantityPerOrder limit
        if (item?.maxQuantityPerOrder !== undefined && newQuantity > item.maxQuantityPerOrder) {
            showNotification(`Chỉ có thể mua tối đa ${item.maxQuantityPerOrder} sản phẩm với giá hiện tại`);
            return;
        }

        setUpdatingItems(prev => new Set([...prev, productId]));
        try {
            await updateQuantity(productId, newQuantity);
            showNotification('Đã cập nhật số lượng sản phẩm');
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Không thể cập nhật số lượng sản phẩm';
            showNotification(errorMsg);
        } finally {
            setUpdatingItems(prev => {
                const next = new Set(prev);
                next.delete(productId);
                return next;
            });
        }
    };

    const handleRemoveItem = async (productId) => {
        setRemovingItems(prev => new Set([...prev, productId]));
        try {
            await removeItem(productId);
            showNotification('Đã xóa khỏi giỏ hàng');
        } catch (err) {
            showNotification('Không thể xóa sản phẩm');
        } finally {
            setRemovingItems(prev => {
                const next = new Set(prev);
                next.delete(productId);
                return next;
            });
        }
    };

    const moveToWishlist = (productId) => {
        const item = cart?.items?.find(item => item.productId === productId);
        setRemovingItems(prev => new Set([...prev, productId]));

        setTimeout(() => {
            handleRemoveItem(productId);
            showNotification(`Đã thêm ${item?.productName} vào danh sách yêu thích`);
        }, 300);
    };

    const handleToggleSelection = async (productId) => {
        try {
            await toggleItemSelection(productId);
        } catch (err) {
            showNotification('Không thể cập nhật lựa chọn');
        }
    };

    const handleSelectAll = async () => {
        const allSelected = cart?.items?.every(item => item.isSelected);
        try {
            for (const item of cart?.items || []) {
                if (item.isSelected !== !allSelected) {
                    await toggleItemSelection(item.productId, !allSelected);
                }
            }
        } catch (err) {
            showNotification('Không thể cập nhật lựa chọn');
        }
    };

    const getSubtotal = () => {
        // Chỉ tính tổng cho items đã chọn
        return cart?.items
            ?.filter(item => item.isSelected)
            ?.reduce((sum, item) => sum + (item.priceAtAdd * item.quantity), 0) || 0;
    };

    const getTotal = () => {
        return getSubtotal() - discount;
    };

    const getItemCount = () => {
        return cart?.items?.length || 0;
    };

    const getSelectedItemCount = () => {
        return cart?.items?.filter(item => item.isSelected)?.length || 0;
    };

    const getSavings = () => {
        if (!cart?.items) return 0;
        return cart.items.reduce((sum, item) => {
            // Assuming original price is stored in the product data
            const originalTotal = (item.originalPrice || item.priceAtAdd) * item.quantity;
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
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="alert alert-danger" role="alert">
                            {error}
                        </div>
                    ) : !cart?.items?.length ? (
                        <div style={styles.emptyCartContainer}>
                            <div style={styles.emptyCartIcon}>
                                <FaShoppingBag />
                            </div>
                            <h3>Giỏ hàng của bạn đang trống</h3>
                            <p className="mb-4 text-muted">Thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm</p>
                            <Link to="/">
                                <Button variant="primary" size="lg">
                                    Tiếp tục mua sắm
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <Row>
                            <Col lg={8} className="mb-4">
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h4 className="mb-0">Giỏ hàng của bạn ({cart?.items?.length || 0} sản phẩm)</h4>

                                </div>

                                <Card className="mb-4 border-0 shadow-sm">
                                    <Card.Body className="p-0">
                                        <Table responsive className="mb-0">
                                            <thead>
                                                <tr>
                                                    <th style={{...styles.tableHeader, width: '50px'}}>
                                                        <Form.Check
                                                            type="checkbox"
                                                            checked={cart?.items?.every(item => item.isSelected)}
                                                            onChange={handleSelectAll}
                                                            aria-label="Chọn tất cả"
                                                        />
                                                    </th>
                                                    <th style={styles.tableHeader}>Sản phẩm</th>
                                                    <th style={styles.tableHeader}>Giá</th>
                                                    <th style={styles.tableHeader}>Số lượng</th>
                                                    <th style={styles.tableHeader}>Đơn giá</th>
                                                    <th style={styles.tableHeader}></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {cart?.items?.map(item => {
                                                    {/* const discountPercent = item.originalPrice > item.priceAtAdd
                                                        ? Math.round((1 - item.priceAtAdd / item.originalPrice) * 100)
                                                        : 0; */}

                                                    return (
                                                        <tr
                                                            key={item.productId}
                                                            className={`cart-item ${removingItems.has(item.productId) ? 'removing' : ''} ${updatingItems.has(item.productId) ? 'updating' : ''}`}
                                                            style={{
                                                                opacity: item.isSelected ? 1 : 0.6,
                                                                backgroundColor: item.isSelected ? 'transparent' : '#f8f9fa'
                                                            }}
                                                        >
                                                            <td style={{...styles.tableCell, verticalAlign: 'middle'}}>
                                                                <Form.Check
                                                                    type="checkbox"
                                                                    checked={item.isSelected || false}
                                                                    onChange={() => handleToggleSelection(item.productId)}
                                                                    aria-label={`Chọn ${item.productName}`}
                                                                />
                                                            </td>
                                                            <td style={styles.tableCell}>
                                                                <div className="d-flex align-items-center">
                                                                    <Image src={getImageUrl(item.thumbnailUrl)} alt={item.productName} style={styles.productImage} />
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
                                                                <div>
                                                                    <InputGroup className="quantity-selector" style={styles.quantityInput}>
                                                                        <Button
                                                                            variant="outline-secondary"
                                                                            size="sm"
                                                                            className="quantity-btn"
                                                                            onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1, item)}
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
                                                                            onChange={(e) => handleUpdateQuantity(item.productId, parseInt(e.target.value) || 1, item)}
                                                                            aria-label="Số lượng sản phẩm"
                                                                            min="1"
                                                                            max={item.maxQuantityPerOrder || item.stock || 999}
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
                                                                            onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1, item)}
                                                                            disabled={
                                                                                updatingItems.has(item.productId) ||
                                                                                (item.maxQuantityPerOrder && item.quantity >= item.maxQuantityPerOrder) ||
                                                                                (item.stock && item.quantity >= item.stock)
                                                                            }
                                                                            aria-label="Tăng số lượng"
                                                                            style={{
                                                                                borderColor: '#b8860b',
                                                                                color: '#b8860b',
                                                                                opacity: (item.maxQuantityPerOrder && item.quantity >= item.maxQuantityPerOrder) ||
                                                                                        (item.stock && item.quantity >= item.stock) ? 0.5 : 1
                                                                            }}
                                                                        >
                                                                            <FaPlus />
                                                                        </Button>
                                                                    </InputGroup>

                                                                    {/* Show stock warning */}
                                                                    {item.maxQuantityPerOrder && item.maxQuantityPerOrder < (item.stock || 0) && (
                                                                        <div style={{
                                                                            fontSize: '0.75rem',
                                                                            color: '#ff6b6b',
                                                                            marginTop: '4px'
                                                                        }}>
                                                                            Tối đa {item.maxQuantityPerOrder} sp/đơn
                                                                        </div>
                                                                    )}

                                                                    {/* Show out of stock warning */}
                                                                    {item.stock === 0 && (
                                                                        <div style={{
                                                                            fontSize: '0.75rem',
                                                                            color: '#dc3545',
                                                                            marginTop: '4px',
                                                                            fontWeight: 'bold'
                                                                        }}>
                                                                            Hết hàng
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td style={styles.tableCell}>
                                                                <strong>{(+item?.priceAtAdd * +item?.quantity).toLocaleString()} VND</strong>
                                                            </td>
                                                            <td style={styles.tableCell}>
                                                                <div className="d-flex flex-column align-items-center">
                                                                    <button
                                                                        style={styles.removeButton}
                                                                        onClick={() => handleRemoveItem(item.productId)}
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

                                        {getSelectedItemCount() < getItemCount() && (
                                            <Alert variant="info" className="py-2 mb-3" style={{fontSize: '0.9rem'}}>
                                                Đã chọn {getSelectedItemCount()}/{getItemCount()} sản phẩm
                                            </Alert>
                                        )}

                                        <div style={styles.summaryRow}>
                                            <span>Tạm tính ({getSelectedItemCount()} sản phẩm)</span>
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
                                            disabled={getSelectedItemCount() === 0}
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