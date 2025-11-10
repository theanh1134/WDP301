import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import {
    Badge,
    Button,
    Card,
    Col,
    Form,
    CloseButton,
    Modal,
    OverlayTrigger,
    Pagination,
    Row,
    Spinner,
    Table,
    Tooltip
} from 'react-bootstrap';
import {
    FaBalanceScale,
    FaChartPie,
    FaClock,
    FaEdit,
    FaCogs,
    FaHistory,
    FaPercentage,
    FaSearch,
    FaSyncAlt,
    FaUserShield,
    FaCheckCircle,
    FaBan,
    FaStar
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import adminService from '../../services/adminService';

const PageWrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
`;

const Banner = styled.div`
    background: linear-gradient(135deg, #e9f5ff 0%, #f5f9ff 100%);
    border: 1px solid #e6f0fb;
    padding: 1rem 1.25rem;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
`;

const Header = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
`;

const Toolbar = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 64px;
    z-index: 2;
    background: rgba(255,255,255,0.75);
    backdrop-filter: blur(6px);
    padding: 0.5rem 0.25rem;
    border-radius: 12px;
`;

const SearchWrapper = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: white;
    padding: 0.4rem 0.6rem;
    border: 1px solid #dfe6e9;
    border-radius: 10px;
    min-width: 260px;

    svg {
        color: #95a5a6;
    }

    input {
        border: none;
        outline: none;
        flex: 1;
        font-size: 0.95rem;
    }
`;

const RefreshButton = styled(Button)`
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    border-radius: 12px;
    padding: 0.55rem 1.2rem;
    background: linear-gradient(135deg, #1abc9c 0%, #16a085 100%);
    border: none;
    font-weight: 600;

    &:hover {
        background: linear-gradient(135deg, #16a085 0%, #1abc9c 100%);
    }
`;

const SummaryCard = styled(Card)`
    border: none;
    border-radius: 16px;
    box-shadow: 0 12px 28px rgba(44, 62, 80, 0.08);
    overflow: hidden;

    .card-body {
        padding: 1.25rem 1.5rem;
    }
`;

const SummaryItem = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.75rem;

    h5 {
        margin: 0;
        font-size: 0.8rem;
        color: #7f8c8d;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        font-weight: 600;
    }

    .value {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 2rem;
        font-weight: 700;
        color: #2c3e50;
    }

    .icon-badge {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
        color: white;
        margin-bottom: 0.5rem;
    }
`;

const GlobalActionCard = styled(Card)`
    border: none;
    border-radius: 16px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    box-shadow: 0 12px 28px rgba(102, 126, 234, 0.25);
    color: white;
    transition: all 0.3s ease;
    cursor: pointer;

    &:hover {
        transform: translateY(-4px);
        box-shadow: 0 16px 32px rgba(102, 126, 234, 0.35);
    }

    .card-body {
        padding: 1.5rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
    }

    .content {
        flex: 1;
    }

    .title {
        font-size: 1.1rem;
        font-weight: 700;
        margin-bottom: 0.5rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .description {
        font-size: 0.9rem;
        opacity: 0.9;
        margin: 0;
    }

    .icon-wrapper {
        width: 56px;
        height: 56px;
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.75rem;
    }
`;

const StyledCard = styled(Card)`
    border: none;
    border-radius: 16px;
    box-shadow: 0 12px 28px rgba(44, 62, 80, 0.08);

    .card-header {
        background: white;
        border-bottom: 1px solid #ecf0f1;
        padding: 1.25rem 1.5rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;

        h5 {
            margin: 0;
            font-size: 1.05rem;
            font-weight: 700;
            color: #2c3e50;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
    }

    .card-body {
        padding: 1.25rem 1.5rem;
    }
`;

const StyledTable = styled(Table)`
    margin: 0;

    thead th {
        background: linear-gradient(135deg, #f8f9fc 0%, #f0f2f5 100%);
        border-bottom: 2px solid #e9ecef;
        color: #6b7c93;
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        font-weight: 700;
        padding: 1rem 0.75rem;
        position: sticky;
        top: 0;
        z-index: 10;
    }

    tbody tr {
        transition: all 0.2s ease;
        border-bottom: 1px solid #f0f2f5;

        &:hover {
            background: linear-gradient(135deg, #fbfdff 0%, #f8fbff 100%);
            transform: scale(1.01);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }
    }

    tbody td {
        vertical-align: middle;
        border-top: none;
        color: #2c3e50;
        font-size: 0.95rem;
        padding: 1rem 0.75rem;
    }
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
    gap: 0.25rem;

    .name {
        font-weight: 600;
        color: #2c3e50;
        font-size: 0.95rem;
    }

    .sub {
        color: #95a5a6;
        font-size: 0.85rem;
        display: flex;
        align-items: center;
        gap: 0.35rem;
    }
`;

const RateBadge = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.85rem;
    border-radius: 8px;
    background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
    border: 2px solid #667eea;
    font-weight: 700;
    font-size: 1.1rem;
    color: #667eea;

    svg {
        font-size: 0.9rem;
    }
`;

const StatusBadge = styled(Badge)`
    font-size: 0.775rem;
    padding: 0.4rem 0.75rem;
    border-radius: 999px;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;

    svg {
        font-size: 0.7rem;
    }
`;

const ActionButton = styled(Button)`
    border-radius: 8px;
    font-size: 0.85rem;
    padding: 0.4rem 0.75rem;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    transition: all 0.2s ease;
    border: 1px solid;

    &.btn-outline-primary {
        border-color: #667eea;
        color: #667eea;

        &:hover {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-color: #667eea;
            color: white;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }
    }

    &.btn-outline-secondary {
        border-color: #95a5a6;
        color: #7f8c8d;

        &:hover {
            background: #7f8c8d;
            border-color: #7f8c8d;
            color: white;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(127, 140, 141, 0.3);
        }
    }

    svg {
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

const HistoryItem = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 1.25rem;
    border-radius: 12px;
    background: #f8f9fa;
    margin-bottom: 1rem;
    border-left: 4px solid #667eea;
    transition: all 0.2s ease;

    &:hover {
        background: #f0f2f5;
        transform: translateX(4px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }

    &:last-child {
        margin-bottom: 0;
    }

    .headline {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        font-weight: 700;
        color: #2c3e50;
        font-size: 1.05rem;
    }

    .meta {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
        font-size: 0.85rem;
        color: #7f8c8d;

        span {
            display: flex;
            align-items: center;
            gap: 0.35rem;
        }
    }

    .reason-note {
        margin-top: 0.5rem;
        padding: 0.75rem;
        background: white;
        border-radius: 8px;
        font-size: 0.9rem;

        strong {
            color: #667eea;
            font-weight: 600;
        }
    }
`;

const StyledModal = styled(Modal)`
    .modal-content {
        border: none;
        border-radius: 16px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        overflow: hidden;
    }

    .modal-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        padding: 1.5rem 1.75rem;

        .modal-title {
            font-weight: 700;
            font-size: 1.25rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .btn-close {
            filter: brightness(0) invert(1);
            opacity: 0.8;

            &:hover {
                opacity: 1;
            }
        }
    }

    .modal-body {
        padding: 1.75rem;
    }

    .modal-footer {
        border-top: 1px solid #ecf0f1;
        padding: 1.25rem 1.75rem;
        background: #f8f9fa;
    }
`;

const FormGroup = styled(Form.Group)`
    margin-bottom: 1.25rem;

    label {
        font-weight: 600;
        color: #2c3e50;
        margin-bottom: 0.5rem;
        font-size: 0.95rem;
    }

    input, textarea {
        border-radius: 8px;
        border: 2px solid #e9ecef;
        padding: 0.65rem 0.85rem;
        transition: all 0.2s ease;

        &:focus {
            border-color: #667eea;
            box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.15);
        }
    }

    .form-text {
        margin-top: 0.5rem;
        font-size: 0.85rem;
        color: #7f8c8d;
    }
`;

const InfoBox = styled.div`
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    padding: 1rem 1.25rem;
    border-radius: 12px;
    margin-bottom: 1.5rem;
    border-left: 4px solid #667eea;

    .text-muted {
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: 0.5rem;
        font-weight: 600;
    }

    .fw-semibold {
        font-size: 1.1rem;
        font-weight: 700;
        color: #2c3e50;
        margin-bottom: 0.25rem;
    }

    .text-muted:not(:first-child) {
        font-size: 0.9rem;
        text-transform: none;
        letter-spacing: normal;
        font-weight: 400;
    }
`;

const CommissionManagement = () => {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState('');
    const [pendingSearch, setPendingSearch] = useState('');
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [data, setData] = useState(null);
    const [selectedRow, setSelectedRow] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [showGlobalModal, setShowGlobalModal] = useState(false);
    const [updateForm, setUpdateForm] = useState({
        percentageRate: '',
        reason: '',
        note: ''
    });
    const [updateSubmitting, setUpdateSubmitting] = useState(false);
    const [history, setHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [globalForm, setGlobalForm] = useState({
        percentageRate: '',
        reason: '',
        note: '',
        overrideShopConfigs: false
    });
    const [globalSubmitting, setGlobalSubmitting] = useState(false);

    const pagination = data?.pagination;
    const summary = data?.summary;
    const items = data?.items || [];

    const fetchData = useCallback(async (options = {}) => {
        try {
            const { keepLoadingState = false, pageOverride } = options;
            if (!keepLoadingState) {
                setLoading(true);
            } else {
                setRefreshing(true);
            }
            const response = await adminService.getSellerCommissionList({
                page: pageOverride || page,
                limit,
                search
            });
            setData(response.data);
        } catch (error) {
            toast.error(error?.message || 'Không thể tải dữ liệu hoa hồng.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [limit, page, search]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSearchSubmit = () => {
        setSearch(pendingSearch.trim());
        setPage(1);
    };

    const handleRefresh = () => {
        fetchData({ keepLoadingState: true });
    };

    const openGlobalEdit = () => {
        setGlobalForm(form => ({
            ...form,
            percentageRate: summary?.defaultRate ?? '',
            reason: '',
            note: '',
            overrideShopConfigs: false
        }));
        setShowGlobalModal(true);
    };

    const submitGlobalUpdate = async () => {
        if (globalForm.percentageRate === '' || globalForm.percentageRate === null) {
            toast.warning('Vui lòng nhập tỷ lệ hoa hồng.');
            return;
        }
        const rateNumber = parseFloat(globalForm.percentageRate);
        if (Number.isNaN(rateNumber) || rateNumber < 0 || rateNumber > 100) {
            toast.warning('Tỷ lệ hoa hồng phải nằm trong khoảng 0 - 100%.');
            return;
        }
        setGlobalSubmitting(true);
        try {
            await adminService.updateGlobalCommission({
                percentageRate: rateNumber,
                reason: globalForm.reason,
                note: globalForm.note,
                overrideShopConfigs: globalForm.overrideShopConfigs
            });
            toast.success('Cập nhật hoa hồng mặc định thành công.');
            setShowGlobalModal(false);
            fetchData({ keepLoadingState: true });
        } catch (error) {
            toast.error(error?.message || 'Không thể cập nhật hoa hồng mặc định.');
        } finally {
            setGlobalSubmitting(false);
        }
    };

    const handleOpenEdit = (record) => {
        setSelectedRow(record);
        setUpdateForm({
            percentageRate: record?.currentCommission?.currentRate ?? '',
            reason: '',
            note: ''
        });
        setShowEditModal(true);
    };

    const handleOpenHistory = async (record) => {
        setSelectedRow(record);
        setShowHistoryModal(true);
        setHistory([]);
        setHistoryLoading(true);
        try {
            const response = await adminService.getSellerCommissionHistory(record.shopId);
            setHistory(response.data?.history || []);
        } catch (error) {
            toast.error(error?.message || 'Không thể tải lịch sử hoa hồng.');
        } finally {
            setHistoryLoading(false);
        }
    };

    const handleUpdateCommission = async () => {
        if (!selectedRow) return;
        if (updateForm.percentageRate === '' || updateForm.percentageRate === null) {
            toast.warning('Vui lòng nhập tỷ lệ hoa hồng.');
            return;
        }
        const rateNumber = parseFloat(updateForm.percentageRate);
        if (Number.isNaN(rateNumber) || rateNumber < 0 || rateNumber > 100) {
            toast.warning('Tỷ lệ hoa hồng phải nằm trong khoảng 0 - 100%.');
            return;
        }
        setUpdateSubmitting(true);
        try {
            await adminService.updateSellerCommission(selectedRow.shopId, {
                percentageRate: rateNumber,
                reason: updateForm.reason,
                note: updateForm.note
            });
            toast.success('Cập nhật tỷ lệ hoa hồng thành công.');
            setShowEditModal(false);
            fetchData({ keepLoadingState: true });
        } catch (error) {
            toast.error(error?.message || 'Không thể cập nhật tỷ lệ hoa hồng.');
        } finally {
            setUpdateSubmitting(false);
        }
    };

    const totalPages = useMemo(() => pagination?.totalPages || 1, [pagination]);

    const renderPagination = () => {
        if (!pagination || totalPages <= 1) return null;
        const items = [];
        for (let number = 1; number <= totalPages; number += 1) {
            items.push(
                <Pagination.Item
                    key={number}
                    active={number === page}
                    onClick={() => {
                        setPage(number);
                        fetchData({ pageOverride: number, keepLoadingState: true });
                    }}
                >
                    {number}
                </Pagination.Item>
            );
        }
        return <Pagination>{items}</Pagination>;
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '420px' }}>
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    return (
        <PageWrapper>
            <Header>
                <Banner>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                            width: 40, height: 40, borderRadius: 12,
                            background: 'linear-gradient(135deg, #66a6ff 0%, #89f7fe 100%)'
                        }}/>
                        <div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#2c3e50' }}>
                                Quản Lý Hoa Hồng
                            </div>
                            <div style={{ color: '#7f8c8d' }}>
                                Theo dõi, điều chỉnh tỷ lệ và lịch sử thay đổi đồng bộ với toàn hệ thống.
                            </div>
                        </div>
                    </div>
                </Banner>
            </Header>

            <Row className="g-3">
                <Col lg={3} md={6}>
                    <SummaryCard>
                        <Card.Body>
                            <SummaryItem>
                                <div className="icon-badge" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                                    <FaPercentage />
                                </div>
                                <h5>Hoa hồng mặc định</h5>
                                <span className="value">{summary?.defaultFormattedRate || '—'}</span>
                            </SummaryItem>
                        </Card.Body>
                    </SummaryCard>
                </Col>
                <Col lg={3} md={6}>
                    <SummaryCard>
                        <Card.Body>
                            <SummaryItem>
                                <div className="icon-badge" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                                    <FaChartPie />
                                </div>
                                <h5>Tỷ lệ trung bình</h5>
                                <span className="value">{summary?.averageRate ? `${summary.averageRate}%` : '—'}</span>
                            </SummaryItem>
                        </Card.Body>
                    </SummaryCard>
                </Col>
                <Col lg={3} md={6}>
                    <SummaryCard>
                        <Card.Body>
                            <SummaryItem>
                                <div className="icon-badge" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                                    <FaUserShield />
                                </div>
                                <h5>Sellers tùy chỉnh</h5>
                                <span className="value">{summary?.customCommissionCount || 0}</span>
                            </SummaryItem>
                        </Card.Body>
                    </SummaryCard>
                </Col>
                <Col lg={3} md={6}>
                    <GlobalActionCard onClick={openGlobalEdit}>
                        <Card.Body>
                            <div className="content">
                                <div className="title">
                                    <FaCogs />
                                    Điều chỉnh toàn bộ
                                </div>
                                <p className="description">
                                    Cập nhật hoa hồng cho tất cả cửa hàng
                                </p>
                            </div>
                            <div className="icon-wrapper">
                                <FaBalanceScale />
                            </div>
                        </Card.Body>
                    </GlobalActionCard>
                </Col>
            </Row>

            <Toolbar>
                <SearchWrapper>
                    <FaSearch />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo cửa hàng hoặc seller…"
                        value={pendingSearch}
                        onChange={(event) => setPendingSearch(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                                handleSearchSubmit();
                            }
                        }}
                    />
                </SearchWrapper>

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <Button variant="outline-secondary" onClick={handleSearchSubmit}>
                        <FaSearch style={{ marginRight: '0.35rem' }} />
                        Tìm kiếm
                    </Button>
                    
                </div>
            </Toolbar>

            <StyledCard>
                <Card.Header>
                    <h5>
                        <FaPercentage />
                        Danh sách cửa hàng &amp; tỷ lệ hiện tại
                    </h5>
                    <span>Tổng cộng {pagination?.total || 0} cửa hàng</span>
                </Card.Header>
                <Card.Body>
                    {items.length === 0 ? (
                        <EmptyState>
                            <FaPercentage />
                            <p>Chưa có dữ liệu phù hợp.</p>
                        </EmptyState>
                    ) : (
                        <>
                            <StyledTable responsive hover>
                                <thead>
                                    <tr>
                                        <th>Cửa hàng</th>
                                        <th>Seller</th>
                                        <th>Tỷ lệ hiện tại</th>
                                        <th>Hiệu lực</th>
                                        <th>Lần cập nhật</th>
                                        <th>Trạng thái</th>
                                        <th>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map(record => {
                                        const commission = record.currentCommission;
                                        const latestChange = record.latestChange;
                                        return (
                                            <tr key={record.shopId}>
                                                <td>
                                                    <SellerInfo>
                                                        <Avatar src={record.shopAvatar}>
                                                            {!record.shopAvatar && (record.shopName?.[0] || 'S')}
                                                        </Avatar>
                                                        <SellerMeta>
                                                            <span className="name">{record.shopName}</span>
                                                            {commission?.isCustom && (
                                                                <span className="sub">
                                                                    <FaStar style={{ color: '#f39c12' }} />
                                                                    Tùy chỉnh riêng
                                                                </span>
                                                            )}
                                                        </SellerMeta>
                                                    </SellerInfo>
                                                </td>
                                                <td>
                                                    <SellerMeta>
                                                        <span className="name">{record.seller?.name}</span>
                                                        <span className="sub">{record.seller?.email}</span>
                                                    </SellerMeta>
                                                </td>
                                                <td>
                                                    {commission?.feeType === 'PERCENTAGE' ? (
                                                        <RateBadge>
                                                            <FaPercentage />
                                                            {commission.currentRate?.toFixed(2)}%
                                                        </RateBadge>
                                                    ) : (
                                                        commission?.formattedRate || '—'
                                                    )}
                                                </td>
                                                <td>
                                                    {commission?.effectiveFrom ? (
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                                            <span>{new Date(commission.effectiveFrom).toLocaleDateString('vi-VN')}</span>
                                                            {commission?.effectiveTo && (
                                                                <Badge bg="light" text="dark">
                                                                    đến {new Date(commission.effectiveTo).toLocaleDateString('vi-VN')}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        '—'
                                                    )}
                                                </td>
                                                <td>
                                                    {latestChange ? (
                                                        <OverlayTrigger
                                                            placement="top"
                                                            overlay={(
                                                                <Tooltip id={`tooltip-change-${record.shopId}`}>
                                                                    Cập nhật bởi {latestChange.changedBy?.fullName || 'Admin'} lúc {new Date(latestChange.changedAt).toLocaleString('vi-VN')}
                                                                </Tooltip>
                                                            )}
                                                        >
                                                            <span>
                                                                <FaClock style={{ marginRight: '0.35rem', color: '#7f8c8d' }} />
                                                                {new Date(latestChange.changedAt).toLocaleDateString('vi-VN')}
                                                            </span>
                                                        </OverlayTrigger>
                                                    ) : (
                                                        '—'
                                                    )}
                                                </td>
                                                <td>
                                                    <StatusBadge bg={record.isActive ? 'success' : 'secondary'}>
                                                        {record.isActive ? (
                                                            <>
                                                                <FaCheckCircle />
                                                                Đang hoạt động
                                                            </>
                                                        ) : (
                                                            <>
                                                                <FaBan />
                                                                Đã khóa
                                                            </>
                                                        )}
                                                    </StatusBadge>
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                        <ActionButton
                                                            size="sm"
                                                            variant="outline-primary"
                                                            onClick={() => handleOpenEdit(record)}
                                                        >
                                                            <FaEdit />
                                                            Điều chỉnh
                                                        </ActionButton>
                                                        <ActionButton
                                                            size="sm"
                                                            variant="outline-secondary"
                                                            onClick={() => handleOpenHistory(record)}
                                                        >
                                                            <FaHistory />
                                                            Lịch sử
                                                        </ActionButton>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </StyledTable>
                            <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap gap-2">
                                <div style={{ color: '#95a5a6', fontSize: '0.9rem' }}>
                                    Hiển thị {items.length} / {pagination?.total || 0} cửa hàng
                                </div>
                                {renderPagination()}
                            </div>
                        </>
                    )}
                </Card.Body>
            </StyledCard>

            <StyledModal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        <FaEdit />
                        Cập nhật hoa hồng
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <InfoBox>
                        <small className="text-muted text-uppercase">Cửa hàng</small>
                        <div className="fw-semibold">{selectedRow?.shopName}</div>
                        <div className="text-muted">{selectedRow?.seller?.name}</div>
                    </InfoBox>
                    <Form>
                        <FormGroup controlId="commissionRate">
                            <Form.Label>Tỷ lệ hoa hồng (%)</Form.Label>
                            <Form.Control
                                type="number"
                                min="0"
                                max="100"
                                step="0.1"
                                value={updateForm.percentageRate}
                                onChange={(event) => setUpdateForm(form => ({
                                    ...form,
                                    percentageRate: event.target.value
                                }))}
                                placeholder="Nhập tỷ lệ từ 0 đến 100"
                            />
                            <Form.Text className="text-muted">
                                Tỷ lệ hoa hồng hiện tại: {selectedRow?.currentCommission?.currentRate?.toFixed(2)}%
                            </Form.Text>
                        </FormGroup>
                        <FormGroup controlId="commissionReason">
                            <Form.Label>Lý do điều chỉnh</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                placeholder="Ví dụ: Seller đạt KPI quý 4 nên giảm phí…"
                                value={updateForm.reason}
                                onChange={(event) => setUpdateForm(form => ({
                                    ...form,
                                    reason: event.target.value
                                }))}
                            />
                        </FormGroup>
                        <FormGroup className="mb-0" controlId="commissionNote">
                            <Form.Label>Ghi chú nội bộ</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                placeholder="Ghi chú thêm cho nội bộ quản lý..."
                                value={updateForm.note}
                                onChange={(event) => setUpdateForm(form => ({
                                    ...form,
                                    note: event.target.value
                                }))}
                            />
                        </FormGroup>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                        Hủy
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleUpdateCommission}
                        disabled={updateSubmitting}
                        style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            border: 'none',
                            fontWeight: 600
                        }}
                    >
                        {updateSubmitting ? (
                            <>
                                <Spinner size="sm" animation="border" className="me-2" />
                                Đang lưu...
                            </>
                        ) : (
                            <>
                                <FaBalanceScale style={{ marginRight: '0.35rem' }} />
                                Lưu thay đổi
                            </>
                        )}
                    </Button>
                </Modal.Footer>
            </StyledModal>

            {/* Global Update Modal */}
            <StyledModal show={showGlobalModal} onHide={() => setShowGlobalModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        <FaCogs />
                        Cập nhật hoa hồng mặc định (toàn bộ)
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div style={{
                        background: 'linear-gradient(135deg, #fff5f5 0%, #ffe5e5 100%)',
                        padding: '1rem 1.25rem',
                        borderRadius: '12px',
                        marginBottom: '1.5rem',
                        borderLeft: '4px solid #e74c3c'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <FaBalanceScale style={{ color: '#e74c3c' }} />
                            <strong style={{ color: '#e74c3c' }}>Cảnh báo quan trọng</strong>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#c0392b' }}>
                            Thay đổi này sẽ ảnh hưởng đến tất cả các đơn hàng mới trong hệ thống. Vui lòng kiểm tra kỹ trước khi áp dụng.
                        </p>
                    </div>
                    <Form>
                        <FormGroup controlId="globalRate">
                            <Form.Label>Tỷ lệ hoa hồng mặc định (%)</Form.Label>
                            <Form.Control
                                type="number"
                                min="0"
                                max="100"
                                step="0.1"
                                value={globalForm.percentageRate}
                                onChange={(event) => setGlobalForm(form => ({
                                    ...form,
                                    percentageRate: event.target.value
                                }))}
                                placeholder="Nhập tỷ lệ từ 0 đến 100"
                            />
                            <Form.Text className="text-muted">
                                Tỷ lệ hiện tại: {summary?.defaultFormattedRate || '—'}
                            </Form.Text>
                        </FormGroup>
                        <FormGroup controlId="globalReason">
                            <Form.Label>Lý do điều chỉnh</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                placeholder="Ví dụ: Điều chỉnh chính sách phí sàn theo quý..."
                                value={globalForm.reason}
                                onChange={(event) => setGlobalForm(form => ({
                                    ...form,
                                    reason: event.target.value
                                }))}
                            />
                        </FormGroup>
                        <FormGroup controlId="globalNote">
                            <Form.Label>Ghi chú nội bộ</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                placeholder="Ghi chú thêm cho nội bộ quản lý..."
                                value={globalForm.note}
                                onChange={(event) => setGlobalForm(form => ({
                                    ...form,
                                    note: event.target.value
                                }))}
                            />
                        </FormGroup>
                        <FormGroup controlId="globalOverride" className="mb-0">
                            <div style={{
                                background: '#f8f9fa',
                                padding: '1rem',
                                borderRadius: '8px',
                                border: '2px solid #e9ecef'
                            }}>
                                <Form.Check
                                    type="switch"
                                    label={
                                        <span style={{ fontWeight: 600, color: '#2c3e50' }}>
                                            Ghi đè toàn bộ cấu hình tùy chỉnh của cửa hàng
                                        </span>
                                    }
                                    checked={globalForm.overrideShopConfigs}
                                    onChange={(event) => setGlobalForm(form => ({
                                        ...form,
                                        overrideShopConfigs: event.target.checked
                                    }))}
                                />
                                <Form.Text className="text-muted" style={{ display: 'block', marginTop: '0.5rem' }}>
                                    ⚠️ Bật tùy chọn này nếu bạn muốn áp dụng tỷ lệ mới cho TẤT CẢ cửa hàng, bao gồm cả những shop đã có cấu hình riêng.
                                </Form.Text>
                            </div>
                        </FormGroup>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowGlobalModal(false)}>
                        Hủy
                    </Button>
                    <Button
                        variant="danger"
                        onClick={submitGlobalUpdate}
                        disabled={globalSubmitting}
                        style={{
                            background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
                            border: 'none',
                            fontWeight: 600
                        }}
                    >
                        {globalSubmitting ? (
                            <>
                                <Spinner size="sm" animation="border" className="me-2" />
                                Đang áp dụng...
                            </>
                        ) : (
                            <>
                                <FaBalanceScale style={{ marginRight: '0.35rem' }} />
                                Áp dụng toàn bộ
                            </>
                        )}
                    </Button>
                </Modal.Footer>
            </StyledModal>
            <StyledModal show={showHistoryModal} onHide={() => setShowHistoryModal(false)} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        <FaHistory />
                        Lịch sử thay đổi hoa hồng
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                    <InfoBox>
                        <small className="text-muted text-uppercase">Cửa hàng</small>
                        <div className="fw-semibold">{selectedRow?.shopName}</div>
                        <div className="text-muted">{selectedRow?.seller?.name}</div>
                    </InfoBox>
                    {historyLoading ? (
                        <div className="d-flex justify-content-center py-5">
                            <div style={{ textAlign: 'center' }}>
                                <Spinner animation="border" style={{ color: '#667eea' }} />
                                <p style={{ marginTop: '1rem', color: '#7f8c8d' }}>Đang tải lịch sử...</p>
                            </div>
                        </div>
                    ) : history.length === 0 ? (
                        <EmptyState>
                            <FaHistory />
                            <p>Chưa có lịch sử điều chỉnh.</p>
                        </EmptyState>
                    ) : (
                        <div>
                            <div style={{
                                marginBottom: '1rem',
                                padding: '0.75rem 1rem',
                                background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
                                borderRadius: '8px',
                                fontSize: '0.9rem',
                                color: '#2e7d32',
                                fontWeight: 600
                            }}>
                                📊 Tổng số thay đổi: {history.length}
                            </div>
                            {history.map((item, index) => (
                                <HistoryItem key={item.id}>
                                    <div className="headline">
                                        <FaPercentage style={{ color: '#f39c12' }} />
                                        <span style={{ color: '#e74c3c' }}>
                                            {item.previousRate !== null ? `${item.previousRate}%` : '—'}
                                        </span>
                                        <span style={{ color: '#95a5a6' }}>→</span>
                                        <span style={{ color: '#27ae60', fontWeight: 700 }}>{item.newRate}%</span>
                                    </div>
                                    <div className="meta">
                                        <span>
                                            <FaClock />
                                            {new Date(item.createdAt).toLocaleString('vi-VN')}
                                        </span>
                                        {item.changedBy && (
                                            <span>
                                                <FaUserShield />
                                                {item.changedBy.name}
                                            </span>
                                        )}
                                    </div>
                                    {(item.reason || item.note) && (
                                        <div className="reason-note">
                                            {item.reason && (
                                                <div style={{ marginBottom: item.note ? '0.5rem' : 0 }}>
                                                    <strong>Lý do:</strong> {item.reason}
                                                </div>
                                            )}
                                            {item.note && (
                                                <div style={{ color: '#636e72' }}>
                                                    <strong>Ghi chú:</strong> {item.note}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </HistoryItem>
                            ))}
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowHistoryModal(false)}>
                        Đóng
                    </Button>
                </Modal.Footer>
            </StyledModal>
        </PageWrapper>
    );
};

export default CommissionManagement;

