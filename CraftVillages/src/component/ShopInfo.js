import React from 'react';
import { Card, Button, Row, Col } from 'react-bootstrap';
import { FaStar, FaStore, FaBox } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

function ShopInfo({ shop }) {
    const navigate = useNavigate();

    if (!shop || !shop._id) {
        return null;
    }

    const handleViewShop = () => {
        navigate(`/shop/${shop._id}`);
    };

    const handleChatNow = () => {
        // TODO: Implement chat functionality
        alert('Chức năng chat đang được phát triển');
    };

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
        shopCard: {
            border: '1px solid #e9ecef',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '30px',
            backgroundColor: '#fff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        },
        shopHeader: {
            display: 'flex',
            alignItems: 'center',
            marginBottom: '15px',
            gap: '15px'
        },
        shopLogo: {
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            objectFit: 'cover',
            border: '2px solid #b8860b'
        },
        shopName: {
            fontSize: '18px',
            fontWeight: '600',
            color: '#2c3e50',
            marginBottom: '5px'
        },
        statsContainer: {
            display: 'flex',
            gap: '20px',
            marginBottom: '15px',
            flexWrap: 'wrap'
        },
        statItem: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start'
        },
        statLabel: {
            fontSize: '12px',
            color: '#6c757d',
            marginBottom: '3px'
        },
        statValue: {
            fontSize: '14px',
            fontWeight: '600',
            color: '#2c3e50'
        },
        ratingContainer: {
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
        },
        buttonContainer: {
            display: 'flex',
            gap: '10px',
            marginTop: '15px'
        },
        viewShopBtn: {
            backgroundColor: '#fff',
            border: '1px solid #b8860b',
            color: '#b8860b',
            padding: '8px 20px',
            fontSize: '14px',
            fontWeight: '600',
            borderRadius: '6px',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
        },
        chatBtn: {
            backgroundColor: '#b8860b',
            border: 'none',
            color: '#fff',
            padding: '8px 20px',
            fontSize: '14px',
            fontWeight: '600',
            borderRadius: '6px',
            transition: 'all 0.3s ease'
        },
        divider: {
            height: '1px',
            backgroundColor: '#e9ecef',
            margin: '15px 0'
        }
    };

    const completionRate = shop.statistics?.totalOrders > 0
        ? ((shop.statistics.completedOrders / shop.statistics.totalOrders) * 100).toFixed(0)
        : 100;

    // Calculate years since shop creation using lastActivityAt - createdAt
    const getYearsSinceCreation = () => {
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
    };

    // Format followers count
    const formatFollowers = (count) => {
        if (!count) return '0';
        if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
        return count.toString();
    };

    // Format rating count
    const formatRatingCount = (count) => {
        if (!count) return '0';
        if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
        return count.toString();
    };

    return (
        <Card style={styles.shopCard}>
            <div style={styles.shopHeader}>
                <img
                    src={shop.avatarUrl || shop.bannerUrl || 'https://via.placeholder.com/60?text=Shop'}
                    alt={shop.shopName}
                    style={styles.shopLogo}
                    onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/60?text=Shop';
                    }}
                />
                <div style={{ flex: 1 }}>
                    <div style={styles.shopName}>{shop.shopName}</div>
                    <div style={styles.ratingContainer}>
                        {renderStars(shop.rating?.average || 0)}
                        <span style={{ fontSize: '13px', color: '#6c757d', marginLeft: '5px' }}>
                            ({shop.rating?.count || 0} đánh giá)
                        </span>
                    </div>
                </div>
            </div>

            <div style={styles.divider}></div>

            {/* Stats Grid - 2 rows x 3 columns */}
            <Row className="mb-2">
                <Col xs={4}>
                    <div style={styles.statItem}>
                        <div style={styles.statLabel}>Đánh giá</div>
                        <div style={styles.statValue}>
                            <span style={{ color: '#b8860b' }}>{formatRatingCount(shop.rating?.count || 0)}</span>
                        </div>
                    </div>
                </Col>
                <Col xs={4}>
                    <div style={styles.statItem}>
                        <div style={styles.statLabel}>Tỷ lệ phản hồi</div>
                        <div style={styles.statValue}>
                            <span style={{ color: '#28a745' }}>{completionRate}%</span>
                        </div>
                    </div>
                </Col>
                <Col xs={4}>
                    <div style={styles.statItem}>
                        <div style={styles.statLabel}>Tham gia</div>
                        <div style={styles.statValue}>
                            {getYearsSinceCreation()}
                        </div>
                    </div>
                </Col>
            </Row>

            <Row>
                <Col xs={4}>
                    <div style={styles.statItem}>
                        <div style={styles.statLabel}>Sản phẩm</div>
                        <div style={styles.statValue}>
                            <FaBox style={{ color: '#b8860b', marginRight: '5px', fontSize: '12px' }} />
                            {shop.statistics?.totalProducts || 0}
                        </div>
                    </div>
                </Col>
                <Col xs={4}>
    <div style={styles.statItem}>
        <div style={styles.statLabel}>Thời gian phản hồi</div>
        <div style={{ ...styles.statValue, fontSize: '12px' }}>
            {shop.responseTime || 'trong vài giờ'}
        </div>
    </div>
</Col>
                <Col xs={4}>
                    <div style={styles.statItem}>
                        <div style={styles.statLabel}>Người theo dõi</div>
                        <div style={styles.statValue}>
                            <span style={{ color: '#b8860b' }}>{formatFollowers(shop.statistics?.followers || 0)}</span>
                        </div>
                    </div>
                </Col>
            </Row>

            <div style={styles.buttonContainer}>
                <Button
                    style={styles.viewShopBtn}
                    onClick={handleViewShop}
                    onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#b8860b';
                        e.target.style.color = '#fff';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#fff';
                        e.target.style.color = '#b8860b';
                    }}
                >
                    <FaStore /> Xem Shop
                </Button>
                <Button
                    style={styles.chatBtn}
                    onClick={handleChatNow}
                    onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#9a6f0a';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#b8860b';
                    }}
                >
                    💬 Chat Ngay
                </Button>
            </div>
        </Card>
    );
}

export default ShopInfo;

