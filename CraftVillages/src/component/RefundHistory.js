import React, { useEffect, useMemo, useState } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import dayjs from 'dayjs';
import authService from '../services/authService';
import Header from './Header';
import Footer from './Footer';

const MAX_WIDTH = 1600; // tăng/giảm để rộng/hẹp hơn

/**
 * RefundHistoryPage (simple, no filters)
 * - Gọi API trả về đúng schema mẫu user đưa ra
 * - Hiển thị toàn bộ danh sách (không filter), mới nhất lên trước
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
        <Header />
        <Container fluid style={{ marginTop: 24, marginBottom: 40 }}>
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

                    <div className="position-relative">
                    {loading && (
                        <div className="d-flex align-items-center justify-content-center py-5">
                        <Spinner animation="border" size="sm" className="me-2" /> Đang tải dữ liệu...
                        </div>
                    )}

                    {!loading && error && (
                        <div className="text-danger py-4">{error}</div>
                    )}

                    {!loading && !error && items.length === 0 && (
                        <div className="text-muted py-4">Không có bản ghi</div>
                    )}

                    {!loading && !error && items.length > 0 && (
                        <Table hover responsive="xl" className="align-middle">
                        <thead>
                            <tr>
                            <th>#</th>
                            <th>Requested</th>
                            <th>Processed</th>
                            <th>Amount</th>
                            <th>Fee / Net</th>
                            <th>Ngân hàng</th>
                            <th>STK</th>
                            <th>Chủ TK</th>
                            <th>Balance (before → after)</th>
                            <th>Trạng thái</th>
                            <th style={{ minWidth: 220 }}>Code</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((it, idx) => {
                            const requestedAt = safeTime(it?.requestedAt);
                            const processedAt = it?.processedAt || it?.completedAt
                                ? safeTime(it?.processedAt || it?.completedAt)
                                : '-';
                            const amountText = it?.formattedAmount || money(it?.amount);
                            const fee = money(it?.feeInfo?.withdrawalFee);
                            const net = (typeof it?.feeInfo?.netAmount !== 'undefined')
                                ? money(it?.feeInfo?.netAmount)
                                : null;
                            const bankName = it?.bankInfo?.bankName || '-';
                            const accNumber = maskAccount(it?.bankInfo?.accountNumber);
                            const holder = (it?.bankInfo?.accountHolderName || '').toUpperCase();
                            const beforeBal = money(it?.balanceSnapshot?.beforeWithdrawal);
                            const afterBal = money(it?.balanceSnapshot?.afterWithdrawal);
                            const code = it?.withdrawalCode || '-';

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

                    {/* Ghi chú xử lý (optional detail) */}
                    {items.length > 0 && (
                    <div className="mt-2" style={{ fontSize: 12 }}>
                        <div className="text-muted">
                        Ghi chú: di chuột vào thời gian để xem timestamp đầy đủ. Các trường lỗi/ghi chú xử lý (nếu có) sẽ có trong record:
                        </div>
                        <ul className="mb-0">
                        <li><code>processingInfo.notes</code> / <code>processingInfo.failureReason</code> / <code>processingInfo.transactionReference</code></li>
                        </ul>
                    </div>
                    )}
                </Card.Body>
                </Card>
            </Col>
            </Row>
        </div>
        </Container>
        <Footer />
    </>
  );
}

function StatusBadge({ value }) {
  const v = String(value || '').toUpperCase();
  if (v === 'SUCCESS') return <Badge bg="success">SUCCESS</Badge>;
  if (v === 'FAILED') return <Badge bg="danger">FAILED</Badge>;
  if (v === 'CANCELED') return <Badge bg="secondary">CANCELED</Badge>;
  return <Badge bg="warning" text="dark">PENDING</Badge>;
}
