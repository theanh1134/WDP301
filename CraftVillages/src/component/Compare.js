import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Card, Table, Dropdown, Badge, Alert } from 'react-bootstrap';
import { FaStar, FaStarHalfAlt, FaRegStar, FaArrowLeft, FaTimes, FaPlus, FaBalanceScale, FaInfoCircle, FaShoppingCart, FaEye, FaHeart, FaTags } from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from './Header';

// Animations
const fadeIn = keyframes`
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
`;

const slideIn = keyframes`
    from {
        opacity: 0;
        transform: translateX(-20px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
`;

const pulse = keyframes`
    0% {
        box-shadow: 0 0 0 0 rgba(184, 134, 11, 0.4);
    }
    70% {
        box-shadow: 0 0 0 10px rgba(184, 134, 11, 0);
    }
    100% {
        box-shadow: 0 0 0 0 rgba(184, 134, 11, 0);
    }
`;

// Styled Components
const StyledCard = styled(Card)`
    border: none;
    border-radius: 12px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    animation: ${fadeIn} 0.6s ease-out;

    &:hover {
        transform: translateY(-5px);
        box-shadow: 0 15px 35px rgba(0, 0, 0, 0.12);
    }
`;

const ProductCard = styled(StyledCard)`
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(184, 134, 11, 0.1), transparent);
        transition: left 0.5s;
    }

    &:hover::before {
        left: 100%;
    }
`;

const RemoveButton = styled(Button)`
    position: absolute;
    top: 10px;
    right: 10px;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: rgba(220, 53, 69, 0.9);
    border: none;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: all 0.3s ease;
    z-index: 2;

    &:hover {
        background: #dc3545;
        transform: scale(1.1);
    }
`;

const ProductImageContainer = styled.div`
    position: relative;
    overflow: hidden;
    border-radius: 8px 8px 0 0;

    &:hover ${RemoveButton} {
        opacity: 1;
    }

    img {
        transition: transform 0.3s ease;
    }

    &:hover img {
        transform: scale(1.05);
    }
`;

const StyledButton = styled(Button)`
    background: linear-gradient(135deg, #b8860b 0%, #d4af37 100%);
    border: none;
    border-radius: 8px;
    font-weight: 600;
    padding: 10px 20px;
    transition: all 0.3s ease;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(184, 134, 11, 0.3);
        animation: ${pulse} 2s infinite;
    }

    &:active {
        transform: translateY(0);
    }
`;

const SidebarCard = styled(StyledCard)`
    position: sticky;
    top: 100px;
    animation: ${slideIn} 0.6s ease-out;
`;

const ComparisonTable = styled(Table)`
    margin-bottom: 0;

    th {
        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        border: none;
        font-weight: 600;
        color: #495057;
        padding: 15px;
        position: sticky;
        top: 0;
        z-index: 1;
    }

    td {
        padding: 15px;
        border-color: #e9ecef;
        vertical-align: middle;
        transition: background-color 0.2s ease;
    }

    tr:hover td {
        background-color: rgba(184, 134, 11, 0.05);
    }
`;

const PriceTag = styled.div`
    font-size: 1.2rem;
    font-weight: 700;
    color: #b8860b;
    margin: 10px 0;
`;

const RatingContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    margin: 10px 0;
`;

function Compare() {
    const location = useLocation();
    const navigate = useNavigate();
    const [compareProducts, setCompareProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Nếu có sản phẩm ban đầu được truyền từ trang chi tiết sản phẩm
        if (location.state && location.state.initialProduct) {
            setCompareProducts([location.state.initialProduct]);
        }
    }, [location]);

    // Danh sách sản phẩm có thể thêm vào để so sánh
    const productOptions = [
        {
            id: 101,
            name: 'Nón lá truyền thống',
            price: 200000,
            sku: 'TFCBUSDSL05H15',
            origin: 'Cói, Tre, Hồ',
            material: 'Cói, Tre, Hồ',
            finish: 'Nguyên bản',
            decoration: 'Không có họa tiết',
            adjustable: 'No',
            maxLoad: '250 KG',
            manufacturerOrigin: 'India',
            width: '285.32 cm',
            height: '76 cm',
            depth: '167.76 cm',
            rating: 4.7,
            reviews: 234,
            image: 'https://i.pinimg.com/1200x/4f/54/4d/4f544d2d569a546d345bc89699699691.jpg'
        },
        {
            id: 102,
            name: 'Nón lá Huế',
            price: 80000,
            sku: 'D1UBUSDSLG8',
            origin: 'Lá buông, Tre, Hồ',
            material: 'Lá buông, Tre, Hồ',
            finish: 'Bright Grey & Lion',
            decoration: 'Có họa tiết vẽ hình Chợ Bến Thành',
            color: 'Màu sắc nguyên bản, phần nón dâu bóng, bảo vệ',
            adjustable: 'Yes',
            maxLoad: '300 KG',
            manufacturerOrigin: 'India',
            width: '285.32 cm',
            height: '76 cm',
            depth: '167.76 cm',
            rating: 4.2,
            reviews: 141,
            image: 'https://i.pinimg.com/736x/b5/96/d4/b596d46dabe0bc0e1271a366fa4e45eb.jpg'
        }
    ];

    // Hàm xử lý thêm sản phẩm để so sánh
    const handleAddProductToCompare = (product) => {
        if (compareProducts.length >= 4) {
            alert('Bạn chỉ có thể so sánh tối đa 4 sản phẩm cùng lúc!');
            return;
        }

        if (!compareProducts.find(p => p.id === product.id)) {
            setIsLoading(true);
            setTimeout(() => {
                setCompareProducts(prev => [...prev, product]);
                setIsLoading(false);
            }, 300);
        }
    };

    // Hàm xử lý xóa sản phẩm khỏi so sánh
    const handleRemoveProduct = (productId) => {
        setCompareProducts(prev => prev.filter(p => p.id !== productId));
    };

    // Hàm xử lý khi người dùng quay về trang trước
    const handleBack = () => {
        navigate(-1);
    };

    // Hàm xử lý thêm vào giỏ hàng
    const handleAddToCart = (product) => {
        // Logic thêm vào giỏ hàng
        console.log('Added to cart:', product);
        alert(`Đã thêm ${product.name} vào giỏ hàng!`);
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

    // Enhanced Styles
    const styles = {
        compareContainer: {
            background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
            minHeight: '100vh',
            padding: '40px 0'
        },
        compareHeader: {
            backgroundImage: 'linear-gradient(135deg, rgba(184, 134, 11, 0.9), rgba(212, 175, 55, 0.9)), url(https://i.pinimg.com/736x/b9/f0/83/b9f0831841c5c0f7c5b2bbc64ceadaf2.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            padding: '80px 0',
            position: 'relative',
            borderRadius: '16px',
            marginBottom: '40px',
            boxShadow: '0 15px 35px rgba(0, 0, 0, 0.1)'
        },
        compareTitle: {
            color: '#fff',
            textAlign: 'center',
            fontSize: '3rem',
            fontWeight: '700',
            marginBottom: '20px',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)'
        },
        compareSubtitle: {
            color: '#fff',
            textAlign: 'center',
            fontSize: '1.2rem',
            opacity: 0.9,
            marginBottom: '30px'
        },
        compareBreadcrumb: {
            textAlign: 'center',
            color: '#fff'
        },
        compareBreadcrumbLink: {
            color: '#fff',
            textDecoration: 'none',
            transition: 'all 0.3s ease',
            '&:hover': {
                color: '#d4af37'
            }
        },
        sidebarContainer: {
            background: '#fff',
            borderRadius: '16px',
            padding: '25px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(184, 134, 11, 0.1)'
        },
        sidebarTitle: {
            fontSize: '1.4rem',
            fontWeight: '700',
            color: '#333',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
        },
        comparisonStats: {
            background: 'linear-gradient(135deg, rgba(184, 134, 11, 0.1), rgba(212, 175, 55, 0.1))',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '25px',
            textAlign: 'center'
        },
        statsNumber: {
            fontSize: '2rem',
            fontWeight: '700',
            color: '#b8860b',
            display: 'block'
        },
        statsLabel: {
            fontSize: '0.9rem',
            color: '#666',
            marginTop: '5px'
        },
        compareProductsContainer: {
            marginBottom: '40px',
            backgroundColor: '#fff',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)'
        },
        sectionHeader: {
            background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
            padding: '25px',
            borderBottom: '2px solid rgba(184, 134, 11, 0.1)'
        },
        sectionTitle: {
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#333',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
        },
        compareTableCell: {
            padding: '12px 20px'
        },
        compareTableHeader: {
            fontWeight: '600',
            backgroundColor: '#f8f8f8'
        },
        addToCompareDropdown: {
            marginBottom: '20px'
        },
        addToCartBtnCompare: {
            backgroundColor: '#b8860b',
            border: 'none',
            padding: '8px 20px',
            fontSize: '14px',
            fontWeight: '600',
            borderRadius: '4px',
            marginTop: '15px',
            width: '100%'
        },
        ratingText: {
            fontSize: '14px',
            color: '#666',
            marginLeft: '10px'
        },
        noProductsMessage: {
            textAlign: 'center',
            padding: '40px 0',
            color: '#666',
            fontSize: '18px'
        },
        emptyCompareContainer: {
            textAlign: 'center',
            padding: '80px 0',
            backgroundColor: '#fff',
            borderRadius: '8px',
            boxShadow: '0 5px 15px rgba(0, 0, 0, 0.05)',
            marginBottom: '30px'
        },
        emptyCompareIcon: {
            fontSize: '48px',
            color: '#ccc',
            marginBottom: '20px'
        },
        emptyCompareText: {
            fontSize: '20px',
            color: '#666',
            marginBottom: '30px'
        }
    };

    return (
        <>
            <Header />
            <div style={styles.compareContainer}>
                <Container>
                    {/* Enhanced Header */}
                    <div style={styles.compareHeader}>
                        <h1 style={styles.compareTitle}>
                            <FaBalanceScale style={{ marginRight: '15px' }} />
                            So sánh sản phẩm
                        </h1>
                        <p style={styles.compareSubtitle}>
                            Tìm hiểu chi tiết và so sánh các sản phẩm để đưa ra lựa chọn tốt nhất
                        </p>
                        <div style={styles.compareBreadcrumb}>
                            <span>
                                <a href="#" onClick={handleBack} style={styles.compareBreadcrumbLink}>
                                    <FaArrowLeft style={{ marginRight: '8px' }} />
                                    Trang chủ
                                </a> › So sánh sản phẩm
                            </span>
                        </div>
                    </div>

                    <Row>
                        {/* Enhanced Sidebar */}
                        <Col lg={3}>
                            <SidebarCard>
                                <div style={styles.sidebarContainer}>
                                    <h5 style={styles.sidebarTitle}>
                                        <FaInfoCircle />
                                        Thông tin so sánh
                                    </h5>

                                    {/* Comparison Stats */}
                                    <div style={styles.comparisonStats}>
                                        <span style={styles.statsNumber}>{compareProducts.length}</span>
                                        <div style={styles.statsLabel}>sản phẩm đang so sánh</div>
                                        <small style={{ color: '#666', fontSize: '0.8rem' }}>
                                            (Tối đa 4 sản phẩm)
                                        </small>
                                    </div>

                                    {/* Add Product Section */}
                                    <div>
                                        <h6 style={{ marginBottom: '15px', fontWeight: '600' }}>
                                            <FaPlus style={{ marginRight: '8px', color: '#b8860b' }} />
                                            Thêm sản phẩm
                                        </h6>
                                        <Dropdown>
                                            <Dropdown.Toggle
                                                as={StyledButton}
                                                variant="outline-primary"
                                                style={{
                                                    width: '100%',
                                                    textAlign: 'left',
                                                    background: 'white',
                                                    color: '#333',
                                                    border: '2px solid #e9ecef'
                                                }}
                                                disabled={compareProducts.length >= 4}
                                            >
                                                {compareProducts.length >= 4 ? 'Đã đạt giới hạn' : 'Chọn sản phẩm'}
                                            </Dropdown.Toggle>

                                            <Dropdown.Menu style={{ width: '100%' }}>
                                                {productOptions
                                                    .filter(prod => !compareProducts.find(p => p.id === prod.id))
                                                    .map(prod => (
                                                        <Dropdown.Item
                                                            key={prod.id}
                                                            onClick={() => handleAddProductToCompare(prod)}
                                                            style={{
                                                                padding: '12px 16px',
                                                                borderBottom: '1px solid #f8f9fa'
                                                            }}
                                                        >
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                                <img
                                                                    src={prod.image}
                                                                    alt={prod.name}
                                                                    style={{
                                                                        width: '40px',
                                                                        height: '40px',
                                                                        objectFit: 'cover',
                                                                        borderRadius: '6px'
                                                                    }}
                                                                />
                                                                <div>
                                                                    <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>
                                                                        {prod.name}
                                                                    </div>
                                                                    <div style={{ color: '#b8860b', fontSize: '0.8rem' }}>
                                                                        {prod.price?.toLocaleString()} VND
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </Dropdown.Item>
                                                    ))
                                                }
                                                {productOptions.filter(prod => !compareProducts.find(p => p.id === prod.id)).length === 0 && (
                                                    <Dropdown.Item disabled style={{ textAlign: 'center', padding: '20px' }}>
                                                        <FaInfoCircle style={{ marginRight: '8px' }} />
                                                        Không có sản phẩm để thêm
                                                    </Dropdown.Item>
                                                )}
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </div>

                                    {/* Quick Actions */}
                                    <div style={{ marginTop: '25px', paddingTop: '20px', borderTop: '1px solid #e9ecef' }}>
                                        <StyledButton
                                            variant="outline-secondary"
                                            onClick={handleBack}
                                            style={{
                                                width: '100%',
                                                background: 'white',
                                                color: '#666',
                                                border: '1px solid #dee2e6'
                                            }}
                                        >
                                            <FaArrowLeft style={{ marginRight: '8px' }} />
                                            Quay lại cửa hàng
                                        </StyledButton>
                                    </div>
                                </div>
                            </SidebarCard>
                        </Col>

                        {/* Main Content */}
                        <Col lg={9}>
                            {compareProducts.length === 0 ? (
                                <StyledCard style={{ textAlign: 'center', padding: '60px 40px' }}>
                                    <div style={{ fontSize: '4rem', marginBottom: '20px', opacity: 0.3 }}>
                                        <FaBalanceScale />
                                    </div>
                                    <h3 style={{ color: '#666', marginBottom: '15px' }}>
                                        Chưa có sản phẩm để so sánh
                                    </h3>
                                    <p style={{ color: '#999', marginBottom: '30px', fontSize: '1.1rem' }}>
                                        Hãy chọn ít nhất 2 sản phẩm để bắt đầu so sánh và tìm ra lựa chọn tốt nhất cho bạn
                                    </p>
                                    <StyledButton onClick={handleBack}>
                                        <FaArrowLeft style={{ marginRight: '8px' }} />
                                        Khám phá sản phẩm
                                    </StyledButton>
                                </StyledCard>
                            ) : (
                                <>
                                    {/* Product Cards Section */}
                                    <StyledCard style={{ marginBottom: '30px' }}>
                                        <div style={styles.sectionHeader}>
                                            <h4 style={styles.sectionTitle}>
                                                <FaEye style={{ color: '#b8860b' }} />
                                                Sản phẩm đang so sánh
                                            </h4>
                                        </div>
                                        <div style={{ padding: '30px' }}>
                                            <Row className="g-4">
                                                {compareProducts.map((prod, index) => (
                                                    <Col lg={6} xl={4} key={index}>
                                                        <ProductCard>
                                                            <ProductImageContainer>
                                                                <Card.Img
                                                                    variant="top"
                                                                    src={prod.image}
                                                                    alt={prod.name}
                                                                    style={{
                                                                        height: '200px',
                                                                        objectFit: 'cover'
                                                                    }}
                                                                />
                                                                <RemoveButton
                                                                    onClick={() => handleRemoveProduct(prod.id)}
                                                                    title="Xóa khỏi so sánh"
                                                                >
                                                                    <FaTimes />
                                                                </RemoveButton>
                                                            </ProductImageContainer>
                                                            <Card.Body style={{ textAlign: 'center', padding: '20px' }}>
                                                                <Card.Title style={{
                                                                    fontSize: '1.1rem',
                                                                    fontWeight: '600',
                                                                    marginBottom: '10px',
                                                                    color: '#333'
                                                                }}>
                                                                    {prod.name}
                                                                </Card.Title>
                                                                <PriceTag>
                                                                    {prod.price?.toLocaleString()} VND
                                                                </PriceTag>
                                                                <RatingContainer>
                                                                    {renderRatingStars(prod.rating || 4.5)}
                                                                    <span style={{
                                                                        fontSize: '0.9rem',
                                                                        color: '#666',
                                                                        marginLeft: '8px'
                                                                    }}>
                                                                        ({prod.reviews || 10})
                                                                    </span>
                                                                </RatingContainer>
                                                                <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                                                                    <StyledButton
                                                                        size="sm"
                                                                        onClick={() => handleAddToCart(prod)}
                                                                        style={{ flex: 1 }}
                                                                    >
                                                                        <FaShoppingCart style={{ marginRight: '5px' }} />
                                                                        Thêm vào giỏ
                                                                    </StyledButton>
                                                                    <Button
                                                                        variant="outline-secondary"
                                                                        size="sm"
                                                                        style={{
                                                                            borderColor: '#dee2e6',
                                                                            color: '#666'
                                                                        }}
                                                                    >
                                                                        <FaHeart />
                                                                    </Button>
                                                                </div>
                                                            </Card.Body>
                                                        </ProductCard>
                                                    </Col>
                                                ))}
                                            </Row>
                                        </div>
                                    </StyledCard>

                                    {/* Comparison Tables */}
                                    <StyledCard style={{ marginBottom: '30px' }}>
                                        <div style={styles.sectionHeader}>
                                            <h4 style={styles.sectionTitle}>
                                                <FaInfoCircle style={{ color: '#b8860b' }} />
                                                Thông tin cơ bản
                                            </h4>
                                        </div>
                                        <ComparisonTable responsive>
                                            <tbody>
                                                <tr>
                                                    <th style={{ width: '200px' }}>Giá bán</th>
                                                    {compareProducts.map((prod, index) => (
                                                        <td key={index}>
                                                            <PriceTag style={{ fontSize: '1rem', margin: 0 }}>
                                                                {prod.price?.toLocaleString()} VND
                                                            </PriceTag>
                                                        </td>
                                                    ))}
                                                </tr>
                                                <tr>
                                                    <th>Mã sản phẩm</th>
                                                    {compareProducts.map((prod, index) => (
                                                        <td key={index}>
                                                            <code style={{
                                                                background: '#f8f9fa',
                                                                padding: '4px 8px',
                                                                borderRadius: '4px',
                                                                fontSize: '0.9rem'
                                                            }}>
                                                                {prod.sku || 'N/A'}
                                                            </code>
                                                        </td>
                                                    ))}
                                                </tr>
                                                <tr>
                                                    <th>Vật liệu</th>
                                                    {compareProducts.map((prod, index) => (
                                                        <td key={index}>{prod.material || '-'}</td>
                                                    ))}
                                                </tr>
                                                <tr>
                                                    <th>Họa tiết</th>
                                                    {compareProducts.map((prod, index) => (
                                                        <td key={index}>{prod.decoration || '-'}</td>
                                                    ))}
                                                </tr>
                                                <tr>
                                                    <th>Màu sắc</th>
                                                    {compareProducts.map((prod, index) => (
                                                        <td key={index}>
                                                            <Badge
                                                                bg="light"
                                                                text="dark"
                                                                style={{
                                                                    fontSize: '0.8rem',
                                                                    padding: '6px 12px'
                                                                }}
                                                            >
                                                                {prod.color || 'Nguyên bản'}
                                                            </Badge>
                                                        </td>
                                                    ))}
                                                </tr>
                                            </tbody>
                                        </ComparisonTable>
                                    </StyledCard>

                                    {/* Technical Specifications */}
                                    <StyledCard style={{ marginBottom: '30px' }}>
                                        <div style={styles.sectionHeader}>
                                            <h4 style={styles.sectionTitle}>
                                                <FaTags style={{ color: '#b8860b' }} />
                                                Thông số kỹ thuật
                                            </h4>
                                        </div>
                                        <ComparisonTable responsive>
                                            <tbody>
                                                <tr>
                                                    <th style={{ width: '200px' }}>Chất liệu chính</th>
                                                    {compareProducts.map((prod, index) => (
                                                        <td key={index}>{prod.material || 'Không xác định'}</td>
                                                    ))}
                                                </tr>
                                                <tr>
                                                    <th>Loại hoàn thiện</th>
                                                    {compareProducts.map((prod, index) => (
                                                        <td key={index}>{prod.finish || 'Tự nhiên'}</td>
                                                    ))}
                                                </tr>
                                                <tr>
                                                    <th>Có thể điều chỉnh</th>
                                                    {compareProducts.map((prod, index) => (
                                                        <td key={index}>
                                                            <Badge
                                                                bg={prod.adjustable === 'Yes' ? 'success' : 'secondary'}
                                                                style={{ fontSize: '0.8rem' }}
                                                            >
                                                                {prod.adjustable === 'Yes' ? 'Có' : 'Không'}
                                                            </Badge>
                                                        </td>
                                                    ))}
                                                </tr>
                                                <tr>
                                                    <th>Tải trọng tối đa</th>
                                                    {compareProducts.map((prod, index) => (
                                                        <td key={index}>
                                                            <strong style={{ color: '#b8860b' }}>
                                                                {prod.maxLoad || '250 KG'}
                                                            </strong>
                                                        </td>
                                                    ))}
                                                </tr>
                                                <tr>
                                                    <th>Xuất xứ</th>
                                                    {compareProducts.map((prod, index) => (
                                                        <td key={index}>{prod.manufacturerOrigin || 'Việt Nam'}</td>
                                                    ))}
                                                </tr>
                                            </tbody>
                                        </ComparisonTable>
                                    </StyledCard>

                                    {/* Dimensions */}
                                    <StyledCard style={{ marginBottom: '30px' }}>
                                        <div style={styles.sectionHeader}>
                                            <h4 style={styles.sectionTitle}>
                                                📏 Kích thước
                                            </h4>
                                        </div>
                                        <ComparisonTable responsive>
                                            <tbody>
                                                <tr>
                                                    <th style={{ width: '200px' }}>Chiều rộng</th>
                                                    {compareProducts.map((prod, index) => (
                                                        <td key={index}>
                                                            <code style={{
                                                                background: '#e3f2fd',
                                                                color: '#1976d2',
                                                                padding: '4px 8px',
                                                                borderRadius: '4px'
                                                            }}>
                                                                {prod.width || '285.32 cm'}
                                                            </code>
                                                        </td>
                                                    ))}
                                                </tr>
                                                <tr>
                                                    <th>Chiều cao</th>
                                                    {compareProducts.map((prod, index) => (
                                                        <td key={index}>
                                                            <code style={{
                                                                background: '#e8f5e8',
                                                                color: '#2e7d32',
                                                                padding: '4px 8px',
                                                                borderRadius: '4px'
                                                            }}>
                                                                {prod.height || '76 cm'}
                                                            </code>
                                                        </td>
                                                    ))}
                                                </tr>
                                                <tr>
                                                    <th>Độ sâu</th>
                                                    {compareProducts.map((prod, index) => (
                                                        <td key={index}>
                                                            <code style={{
                                                                background: '#fff3e0',
                                                                color: '#f57c00',
                                                                padding: '4px 8px',
                                                                borderRadius: '4px'
                                                            }}>
                                                                {prod.depth || '167.76 cm'}
                                                            </code>
                                                        </td>
                                                    ))}
                                                </tr>
                                            </tbody>
                                        </ComparisonTable>
                                    </StyledCard>
                                </>
                            )}

                            {/* Action Buttons */}
                            <div style={{ textAlign: 'center', marginTop: '40px', marginBottom: '40px' }}>
                                <StyledButton
                                    variant="outline-secondary"
                                    onClick={handleBack}
                                    style={{
                                        background: 'white',
                                        color: '#666',
                                        border: '2px solid #dee2e6',
                                        padding: '12px 30px',
                                        fontSize: '1rem'
                                    }}
                                >
                                    <FaArrowLeft style={{ marginRight: '10px' }} />
                                    Quay lại cửa hàng
                                </StyledButton>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>
        </>
    );
}

export default Compare;