import React, { useEffect, useMemo, useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Badge, Image, Modal } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from './Header';
import Footer from './Footer';
import authService from '../services/authService';
import userService from '../services/userService';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Flex } from 'antd';
import { useNavigate } from 'react-router-dom';

function Profile() {
    const baseUser = useMemo(() => authService.getCurrentUser?.() || null, []);
    const [profile, setProfile] = useState(baseUser || {});
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({ fullName: '', phoneNumber: '', avatarUrl: '' });
    const [addresses, setAddresses] = useState([]);
    const [newAddress, setNewAddress] = useState({ street: '', ward: '', district: '', city: '', country: 'Việt Nam', note: '' });
    const [showChangePw, setShowChangePw] = useState(false);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [balance, setBalance] = useState();

    const fullName = (editing ? form.fullName : (profile?.fullName || profile?.name || profile?.username || ''));
    const email = profile?.email || '';
    const avatarUrl = (editing ? form.avatarUrl : profile?.avatarUrl) || `https://ui-avatars.com/api/?background=d4af37&color=fff&name=${encodeURIComponent(fullName || email || 'U')}`;

    const navigate = useNavigate();
    useEffect(() => {
        const load = async () => {
            const id = baseUser?._id || baseUser?.id;
            if (!id) return;
            try {
                const data = await userService.getUserById(id);
                setProfile(data);
                setForm({
                    fullName: data.fullName || '',
                    phoneNumber: data.phoneNumber || '',
                    avatarUrl: data.avatarUrl || ''
                });
                const res = await axios.get(`http://localhost:9999/users/${id}/balance`)
                console.log(res.data.data)
                setBalance(res.data.data)
                setAddresses(Array.isArray(data.addresses) ? data.addresses : []);
            } catch (e) {
                // ignore
            }
        };
        load();
    }, [baseUser]);

    const setDefaultAddress = (index) => {
        if (index < 0 || index >= addresses.length) return;
        const next = [...addresses];
        const [chosen] = next.splice(index, 1);
        setAddresses([chosen, ...next]);
    };

    const addAddress = () => {
        const addr = newAddress || {};
        if (!addr.street || !addr.city) return;
        setAddresses(prev => [...prev, {
            ...addr,
            isDefault: prev.length === 0
        }]);
        setNewAddress({ fullName: '', phoneNumber: '', street: '', ward: '', district: '', city: '', country: 'Việt Nam', note: '' });
    };

    const removeAddress = (index) => {
        setAddresses(addresses.filter((_, i) => i !== index));
    };

    const saveProfile = async () => {
        try {
            const id = baseUser?._id || baseUser?.id;
            const payload = {
                fullName: form.fullName,
                phoneNumber: form.phoneNumber,
                avatarUrl: form.avatarUrl,
                addresses
            };
            const updated = await userService.updateUser(id, payload);
            setProfile(updated);
            setEditing(false);
            try {
                const raw = localStorage.getItem('user');
                if (raw) {
                    const u = JSON.parse(raw);
                    u.fullName = updated.fullName;
                    u.avatarUrl = updated.avatarUrl;
                    u.phoneNumber = updated.phoneNumber;
                    u.addresses = updated.addresses;
                    localStorage.setItem('user', JSON.stringify(u));
                }
            } catch { }
            toast.success('Đã lưu thông tin tài khoản');
        } catch (e) {
            toast.error(e?.response?.data?.message || 'Không thể lưu thông tin');
        }
    };

    const styles = {
        headerSection: {
            backgroundImage: 'linear-gradient(135deg, rgba(184,134,11,0.95), rgba(212,175,55,0.95))',
            borderRadius: '16px',
            padding: '32px',
            color: 'white',
            marginBottom: '24px'
        },
        avatar: {
            width: 96,
            height: 96,
            borderRadius: '50%',
            border: '3px solid #fff',
            objectFit: 'cover'
        },
        card: {
            border: 'none',
            borderRadius: '12px',
            boxShadow: '0 8px 25px rgba(0,0,0,0.08)'
        },
        sectionTitle: {
            fontWeight: 700,
            marginBottom: 16,
            color: '#333'
        },
        label: {
            fontSize: 13,
            color: '#777'
        }
    };

    return (
        <>
            <Header />
            <Container style={{ marginTop: 24, marginBottom: 40 }}>
                {/* Top summary */}
                <div style={styles.headerSection}>
                    <Row className="align-items-center">
                        <Col md={1} className="mb-3 mb-md-0">
                            <Image src={avatarUrl} alt={fullName} style={styles.avatar} />
                        </Col>
                        <Col md={7} className="mb-3 mb-md-0">
                            <h4 style={{ margin: 0, fontWeight: 700 }}>Xin chào, {fullName || 'Người dùng'}</h4>
                            <div>{email}</div>
                            <div className="mt-2">
                                <Badge bg="light" text="dark">Thành viên</Badge>
                            </div>
                        </Col>
                        <Col md={4} className="text-md-end">
                            {!editing ? (
                                <>
                                    <Button variant="light" className="me-2" onClick={() => setEditing(true)}>Chỉnh sửa</Button>
                                    <Button variant="light" href="/orders">Đơn hàng của tôi</Button>
                                </>
                            ) : (
                                <>
                                    <Button variant="light" className="me-2" onClick={() => { setEditing(false); setForm({ fullName: profile.fullName || '', phoneNumber: profile.phoneNumber || '', avatarUrl: profile.avatarUrl || '' }); setAddresses(Array.isArray(profile.addresses) ? profile.addresses : []); }}>Hủy</Button>
                                    <Button variant="dark" onClick={saveProfile}>Lưu</Button>
                                </>
                            )}
                        </Col>
                    </Row>
                </div>

                <Row className="g-4">
                    <Col lg={6}>
                        <Card style={styles.card}>
                            <Card.Body>
                                <h5 style={styles.sectionTitle}>Thông tin cá nhân</h5>
                                <Form onSubmit={(e) => { e.preventDefault(); }}>
                                    <Form.Group className="mb-3">
                                        <Form.Label style={styles.label}>Họ và tên</Form.Label>
                                        <Form.Control value={editing ? form.fullName : fullName} disabled={!editing} onChange={(e) => setForm(s => ({ ...s, fullName: e.target.value }))} />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label style={styles.label}>Email</Form.Label>
                                        <Form.Control type="email" value={email} disabled />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label style={styles.label}>Số điện thoại</Form.Label>
                                        <Form.Control value={editing ? form.phoneNumber : (profile?.phoneNumber || '')} disabled={!editing} onChange={(e) => setForm(s => ({ ...s, phoneNumber: e.target.value }))} />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label style={styles.label}>Ảnh đại diện (URL)</Form.Label>
                                        <Form.Control value={editing ? form.avatarUrl : (profile?.avatarUrl || '')} disabled={!editing} onChange={(e) => setForm(s => ({ ...s, avatarUrl: e.target.value }))} />
                                    </Form.Group>
                                    <Button variant="warning" onClick={saveProfile} disabled={!editing}>Lưu thay đổi</Button>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col lg={6}>
                        <Card style={styles.card}>
                            <Card.Body style={{display: 'flex', justifyContent:'space-between', alignItems:'center'}}>
                                <h5>Balance: {balance?.formattedBalance ? balance.formattedBalance : '0 VND' }</h5>
                                <Button
                                    variant="light"
                                    onClick={() => navigate('/refund-history')}
                                    >
                                    Lịch sử rút tiền
                                </Button>
                                <Button onClick={() => {
                                    const uid = profile?._id || profile?.id || '';
                                    navigate('/refund', { state: { userId: uid, balance } }); // gửi kèm state nếu muốn
                                }}>Rút tiền</Button>
                            </Card.Body>
                        </Card>
                        <div style={{marginBottom:25}}></div>
                        <Card style={styles.card}>
                            <Card.Body>
                                <h5 style={styles.sectionTitle}>Địa chỉ mặc định</h5>
                                {!editing ? (
                                    <div style={{ color: '#555' }}>{(addresses && addresses.length > 0) ? [addresses[0]?.street, addresses[0]?.ward, addresses[0]?.district, addresses[0]?.city, addresses[0]?.country].filter(Boolean).join(', ') : 'Chưa có địa chỉ'}</div>
                                ) : (
                                    <>
                                        {addresses.length === 0 && (
                                            <div style={{ color: '#555' }}>Chưa có địa chỉ</div>
                                        )}
                                        {addresses.map((addr, i) => (
                                            <div key={i} className="d-flex align-items-center justify-content-between mb-2">
                                                <div className="d-flex align-items-center" style={{ gap: 8 }}>
                                                    <Form.Check
                                                        type="radio"
                                                        name="defaultAddress"
                                                        checked={i === 0}
                                                        onChange={() => setDefaultAddress(i)}
                                                        label={i === 0 ? 'Mặc định' : 'Đặt mặc định'}
                                                    />
                                                    <div>
                                                        <div className="d-flex" style={{ gap: 8 }}>
                                                            <Form.Control placeholder="Tên người nhận" value={addr.fullName || ''} onChange={(e) => { const next = [...addresses]; next[i] = { ...addr, fullName: e.target.value }; setAddresses(next); }} />
                                                            <Form.Control placeholder="SĐT" value={addr.phoneNumber || ''} onChange={(e) => { const next = [...addresses]; next[i] = { ...addr, phoneNumber: e.target.value }; setAddresses(next); }} />
                                                        </div>
                                                        <div className="d-flex mt-2" style={{ gap: 8 }}>
                                                            <Form.Control placeholder="Đường, số nhà" value={addr.street || ''} onChange={(e) => { const next = [...addresses]; next[i] = { ...addr, street: e.target.value }; setAddresses(next); }} />
                                                        </div>
                                                        <div className="d-flex mt-2" style={{ gap: 8 }}>
                                                            <Form.Control placeholder="Phường/Xã" value={addr.ward || ''} onChange={(e) => { const next = [...addresses]; next[i] = { ...addr, ward: e.target.value }; setAddresses(next); }} />
                                                            <Form.Control placeholder="Quận/Huyện" value={addr.district || ''} onChange={(e) => { const next = [...addresses]; next[i] = { ...addr, district: e.target.value }; setAddresses(next); }} />
                                                        </div>
                                                        <div className="d-flex mt-2" style={{ gap: 8 }}>
                                                            <Form.Control placeholder="Tỉnh/Thành phố" value={addr.city || ''} onChange={(e) => { const next = [...addresses]; next[i] = { ...addr, city: e.target.value }; setAddresses(next); }} />
                                                            <Form.Control placeholder="Quốc gia" value={addr.country || ''} onChange={(e) => { const next = [...addresses]; next[i] = { ...addr, country: e.target.value }; setAddresses(next); }} />
                                                        </div>
                                                        <Form.Control className="mt-2" placeholder="Ghi chú (tuỳ chọn)" value={addr.note || ''} onChange={(e) => { const next = [...addresses]; next[i] = { ...addr, note: e.target.value }; setAddresses(next); }} />
                                                    </div>
                                                </div>
                                                <Button size="sm" variant="outline-danger" onClick={() => removeAddress(i)}>Xóa</Button>
                                            </div>
                                        ))}
                                        <div className="mt-3">
                                            <div className="d-flex" style={{ gap: 8 }}>
                                                <Form.Control placeholder="Tên người nhận" value={newAddress.fullName} onChange={(e) => setNewAddress(s => ({ ...s, fullName: e.target.value }))} />
                                                <Form.Control placeholder="SĐT" value={newAddress.phoneNumber} onChange={(e) => setNewAddress(s => ({ ...s, phoneNumber: e.target.value }))} />
                                            </div>
                                            <div className="d-flex mt-2" style={{ gap: 8 }}>
                                                <Form.Control placeholder="Đường, số nhà" value={newAddress.street} onChange={(e) => setNewAddress(s => ({ ...s, street: e.target.value }))} />
                                            </div>
                                            <div className="d-flex mt-2" style={{ gap: 8 }}>
                                                <Form.Control placeholder="Phường/Xã" value={newAddress.ward} onChange={(e) => setNewAddress(s => ({ ...s, ward: e.target.value }))} />
                                                <Form.Control placeholder="Quận/Huyện" value={newAddress.district} onChange={(e) => setNewAddress(s => ({ ...s, district: e.target.value }))} />
                                            </div>
                                            <div className="d-flex mt-2" style={{ gap: 8 }}>
                                                <Form.Control placeholder="Tỉnh/Thành phố" value={newAddress.city} onChange={(e) => setNewAddress(s => ({ ...s, city: e.target.value }))} />
                                                <Form.Control placeholder="Quốc gia" value={newAddress.country} onChange={(e) => setNewAddress(s => ({ ...s, country: e.target.value }))} />
                                            </div>
                                            <Form.Control className="mt-2" placeholder="Ghi chú (tuỳ chọn)" value={newAddress.note} onChange={(e) => setNewAddress(s => ({ ...s, note: e.target.value }))} />
                                            <div className="d-flex mt-2" style={{ gap: 8 }}>
                                                <Button variant="outline-secondary" onClick={addAddress}>Thêm địa chỉ</Button>
                                            </div>
                                        </div>
                                        <div className="mt-3 text-muted" style={{ fontSize: 12 }}>Địa chỉ đầu danh sách là địa chỉ mặc định.</div>
                                    </>
                                )}
                            </Card.Body>
                        </Card>

                        <Card className="mt-4" style={styles.card}>
                            <Card.Body>
                                <h5 style={styles.sectionTitle}>Bảo mật</h5>
                                <Button variant="outline-danger" onClick={() => setShowChangePw(true)}>Đổi mật khẩu</Button>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
            {/* Change Password Modal */}
            <Modal show={showChangePw} onHide={() => setShowChangePw(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Đổi mật khẩu</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={(e) => { e.preventDefault(); }}>
                        <Form.Group className="mb-3">
                            <Form.Label>Mật khẩu hiện tại</Form.Label>
                            <Form.Control type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Mật khẩu mới</Form.Label>
                            <Form.Control type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Nhập lại mật khẩu mới</Form.Label>
                            <Form.Control type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowChangePw(false)}>Hủy</Button>
                    <Button variant="danger" onClick={async () => {
                        if (!oldPassword || !newPassword) { toast.error('Vui lòng nhập đầy đủ'); return; }
                        if (newPassword !== confirmPassword) { toast.error('Mật khẩu mới không khớp'); return; }
                        try {
                            const id = baseUser?._id || baseUser?.id;
                            const res = await fetch('http://localhost:9999/api/auth/change-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: id, oldPassword, newPassword }) });
                            let data = {};
                            try { data = await res.json(); } catch { throw new Error('Máy chủ trả về phản hồi không hợp lệ'); }
                            if (!res.ok || !data.success) throw new Error(data.message || 'Đổi mật khẩu thất bại');
                            toast.success('Đổi mật khẩu thành công');
                            setShowChangePw(false);
                            setOldPassword(''); setNewPassword(''); setConfirmPassword('');
                        } catch (err) {
                            toast.error(err.message);
                        }
                    }}>Xác nhận</Button>
                </Modal.Footer>
            </Modal>

            <Footer />
        </>
    );
}

export default Profile;


