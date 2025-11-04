import React, { useMemo, useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
// (tuỳ chọn) nếu bạn có Header/Footer chung:
// import Header from './Header';
// import Footer from './Footer';
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
      <Container style={{ marginTop: 24, marginBottom: 40 }}>
        <Row className="justify-content-center">
          <Col md={8} lg={7} xl={6}>
            <Card style={{ border: 'none', borderRadius: 12, boxShadow: '0 8px 25px rgba(0,0,0,0.06)' }}>
              <Card.Body>
                <h4 className="mb-3">Yêu cầu rút tiền</h4>
                <Form onSubmit={handleSubmit}>

                  <Form.Group className="mb-3">
                    <Form.Label>Số dư</Form.Label>
                    <div>
                    <strong>{balance?.balance.toLocaleString() } VND</strong>
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Số tiền rút (VND)</Form.Label>
                    <Form.Control
                      inputMode="numeric"
                      value={form.amountText}
                      onChange={(e) => setField('amountText', e.target.value)}
                      isInvalid={!!errors.amountText}
                      placeholder="500,000"
                    />
                    <Form.Control.Feedback type="invalid">{errors.amountText}</Form.Control.Feedback>
                  </Form.Group>

                  <fieldset className="mb-2" style={{ border: '1px solid #eee', borderRadius: 12, padding: 16 }}>
                    <legend className="px-2" style={{ fontSize: 14, fontWeight: 600 }}>Thông tin ngân hàng</legend>

                    <Form.Group className="mb-3">
                      <Form.Label>Ngân hàng</Form.Label>
                      <Form.Select
                        value={form.bankName}
                        onChange={(e) => setField('bankName', e.target.value)}
                        isInvalid={!!errors.bankName}
                      >
                        <option value="">-- Chọn ngân hàng --</option>
                        {bankOptions.map((b) => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">{errors.bankName}</Form.Control.Feedback>
                    </Form.Group>

                    <Row>
                      <Col md={6} className="mb-3">
                        <Form.Label>Số tài khoản</Form.Label>
                        <Form.Control
                          inputMode="numeric"
                          value={form.accountNumber}
                          onChange={(e) => setField('accountNumber', e.target.value.replace(/[^\d]/g, ''))}
                          isInvalid={!!errors.accountNumber}
                          placeholder="1234567890123"
                        />
                        <Form.Control.Feedback type="invalid">{errors.accountNumber}</Form.Control.Feedback>
                      </Col>
                      <Col md={6} className="mb-3">
                        <Form.Label>Chủ tài khoản</Form.Label>
                        <Form.Control
                          value={form.accountHolderName}
                          onChange={(e) => setField('accountHolderName', e.target.value)}
                          isInvalid={!!errors.accountHolderName}
                          placeholder="NGUYEN VAN A"
                        />
                        <Form.Control.Feedback type="invalid">{errors.accountHolderName}</Form.Control.Feedback>
                      </Col>
                    </Row>

                    <Form.Group className="mb-1">
                      <Form.Label>Chi nhánh (tuỳ chọn)</Form.Label>
                      <Form.Control
                        value={form.branchName}
                        onChange={(e) => setField('branchName', e.target.value)}
                        placeholder="Chi nhánh Hà Nội"
                      />
                    </Form.Group>
                  </fieldset>

                  <Form.Group className="mb-4">
                    <Form.Label>Phí rút (VND)</Form.Label>
                    <Form.Control
                      inputMode="numeric"
                      value={form.withdrawalFeeText}
                      isInvalid={!!errors.withdrawalFeeText}
                      // placeholder="5,000"
                      readOnly
                    />
                    <Form.Control.Feedback type="invalid">{errors.withdrawalFeeText}</Form.Control.Feedback>
                  </Form.Group>

                  <div className="d-flex justify-content-end gap-2">
                    <Button variant="outline-secondary" onClick={() => navigate(-1)} disabled={busy}>Huỷ</Button>
                    <Button variant="dark" type="submit" disabled={busy}>{busy ? 'Đang gửi...' : 'Gửi yêu cầu'}</Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
      <Footer />
    </>
  );
}
