import React, { useState } from 'react';
import axios from 'axios';
import './ShipperRegister.css';

function ShipperRegister() {
  const [step, setStep] = useState(1); // 1: Register, 2: Verify, 3: Success
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form data
  const [formData, setFormData] = useState({
    // Thông tin cá nhân
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    gender: 'Other',
    
    // Thông tin phương tiện
    vehicleType: 'Motorbike',
    vehicleNumber: '',
    vehicleRegistration: '',
    vehicleInsurance: '',
    
    // Thông tin tài liệu
    licenseNumber: '',
    licenseExpireDate: '',
    identityNumber: '',
    
    // Thông tin ngân hàng
    bankName: '',
    bankAccountNumber: '',
    bankAccountHolder: '',
    
    // Khu vực phục vụ
    province: '',
    district: '',
    ward: '',
    
    // Verification
    verificationCode: ''
  });

  const [registeredData, setRegisteredData] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Step 1: Register
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Validate
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }

      const dataToSend = {
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
        vehicleType: formData.vehicleType,
        vehicleNumber: formData.vehicleNumber,
        vehicleRegistration: formData.vehicleRegistration,
        vehicleInsurance: formData.vehicleInsurance,
        licenseNumber: formData.licenseNumber,
        licenseExpireDate: formData.licenseExpireDate,
        identityNumber: formData.identityNumber,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        bankName: formData.bankName,
        bankAccountNumber: formData.bankAccountNumber,
        bankAccountHolder: formData.bankAccountHolder,
        serviceAreas: [
          {
            province: formData.province,
            district: formData.district,
            ward: formData.ward
          }
        ]
      };

      const response = await axios.post(
        'http://localhost:9999/api/auth/register-shipper',
        dataToSend
      );

      if (response.data.success) {
        setRegisteredData(response.data.data);
        setSuccess(response.data.message);
        setStep(2); // Go to verification step
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify Email (sử dụng endpoint verify-email chung)
  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await axios.post(
        'http://localhost:9999/api/auth/verify-email',
        {
          email: registeredData.email,
          code: formData.verificationCode
        }
      );

      if (response.data.success) {
        setSuccess(response.data.message);
        setStep(3); // Go to success step
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  // Resend verification code (sử dụng endpoint resend-code chung)
  const handleResendCode = async () => {
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(
        'http://localhost:9999/api/auth/resend-code',
        { email: registeredData.email }
      );

      if (response.data.success) {
        setSuccess('Verification code sent to your email');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="shipper-register-container">
      <div className="shipper-register-card">
        <h1>Đăng Ký Tài Khoản Shipper</h1>

        {/* Step Indicator */}
        <div className="step-indicator">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>
            <span>1</span>
            <p>Thông tin</p>
          </div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}>
            <span>2</span>
            <p>Xác minh</p>
          </div>
          <div className={`step ${step >= 3 ? 'active' : ''}`}>
            <span>3</span>
            <p>Hoàn thành</p>
          </div>
        </div>

        {/* Error & Success Messages */}
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {/* Step 1: Registration Form */}
        {step === 1 && (
          <form onSubmit={handleRegister} className="register-form">
            {/* Thông tin cá nhân */}
            <fieldset>
              <legend>Thông Tin Cá Nhân</legend>
              
              <div className="form-group">
                <label>Họ và tên *</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Nhập họ và tên"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="example@email.com"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Số điện thoại *</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="0912345678"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Ngày sinh</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Giới tính</label>
                  <select name="gender" value={formData.gender} onChange={handleChange}>
                    <option value="Male">Nam</option>
                    <option value="Female">Nữ</option>
                    <option value="Other">Khác</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Mật khẩu *</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Tối thiểu 6 ký tự"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Xác nhận mật khẩu *</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Nhập lại mật khẩu"
                    required
                  />
                </div>
              </div>
            </fieldset>

            {/* Thông tin phương tiện */}
            <fieldset>
              <legend>Thông Tin Phương Tiện</legend>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Loại phương tiện *</label>
                  <select name="vehicleType" value={formData.vehicleType} onChange={handleChange}>
                    <option value="Motorbike">Xe máy</option>
                    <option value="Bicycle">Xe đạp</option>
                    <option value="Car">Ô tô</option>
                    <option value="Truck">Xe tải</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Biển số xe *</label>
                  <input
                    type="text"
                    name="vehicleNumber"
                    value={formData.vehicleNumber}
                    onChange={handleChange}
                    placeholder="Vd: 30F-123456"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Số đăng ký xe *</label>
                  <input
                    type="text"
                    name="vehicleRegistration"
                    value={formData.vehicleRegistration}
                    onChange={handleChange}
                    placeholder="Số đăng ký"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Ngày hết hạn bảo hiểm *</label>
                  <input
                    type="date"
                    name="vehicleInsurance"
                    value={formData.vehicleInsurance}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </fieldset>

            {/* Thông tin tài liệu */}
            <fieldset>
              <legend>Thông Tin Tài Liệu</legend>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Số bằng lái *</label>
                  <input
                    type="text"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleChange}
                    placeholder="Số bằng lái"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Ngày hết hạn bằng lái *</label>
                  <input
                    type="date"
                    name="licenseExpireDate"
                    value={formData.licenseExpireDate}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Số CCCD/CMND *</label>
                <input
                  type="text"
                  name="identityNumber"
                  value={formData.identityNumber}
                  onChange={handleChange}
                  placeholder="Số CCCD/CMND"
                  required
                />
              </div>
            </fieldset>

            {/* Thông tin ngân hàng */}
            <fieldset>
              <legend>Thông Tin Ngân Hàng</legend>
              
              <div className="form-group">
                <label>Tên ngân hàng *</label>
                <input
                  type="text"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleChange}
                  placeholder="Vd: Vietcombank, Techcombank"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Số tài khoản *</label>
                  <input
                    type="text"
                    name="bankAccountNumber"
                    value={formData.bankAccountNumber}
                    onChange={handleChange}
                    placeholder="Số tài khoản"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Chủ tài khoản *</label>
                  <input
                    type="text"
                    name="bankAccountHolder"
                    value={formData.bankAccountHolder}
                    onChange={handleChange}
                    placeholder="Tên chủ tài khoản"
                    required
                  />
                </div>
              </div>
            </fieldset>

            {/* Khu vực phục vụ */}
            <fieldset>
              <legend>Khu Vực Phục Vụ</legend>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Tỉnh/Thành phố</label>
                  <input
                    type="text"
                    name="province"
                    value={formData.province}
                    onChange={handleChange}
                    placeholder="Vd: Hồ Chí Minh"
                  />
                </div>

                <div className="form-group">
                  <label>Quận/Huyện</label>
                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    placeholder="Vd: Quận 1"
                  />
                </div>

                <div className="form-group">
                  <label>Phường/Xã</label>
                  <input
                    type="text"
                    name="ward"
                    value={formData.ward}
                    onChange={handleChange}
                    placeholder="Vd: Phường Bến Nghé"
                  />
                </div>
              </div>
            </fieldset>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Đang xử lý...' : 'Tiếp tục'}
            </button>
          </form>
        )}

        {/* Step 2: Email Verification */}
        {step === 2 && registeredData && (
          <form onSubmit={handleVerify} className="verify-form">
            <div className="verify-info">
              <p>Chúng tôi đã gửi mã xác minh đến email:</p>
              <strong>{registeredData.email}</strong>
            </div>

            <div className="form-group">
              <label>Mã Xác Minh *</label>
              <input
                type="text"
                name="verificationCode"
                value={formData.verificationCode}
                onChange={handleChange}
                placeholder="Nhập 6 chữ số"
                maxLength="6"
                required
              />
            </div>

            <div className="verify-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Đang xác minh...' : 'Xác Minh'}
              </button>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={handleResendCode}
                disabled={loading}
              >
                Gửi lại mã
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Success */}
        {step === 3 && (
          <div className="success-message">
            <div className="success-icon">✓</div>
            <h2>Đăng Ký Thành Công!</h2>
            <p>Hồ sơ của bạn đã được gửi cho Admin để duyệt.</p>
            <div className="success-info">
              <p>
                <strong>Email:</strong> {registeredData.email}
              </p>
              <p>
                <strong>Trạng thái:</strong> <span className="status">Chờ duyệt</span>
              </p>
            </div>
            <p className="info-text">
              Bạn sẽ nhận được email thông báo khi Admin duyệt hồ sơ của bạn.
              Bình thường sẽ mất từ 1-3 ngày làm việc.
            </p>
            <a href="/login" className="btn btn-primary">
              Quay lại Đăng Nhập
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default ShipperRegister;
