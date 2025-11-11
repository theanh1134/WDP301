import React, { useMemo, useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaWallet, FaMoneyBillWave, FaUniversity, FaUserCircle, FaMapMarkerAlt, FaInfoCircle } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';
import authService from '../services/authService';
import Header from './Header';
import Footer from './Footer';

/**
 * RefundPage (full page thay cho dialog)
 * - Đọc userId/balance từ location.state (nếu có) hoặc authService
 * - Cho phép nhập thông tin rút tiền và POST lên BE
 * - Payload khớp với BE mẫu của bạn
 */
export default function RefundPage() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const currentUser = useMemo(() => authService.getCurrentUser?.() || null, []);
  const inferredUserId = state?.userId || currentUser?._id || currentUser?.id || '';

  const [form, setForm] = useState({
    userId: inferredUserId,
    amountText: '',
    bankName: '',
    accountNumber: '',
    accountHolderName: '',
    branchName: '',
    withdrawalFeeText: '0',
  });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [balance, setBalance] = useState();

  const bankOptions = [
    'Vietcombank',
    'Vietinbank',
    'BIDV',
    'Agribank',
    'Techcombank',
    'MB Bank',
    'ACB',
    'TPBank',
    'VPBank',
  ];

  useEffect(() => {
    const load = async () => {
        try {
            const res = await axios.get(`http://localhost:9999/users/${inferredUserId}/balance`)
            console.log(res.data.data)
            setBalance(res.data.data)
        } catch (e) {
            // ignore
        }
      };
      load();
  }, []);

  useEffect(() => {
    // đồng bộ userId khi state/currentUser thay đổi
    setForm((f) => ({ ...f, userId: inferredUserId }));
  }, [inferredUserId]);

  const parsedAmount = useMemo(() => toNumber(form.amountText), [form.amountText]);
  const parsedFee = useMemo(() => toNumber(form.withdrawalFeeText), [form.withdrawalFeeText]);

  function toNumber(s) {
    const n = Number(String(s).replace(/[^0-9.-]/g, ''));
    return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
  }
  function formatCurrency(n) {
    const x = typeof n === 'number' ? n : toNumber(n);
    return x.toLocaleString('vi-VN');
  }
  function setField(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function validate() {
    const e = {};
    if (!form.userId?.trim()) e.userId = 'Thiếu userId';
    if (parsedAmount <= 0) e.amountText = 'Số tiền rút phải > 0';
    if (!form.bankName.trim()) e.bankName = 'Chọn ngân hàng';
    if (!form.accountNumber.trim()) e.accountNumber = 'Nhập số tài khoản';
    else if (!/^\d{6,20}$/.test(form.accountNumber.trim())) e.accountNumber = 'Số tài khoản không hợp lệ';
    if (!form.accountHolderName.trim()) e.accountHolderName = 'Nhập tên chủ tài khoản';
    if (parsedFee < 0) e.withdrawalFeeText = 'Phí rút không hợp lệ';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    if (!validate()) return;

    const payload = {
      userId: form.userId.trim(),
      amount: parsedAmount,
      bankInfo: {
        bankName: form.bankName.trim(),
        accountNumber: form.accountNumber.trim(),
        accountHolderName: form.accountHolderName.trim().toUpperCase(),
        branchName: form.branchName.trim() || undefined,
      },
      withdrawalFee: parsedFee,
    };

    try {
      setBusy(true);
      // Đổi URL BE theo hệ thống của bạn
      const resp = await axios.post('http://localhost:9999/api/withdrawals', payload);
      if (!resp?.data?.success && resp?.status >= 400) {
        throw new Error(resp?.data?.message || `HTTP ${resp.status}`);
      }
      toast.success('Gửi yêu cầu rút tiền thành công');
      // (tuỳ chọn) quay lại trang hồ sơ
      navigate(-1);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Gửi yêu cầu thất bại';
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Header />
      <Container fluid style={{
        backgroundColor: '#f8f9fa',
        minHeight: '100vh',
        paddingTop: 24,
        paddingBottom: 40
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 15px' }}>
          {/* Back Button */}
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => navigate(-1)}
            className="mb-3"
            style={{ borderRadius: 8 }}
          >
            <FaArrowLeft className="me-2" /> Quay lại
          </Button>

          {/* Header Card */}
          <Card style={styles.headerCard} className="mb-4">
            <Card.Body>
              <div className="text-center">
                <h3 className="mb-2" style={{ fontWeight: 600 }}>
                  <FaMoneyBillWave className="me-2 text-primary" />
                  Yêu cầu rút tiền
                </h3>
                <p className="text-muted mb-0 small">
                  Vui lòng điền đầy đủ thông tin để tạo yêu cầu rút tiền
                </p>
              </div>
            </Card.Body>
          </Card>

          {/* Balance Display Card */}
          <Card style={styles.balanceCard} className="mb-4">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-3">
                  <div style={styles.balanceIcon}>
                    <FaWallet size={24} className="text-primary" />
                  </div>
                  <div>
                    <div className="text-muted small mb-1">Số dư khả dụng</div>
                    <div style={styles.balanceAmount}>
                      {balance?.balance?.toLocaleString('vi-VN') || '0'} VND
                    </div>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Main Form Card */}
          <Card style={styles.formCard}>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                {/* Amount Input */}
                <div style={styles.section}>
                  <div style={styles.sectionHeader}>
                    <FaMoneyBillWave className="me-2 text-primary" />
                    <span>Số tiền rút</span>
                  </div>
                  <Form.Group className="mb-3">
                    <Form.Label className="small text-muted">Số tiền rút (VND)</Form.Label>
                    <Form.Control
                      size="lg"
                      inputMode="numeric"
                      value={form.amountText}
                      onChange={(e) => setField('amountText', e.target.value)}
                      isInvalid={!!errors.amountText}
                      placeholder="Nhập số tiền, ví dụ: 500000"
                      style={styles.input}
                    />
                    <Form.Control.Feedback type="invalid">{errors.amountText}</Form.Control.Feedback>
                    {parsedAmount > 0 && (
                      <Form.Text className="text-success">
                        <FaInfoCircle className="me-1" />
                        Số tiền: {parsedAmount.toLocaleString('vi-VN')} VND
                      </Form.Text>
                    )}
                  </Form.Group>
                </div>

                {/* Bank Information Section */}
                <div style={styles.section}>
                  <div style={styles.sectionHeader}>
                    <FaUniversity className="me-2 text-primary" />
                    <span>Thông tin ngân hàng</span>
                  </div>

                  <Form.Group className="mb-3">
                    <Form.Label className="small text-muted">Ngân hàng</Form.Label>
                    <Form.Select
                      size="lg"
                      value={form.bankName}
                      onChange={(e) => setField('bankName', e.target.value)}
                      isInvalid={!!errors.bankName}
                      style={styles.input}
                    >
                      <option value="">-- Chọn ngân hàng --</option>
                      {bankOptions.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">{errors.bankName}</Form.Control.Feedback>
                  </Form.Group>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="small text-muted">Số tài khoản</Form.Label>
                        <Form.Control
                          size="lg"
                          inputMode="numeric"
                          value={form.accountNumber}
                          onChange={(e) => setField('accountNumber', e.target.value.replace(/[^\d]/g, ''))}
                          isInvalid={!!errors.accountNumber}
                          placeholder="1234567890123"
                          style={styles.input}
                        />
                        <Form.Control.Feedback type="invalid">{errors.accountNumber}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="small text-muted">Chủ tài khoản</Form.Label>
                        <Form.Control
                          size="lg"
                          value={form.accountHolderName}
                          onChange={(e) => setField('accountHolderName', e.target.value)}
                          isInvalid={!!errors.accountHolderName}
                          placeholder="NGUYEN VAN A"
                          style={styles.input}
                        />
                        <Form.Control.Feedback type="invalid">{errors.accountHolderName}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label className="small text-muted">
                      <FaMapMarkerAlt className="me-1" />
                      Chi nhánh (tuỳ chọn)
                    </Form.Label>
                    <Form.Control
                      size="lg"
                      value={form.branchName}
                      onChange={(e) => setField('branchName', e.target.value)}
                      placeholder="Chi nhánh Hà Nội"
                      style={styles.input}
                    />
                  </Form.Group>
                </div>

                {/* Fee Section */}
                <div style={styles.feeSection}>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted">Phí rút tiền</span>
                    <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                      {parsedFee.toLocaleString('vi-VN')} VND
                    </span>
                  </div>
                </div>

                {/* Info Alert */}
                <Alert variant="info" className="mb-4" style={{ borderRadius: 8, border: 'none' }}>
                  <FaInfoCircle className="me-2" />
                  <small>
                    Yêu cầu rút tiền sẽ được xử lý trong vòng 24h. Vui lòng kiểm tra kỹ thông tin trước khi gửi.
                  </small>
                </Alert>

                {/* Action Buttons */}
                <div className="d-flex justify-content-end gap-2">
                  <Button
                    variant="outline-secondary"
                    onClick={() => navigate(-1)}
                    disabled={busy}
                    style={styles.cancelButton}
                  >
                    Huỷ
                  </Button>
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={busy}
                    style={styles.submitButton}
                  >
                    {busy ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        Đang gửi...
                      </>
                    ) : (
                      <>
                        <FaMoneyBillWave className="me-2" />
                        Gửi yêu cầu
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </div>
      </Container>
      <Footer />
    </>
  );
}

// Styles
const styles = {
  headerCard: {
    border: 'none',
    borderRadius: 12,
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white'
  },
  balanceCard: {
    border: 'none',
    borderRadius: 12,
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    color: 'white'
  },
  balanceIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  balanceAmount: {
    fontSize: '1.5rem',
    fontWeight: 700
  },
  formCard: {
    border: 'none',
    borderRadius: 12,
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
  },
  section: {
    marginBottom: 24,
    paddingBottom: 24,
    borderBottom: '1px solid #e9ecef'
  },
  sectionHeader: {
    fontSize: '1rem',
    fontWeight: 600,
    marginBottom: 16,
    display: 'flex',
    alignItems: 'center'
  },
  input: {
    borderRadius: 8,
    border: '1px solid #dee2e6',
    padding: '10px 14px'
  },
  feeSection: {
    backgroundColor: '#fff3cd',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20
  },
  cancelButton: {
    borderRadius: 8,
    padding: '10px 24px',
    fontWeight: 500
  },
  submitButton: {
    borderRadius: 8,
    padding: '10px 24px',
    fontWeight: 500
  }
};
