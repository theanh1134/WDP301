import React, { useEffect, useMemo, useState } from 'react';
import { Container, Row, Col, Card, Button, Badge, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaUniversity, FaMoneyBillWave, FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaClock, FaReceipt } from 'react-icons/fa';
import axios from 'axios';
import dayjs from 'dayjs';
import authService from '../services/authService';
import Header from './Header';
import Footer from './Footer';

const MAX_WIDTH = 1400;

/**
 * RefundHistoryPage - Modern card-based design
 * - Responsive card layout instead of table
 * - Better visual hierarchy
 * - Consistent with project design
 */
export default function RefundHistoryPage() {
  const navigate = useNavigate();

  // Lấy user hiện tại (ổn định qua useMemo)
  const currentUser = useMemo(() => (authService.getCurrentUser?.() || null), []);
  const userId = useMemo(() => (currentUser?._id || currentUser?.id || ''), [currentUser]);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Helpers
  const money = (s) => `${Number(s || 0).toLocaleString('vi-VN')} VND`;
  const safeTime = (t) => (dayjs(t).isValid() ? dayjs(t).format('DD/MM/YYYY HH:mm') : '-');
  const maskAccount = (acc = '') => {
    if (!acc) return '';
    if (acc.length <= 4) return '*'.repeat(Math.max(0, acc.length - 1)) + acc.slice(-1);
    return acc.slice(0, 2) + '******' + acc.slice(-2);
  };

  async function fetchData() {
    try {
      setLoading(true);
      setError('');

      // Nếu backend không cần userId, thay đổi endpoint/params tương ứng
      const resp = await axios.get(`http://localhost:9999/api/withdrawals/user/${userId}`);

      const arr = Array.isArray(resp?.data?.data) ? resp.data.data : [];

      // sort mới nhất trước theo createdAt/requestedAt
      const sorted = [...arr].sort(
        (a, b) =>
          new Date(b?.createdAt || b?.requestedAt || 0).getTime() -
          new Date(a?.createdAt || a?.requestedAt || 0).getTime()
      );

      setItems(sorted);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Không thể tải lịch sử';
      setError(msg);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return (
    <>
<<<<<<< HEAD
        <Header />
        <Container fluid style={{ marginTop: 24, marginBottom: 100, height: '70vh' }}>
            <Button onClick={() => {navigate(-1);}}> Back </Button>
        {/* Wrapper để căn giữa và giới hạn chiều rộng "lý tưởng" lớn hơn mặc định */}
        <div style={{ maxWidth: MAX_WIDTH, margin: '0 auto' }}>
            <Row className="justify-content-center">
            <Col xs={12}>
                <Card style={{ border: 'none', borderRadius: 12, boxShadow: '0 8px 25px rgba(0,0,0,0.06)' }}>
                <Card.Body>
                    <div className="d-flex align-items-center justify-content-between mb-3">
                    <h4 className="m-0">Lịch sử hoàn tiền</h4>
                    <div className="d-flex gap-2">
                        <Button
                        variant="dark"
                        size="sm"
                        onClick={() => navigate('/refund', { state: { userId } })}
                        >
                        Tạo yêu cầu
                        </Button>
                    </div>
                    </div>
=======
      <Header />
      <Container fluid style={{
        backgroundColor: '#f8f9fa',
        minHeight: '100vh',
        paddingTop: 24,
        paddingBottom: 40
      }}>
        <div style={{ maxWidth: MAX_WIDTH, margin: '0 auto', padding: '0 15px' }}>
          {/* Header Section */}
          <div className="mb-4">
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => navigate(-1)}
              className="mb-3"
              style={{ borderRadius: 8 }}
            >
              <FaArrowLeft className="me-2" /> Quay lại
            </Button>
>>>>>>> 375b519d2ebe9dd5545188a149a111da565d99a2

            <Card style={styles.headerCard}>
              <Card.Body>
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                  <div>
                    <h3 className="mb-1" style={{ fontWeight: 600 }}>
                      <FaReceipt className="me-2 text-primary" />
                      Lịch sử rút tiền
                    </h3>
                    <p className="text-muted mb-0 small">
                      Quản lý và theo dõi các yêu cầu rút tiền của bạn
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    onClick={() => navigate('/refund', { state: { userId } })}
                    style={styles.createButton}
                  >
                    <FaMoneyBillWave className="me-2" />
                    Tạo yêu cầu rút tiền
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </div>

          {/* Loading State */}
          {loading && (
            <Card style={styles.card}>
              <Card.Body className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3 text-muted">Đang tải dữ liệu...</p>
              </Card.Body>
            </Card>
          )}

          {/* Error State */}
          {!loading && error && (
            <Card style={styles.card}>
              <Card.Body className="text-center py-5">
                <FaTimesCircle size={48} className="text-danger mb-3" />
                <p className="text-danger mb-0">{error}</p>
              </Card.Body>
            </Card>
          )}

          {/* Empty State */}
          {!loading && !error && items.length === 0 && (
            <Card style={styles.card}>
              <Card.Body className="text-center py-5">
                <FaReceipt size={48} className="text-muted mb-3" />
                <h5 className="text-muted">Chưa có yêu cầu rút tiền nào</h5>
                <p className="text-muted small mb-3">
                  Bạn chưa thực hiện yêu cầu rút tiền nào
                </p>
                <Button
                  variant="primary"
                  onClick={() => navigate('/refund', { state: { userId } })}
                >
                  Tạo yêu cầu đầu tiên
                </Button>
              </Card.Body>
            </Card>
          )}

<<<<<<< HEAD
                            return (
                                <tr key={it?.id || it?._id || it?.withdrawalCode || idx}>
                                <td>{idx + 1}</td>
                                <td title={String(it?.requestedAt || '')}>{requestedAt}</td>
                                <td title={String(it?.processedAt || it?.completedAt || '')}>{processedAt}</td>
                                <td title={String(it?.amount || '')}>{amountText}</td>
                                <td>
                                    <div>Fee: {fee}</div>
                                    {net && <div>Net: {net}</div>}
                                </td>
                                <td>{bankName}</td>
                                <td>{accNumber}</td>
                                <td>{holder || '-'}</td>
                                <td>
                                    <div>{beforeBal}</div>
                                    <div className="text-muted">→ {afterBal}</div>
                                </td>
                                <td><StatusBadge value={it?.status} /></td>
                                <td className="text-truncate" style={{ maxWidth: 260 }}>{code}</td>
                                </tr>
                            );
                            })}
                        </tbody>
                        </Table>
                    )}
                    </div>

                    
                </Card.Body>
                </Card>
            </Col>
            </Row>
