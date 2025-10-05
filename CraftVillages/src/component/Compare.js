import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Card, Table, Dropdown } from 'react-bootstrap';
import { FaStar, FaStarHalfAlt, FaRegStar, FaArrowLeft } from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

function Compare() {
    const location = useLocation();
    const navigate = useNavigate();
    const [compareProducts, setCompareProducts] = useState([]);

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
        // Kiểm tra xem sản phẩm đã có trong danh sách so sánh chưa
        if (!compareProducts.find(p => p.id === product.id)) {
            setCompareProducts(prev => [...prev, product]);
        }
    };

    // Hàm xử lý khi người dùng quay về trang trước
    const handleBack = () => {
        navigate(-1);
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

    // Styles
    const styles = {
        compareContainer: {
            backgroundColor: '#f9f9f9',
            padding: '40px 0'
        },
        compareHeader: {
            backgroundImage: 'url(https://i.pinimg.com/736x/b9/f0/83/b9f0831841c5c0f7c5b2bbc64ceadaf2.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            padding: '50px 0',
            position: 'relative',
            borderRadius: '8px',
            marginBottom: '30px'
        },
        compareOverlay: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            borderRadius: '8px'
        },
        compareTitle: {
            color: '#fff',
            textAlign: 'center',
            position: 'relative',
            zIndex: 1,
            fontSize: '32px',
            fontWeight: '700'
        },
        compareBreadcrumb: {
            textAlign: 'center',
            position: 'relative',
            zIndex: 1,
            color: '#fff'
        },
        compareBreadcrumbLink: {
            color: '#fff',
            textDecoration: 'none'
        },
        compareProductsContainer: {
            marginBottom: '30px',
            backgroundColor: '#fff',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 5px 15px rgba(0, 0, 0, 0.05)'
        },
        compareProductsHeader: {
            backgroundColor: '#f5f5f5',
            padding: '20px',
            borderBottom: '1px solid #e0e0e0'
        },
        compareProductColumn: {
            textAlign: 'center',
            padding: '20px'
        },
        compareProductImage: {
            width: '100%',
            maxWidth: '200px',
            height: 'auto',
            borderRadius: '8px',
            margin: '0 auto 15px'
        },
        compareProductName: {
            fontSize: '18px',
            fontWeight: '600',
            color: '#333',
            marginBottom: '10px'
        },
        compareProductPrice: {
            fontSize: '16px',
            fontWeight: '600',
            color: '#b8860b',
            marginBottom: '10px'
        },
        compareProductRating: {
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '15px'
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
        <div style={styles.compareContainer}>
            <Container>
                <div style={styles.compareHeader}>
                    <div style={styles.compareOverlay}></div>
                    <h1 style={styles.compareTitle}>So sánh sản phẩm</h1>
                    <div style={styles.compareBreadcrumb}>
                        <span>
                            <a href="#" onClick={handleBack} style={styles.compareBreadcrumbLink}>Home</a> &gt; So sánh
                        </span>
                    </div>
                </div>

                <Row>
                    <Col md={3}>
                        <div className="sticky-top" style={{top: '20px'}}>
                            <Card>
                                <Card.Body>
                                    <h5>Truy cập trang</h5>
                                    <p>Sản phẩm để biết thêm</p>
                                    <p>Sản phẩm</p>
                                    <Button 
                                        variant="link" 
                                        style={{padding: 0, color: '#b8860b'}}
                                        onClick={handleBack}
                                    >
                                        Xem thêm
                                    </Button>
                                    
                                    <div style={styles.addToCompareDropdown}>
                                        <h5 className="mt-4">Thêm sản phẩm</h5>
                                        <Dropdown>
                                            <Dropdown.Toggle variant="outline-secondary" id="dropdown-basic" style={{width: '100%', textAlign: 'left'}}>
                                                Chọn sản phẩm
                                            </Dropdown.Toggle>

                                            <Dropdown.Menu>
                                                {productOptions
                                                    .filter(prod => !compareProducts.find(p => p.id === prod.id))
                                                    .map(prod => (
                                                        <Dropdown.Item 
                                                            key={prod.id}
                                                            onClick={() => handleAddProductToCompare(prod)}
                                                        >
                                                            {prod.name}
                                                        </Dropdown.Item>
                                                    ))
                                                }
                                                {productOptions.length === compareProducts.length && (
                                                    <Dropdown.Item disabled>Không có sản phẩm để so sánh thêm</Dropdown.Item>
                                                )}
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </div>
                                </Card.Body>
                            </Card>
                        </div>
                    </Col>

                    <Col md={9}>
                        {compareProducts.length === 0 ? (
                            <div style={styles.emptyCompareContainer}>
                                <div style={styles.emptyCompareIcon}>🔍</div>
                                <p style={styles.emptyCompareText}>Bạn chưa chọn sản phẩm nào để so sánh</p>
                                <Button 
                                    variant="outline-primary"
                                    onClick={handleBack}
                                >
                                    Quay lại trang sản phẩm
                                </Button>
                            </div>
                        ) : (
                            <div style={styles.compareProductsContainer}>
                                <Row style={styles.compareProductsHeader}>
                                    <Col>
                                        <h4>Tổng quan</h4>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={3}>
                                        {/* Cột tiêu đề */}
                                    </Col>
                                    {compareProducts.map((prod, index) => (
                                        <Col md={4} key={index} style={styles.compareProductColumn}>
                                            <img 
                                                src={prod.image} 
                                                alt={prod.name} 
                                                style={styles.compareProductImage}
                                            />
                                            <h4 style={styles.compareProductName}>{prod.name}</h4>
                                            <p style={styles.compareProductPrice}>{prod.price?.toLocaleString()} VND</p>
                                            <div style={styles.compareProductRating}>
                                                {renderRatingStars(prod.rating || 4.5)}
                                                <span style={styles.ratingText}>
                                                    ({prod.reviews || 10})
                                                </span>
                                            </div>
                                            <Button style={styles.addToCartBtnCompare} className="add-to-cart-btn">
                                                Add To Cart
                                            </Button>
                                        </Col>
                                    ))}
                                </Row>

                                <Table bordered hover>
                                    <tbody>
                                        <tr>
                                            <td style={{...styles.compareTableCell, ...styles.compareTableHeader}}>Giá bán hàng</td>
                                            {compareProducts.map((prod, index) => (
                                                <td key={index} style={styles.compareTableCell}>
                                                    {prod.price?.toLocaleString()} VND
                                                </td>
                                            ))}
                                        </tr>
                                        <tr>
                                            <td style={{...styles.compareTableCell, ...styles.compareTableHeader}}>Số hiệu mẫu</td>
                                            {compareProducts.map((prod, index) => (
                                                <td key={index} style={styles.compareTableCell}>{prod.sku || '-'}</td>
                                            ))}
                                        </tr>
                                        <tr>
                                            <td style={{...styles.compareTableCell, ...styles.compareTableHeader}}>Vật liệu</td>
                                            {compareProducts.map((prod, index) => (
                                                <td key={index} style={styles.compareTableCell}>{prod.material || '-'}</td>
                                            ))}
                                        </tr>
                                        <tr>
                                            <td style={{...styles.compareTableCell, ...styles.compareTableHeader}}>Họa tiết</td>
                                            {compareProducts.map((prod, index) => (
                                                <td key={index} style={styles.compareTableCell}>{prod.decoration || '-'}</td>
                                            ))}
                                        </tr>
                                        <tr>
                                            <td style={{...styles.compareTableCell, ...styles.compareTableHeader}}>Màu sắc</td>
                                            {compareProducts.map((prod, index) => (
                                                <td key={index} style={styles.compareTableCell}>{prod.color || 'Nguyên bản'}</td>
                                            ))}
                                        </tr>
                                    </tbody>
                                </Table>

                                <Row style={styles.compareProductsHeader}>
                                    <Col>
                                        <h4>Sản phẩm</h4>
                                    </Col>
                                </Row>

                                <Table bordered hover>
                                    <tbody>
                                        <tr>
                                            <td style={{...styles.compareTableCell, ...styles.compareTableHeader}}>Vật liệu</td>
                                            {compareProducts.map((prod, index) => (
                                                <td key={index} style={styles.compareTableCell}>{prod.material || 'Foam'}</td>
                                            ))}
                                        </tr>
                                        <tr>
                                            <td style={{...styles.compareTableCell, ...styles.compareTableHeader}}>Finish Type</td>
                                            {compareProducts.map((prod, index) => (
                                                <td key={index} style={styles.compareTableCell}>{prod.finish || 'Bright Grey & Lion'}</td>
                                            ))}
                                        </tr>
                                        <tr>
                                            <td style={{...styles.compareTableCell, ...styles.compareTableHeader}}>Adjustable Headrest</td>
                                            {compareProducts.map((prod, index) => (
                                                <td key={index} style={styles.compareTableCell}>{prod.adjustable || 'No'}</td>
                                            ))}
                                        </tr>
                                        <tr>
                                            <td style={{...styles.compareTableCell, ...styles.compareTableHeader}}>Maximum Load Capacity</td>
                                            {compareProducts.map((prod, index) => (
                                                <td key={index} style={styles.compareTableCell}>{prod.maxLoad || '250 KG'}</td>
                                            ))}
                                        </tr>
                                        <tr>
                                            <td style={{...styles.compareTableCell, ...styles.compareTableHeader}}>Origin of Manufacture</td>
                                            {compareProducts.map((prod, index) => (
                                                <td key={index} style={styles.compareTableCell}>{prod.manufacturerOrigin || 'India'}</td>
                                            ))}
                                        </tr>
                                    </tbody>
                                </Table>

                                <Row style={styles.compareProductsHeader}>
                                    <Col>
                                        <h4>Kích thước</h4>
                                    </Col>
                                </Row>

                                <Table bordered hover>
                                    <tbody>
                                        <tr>
                                            <td style={{...styles.compareTableCell, ...styles.compareTableHeader}}>Chiều rộng</td>
                                            {compareProducts.map((prod, index) => (
                                                <td key={index} style={styles.compareTableCell}>{prod.width || '285.32 cm'}</td>
                                            ))}
                                        </tr>
                                        <tr>
                                            <td style={{...styles.compareTableCell, ...styles.compareTableHeader}}>Chiều cao</td>
                                            {compareProducts.map((prod, index) => (
                                                <td key={index} style={styles.compareTableCell}>{prod.height || '76 cm'}</td>
                                            ))}
                                        </tr>
                                        <tr>
                                            <td style={{...styles.compareTableCell, ...styles.compareTableHeader}}>Độ sâu</td>
                                            {compareProducts.map((prod, index) => (
                                                <td key={index} style={styles.compareTableCell}>{prod.depth || '167.76 cm'}</td>
                                            ))}
                                        </tr>
                                    </tbody>
                                </Table>
                            </div>
                        )}

                        <div className="text-center mt-4 mb-5">
                            <Button 
                                variant="outline-secondary"
                                className="me-2"
                                onClick={handleBack}
                            >
                                <FaArrowLeft className="me-2" /> Quay lại
                            </Button>
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}

export default Compare;