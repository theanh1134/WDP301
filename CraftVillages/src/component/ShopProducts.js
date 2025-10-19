import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Spinner, Badge } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { FaStar, FaStore, FaBox } from 'react-icons/fa';
import Header from './Header';
import Footer from './Footer';
import axios from 'axios';
import { getImageUrl } from '../utils/imageHelper';

function ShopProducts() {
    const { shopId } = useParams();
    const navigate = useNavigate();
    const [shop, setShop] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchShopData = async () => {
            try {
                setLoading(true);

                // Fetch shop info
                const shopRes = await axios.get(`http://localhost:9999/api/shops/${shopId}`);
                setShop(shopRes.data.data);

                // Fetch products by shop
                const productsRes = await axios.get(`http://localhost:9999/products?shopId=${shopId}`);
                console.log('Products response:', productsRes.data);
                setProducts(productsRes.data.data?.products || []);
            } catch (error) {
                console.error('Error fetching shop data:', error);
                setProducts([]); // Set empty array on error
            } finally {
                setLoading(false);
            }
        };

        if (shopId) {
            fetchShopData();
        }
    }, [shopId]);

    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;

        for (let i = 0; i < fullStars; i++) {
            stars.push(<FaStar key={`full-${i}`} style={{ color: '#ffc107', fontSize: '14px' }} />);
        }
        if (hasHalfStar) {
            stars.push(<FaStar key="half" style={{ color: '#ffc107', fontSize: '14px', opacity: 0.5 }} />);
        }
        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            stars.push(<FaStar key={`empty-${i}`} style={{ color: '#e0e0e0', fontSize: '14px' }} />);
        }
        return stars;
    };

    const styles = {
        banner: {
            background: 'linear-gradient(135deg, #b8860b 0%, #d4af37 100%)',
            padding: '60px 0',
            marginBottom: '40px',
            color: '#fff'
        },
        shopLogo: {
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            objectFit: 'cover',
            border: '4px solid #fff',
            marginBottom: '20px'
        },
        shopName: {
            fontSize: '32px',
            fontWeight: '700',
            marginBottom: '10px'
        },
        shopDescription: {
            fontSize: '16px',
            opacity: 0.9,
            marginBottom: '20px'
        },
        statsContainer: {
            display: 'flex',
            gap: '40px',
            justifyContent: 'center',
            marginTop: '20px'
        },
        statItem: {
            textAlign: 'center'
        },
        statValue: {
            fontSize: '24px',
            fontWeight: '700',
            marginBottom: '5px'
        },
        statLabel: {
            fontSize: '14px',
            opacity: 0.9
        },
        productCard: {
            border: 'none',
            borderRadius: '12px',
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            height: '100%',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        },
        productImage: {
            width: '100%',
            height: '250px',
            objectFit: 'cover'
        },
        productName: {
            fontSize: '16px',
            fontWeight: '600',
            color: '#2c3e50',
            marginBottom: '10px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
        },
        productPrice: {
            fontSize: '18px',
            fontWeight: '700',
            color: '#b8860b',
            marginBottom: '10px'
        },
        emptyState: {
            textAlign: 'center',
            padding: '60px 20px',
            color: '#6c757d'
        }
    };

    const completionRate = shop?.statistics?.totalOrders > 0
        ? ((shop.statistics.completedOrders / shop.statistics.totalOrders) * 100).toFixed(0)
        : 100;

    if (loading) {
        return (
            <>
                <Header />
                <Container className="text-center py-5">
                    <Spinner animation="border" variant="warning" />
                    <p className="mt-3">Đang tải thông tin shop...</p>
                </Container>
                <Footer />
            </>
        );
    }

    if (!shop) {
        return (
            <>
                <Header />
                <Container className="text-center py-5">
                    <h3>Không tìm thấy shop</h3>
                </Container>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
            
            {/* Shop Banner */}
            <div style={styles.banner}>
                <Container className="text-center">
                    <img
                        src={shop.avatarUrl || shop.bannerUrl || 'https://via.placeholder.com/100?text=Shop'}
                        alt={shop.shopName}
                        style={styles.shopLogo}
                        onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/100?text=Shop';
                        }}
                    />
                    <h1 style={styles.shopName}>
                        <FaStore style={{ marginRight: '10px' }} />
                        {shop.shopName}
                    </h1>
                    {shop.description && (
                        <p style={styles.shopDescription}>{shop.description}</p>
                    )}
                    
                    <div style={styles.statsContainer}>
                        <div style={styles.statItem}>
                            <div style={styles.statValue}>
                                {renderStars(shop.rating?.average || 0)}
                            </div>
                            <div style={styles.statLabel}>
                                {(shop.rating?.average || 0).toFixed(1)} sao
                            </div>
                        </div>
                        <div style={styles.statItem}>
                            <div style={styles.statValue}>
                                {shop.rating?.count >= 1000
                                    ? `${(shop.rating.count / 1000).toFixed(1)}k`
                                    : (shop.rating?.count || 0)}
                            </div>
                            <div style={styles.statLabel}>Đánh giá</div>
                        </div>
                        <div style={styles.statItem}>
                            <div style={styles.statValue}>{completionRate}%</div>
                            <div style={styles.statLabel}>Tỷ lệ phản hồi</div>
                        </div>
                        <div style={styles.statItem}>
                            <div style={styles.statValue}>
                                {(() => {
                                    if (!shop.createdAt) return 'mới tham gia';

                                    // Use lastActivityAt if available, otherwise use current date
                                    const endDate = shop.lastActivityAt ? new Date(shop.lastActivityAt) : new Date();
                                    const startDate = new Date(shop.createdAt);

                                    const daysDiff = Math.floor((endDate - startDate) / (24 * 60 * 60 * 1000));
                                    const years = Math.floor(daysDiff / 365);

                                    // If less than 1 year, show "mới tham gia"
                                    if (years < 1) {
                                        return 'mới tham gia';
                                    }

                                    return `${years} năm trước`;
                                })()}
                            </div>
                            <div style={styles.statLabel}>Tham gia</div>
                        </div>
                        <div style={styles.statItem}>
                            <div style={styles.statValue}>
                                <FaBox style={{ marginRight: '5px' }} />
                                {shop.statistics?.totalProducts || 0}
                            </div>
                            <div style={styles.statLabel}>Sản phẩm</div>
                        </div>
                        <div style={styles.statItem}>
                            <div style={styles.statValue}>{shop.responseTime || 'trong vài giờ'}</div>
                            <div style={styles.statLabel}>Thời gian phản hồi</div>
                        </div>
                        <div style={styles.statItem}>
                            <div style={styles.statValue}>
                                {shop.statistics?.followers >= 1000
                                    ? `${(shop.statistics.followers / 1000).toFixed(1)}k`
                                    : (shop.statistics?.followers || 0)}
                            </div>
                            <div style={styles.statLabel}>Người theo dõi</div>
                        </div>
                    </div>
                </Container>
            </div>

            {/* Products Grid */}
            <Container style={{ marginBottom: '60px' }}>
                <h3 style={{ marginBottom: '30px', fontWeight: '700' }}>
                    Sản phẩm của shop ({Array.isArray(products) ? products.length : 0})
                </h3>

                {!Array.isArray(products) || products.length === 0 ? (
                    <div style={styles.emptyState}>
                        <FaBox style={{ fontSize: '64px', marginBottom: '20px', opacity: 0.3 }} />
                        <h4>Shop chưa có sản phẩm nào</h4>
                    </div>
                ) : (
                    <Row>
                        {products.map((product) => (
                            <Col key={product._id} xs={12} sm={6} md={4} lg={3} className="mb-4">
                                <Card
                                    style={styles.productCard}
                                    onClick={() => navigate(`/products/${product._id}`)}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-5px)';
                                        e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                                    }}
                                >
                                    <div style={{ position: 'relative' }}>
                                        <Card.Img
                                            variant="top"
                                            src={getImageUrl(product.image)}
                                            style={styles.productImage}
                                            onError={(e) => {
                                                e.target.src = 'https://via.placeholder.com/250?text=No+Image';
                                            }}
                                        />

                                        {/* Out of Stock Badge */}
                                        {(!product.stock || product.stock === 0 || product.maxQuantityPerOrder === 0) && (
                                            <div style={{
                                                position: 'absolute',
                                                top: '10px',
                                                right: '10px',
                                                backgroundColor: '#dc3545',
                                                color: 'white',
                                                padding: '6px 12px',
                                                borderRadius: '6px',
                                                fontSize: '0.85rem',
                                                fontWeight: 'bold',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                                zIndex: 10
                                            }}>
                                                HẾT HÀNG
                                            </div>
                                        )}
                                    </div>
                                    <Card.Body>
                                        <div style={styles.productName}>{product.name}</div>
                                        <div style={styles.productPrice}>
                                            {(product.displayPrice || product.price || 0).toLocaleString()} VND
                                        </div>
                                        {product.priceRange &&
                                         product.priceRange.min !== product.priceRange.max && (
                                            <div style={{
                                                fontSize: '0.75rem',
                                                color: '#666',
                                                marginTop: '4px'
                                            }}>
                                                {product.priceRange.min.toLocaleString()} - {product.priceRange.max.toLocaleString()} VND
                                            </div>
                                        )}
                                        {product.categoryName && (
                                            <Badge bg="secondary" style={{ fontSize: '11px', marginTop: '8px' }}>
                                                {product.categoryName}
                                            </Badge>
                                        )}
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                )}
            </Container>

            <Footer />
        </>
    );
}

export default ShopProducts;