=======
          {/* Withdrawal List */}
          {!loading && !error && items.length > 0 && (
            <div className="withdrawal-list">
              {items.map((item, idx) => (
                <WithdrawalCard
                  key={item?._id || item?.withdrawalCode || idx}
                  item={item}
                  index={idx}
                  money={money}
                  safeTime={safeTime}
                  maskAccount={maskAccount}
                />
              ))}
            </div>
          )}
>>>>>>> 375b519d2ebe9dd5545188a149a111da565d99a2
        </div>
      </Container>
      <Footer />
    </>
  );
}

// Withdrawal Card Component
function WithdrawalCard({ item, index, money, safeTime, maskAccount }) {
  const requestedAt = safeTime(item?.requestedAt);
  const processedAt = item?.processedAt || item?.completedAt
    ? safeTime(item?.processedAt || item?.completedAt)
    : null;
  const amountText = item?.formattedAmount || money(item?.amount);
  const fee = item?.feeInfo?.withdrawalFee || 0;
  const bankName = item?.bankInfo?.bankName || '-';
  const accNumber = maskAccount(item?.bankInfo?.accountNumber);
  const holder = (item?.bankInfo?.accountHolderName || '').toUpperCase();
  const beforeBal = money(item?.balanceSnapshot?.beforeWithdrawal);
  const afterBal = money(item?.balanceSnapshot?.afterWithdrawal);
  const code = item?.withdrawalCode || '-';

  return (
    <Card style={styles.withdrawalCard} className="mb-3">
      <Card.Body>
        {/* Header Row */}
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span style={styles.indexBadge}>#{index + 1}</span>
              <StatusBadge value={item?.status} />
            </div>
            <div className="text-muted small">
              <FaCalendarAlt className="me-1" />
              {requestedAt}
            </div>
          </div>
          <div className="text-end">
            <div style={styles.amountText}>{amountText}</div>
            {fee > 0 && (
              <div className="text-muted small">Phí: {money(fee)}</div>
            )}
          </div>
        </div>

        {/* Bank Info Row */}
        <div style={styles.infoSection}>
          <Row className="g-3">
            <Col md={6}>
              <div style={styles.infoItem}>
                <FaUniversity className="text-primary me-2" />
                <div>
                  <div className="text-muted small">Ngân hàng</div>
                  <div style={styles.infoValue}>{bankName}</div>
                </div>
              </div>
            </Col>
            <Col md={6}>
              <div style={styles.infoItem}>
                <FaReceipt className="text-primary me-2" />
                <div>
                  <div className="text-muted small">Số tài khoản</div>
                  <div style={styles.infoValue}>{accNumber}</div>
                </div>
              </div>
            </Col>
            <Col md={6}>
              <div style={styles.infoItem}>
                <div>
                  <div className="text-muted small">Chủ tài khoản</div>
                  <div style={styles.infoValue}>{holder || '-'}</div>
                </div>
              </div>
            </Col>
            <Col md={6}>
              <div style={styles.infoItem}>
                <div>
                  <div className="text-muted small">Mã giao dịch</div>
                  <div style={{ ...styles.infoValue, fontSize: '0.85rem', wordBreak: 'break-all' }}>
                    {code}
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </div>

        {/* Balance Info */}
        <div style={styles.balanceSection}>
          <div className="d-flex justify-content-between align-items-center">
            <span className="text-muted small">Số dư trước:</span>
            <span style={styles.balanceText}>{beforeBal}</span>
          </div>
          <div className="d-flex justify-content-between align-items-center">
            <span className="text-muted small">Số dư sau:</span>
            <span style={styles.balanceText}>{afterBal}</span>
          </div>
        </div>

        {/* Footer */}
        {processedAt && (
          <div className="text-muted small text-end mt-2" style={{ borderTop: '1px solid #e9ecef', paddingTop: 8 }}>
            <FaCheckCircle className="me-1" />
            Xử lý: {processedAt}
          </div>
        )}
      </Card.Body>
    </Card>
  );
}

