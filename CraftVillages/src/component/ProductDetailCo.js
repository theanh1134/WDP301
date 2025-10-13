import React, { useState } from 'react';
import { Container, Row, Col, Button, Form, Tabs, Tab, Card } from 'react-bootstrap';
import { FaFacebook, FaInstagram, FaTwitter, FaShoppingCart, FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';
import { BsArrowLeft } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from './Header';
import Footer from './Footer';
import UspBanner from './USPBanner';
function ProductDetail({ product, onBack }) {
    const [quantity, setQuantity] = useState(1);
    const navigate = useNavigate();

    const increaseQuantity = () => {
        setQuantity(prev => prev + 1);
    };

    const decreaseQuantity = () => {
        if (quantity > 1) {
            setQuantity(prev => prev - 1);
        }
    };

    // Hàm xử lý khi người dùng bấm nút Compare
    const handleCompare = () => {
        // Chuyển hướng đến trang so sánh và truyền thông tin sản phẩm hiện tại
        navigate('/compare', { state: { initialProduct: product } });
    };

    // Tạo component rating stars
    const renderRatingStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating - fullStars >= 0.5;

        // Thêm sao đầy đủ
        for (let i = 0; i < fullStars; i++) {
            stars.push(<FaStar key={`star-${i}`} style={{ color: '#ffc107' }} />);
        }

        // Thêm nửa sao nếu cần
        if (hasHalfStar) {
            stars.push(<FaStarHalfAlt key="half-star" style={{ color: '#ffc107' }} />);
        }

        // Thêm sao trống nếu cần
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        for (let i = 0; i < emptyStars; i++) {
            stars.push(<FaRegStar key={`empty-star-${i}`} style={{ color: '#ffc107' }} />);
        }

        return stars;
    };

    // Danh sách sản phẩm liên quan
    const relatedProducts = [
        {
            id: 1,
            name: 'Nón lá truyền thống',
            category: 'Nón lá thủ công truyền thống',
            price: 75000,
            oldPrice: 100000,
            image: 'https://i.pinimg.com/1200x/4f/54/4d/4f544d2d569a546d345bc89699699691.jpg',
            badge: 'Sale'
        },
        {
            id: 2,
            name: 'Leviosa',
            category: 'Nón lá thủ công truyền thống',
            price: 75000,
            oldPrice: null,
            image: 'https://i.pinimg.com/1200x/4f/54/4d/4f544d2d569a546d345bc89699699691.jpg',
            badge: 'New'
        },
        {
            id: 3,
            name: 'Lolito',
            category: 'Luxury big sofa',
            price: 7000000,
            oldPrice: 14000000,
            image: 'https://i.pinimg.com/1200x/4f/54/4d/4f544d2d569a546d345bc89699699691.jpg',
            badge: 'Sale'
        },
        {
            id: 4,
            name: 'Respira',
            category: 'Outdoor bar table and stool',
            price: 500000,
            oldPrice: null,
            image: 'https://i.pinimg.com/1200x/4f/54/4d/4f544d2d569a546d345bc89699699691.jpg',
            badge: 'New'
        }
    ];

    // Styles
    const styles = {
        breadcrumb: {
            padding: '15px 0',
            backgroundColor: '#f8f9fa',
            marginBottom: '30px'
        },
        breadcrumbItem: {
            display: 'inline-block',
            margin: '0 5px',
            color: '#6c757d',
            textDecoration: 'none',
            fontSize: '14px'
        },
        breadcrumbActive: {
            color: '#333',
            fontWeight: '500'
        },
        productContainer: {
            marginBottom: '50px',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            padding: '30px',
            backgroundColor: '#fff'
        },
        productImage: {
            width: '100%',
            height: 'auto',
            borderRadius: '8px',
            marginBottom: '15px'
        },
        thumbnailContainer: {
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
        },
        thumbnail: {
            width: '70px',
            height: '70px',
            objectFit: 'cover',
            borderRadius: '4px',
            cursor: 'pointer',
            border: '2px solid transparent'
        },
        thumbnailActive: {
            borderColor: '#b8860b'
        },
        productTitle: {
            fontSize: '28px',
            fontWeight: '600',
            marginBottom: '10px',
            color: '#333'
        },
        productPrice: {
            fontSize: '24px',
            fontWeight: '600',
            color: '#b8860b',
            marginRight: '15px'
        },
        productOldPrice: {
            fontSize: '18px',
            color: '#999',
            textDecoration: 'line-through'
        },
        productRating: {
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            marginBottom: '20px'
        },
        ratingText: {
            fontSize: '14px',
            color: '#666',
            marginLeft: '10px'
        },
        productDescription: {
            fontSize: '16px',
            color: '#555',
            lineHeight: '1.6',
            marginBottom: '20px'
        },
        quantityControl: {
            display: 'flex',
            alignItems: 'center',
            marginBottom: '20px'
        },
        quantityBtn: {
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f0f0f0',
            border: 'none',
            fontSize: '18px'
        },
        quantityInput: {
            width: '60px',
            height: '40px',
            textAlign: 'center',
            border: '1px solid #e0e0e0'
        },
        addToCartBtn: {
            backgroundColor: '#b8860b',
            border: 'none',
            padding: '10px 25px',
            fontSize: '16px',
            fontWeight: '600',
            borderRadius: '4px',
            marginRight: '15px'
        },
        compareBtn: {
            backgroundColor: 'white',
            border: '1px solid #b8860b',
            color: '#b8860b',
            padding: '10px 25px',
            fontSize: '16px',
            fontWeight: '600',
            borderRadius: '4px'
        },
        productMeta: {
            marginTop: '30px',
            borderTop: '1px solid #e0e0e0',
            paddingTop: '20px',
            fontSize: '14px'
        },
        metaItem: {
            marginBottom: '10px',
            display: 'flex'
        },
        metaLabel: {
            width: '100px',
            color: '#666',
            fontWeight: '500'
        },
        metaValue: {
            color: '#333'
        },
        socialLinks: {
            marginTop: '10px',
            display: 'flex',
            gap: '15px'
        },
        socialIcon: {
            color: '#333',
            fontSize: '20px'
        },
        tabsContainer: {
            marginTop: '50px',
            marginBottom: '50px'
        },
        tabContent: {
            padding: '30px',
            border: '1px solid #dee2e6',
            borderTop: 'none',
            borderBottomLeftRadius: '4px',
            borderBottomRightRadius: '4px',
            backgroundColor: '#fff'
        },
        productDetailText: {
            fontSize: '16px',
            color: '#555',
            lineHeight: '1.8',
            marginBottom: '20px'
        },
        productDetailImage: {
            width: '100%',
            height: 'auto',
            borderRadius: '8px',
            marginBottom: '30px'
        },
        relatedProductsSection: {
            marginBottom: '50px'
        },
        sectionTitle: {
            fontSize: '28px',
            fontWeight: '600',
            textAlign: 'center',
            marginBottom: '30px',
            color: '#333'
        },
        relatedProductCard: {
            border: 'none',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 5px 15px rgba(0, 0, 0, 0.05)',
            marginBottom: '20px',
            height: '100%',
            cursor: 'pointer'
        },
        relatedProductImage: {
            height: '200px',
            objectFit: 'cover'
        },
        relatedProductBadge: {
            position: 'absolute',
            top: '10px',
            right: '10px',
            padding: '5px 10px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: '600',
            zIndex: '1',
            color: 'white'
        },
        saleBadge: {
            backgroundColor: '#e74c3c'
        },
        newBadge: {
            backgroundColor: '#2ecc71'
        },
        relatedProductName: {
            fontSize: '16px',
            fontWeight: '600',
            marginBottom: '5px',
            color: '#333'
        },
        relatedProductCategory: {
            fontSize: '13px',
            color: '#777',
            marginBottom: '10px'
        },
        relatedProductPrice: {
            fontSize: '16px',
            fontWeight: '600',
            color: '#b8860b'
        },
        relatedProductOldPrice: {
            fontSize: '14px',
            color: '#999',
            textDecoration: 'line-through',
            marginLeft: '10px'
        },
        showMoreBtn: {
            backgroundColor: 'transparent',
            border: '2px solid #b8860b',
            color: '#b8860b',
            padding: '8px 30px',
            fontWeight: '600',
            borderRadius: '4px',
            transition: 'all 0.3s ease'
        },
        backButton: {
            backgroundColor: 'transparent',
            border: 'none',
            color: '#333',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            padding: '0',
            marginBottom: '20px',
            cursor: 'pointer'
        }
    };

    return (
        <>
        <Header/>
        <Container>
            <style>
                {`
                    .nav-tabs .nav-link {
                        color: #666;
                        border: 1px solid #dee2e6;
                        padding: 10px 20px;
                        font-weight: 500;
                    }

                    .nav-tabs .nav-link.active {
                        color: #b8860b;
                        background-color: #fff;
                        border-bottom-color: transparent;
                    }

                    .product-card:hover {
                        transform: translateY(-5px);
                        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
                    }

                    .add-to-cart-btn:hover, .compare-btn:hover, .show-more-btn:hover {
                        transform: translateY(-2px);
                    }

                    .add-to-cart-btn:hover {
                        background-color: #a67c00 !important;
                    }

                    .compare-btn:hover {
                        background-color: #b8860b !important;
                        color: white !important;
                    }

                    .show-more-btn:hover {
                        background-color: #b8860b !important;
                        color: white !important;
                    }

                    .thumbnail:hover {
                        border-color: #b8860b !important;
                    }
                `}
            </style>

            {/* Breadcrumb */}
            <div style={styles.breadcrumb}>

                <span style={styles.breadcrumbItem}>Shop</span>
                <span style={{...styles.breadcrumbItem, ...styles.breadcrumbActive}}>{product.name}</span>
            </div>

            {/* Product Details */}
            <div style={styles.productContainer}>
                <Row>
                    {/* Thumbnails */}
                    <Col md={1} className="d-none d-md-block">
                        <div style={styles.thumbnailContainer}>
                            <img 
                                src={product.image} 
                                alt={product.name} 
                                style={{...styles.thumbnail, ...styles.thumbnailActive}}
                            />
                            {product.additionalImages && product.additionalImages.map((image, index) => (
                                <img 
                                    key={index}
                                    src={image} 
                                    alt={`${product.name} ${index + 1}`} 
                                    style={styles.thumbnail}
                                />
                            ))}
                        </div>
                    </Col>

                    {/* Main Product Image */}
                    <Col md={5}>
                        <img 
                            src={product.image} 
                            alt={product.name} 
                            style={styles.productImage}
                        />
                    </Col>

                    {/* Product Info */}
                    <Col md={6}>
                        <h1 style={styles.productTitle}>{product.name}</h1>
                        
                        <div style={styles.productRating}>
                            {renderRatingStars(product.rating || 4.5)}
                            <span style={styles.ratingText}>
                                {product.rating || 4.5} sao ({product.reviews || 10} customer reviews)
                            </span>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <span style={styles.productPrice}>{product.price.toLocaleString()} VND</span>
                            {product.oldPrice && (
                                <span style={styles.productOldPrice}>{product.oldPrice.toLocaleString()} VND</span>
                            )}
                        </div>

                        <p style={styles.productDescription}>
                            {product.description || 'Nón lá truyền thống được làm từ lá cọ chằng chịt, chắc mảnh, tỉ mỉ được công dân Việt Nam làm thủ công theo triết lý âm dương ngũ hành.'}
                        </p>

                        <div style={styles.quantityControl}>
                            <button style={styles.quantityBtn} onClick={decreaseQuantity}>-</button>
                            <input 
                                type="number" 
                                value={quantity}
                                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                                style={styles.quantityInput}
                                min="1"
                            />
                            <button style={styles.quantityBtn} onClick={increaseQuantity}>+</button>
                        </div>

                        <div style={{ marginBottom: '30px' }}>
                            <Button style={styles.addToCartBtn} className="add-to-cart-btn">
                                Add To Cart
                            </Button>
                            <Button 
                                style={styles.compareBtn} 
                                className="compare-btn"
                                onClick={handleCompare}
                            >
                                + Compare
                            </Button>
                        </div>

                        <div style={styles.productMeta}>
                            <div style={styles.metaItem}>
                                <span style={styles.metaLabel}>SKU:</span>
                                <span style={styles.metaValue}>{product.sku || 'NL001'}</span>
                            </div>
                            <div style={styles.metaItem}>
                                <span style={styles.metaLabel}>Category:</span>
                                <span style={styles.metaValue}>{product.category || 'Nón'}</span>
                            </div>
                            <div style={styles.metaItem}>
                                <span style={styles.metaLabel}>Tags:</span>
                                <span style={styles.metaValue}>
                                    {product.tags ? product.tags.join(', ') : 'Nón lá, Truyền thống, Dân trang'}
                                </span>
                            </div>
                            <div style={styles.metaItem}>
                                <span style={styles.metaLabel}>Share:</span>
                                <div style={styles.socialLinks}>
                                    <a href="#" style={styles.socialIcon}><FaFacebook /></a>
                                    <a href="#" style={styles.socialIcon}><FaInstagram /></a>
                                    <a href="#" style={styles.socialIcon}><FaTwitter /></a>
                                </div>
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>

            {/* Tabs Section */}
            <div style={styles.tabsContainer}>
                <Tabs defaultActiveKey="description" id="product-tabs">
                    <Tab eventKey="description" title="Chi Tiết">
                        <div style={styles.tabContent}>
                            <p style={styles.productDetailText}>
                                {product.longDescription || 
                                `Nón lá Việt Nam truyền thống là một sản phẩm điêu khắc tinh tế, chắc mảnh, tỉ mỉ được công dân Việt Nam làm thủ công theo triết lý âm dương ngũ hành.
                                
                                Mỗi chiếc nón lá Việt được làm thủ công qua nhiều công đoạn: chọn lá, phơi lá, xếp lá, may, căng, chụp, chà và cuối cùng là vẽ. Nhờ vào đôi bàn tay khéo léo của các nghệ nhân và sử dụng 100% nguyên liệu tự nhiên, chúng tôi làm ra một chiếc nón lá truyền thống chắc mảnh, tỉ mỉ, chứa đựng cả tâm hồn dân tộc.`}
                            </p>
                            <Row>
                                <Col md={6}>
                                    <img 
                                        src={product.additionalImages ? product.additionalImages[0] : '/images/non-la-detail1.jpg'} 
                                        alt={`${product.name} - Chi tiết 1`} 
                                        style={styles.productDetailImage}
                                    />
                                </Col>
                                <Col md={6}>
                                    <img 
                                        src={product.additionalImages ? (product.additionalImages[1] || product.additionalImages[0]) : '/images/non-la-detail2.jpg'} 
                                        alt={`${product.name} - Chi tiết 2`} 
                                        style={styles.productDetailImage}
                                    />
                                </Col>
                            </Row>
                        </div>
                    </Tab>
                    <Tab eventKey="additional" title="Thông tin bổ sung">
                        <div style={styles.tabContent}>
                            <p style={styles.productDetailText}>
                                Thông tin bổ sung về sản phẩm {product.name} sẽ được cập nhật sau.
                            </p>
                        </div>
                    </Tab>
                    <Tab eventKey="reviews" title={`Đánh giá (${product.reviews || 5})`}>
                        <div style={styles.tabContent}>
                            <p style={styles.productDetailText}>
                                Hiện có {product.reviews || 5} đánh giá cho sản phẩm {product.name}.
                            </p>
                            {/* Có thể thêm hệ thống đánh giá chi tiết tại đây */}
                        </div>
                    </Tab>
                </Tabs>
            </div>

            {/* Related Products */}
            <section style={styles.relatedProductsSection}>
                <h2 style={styles.sectionTitle}>Related Products</h2>
                <Row className="mt-4">
                    {relatedProducts.map(product => (
                        <Col key={product.id} md={3} sm={6} className="mb-4">
                            <Card style={styles.relatedProductCard} className="product-card">
                                <div style={{ position: 'relative' }}>
                                    {product.badge && (
                                        <div 
                                            style={{
                                                ...styles.relatedProductBadge,
                                                ...(product.badge === 'Sale' ? styles.saleBadge : styles.newBadge)
                                            }}
                                        >
                                            {product.badge}
                                        </div>
                                    )}
                                    <Card.Img 
                                        variant="top" 
                                        src={product.image} 
                                        style={styles.relatedProductImage}
                                    />
                                </div>
                                <Card.Body>
                                    <Card.Title style={styles.relatedProductName}>{product.name}</Card.Title>
                                    <p style={styles.relatedProductCategory}>{product.category}</p>
                                    <div>
                                        <span style={styles.relatedProductPrice}>
                                            {product.price.toLocaleString()} VND
                                        </span>
                                        {product.oldPrice && (
                                            <span style={styles.relatedProductOldPrice}>
                                                {product.oldPrice.toLocaleString()} VND
                                            </span>
                                        )}
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
                <div className="text-center mt-4 mb-5">
                    <Button style={styles.showMoreBtn} className="show-more-btn">Show More</Button>
                </div>
            </section>
        </Container>
        <UspBanner/>
        <Footer/>
        </>
    );
}

export default ProductDetail;