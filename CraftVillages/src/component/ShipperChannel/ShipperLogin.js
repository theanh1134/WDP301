import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './ShipperLogin.css';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const ShipperLogin = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [rememberMe, setRememberMe] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            // Validation
            if (!email) {
                setError('Vui lòng nhập email');
                setLoading(false);
                return;
            }
            if (!password) {
                setError('Vui lòng nhập mật khẩu');
                setLoading(false);
                return;
            }

            // API Call
            const response = await axios.post(
                'http://localhost:9999/api/auth/login',
                { email, password }
            );

            if (response.data.success) {
                const { token, user } = response.data.data;

                // Save token
                localStorage.setItem('authToken', token);
                localStorage.setItem('userId', user._id);
                localStorage.setItem('userRole', user.roleId);

                if (rememberMe) {
                    localStorage.setItem('rememberMe', 'true');
                    localStorage.setItem('rememberEmail', email);
                }

                setSuccess('Đăng nhập thành công! Chuyển hướng...');

                // Redirect to dashboard
                setTimeout(() => {
                    navigate('/shipper-dashboard');
                }, 1500);
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    // Load remembered email
    React.useEffect(() => {
        const remembered = localStorage.getItem('rememberMe') === 'true';
        const rememberedEmail = localStorage.getItem('rememberEmail');
        if (remembered && rememberedEmail) {
            setEmail(rememberedEmail);
            setRememberMe(true);
        }
    }, []);

    return (
        <div className="shipper-login-container">
            <div className="login-card">
                {/* Logo Section */}
                <div className="login-header">
                    <div className="logo">
                        <span className="logo-icon">📦</span>
                    </div>
                    <h1>Shipper Dashboard</h1>
                    <p>Đăng nhập vào tài khoản shipper của bạn</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="alert alert-error">
                        <FaTimesCircle />
                        <span>{error}</span>
                    </div>
                )}

                {/* Success Message */}
                {success && (
                    <div className="alert alert-success">
                        <FaCheckCircle />
                        <span>{success}</span>
                    </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleLogin} className="login-form">
                    {/* Email Input */}
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <div className="input-wrapper">
                            <FaEnvelope className="input-icon" />
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Nhập email của bạn"
                                disabled={loading}
                                required
                            />
                        </div>
                    </div>

                    {/* Password Input */}
                    <div className="form-group">
                        <label htmlFor="password">Mật khẩu</label>
                        <div className="input-wrapper">
                            <FaLock className="input-icon" />
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Nhập mật khẩu"
                                disabled={loading}
                                required
                            />
                            <button
                                type="button"
                                className="toggle-password"
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex="-1"
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>

                    {/* Remember Me & Forgot Password */}
                    <div className="form-options">
                        <label className="remember-me">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                disabled={loading}
                            />
                            <span>Nhớ tôi</span>
                        </label>
                        <a href="/forgot-password" className="forgot-password">
                            Quên mật khẩu?
                        </a>
                    </div>

                    {/* Login Button */}
                    <button
                        type="submit"
                        className="btn-login"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner"></span>
                                Đang đăng nhập...
                            </>
                        ) : (
                            'Đăng Nhập'
                        )}
                    </button>
                </form>

                {/* Divider */}
                <div className="divider">
                    <span>hoặc</span>
                </div>

                {/* Registration Link */}
                <div className="register-section">
                    <p>Chưa có tài khoản?</p>
                    <button
                        type="button"
                        className="btn-register"
                        onClick={() => navigate('/shipper-register')}
                        disabled={loading}
                    >
                        Đăng Ký Ngay
                    </button>
                </div>

                {/* Footer */}
                <div className="login-footer">
                    <p className="support-text">
                        Cần hỗ trợ?{' '}
                        <a href="/contact-support" className="support-link">
                            Liên hệ chúng tôi
                        </a>
                    </p>
                </div>
            </div>

            {/* Right Side - Features */}
            <div className="login-benefits">
                <h2>Tại sao trở thành Shipper?</h2>
                <div className="benefits-list">
                    <div className="benefit-item">
                        <div className="benefit-icon">💰</div>
                        <h3>Thu nhập cao</h3>
                        <p>Kiếm tiền linh hoạt dựa trên số đơn giao hàng</p>
                    </div>
                    <div className="benefit-item">
                        <div className="benefit-icon">⏰</div>
                        <h3>Thời gian linh hoạt</h3>
                        <p>Làm việc theo thời gian biểu của riêng bạn</p>
                    </div>
                    <div className="benefit-item">
                        <div className="benefit-icon">🎯</div>
                        <h3>Ứng dụng thân thiện</h3>
                        <p>Giao diện dễ sử dụng, quản lý đơn hàng đơn giản</p>
                    </div>
                    <div className="benefit-item">
                        <div className="benefit-icon">🏆</div>
                        <h3>Công nhân tiêu chuẩn</h3>
                        <p>Được công nhân cao điểm dựa trên hiệu suất</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShipperLogin;
