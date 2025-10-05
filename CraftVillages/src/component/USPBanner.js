import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { FaTrophy, FaShieldAlt, FaTruck, FaHeadset } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';

function USPBanner() {
    const styles = {
        bannerContainer: {
            backgroundColor: '#fdf9e6',
            padding: '15px 0',
            borderTop: '1px solid rgba(0,0,0,0.05)',
            borderBottom: '1px solid rgba(0,0,0,0.05)',
            marginBottom: '30px'
        },
        bannerItem: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '10px 15px'
        },
        icon: {
            fontSize: '24px',
            color: '#b8860b',
            marginRight: '15px'
        },
        textContainer: {
            display: 'flex',
            flexDirection: 'column'
        },
        title: {
            fontSize: '16px',
            fontWeight: '600',
            color: '#333',
            marginBottom: '2px'
        },
        subtitle: {
            fontSize: '12px',
            color: '#777',
            lineHeight: '1.2'
        },
        leftBorder: {
            position: 'relative'
        },
        verticalLine: {
            '@media (min-width: 768px)': {
                content: '""',
                position: 'absolute',
                left: '0',
                top: '20%',
                height: '60%',
                width: '1px',
                backgroundColor: '#e0e0e0'
            }
        }
    };

    // Data for the USP items
    const uspItems = [
        {
            icon: <FaTrophy style={styles.icon} />,
            title: 'High Quality',
            subtitle: 'Crafted from top materials'
        },
        {
            icon: <FaShieldAlt style={styles.icon} />,
            title: 'Warranty Protection',
            subtitle: 'Over 2 years'
        },
        {
            icon: <FaTruck style={styles.icon} />,
            title: 'Free Shipping',
            subtitle: 'Order over 150 $'
        },
        {
            icon: <FaHeadset style={styles.icon} />,
            title: '24 / 7 Support',
            subtitle: 'Dedicated support'
        }
    ];

    return (
        <div style={styles.bannerContainer}>
            <Container>
                <style>
                    {`
                        @media (min-width: 768px) {
                            .usp-divider::before {
                                content: "";
                                position: absolute;
                                left: 0;
                                top: 20%;
                                height: 60%;
                                width: 1px;
                                background-color: #e0e0e0;
                            }
                        }
                    `}
                </style>
                <Row className="justify-content-center">
                    {uspItems.map((item, index) => (
                        <Col key={index} xs={12} sm={6} md={3}
                            className={`d-flex justify-content-center ${index > 0 ? "usp-divider position-relative" : ""}`}>
                            <div style={styles.bannerItem}>
                                {item.icon}
                                <div style={styles.textContainer}>
                                    <span style={styles.title}>{item.title}</span>
                                    <span style={styles.subtitle}>{item.subtitle}</span>
                                </div>
                            </div>
                        </Col>
                    ))}
                </Row>
            </Container>
        </div>
    );
}

export default USPBanner;