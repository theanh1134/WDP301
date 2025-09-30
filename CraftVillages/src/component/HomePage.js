// HomePage.js
import React, { useState } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { FaShoppingCart, FaSearch, FaEye } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import ProductDetail from './ProductDetail'; // Giả sử bạn đã có component ProductDetail

function HomePage() {
    const [selectedProduct, setSelectedProduct] = useState(null);

    // Dữ liệu danh mục sản phẩm
    const categories = [
        {
            id: 1,
            name: 'Sản phẩm Tre mây',
            image: 'https://i.pinimg.com/1200x/9b/f8/d3/9bf8d3e9356e5b4139adc73d42b482a0.jpg',
        },
        {
            id: 2,
            name: 'Sản phẩm Gốm',
            image: 'https://i.pinimg.com/1200x/20/cd/49/20cd49f1f2fea4e207037027f4be4e05.jpg',
        },
        {
            id: 3,
            name: 'Sản phẩm Lụa',
            image: 'https://i.pinimg.com/1200x/a6/97/ea/a697ea74a6388e699b1683f6649d4e74.jpg',
        },
    ];

    // Dữ liệu sản phẩm
    const products = [
        {
            id: 1,
            name: 'Nón lá truyền thống',
            origin: 'Nam Định - Thái Bình',
            price: 75000,
            oldPrice: 100000,
            image: 'https://i.pinimg.com/1200x/4f/54/4d/4f544d2d569a546d345bc89699699691.jpg',
            badge: 'Sale',
            description: 'Nón lá truyền thống được làm từ lá cọ chằng chịt, chắc mảnh, tỉ mỉ được công dân Việt Nam làm thủ công theo triết lý âm dương ngũ hành.',
            rating: 4.5,
            reviews: 12,
            category: 'Nón lá',
            sku: 'NL001',
            tags: ['Nón lá', 'Truyền thống', 'Thủ công'],
            additionalImages: [
                'https://i.pinimg.com/736x/b5/96/d4/b596d46dabe0bc0e1271a366fa4e45eb.jpg',
                'https://i.pinimg.com/736x/d6/6c/37/d66c373637aebaef3b2d7ec3114c1a1e.jpg'
            ]
        },
        {
            id: 2,
            name: 'Đèn lồng',
            origin: 'Đồng Tháp - Phan Thiết',
            price: 75000,
            oldPrice: null,
            image: 'https://i.pinimg.com/736x/1d/b6/af/1db6af30b070047a179b37784cefea06.jpg',
            badge: 'New',
            description: 'Đèn lồng truyền thống được làm thủ công với nhiều màu sắc rực rỡ, thích hợp trang trí không gian sống hoặc làm quà tặng.',
            rating: 4.7,
            reviews: 8,
            category: 'Đèn trang trí',
            sku: 'DL002',
            tags: ['Đèn lồng', 'Trang trí', 'Thủ công'],
            additionalImages: [
                'https://i.pinimg.com/736x/1d/b6/af/1db6af30b070047a179b37784cefea06.jpg',
                'https://i.pinimg.com/736x/1d/b6/af/1db6af30b070047a179b37784cefea06.jpg'
            ]
        },
        {
            id: 3,
            name: 'Sản phẩm tre nứa',
            origin: 'Làng Bát Tràng Hà Nội',
            price: 35000,
            oldPrice: 100000,
            image: 'https://i.pinimg.com/1200x/68/b2/c5/68b2c562fc0356c08d7a9216832c3501.jpg',
            badge: 'Sale',
            description: 'Sản phẩm tre nứa thủ công được đan tỉ mỉ, bền đẹp và có tính ứng dụng cao trong đời sống.',
            rating: 4.2,
            reviews: 15,
            category: 'Đồ gia dụng',
            sku: 'TN003',
            tags: ['Tre nứa', 'Thủ công', 'Gia dụng'],
            additionalImages: [
                'https://i.pinimg.com/1200x/68/b2/c5/68b2c562fc0356c08d7a9216832c3501.jpg',
                'https://i.pinimg.com/736x/97/c1/02/97c102476db4529152d0e6c3b279b7b6.jpg'
            ]
        },
        {
            id: 4,
            name: 'Nón lá Huế',
            origin: 'Làng Mỹ Nghệ Huế',
            price: 80000,
            oldPrice: null,
            image: 'https://i.pinimg.com/736x/b5/96/d4/b596d46dabe0bc0e1271a366fa4e45eb.jpg',
            badge: 'New',
            description: 'Nón lá Huế với hoa văn tinh tế, được làm thủ công bởi các nghệ nhân làng nghề truyền thống.',
            rating: 4.8,
            reviews: 20,
            category: 'Nón lá',
            sku: 'NLH004',
            tags: ['Nón lá', 'Huế', 'Thủ công'],
            additionalImages: [
                'https://i.pinimg.com/736x/b5/96/d4/b596d46dabe0bc0e1271a366fa4e45eb.jpg',
                'https://i.pinimg.com/1200x/4f/54/4d/4f544d2d569a546d345bc89699699691.jpg'
            ]
        },
        {
            id: 5,
            name: 'Túi đeo mây',
            origin: 'Thái Bình',
            price: 150000,
            oldPrice: null,
            image: 'https://i.pinimg.com/736x/d6/6c/37/d66c373637aebaef3b2d7ec3114c1a1e.jpg',
            description: 'Túi đeo mây thủ công với thiết kế tinh tế, vừa thời trang vừa thể hiện nét đẹp văn hóa truyền thống.',
            rating: 4.6,
            reviews: 10,
            category: 'Túi xách',
            sku: 'TDM005',
            tags: ['Túi mây', 'Thời trang', 'Thủ công'],
            additionalImages: [
                'https://i.pinimg.com/736x/d6/6c/37/d66c373637aebaef3b2d7ec3114c1a1e.jpg',
                'https://i.pinimg.com/736x/d6/6c/37/d66c373637aebaef3b2d7ec3114c1a1e.jpg'
            ]
        },
        {
            id: 6,
            name: 'Ghế tre',
            origin: 'Hưng Yên',
            price: 180000,
            oldPrice: null,
            image: 'https://i.pinimg.com/736x/0b/cc/59/0bcc59447c9c1eca32011a681241103e.jpg',
            badge: 'New',
            description: 'Ghế tre chắc chắn, được làm thủ công bởi các nghệ nhân làng nghề, thích hợp sử dụng trong nhà hoặc sân vườn.',
            rating: 4.4,
            reviews: 7,
            category: 'Nội thất',
            sku: 'GT006',
            tags: ['Ghế tre', 'Nội thất', 'Thủ công'],
            additionalImages: [
                'https://i.pinimg.com/736x/0b/cc/59/0bcc59447c9c1eca32011a681241103e.jpg',
                'https://i.pinimg.com/736x/0b/cc/59/0bcc59447c9c1eca32011a681241103e.jpg'
            ]
        },
        {
            id: 7,
            name: 'Giỏ tre trang trí',
            origin: 'Đồng Tháp',
            price: 100000,
            oldPrice: 150000,
            image: 'https://i.pinimg.com/736x/97/c1/02/97c102476db4529152d0e6c3b279b7b6.jpg',
            badge: 'Sale',
            description: 'Giỏ tre trang trí với thiết kế độc đáo, được đan tỉ mỉ, thích hợp để trang trí không gian sống.',
            rating: 4.3,
            reviews: 14,
            category: 'Trang trí',
            sku: 'GTT007',
            tags: ['Giỏ tre', 'Trang trí', 'Thủ công'],
            additionalImages: [
                'https://i.pinimg.com/736x/97/c1/02/97c102476db4529152d0e6c3b279b7b6.jpg',
                'https://i.pinimg.com/736x/97/c1/02/97c102476db4529152d0e6c3b279b7b6.jpg'
            ]
        },
        {
            id: 8,
            name: 'Bình gốm Bát Tràng',
            origin: 'Bát Tràng, Hà Nội',
            price: 250000,
            oldPrice: null,
            image: 'https://i.pinimg.com/1200x/e1/7f/8f/e17f8fe18ac1ab83a6303dc266515813.jpg',
            description: 'Bình gốm Bát Tràng với hoa văn truyền thống, được làm thủ công bởi các nghệ nhân làng nghề nổi tiếng.',
            rating: 4.9,
            reviews: 25,
            category: 'Gốm sứ',
            sku: 'BGBT008',
            tags: ['Gốm sứ', 'Bát Tràng', 'Thủ công'],
            additionalImages: [
                'https://i.pinimg.com/1200x/e1/7f/8f/e17f8fe18ac1ab83a6303dc266515813.jpg',
                'https://i.pinimg.com/1200x/e1/7f/8f/e17f8fe18ac1ab83a6303dc266515813.jpg'
            ]
        },
    ];

    // Hàm xử lý khi người dùng nhấp vào sản phẩm
    const handleProductClick = (product) => {
        setSelectedProduct(product);
        // Cuộn lên đầu trang khi chuyển đến trang chi tiết
        window.scrollTo(0, 0);
    };

    // Hàm xử lý khi người dùng quay lại từ trang chi tiết
    const handleBack = () => {
        setSelectedProduct(null);
    };

    // Styles
    const styles = {
        // General Styles
        body: {
            fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
            color: "#333",
            backgroundColor: "#fff"
        },
        sectionTitle: {
            fontSize: "28px",
            fontWeight: "600",
            textAlign: "center",
            marginBottom: "30px",
            color: "#333",
            position: "relative",
            paddingBottom: "10px"
        },

        // Hero Section
        heroSection: {
            backgroundColor: "#fdf9e6",
            padding: "0",
            overflow: "hidden"
        },
        heroContent: {
            padding: "50px 60px"
        },
        subtitle: {
            fontSize: "16px",
            color: "#666",
            marginBottom: "10px"
        },
        mainTitle: {
            fontSize: "36px",
            fontWeight: "700",
            color: "#b8860b", // Golden color for title
            marginBottom: "15px",
            lineHeight: "1.2"
        },
        heroDescription: {
            fontSize: "18px",
            color: "#555",
            marginBottom: "30px"
        },
        exploreButton: {
            backgroundColor: "#b8860b",
            borderColor: "#b8860b",
            padding: "10px 25px",
            fontWeight: "600",
            letterSpacing: "1px",
            borderRadius: "4px",
            transition: "all 0.3s ease"
        },
        heroImageContainer: {
            height: "100%",
            overflow: "hidden"
        },
        heroImage: {
            width: "100%",
            height: "100%",
            objectFit: "cover"
        },

        // Categories Section
        categoriesSection: {
            padding: "60px 0",
            backgroundColor: "#fff"
        },
        categoryCard: {
            position: "relative",
            borderRadius: "8px",
            overflow: "hidden",
            boxShadow: "0 5px 15px rgba(0, 0, 0, 0.1)",
            transition: "all 0.3s ease",
            cursor: "pointer"
        },
        categoryImageContainer: {
            height: "250px",
            overflow: "hidden"
        },
        categoryImage: {
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform 0.5s ease"
        },
        categoryName: {
            position: "absolute",
            bottom: "0",
            left: "0",
            right: "0",
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            padding: "15px",
            textAlign: "center",
            fontSize: "18px",
            fontWeight: "600",
            color: "#333"
        },

        // Products Section
        productsSection: {
            padding: "60px 0",
            backgroundColor: "#f9f9f9"
        },
        productCard: {
            border: "none",
            borderRadius: "8px",
            overflow: "hidden",
            transition: "all 0.3s ease",
            boxShadow: "0 5px 15px rgba(0, 0, 0, 0.05)",
            marginBottom: "20px",
            height: "100%",
            cursor: "pointer"
        },
        productImageContainer: {
            position: "relative",
            height: "200px",
            overflow: "hidden"
        },
        productImage: {
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform 0.5s ease"
        },
        productOverlay: {
            position: "absolute",
            top: "0",
            left: "0",
            right: "0",
            bottom: "0",
            backgroundColor: "rgba(0, 0, 0, 0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: "0",
            transition: "opacity 0.3s ease"
        },
        productActions: {
            display: "flex",
            gap: "10px"
        },
        actionBtn: {
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            backgroundColor: "white",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#333",
            transition: "all 0.3s ease",
            padding: "0"
        },
        productBadge: {
            position: "absolute",
            top: "10px",
            right: "10px",
            padding: "5px 10px",
            borderRadius: "4px",
            fontSize: "12px",
            fontWeight: "600",
            zIndex: "1",
            color: "white"
        },
        saleBadge: {
            backgroundColor: "#e74c3c"
        },
        newBadge: {
            backgroundColor: "#2ecc71"
        },
        cartBadge: {
            backgroundColor: "#3498db"
        },
        productDetails: {
            padding: "15px",
            backgroundColor: "white"
        },
        productName: {
            fontSize: "16px",
            fontWeight: "600",
            marginBottom: "5px",
            color: "#333"
        },
        productOrigin: {
            fontSize: "13px",
            color: "#777",
            marginBottom: "10px"
        },
        productPriceContainer: {
            display: "flex",
            alignItems: "center",
            gap: "10px"
        },
        productPrice: {
            fontSize: "16px",
            fontWeight: "600",
            color: "#b8860b"
        },
        productOldPrice: {
            fontSize: "14px",
            color: "#999",
            textDecoration: "line-through"
        },
        showMoreBtn: {
            backgroundColor: "transparent",
            border: "2px solid #b8860b",
            color: "#b8860b",
            padding: "8px 30px",
            fontWeight: "600",
            borderRadius: "4px",
            transition: "all 0.3s ease"
        }
    };

    // Nếu có sản phẩm được chọn, hiển thị trang chi tiết sản phẩm
    if (selectedProduct) {
        return <ProductDetail product={selectedProduct} onBack={handleBack} />;
    }

    // Nếu không có sản phẩm được chọn, hiển thị trang chủ
    return (
        <Container fluid className="p-0">
            {/* Embedded CSS for hover effects and dynamic styles */}
            <style>
                {`
                    /* Hover Effects */
                    .explore-button:hover {
                        background-color: #a67c00 !important;
                        border-color: #a67c00 !important;
                        transform: translateY(-2px);
                    }
                    
                    .category-card:hover {
                        transform: translateY(-5px);
                        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
                    }
                    
                    .category-card:hover .category-image {
                        transform: scale(1.05);
                    }
                    
                    .product-card:hover {
                        transform: translateY(-5px);
                        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
                    }
                    
                    .product-card:hover .product-image {
                        transform: scale(1.05);
                    }
                    
                    .product-card:hover .product-overlay {
                        opacity: 1;
                    }
                    
                    .action-btn:hover {
                        background-color: #b8860b !important;
                        color: white !important;
                    }
                    
                    .show-more-btn:hover {
                        background-color: #b8860b !important;
                        color: white !important;
                    }

                    /* Media Queries */
                    @media (max-width: 992px) {
                        .hero-content {
                            padding: 40px 30px !important;
                        }
                        
                        .main-title {
                            font-size: 32px !important;
                        }
                    }

                    @media (max-width: 768px) {
                        .hero-content {
                            padding: 30px 20px !important;
                        }
                        
                        .main-title {
                            font-size: 28px !important;
                        }
                        
                        .explore-button {
                            padding: 8px 20px !important;
                        }
                        
                        .category-image-container {
                            height: 200px !important;
                        }
                    }

                    @media (max-width: 576px) {
                        .hero-content {
                            padding: 30px 15px !important;
                        }
                        
                        .main-title {
                            font-size: 24px !important;
                        }
                        
                        .hero-description {
                            font-size: 16px !important;
                        }
                        
                        .category-name {
                            font-size: 16px !important;
                            padding: 10px !important;
                        }
                    }
                `}
            </style>

            {/* Hero Section */}
            <div style={styles.heroSection}>
                <Row className="mx-0">
                    <Col md={6} className="d-flex align-items-center">
                        <div style={styles.heroContent} className="hero-content">
                            <div style={styles.subtitle}>Bộ sưu tập từ Hội</div>
                            <h1 style={styles.mainTitle} className="main-title">Tinh hoa làng nghề – Gắn kết hôm nay</h1>
                            <p style={styles.heroDescription} className="hero-description">Trải nghiệm văn hóa tinh hoa dân tộc</p>
                            <Button style={styles.exploreButton} className="explore-button">KHÁM PHÁ</Button>
                        </div>
                    </Col>
                    <Col md={6} className="p-0">
                        <div style={styles.heroImageContainer}>
                            <img 
                                src="https://i.pinimg.com/736x/b9/f0/83/b9f0831841c5c0f7c5b2bbc64ceadaf2.jpg"
                                alt="Sản phẩm làng nghề" 
                                style={styles.heroImage}
                            />
                        </div>
                    </Col>
                </Row>
            </div>

            {/* Categories Section */}
            <section style={styles.categoriesSection}>
                <Container>
                    <h2 style={styles.sectionTitle}>Danh mục trọng tâm</h2>
                    <Row className="mt-4">
                        {categories.map(category => (
                            <Col key={category.id} md={4} className="mb-4">
                                <div style={styles.categoryCard} className="category-card">
                                    <div style={styles.categoryImageContainer} className="category-image-container">
                                        <img 
                                            src={category.image} 
                                            alt={category.name} 
                                            style={styles.categoryImage}
                                            className="category-image"
                                        />
                                    </div>
                                    <div style={styles.categoryName} className="category-name">{category.name}</div>
                                </div>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </section>

            {/* Products Section */}
            <section style={styles.productsSection}>
                <Container>
                    <h2 style={styles.sectionTitle}>Sản Phẩm</h2>
                    <Row className="mt-4">
                        {products.map(product => (
                            <Col key={product.id} md={3} sm={6} className="mb-4">
                                <Card 
                                    style={styles.productCard} 
                                    className="product-card"
                                    onClick={() => handleProductClick(product)}
                                >
                                    <div style={styles.productImageContainer} className="product-image-container">
                                        {product.badge && (
                                            <div 
                                                style={{
                                                    ...styles.productBadge,
                                                    ...(product.badge === 'Sale' ? styles.saleBadge : 
                                                        product.badge === 'New' ? styles.newBadge : styles.cartBadge)
                                                }}
                                            >
                                                {product.badge}
                                            </div>
                                        )}
                                        <Card.Img 
                                            variant="top" 
                                            src={product.image} 
                                            style={styles.productImage}
                                            className="product-image"
                                        />
                                        <div style={styles.productOverlay} className="product-overlay">
                                            <div style={styles.productActions}>
                                                <Button 
                                                    style={styles.actionBtn} 
                                                    className="action-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // Ngăn không cho sự kiện lan sang card
                                                        // Xử lý thêm vào giỏ hàng
                                                        alert(`Đã thêm ${product.name} vào giỏ hàng`);
                                                    }}
                                                >
                                                    <FaShoppingCart />
                                                </Button>
                                                <Button 
                                                    style={styles.actionBtn} 
                                                    className="action-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // Ngăn không cho sự kiện lan sang card
                                                        // Xử lý tìm kiếm nhanh
                                                    }}
                                                >
                                                    <FaSearch />
                                                </Button>
                                                <Button 
                                                    style={styles.actionBtn} 
                                                    className="action-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // Ngăn không cho sự kiện lan sang card
                                                        handleProductClick(product);
                                                    }}
                                                >
                                                    <FaEye />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                    <Card.Body style={styles.productDetails}>
                                        <Card.Title style={styles.productName}>{product.name}</Card.Title>
                                        {product.origin && (
                                            <p style={styles.productOrigin}>{product.origin}</p>
                                        )}
                                        <div style={styles.productPriceContainer}>
                                            <span style={styles.productPrice}>{product.price.toLocaleString()} VND</span>
                                            {product.oldPrice && (
                                                <span style={styles.productOldPrice}>{product.oldPrice.toLocaleString()} VND</span>
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
                </Container>
            </section>
        </Container>
    );
}

export default HomePage;