// Status Badge Component
function StatusBadge({ value }) {
  const v = String(value || '').toUpperCase();

  const statusConfig = {
    SUCCESS: { bg: 'success', icon: FaCheckCircle, text: 'Thành công' },
    FAILED: { bg: 'danger', icon: FaTimesCircle, text: 'Thất bại' },
    CANCELED: { bg: 'secondary', icon: FaTimesCircle, text: 'Đã hủy' },
    PENDING: { bg: 'warning', icon: FaClock, text: 'Đang xử lý' }
  };

  const config = statusConfig[v] || statusConfig.PENDING;
  const Icon = config.icon;

  return (
    <Badge
      bg={config.bg}
      text={config.bg === 'warning' ? 'dark' : 'white'}
      style={{ fontSize: '0.75rem', padding: '4px 8px' }}
    >
      <Icon className="me-1" size={12} />
      {config.text}
    </Badge>
  );
}

// Styles
const styles = {
  headerCard: {
    border: 'none',
    borderRadius: 12,
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    marginBottom: 0
  },
  card: {
    border: 'none',
    borderRadius: 12,
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
  },
  withdrawalCard: {
    border: 'none',
    borderRadius: 12,
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'default',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.12)'
    }
  },
  createButton: {
    borderRadius: 8,
    padding: '8px 20px',
    fontWeight: 500
  },
  indexBadge: {
    backgroundColor: '#e9ecef',
    padding: '4px 10px',
    borderRadius: 6,
    fontSize: '0.85rem',
    fontWeight: 600
  },
  amountText: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: '#198754'
  },
  infoSection: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 12
  },
  infoItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 8
  },
  infoValue: {
    fontWeight: 600,
    fontSize: '0.95rem'
  },
  balanceSection: {
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRadius: 8,
    display: 'flex',
    flexDirection: 'column',
    gap: 6
  },
  balanceText: {
    fontWeight: 600,
    fontSize: '0.9rem'
  }
};
