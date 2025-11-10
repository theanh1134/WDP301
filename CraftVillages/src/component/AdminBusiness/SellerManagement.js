import React, { useEffect, useMemo, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { Card, Col, Row, Spinner, Table, Badge, ProgressBar, OverlayTrigger, Tooltip, Form } from 'react-bootstrap';
import {
    FaCrown,
    FaMedal,
    FaMoneyBillWave,
    FaShoppingCart,
    FaStar,
    FaChartLine,
    FaStore,
    FaSyncAlt
} from 'react-icons/fa';
import adminService from '../../services/adminService';

const PageWrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
`;

const PageHeader = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    h2 {
        font-size: 1.75rem;
        font-weight: 700;
        color: #2c3e50;
        margin: 0;
    }

    p {
        margin: 0;
        color: #7f8c8d;
    }
`;

const FilterBar = styled.div`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 1rem;
    justify-content: space-between;
`;

const FilterControls = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    align-items: center;
`;

const FilterButton = styled.button`
    padding: 0.55rem 1.25rem;
    border-radius: 999px;
    border: 1px solid ${({ active }) => (active ? '#3498db' : '#dfe6e9')};
    background: ${({ active }) => (active ? 'rgba(52, 152, 219, 0.15)' : 'white')};
    color: ${({ active }) => (active ? '#2980b9' : '#636e72')};
    font-weight: ${({ active }) => (active ? 600 : 500)};
    transition: all 0.2s ease;
    cursor: pointer;

    &:hover {
        border-color: #3498db;
        color: #2980b9;
    }
`;

const spin = keyframes`
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
`;

const RefreshButton = styled.button`
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.55rem 1.2rem;
    border-radius: 12px;
    border: none;
    background: linear-gradient(135deg, #1abc9c 0%, #16a085 100%);
    color: white;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;

    &:hover {
        transform: translateY(-1px);
        box-shadow: 0 10px 20px rgba(26, 188, 156, 0.2);
    }

    &:disabled {
        opacity: 0.7;
        cursor: default;
        transform: none;
        box-shadow: none;
    }

    svg {
        animation: ${({ refreshing }) => (refreshing ? `${spin} 1.2s linear infinite` : 'none')};
    }
`;

const StyledCard = styled(Card)`
    border: none;
    border-radius: 16px;
    box-shadow: 0 10px 30px rgba(44, 62, 80, 0.08);
    overflow: hidden;
    height: 100%;

    .card-header {
        background: white;
        border-bottom: 1px solid #ecf0f1;
        padding: 1.25rem 1.5rem;
        display: flex;
        justify-content: space-between;
        align-items: center;

        h5 {
            margin: 0;
            font-size: 1.125rem;
            font-weight: 600;
            color: #2c3e50;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        span {
            font-size: 0.875rem;
            color: #95a5a6;
        }
    }

    .card-body {
        padding: 1.5rem;
    }
`;

const RankBadge = styled.div`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    font-weight: 600;
    color: ${({ rank }) => (rank <= 3 ? 'white' : '#2c3e50')};
    background: ${({ rank }) => {
        if (rank === 1) return 'linear-gradient(135deg, #fbc531 0%, #f6e58d 100%)';
        if (rank === 2) return 'linear-gradient(135deg, #dfe4ea 0%, #ced6e0 100%)';
        if (rank === 3) return 'linear-gradient(135deg, #fab1a0 0%, #e17055 100%)';
        return '#ecf0f1';
    }};
    box-shadow: ${({ rank }) => (rank <= 3 ? '0 6px 12px rgba(0,0,0,0.15)' : 'none')};
`;

const SellerInfo = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
`;

const Avatar = styled.div`
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: ${({ src }) =>
        src
            ? `url(${src}) center/cover no-repeat`
            : 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)'};
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 600;
    font-size: 1.1rem;
`;

const SellerMeta = styled.div`
    display: flex;
    flex-direction: column;

    .name {
        font-weight: 600;
        color: #2c3e50;
    }

    .shop {
        color: #95a5a6;
        font-size: 0.85rem;
    }
`;

const EmptyState = styled.div`
    padding: 3rem 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    color: #95a5a6;

    svg {
        font-size: 2.5rem;
    }

    p {
        margin: 0;
    }
`;

const PerformanceHighlight = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 1rem;
`;

const HighlightCard = styled.div`
    background: ${({ variant }) => {
        switch (variant) {
            case 'primary':
                return 'linear-gradient(135deg, rgba(46, 213, 115, 0.15) 0%, rgba(39, 174, 96, 0.15) 100%)';
            case 'secondary':
                return 'linear-gradient(135deg, rgba(30, 55, 153, 0.12) 0%, rgba(76, 161, 175, 0.12) 100%)';
            default:
                return '#f8f9fa';
        }
    }};
    border-radius: 16px;
    padding: 1.25rem 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    border: 1px solid rgba(0, 0, 0, 0.04);

    h4 {
        margin: 0;
        font-size: 1rem;
        color: #2c3e50;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    span {
        font-size: 0.85rem;
        color: #636e72;
    }
`;

const ScoreCard = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 1rem 1.25rem;
    border-radius: 16px;
    background: ${({ rank }) => (rank === 1 ? 'linear-gradient(135deg, rgba(249,202,36,0.18) 0%, rgba(250,211,144,0.2) 100%)' : '#f9fbfd')};
    border: 1px solid ${({ rank }) => (rank === 1 ? 'rgba(249, 202, 36, 0.4)' : 'rgba(0, 0, 0, 0.03)')};
    box-shadow: ${({ rank }) => (rank === 1 ? '0 12px 30px rgba(249, 202, 36, 0.18)' : 'none')};
`;

const ScoreHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;

    .score {
        font-size: 2rem;
        font-weight: 700;
        color: #2c3e50;
    }

    .badge {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        padding: 0.35rem 0.75rem;
        border-radius: 999px;
        font-size: 0.75rem;
        font-weight: 600;
        background: rgba(52, 152, 219, 0.12);
        color: #2980b9;
    }
`;

const ScoreBreakdown = styled.div`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.75rem;

    .metric {
        display: flex;
        flex-direction: column;
        gap: 0.45rem;

        span {
            font-size: 0.8rem;
            color: #7f8c8d;
            font-weight: 600;
        }

        .progress {
            height: 8px;
            border-radius: 999px;
            background: rgba(0, 0, 0, 0.05);
            overflow: hidden;

            .progress-bar {
                border-radius: 999px;
                transition: width 0.6s ease;
            }
        }
    }
`;

const StyledTable = styled(Table)`
    margin: 0;

    thead th {
        background: #f8f9fc;
        border-bottom: none;
        color: #8492a6;
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.08em;
    }

    tbody td {
        vertical-align: middle;
        border-top: 1px solid #f0f2f5;
        color: #34495e;
    }
`;

const periodOptions = [
    { label: 'Hôm nay', value: 'day' },
    { label: 'Tuần này', value: 'week' },
    { label: 'Tháng này', value: 'month' },
    { label: 'Năm nay', value: 'year' }
];

const limitOptions = [
    { label: 'Top 5', value: 5 },
    { label: 'Top 10', value: 10 },
    { label: 'Top 15', value: 15 },
    { label: 'Top 20', value: 20 }
];

const SellerManagement = () => {
    const [period, setPeriod] = useState('month');
    const [limit, setLimit] = useState(10);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [performanceData, setPerformanceData] = useState(null);

    const formattedPeriodLabel = useMemo(() => {
        return periodOptions.find(option => option.value === period)?.label || 'Tháng này';
    }, [period]);

    useEffect(() => {
        fetchSellerPerformance(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [period, limit]);

    const fetchSellerPerformance = async (isRefresh = true) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }
            setError(null);

            const response = await adminService.getSellerPerformance(period, limit);
            if (response.success) {
                setPerformanceData(response.data);
            } else {
                setPerformanceData(null);
                setError(response.message || 'Không thể tải dữ liệu.');
            }
        } catch (err) {
            setError(err?.message || 'Đã xảy ra lỗi khi tải dữ liệu.');
            setPerformanceData(null);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const formatCurrency = value =>
        `₫${Math.round(value || 0).toLocaleString('vi-VN')}`;

    const formatNumber = value => (value || 0).toLocaleString('vi-VN');

    const renderRankIcon = rank => {
        if (rank === 1) return <FaCrown color="#f9ca24" />;
        if (rank === 2) return <FaMedal color="#95a5a6" />;
        if (rank === 3) return <FaMedal color="#e67e22" />;
        return null;
    };

    const renderRevenueRows = items => {
        if (!items?.length) {
            return (
                <tr>
                    <td colSpan={6}>
                        <EmptyState>
                            <FaStore />
                            <p>Chưa có dữ liệu cho kỳ này.</p>
                        </EmptyState>
                    </td>
                </tr>
            );
        }

        return items.map((item, index) => (
            <tr key={`${item.sellerId}-revenue-${index}`}>
                <td style={{ width: '70px' }}>
                    <RankBadge rank={index + 1}>{index + 1}</RankBadge>
                </td>
                <td>
                    <SellerInfo>
                        <Avatar src={item.shopAvatar || item.sellerAvatar}>
                            {!(item.shopAvatar || item.sellerAvatar) && (item.shopName?.[0] || item.sellerName?.[0] || 'S')}
                        </Avatar>
                        <SellerMeta>
                            <span className="name">{item.shopName}</span>
                            <span className="shop">{item.sellerName}</span>
                        </SellerMeta>
                    </SellerInfo>
                </td>
                <td>{formatCurrency(item.totalRevenue)}</td>
                <td>
                    <Badge bg="light" text="dark">
                        {formatNumber(item.totalOrders)} đơn
                    </Badge>
                </td>
                <td>
                    <Badge bg="warning" text="dark">
                        <FaStar style={{ marginRight: '4px' }} />
                        {(item.rating || 0).toFixed(2)}{' '}
                        <span style={{ color: '#7f8c8d' }}>
                            ({formatNumber(item.ratingCount || 0)})
                        </span>
                    </Badge>
                </td>
                <td>
                    {item.lastTransactionAt && (
                        <span style={{ fontSize: '0.75rem', color: '#7f8c8d' }}>
                            {new Date(item.lastTransactionAt).toLocaleString('vi-VN')}
                        </span>
                    )}
                </td>
            </tr>
        ));
    };

    const renderOrderRows = items => {
        if (!items?.length) {
            return (
                <tr>
                    <td colSpan={6}>
                        <EmptyState>
                            <FaStore />
                            <p>Chưa có dữ liệu cho kỳ này.</p>
                        </EmptyState>
                    </td>
                </tr>
            );
        }

        return items.map((item, index) => (
            <tr key={`${item.sellerId}-orders-${index}`}>
                <td style={{ width: '70px' }}>
                    <RankBadge rank={index + 1}>{index + 1}</RankBadge>
                </td>
                <td>
                    <SellerInfo>
                        <Avatar src={item.shopAvatar || item.sellerAvatar}>
                            {!(item.shopAvatar || item.sellerAvatar) && (item.shopName?.[0] || item.sellerName?.[0] || 'S')}
                        </Avatar>
                        <SellerMeta>
                            <span className="name">{item.shopName}</span>
                            <span className="shop">{item.sellerName}</span>
                        </SellerMeta>
                    </SellerInfo>
                </td>
                <td>{formatCurrency(item.totalRevenue)}</td>
                <td>
                    <Badge bg="primary">
                        {formatNumber(item.totalOrders)} đơn
                    </Badge>
                </td>
                <td>
                    <Badge bg="warning" text="dark">
                        <FaStar style={{ marginRight: '4px' }} />
                        {(item.rating || 0).toFixed(2)}{' '}
                        <span style={{ color: '#7f8c8d' }}>
                            ({formatNumber(item.ratingCount || 0)})
                        </span>
                    </Badge>
                </td>
                <td>
                    {item.lastTransactionAt && (
                        <span style={{ fontSize: '0.75rem', color: '#7f8c8d' }}>
                            {new Date(item.lastTransactionAt).toLocaleString('vi-VN')}
                        </span>
                    )}
                </td>
            </tr>
        ));
    };

    const renderRatingRows = items => {
        if (!items?.length) {
            return (
                <tr>
                    <td colSpan={6}>
                        <EmptyState>
                            <FaStore />
                            <p>Chưa có dữ liệu đánh giá.</p>
                        </EmptyState>
                    </td>
                </tr>
            );
        }

        return items.map((item, index) => (
            <tr key={`${item.sellerId}-rating-${index}`}>
                <td style={{ width: '70px' }}>
                    <RankBadge rank={index + 1}>{index + 1}</RankBadge>
                </td>
                <td>
                    <SellerInfo>
                        <Avatar src={item.shopAvatar || item.sellerAvatar}>
                            {!(item.shopAvatar || item.sellerAvatar) && (item.shopName?.[0] || item.sellerName?.[0] || 'S')}
                        </Avatar>
                        <SellerMeta>
                            <span className="name">{item.shopName}</span>
                            <span className="shop">{item.sellerName}</span>
                        </SellerMeta>
                    </SellerInfo>
                </td>
                <td>
                    <Badge bg="warning" text="dark">
                        <FaStar style={{ marginRight: '4px' }} />
                        {(item.averageRating || item.rating || 0).toFixed(2)}
                    </Badge>
                </td>
                <td>
                    <Badge bg="light" text="dark">
                        {formatNumber(item.reviewCount)} đánh giá
                    </Badge>
                </td>
                <td>
                    <Badge bg="info">
                        {formatNumber(item.totalOrdersLifetime)} đơn HL
                    </Badge>
                </td>
                <td>
                    {item.updatedAt && (
                        <span style={{ fontSize: '0.75rem', color: '#7f8c8d' }}>
                            {new Date(item.updatedAt).toLocaleString('vi-VN')}
                        </span>
                    )}
                </td>
            </tr>
        ));
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    if (error) {
        return (
            <EmptyState>
                <FaStore />
                <p>{error}</p>
                <RefreshButton onClick={() => fetchSellerPerformance(false)}>
                    <FaSyncAlt />
                    Thử lại
                </RefreshButton>
            </EmptyState>
        );
    }

    return (
        <PageWrapper>
            <PageHeader>
                <h2>Quản Lý Sellers</h2>
                <p>
                    Theo dõi hiệu suất và xếp hạng của các cửa hàng trên sàn. Dữ liệu được tổng hợp trong kỳ:{' '}
                    <strong>{formattedPeriodLabel.toLowerCase()}</strong>.
                </p>
            </PageHeader>

            <FilterBar>
                <FilterControls>
                    {periodOptions.map(option => (
                        <FilterButton
                            key={option.value}
                            active={period === option.value}
                            onClick={() => setPeriod(option.value)}
                        >
                            {option.label}
                        </FilterButton>
                    ))}
                </FilterControls>

                <FilterControls>
                    <Form.Select
                        value={limit}
                        onChange={event => setLimit(parseInt(event.target.value, 10))}
                        style={{ width: '120px' }}
                    >
                        {limitOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </Form.Select>
                    
                </FilterControls>
            </FilterBar>

            <PerformanceHighlight>
                <HighlightCard variant="primary">
                    <h4>
                        <FaMoneyBillWave />
                        Top Doanh Thu
                    </h4>
                    <span>
                        Cửa hàng đứng đầu về doanh thu nền tảng trong kỳ {formattedPeriodLabel.toLowerCase()}.
                    </span>
                    {performanceData?.revenueRanking?.[0] ? (
                        <ScoreCard rank={1}>
                            <ScoreHeader>
                                <SellerInfo>
                                    <Avatar src={performanceData.revenueRanking[0].shopAvatar}>
                                        {!performanceData.revenueRanking[0].shopAvatar &&
                                            (performanceData.revenueRanking[0].shopName?.[0] || 'S')}
                                    </Avatar>
                                    <SellerMeta>
                                        <span className="name">{performanceData.revenueRanking[0].shopName}</span>
                                        <span className="shop">{performanceData.revenueRanking[0].sellerName}</span>
                                    </SellerMeta>
                                </SellerInfo>
                                <span className="score">{formatCurrency(performanceData.revenueRanking[0].totalRevenue)}</span>
                            </ScoreHeader>
                        </ScoreCard>
                    ) : (
                        <EmptyState>
                            <FaMoneyBillWave />
                            <p>Chưa có dữ liệu doanh thu.</p>
                        </EmptyState>
                    )}
                </HighlightCard>

                <HighlightCard variant="secondary">
                    <h4>
                        <FaShoppingCart />
                        Top Đơn Hàng
                    </h4>
                    <span>
                        Cửa hàng có số lượng đơn hàng hoàn tất nhiều nhất trong kỳ {formattedPeriodLabel.toLowerCase()}.
                    </span>
                    {performanceData?.orderRanking?.[0] ? (
                        <ScoreCard>
                            <ScoreHeader>
                                <SellerInfo>
                                    <Avatar src={performanceData.orderRanking[0].shopAvatar}>
                                        {!performanceData.orderRanking[0].shopAvatar &&
                                            (performanceData.orderRanking[0].shopName?.[0] || 'S')}
                                    </Avatar>
                                    <SellerMeta>
                                        <span className="name">{performanceData.orderRanking[0].shopName}</span>
                                        <span className="shop">{performanceData.orderRanking[0].sellerName}</span>
                                    </SellerMeta>
                                </SellerInfo>
                                <span className="score">{formatNumber(performanceData.orderRanking[0].totalOrders)}</span>
                            </ScoreHeader>
                        </ScoreCard>
                    ) : (
                        <EmptyState>
                            <FaShoppingCart />
                            <p>Chưa có dữ liệu đơn hàng.</p>
                        </EmptyState>
                    )}
                </HighlightCard>

                <HighlightCard>
                    <h4>
                        <FaStar />
                        Đánh Giá Xuất Sắc
                    </h4>
                    <span>
                        Các cửa hàng được đánh giá cao nhất bởi khách hàng trên toàn sàn.
                    </span>
                    {performanceData?.ratingRanking?.slice(0, 3).map((shop, idx) => (
                        <ScoreCard key={shop.sellerId || idx} rank={idx === 0 ? 1 : 0}>
                            <ScoreHeader>
                                <SellerInfo>
                                    <Avatar src={shop.shopAvatar || shop.sellerAvatar}>
                                        {!(shop.shopAvatar || shop.sellerAvatar) && (shop.shopName?.[0] || 'S')}
                                    </Avatar>
                                    <SellerMeta>
                                        <span className="name">{shop.shopName}</span>
                                        <span className="shop">{shop.sellerName}</span>
                                    </SellerMeta>
                                </SellerInfo>
                                <span className="score">
                                    {shop.averageRating?.toFixed(2)} <FaStar color="#f9ca24" />
                                </span>
                            </ScoreHeader>
                            <span style={{ fontSize: '0.8rem', color: '#7f8c8d' }}>
                                {formatNumber(shop.reviewCount)} đánh giá • {formatNumber(shop.totalOrdersLifetime)} đơn thành công
                            </span>
                        </ScoreCard>
                    ))}
                </HighlightCard>
            </PerformanceHighlight>

            <StyledCard>
                <Card.Header>
                    <h5>
                        <FaChartLine />
                        Xếp Hạng Hiệu Suất Tổng Hợp
                    </h5>
                    <span>Điểm số dựa trên doanh thu, đơn hàng, đánh giá và GMV.</span>
                </Card.Header>
                <Card.Body>
                    <Row className="g-3">
                        {performanceData?.performanceLeaders?.map((leader, index) => (
                            <Col key={leader.sellerId || index} lg={4} md={6}>
                                <ScoreCard rank={index === 0 ? 1 : 0}>
                                    <ScoreHeader>
                                        <SellerInfo>
                                            <Avatar src={leader.shopAvatar || leader.sellerAvatar}>
                                                {!(leader.shopAvatar || leader.sellerAvatar) &&
                                                    (leader.shopName?.[0] || leader.sellerName?.[0] || 'S')}
                                            </Avatar>
                                            <SellerMeta>
                                                <span className="name">{leader.shopName}</span>
                                                <span className="shop">{leader.sellerName}</span>
                                            </SellerMeta>
                                        </SellerInfo>
                                        <div>
                                            <div className="badge">
                                                {renderRankIcon(index + 1)}
                                                Top {index + 1}
                                            </div>
                                            <div className="score">{leader.performanceScore?.toFixed(1)}</div>
                                        </div>
                                    </ScoreHeader>
                                    <ScoreBreakdown>
                                        <div className="metric">
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span>Doanh thu</span>
                                                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#27ae60' }}>
                                                    {leader.revenueScore?.toFixed(1) || 0}
                                                </span>
                                            </div>
                                            <OverlayTrigger
                                                overlay={
                                                    <Tooltip id={`tooltip-revenue-${leader.sellerId}`}>
                                                        Điểm doanh thu: {leader.revenueScore?.toFixed(1) || 0}/100
                                                    </Tooltip>
                                                }
                                            >
                                                <ProgressBar
                                                    now={leader.revenueScore || 0}
                                                    variant="success"
                                                    style={{ cursor: 'pointer' }}
                                                />
                                            </OverlayTrigger>
                                        </div>
                                        <div className="metric">
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span>Đơn hàng</span>
                                                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#3498db' }}>
                                                    {leader.ordersScore?.toFixed(1) || 0}
                                                </span>
                                            </div>
                                            <OverlayTrigger
                                                overlay={
                                                    <Tooltip id={`tooltip-orders-${leader.sellerId}`}>
                                                        Điểm đơn hàng: {leader.ordersScore?.toFixed(1) || 0}/100
                                                    </Tooltip>
                                                }
                                            >
                                                <ProgressBar
                                                    now={leader.ordersScore || 0}
                                                    variant="info"
                                                    style={{ cursor: 'pointer' }}
                                                />
                                            </OverlayTrigger>
                                        </div>
                                        <div className="metric">
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span>Đánh giá</span>
                                                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f39c12' }}>
                                                    {leader.ratingScore?.toFixed(1) || 0}
                                                </span>
                                            </div>
                                            <OverlayTrigger
                                                overlay={
                                                    <Tooltip id={`tooltip-rating-${leader.sellerId}`}>
                                                        Điểm đánh giá: {leader.ratingScore?.toFixed(1) || 0}/100
                                                    </Tooltip>
                                                }
                                            >
                                                <ProgressBar
                                                    now={leader.ratingScore || 0}
                                                    variant="warning"
                                                    style={{ cursor: 'pointer' }}
                                                />
                                            </OverlayTrigger>
                                        </div>
                                        <div className="metric">
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span>GMV</span>
                                                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#667eea' }}>
                                                    {leader.gmvScore?.toFixed(1) || 0}
                                                </span>
                                            </div>
                                            <OverlayTrigger
                                                overlay={
                                                    <Tooltip id={`tooltip-gmv-${leader.sellerId}`}>
                                                        Điểm GMV: {leader.gmvScore?.toFixed(1) || 0}/100
                                                    </Tooltip>
                                                }
                                            >
                                                <ProgressBar
                                                    now={leader.gmvScore || 0}
                                                    variant="primary"
                                                    style={{ cursor: 'pointer' }}
                                                />
                                            </OverlayTrigger>
                                        </div>
                                    </ScoreBreakdown>
                                    <div style={{ fontSize: '0.8rem', color: '#7f8c8d' }}>
                                        Doanh thu: <strong>{formatCurrency(leader.totalRevenue)}</strong> • Đơn hàng:{' '}
                                        <strong>{formatNumber(leader.totalOrders)}</strong> • ĐTB: <strong>{(leader.rating || 0).toFixed(2)}</strong>
                                    </div>
                                </ScoreCard>
                            </Col>
                        ))}
                    </Row>
                </Card.Body>
            </StyledCard>

            <Row className="g-4">
                <Col lg={6}>
                    <StyledCard>
                        <Card.Header>
                            <h5>
                                <FaMoneyBillWave />
                                Ranking Doanh Thu
                            </h5>
                            <span>Top cửa hàng theo doanh thu nền tảng.</span>
                        </Card.Header>
                        <Card.Body>
                            <StyledTable responsive="md" hover>
                                <thead>
                                    <tr>
                                        <th>Xếp hạng</th>
                                        <th>Cửa hàng</th>
                                        <th>Doanh thu</th>
                                        <th>Đơn hàng</th>
                                        <th>Rating</th>
                                        <th>Cập nhật</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {renderRevenueRows(performanceData?.revenueRanking)}
                                </tbody>
                            </StyledTable>
                        </Card.Body>
                    </StyledCard>
                </Col>
                <Col lg={6}>
                    <StyledCard>
                        <Card.Header>
                            <h5>
                                <FaShoppingCart />
                                Ranking Đơn Hàng
                            </h5>
                            <span>Top cửa hàng theo số lượng đơn hàng hoàn tất.</span>
                        </Card.Header>
                        <Card.Body>
                            <StyledTable responsive="md" hover>
                                <thead>
                                    <tr>
                                        <th>Xếp hạng</th>
                                        <th>Cửa hàng</th>
                                        <th>Doanh thu</th>
                                        <th>Đơn hàng</th>
                                        <th>Rating</th>
                                        <th>Cập nhật</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {renderOrderRows(performanceData?.orderRanking)}
                                </tbody>
                            </StyledTable>
                        </Card.Body>
                    </StyledCard>
                </Col>
            </Row>

            <StyledCard>
                <Card.Header>
                    <h5>
                        <FaStar />
                        Ranking Đánh Giá
                    </h5>
                    <span>Các cửa hàng được khách hàng yêu thích nhất.</span>
                </Card.Header>
                <Card.Body>
                    <StyledTable responsive hover>
                        <thead>
                            <tr>
                                <th>Xếp hạng</th>
                                <th>Cửa hàng</th>
                                <th>Điểm trung bình</th>
                                <th>Đánh giá</th>
                                <th>Đơn hàng tích lũy</th>
                                <th>Cập nhật</th>
                            </tr>
                        </thead>
                        <tbody>
                            {renderRatingRows(performanceData?.ratingRanking)}
                        </tbody>
                    </StyledTable>
                </Card.Body>
            </StyledCard>
        </PageWrapper>
    );
};

export default SellerManagement;

