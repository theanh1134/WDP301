import React, { useState } from 'react';
import axios from 'axios';
import './ShipperRegistration.css';
import { FaUpload, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const ShipperRegistration = () => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    // Step 1: Account Information
    const [accountData, setAccountData] = useState({
        fullName: '',
        email: '',
        phoneNumber: '',
        password: '',
        confirmPassword: '',
        gender: 'Male',
        dateOfBirth: ''
    });

    // Step 2: Vehicle Information
    const [vehicleData, setVehicleData] = useState({
        vehicleType: 'Motorbike',
        vehicleNumber: '',
        vehicleRegistration: '',
        vehicleInsurance: '',
        vehicleImage: null,
        vehicleImagePreview: ''
    });

    // Step 3: Documents & License
    const [documentsData, setDocumentsData] = useState({
        licenseNumber: '',
        licenseExpireDate: '',
        identityNumber: '',
        licenseImage: null,
        licenseImagePreview: '',
        identityImage: null,
        identityImagePreview: '',
        insuranceImage: null,
        insuranceImagePreview: ''
    });

    // Step 4: Banking Information
    const [bankingData, setBankingData] = useState({
        bankName: '',
        bankAccountNumber: '',
        bankAccountHolder: ''
    });

    // Step 5: Service Area
    const [serviceAreaData, setServiceAreaData] = useState({
        province: 'Ho Chi Minh City',
        district: '',
        ward: ''
    });

    const [serviceAreas, setServiceAreas] = useState([]);

    // Handle Account Form
    const handleAccountChange = (e) => {
        const { name, value } = e.target;
        setAccountData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle Vehicle Form
    const handleVehicleChange = (e) => {
        const { name, value } = e.target;
        setVehicleData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleVehicleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setVehicleData(prev => ({
                    ...prev,
                    vehicleImage: file,
                    vehicleImagePreview: reader.result
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle Documents Form
    const handleDocumentsChange = (e) => {
        const { name, value } = e.target;
        setDocumentsData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleDocumentImageChange = (e, fieldName) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setDocumentsData(prev => ({
                    ...prev,
                    [fieldName]: file,
                    [`${fieldName}Preview`]: reader.result
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle Banking Form
    const handleBankingChange = (e) => {
        const { name, value } = e.target;
        setBankingData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle Service Area
    const handleServiceAreaChange = (e) => {
        const { name, value } = e.target;
        setServiceAreaData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddServiceArea = () => {
        if (serviceAreaData.district && serviceAreaData.ward) {
            setServiceAreas(prev => [...prev, { ...serviceAreaData }]);
            setServiceAreaData({
                province: 'Ho Chi Minh City',
                district: '',
                ward: ''
            });
        }
    };

    const handleRemoveServiceArea = (index) => {
        setServiceAreas(prev => prev.filter((_, i) => i !== index));
    };

    // Validation
    const validateStep1 = () => {
        if (!accountData.fullName) {
            setErrorMessage('Vui lòng nhập họ tên');
            return false;
        }
        if (!accountData.email) {
            setErrorMessage('Vui lòng nhập email');
            return false;
        }
        if (!accountData.phoneNumber) {
            setErrorMessage('Vui lòng nhập số điện thoại');
            return false;
        }
        if (accountData.phoneNumber.length !== 10 && accountData.phoneNumber.length !== 11) {
            setErrorMessage('Số điện thoại phải có 10-11 chữ số');
            return false;
        }
        if (accountData.password.length < 6) {
            setErrorMessage('Mật khẩu phải có ít nhất 6 ký tự');
            return false;
        }
        if (accountData.password !== accountData.confirmPassword) {
            setErrorMessage('Mật khẩu không khớp');
            return false;
        }
        return true;
    };

    const validateStep2 = () => {
        if (!vehicleData.vehicleNumber) {
            setErrorMessage('Vui lòng nhập biển số xe');
            return false;
        }
        if (!vehicleData.vehicleRegistration) {
            setErrorMessage('Vui lòng nhập số đăng ký xe');
            return false;
        }
        if (!vehicleData.vehicleInsurance) {
            setErrorMessage('Vui lòng nhập ngày hết hạn bảo hiểm');
            return false;
        }
        if (!vehicleData.vehicleImage) {
            setErrorMessage('Vui lòng tải lên ảnh xe');
            return false;
        }
        return true;
    };

    const validateStep3 = () => {
        if (!documentsData.licenseNumber) {
            setErrorMessage('Vui lòng nhập số bằng lái');
            return false;
        }
        if (!documentsData.licenseExpireDate) {
            setErrorMessage('Vui lòng chọn ngày hết hạn bằng lái');
            return false;
        }
        if (!documentsData.identityNumber) {
            setErrorMessage('Vui lòng nhập số CCCD/CMND');
            return false;
        }
        if (!documentsData.licenseImage) {
            setErrorMessage('Vui lòng tải lên ảnh bằng lái');
            return false;
        }
        if (!documentsData.identityImage) {
            setErrorMessage('Vui lòng tải lên ảnh CCCD/CMND');
            return false;
        }
        return true;
    };

    const validateStep4 = () => {
        if (!bankingData.bankName) {
            setErrorMessage('Vui lòng chọn ngân hàng');
            return false;
        }
        if (!bankingData.bankAccountNumber) {
            setErrorMessage('Vui lòng nhập số tài khoản');
            return false;
        }
        if (!bankingData.bankAccountHolder) {
            setErrorMessage('Vui lòng nhập tên chủ tài khoản');
            return false;
        }
        return true;
    };

    const validateStep5 = () => {
        if (serviceAreas.length === 0) {
            setErrorMessage('Vui lòng thêm ít nhất 1 khu vực phục vụ');
            return false;
        }
        return true;
    };

    // Submit Form
    const handleSubmit = async () => {
        setErrorMessage('');
        setSuccessMessage('');
        setLoading(true);

        try {
            // Prepare form data for multipart upload
            const formData = new FormData();

            // Account info
            formData.append('fullName', accountData.fullName);
            formData.append('email', accountData.email);
            formData.append('phoneNumber', accountData.phoneNumber);
            formData.append('passwordHash', accountData.password);
            formData.append('gender', accountData.gender);
            formData.append('dateOfBirth', accountData.dateOfBirth);

            // Vehicle info
            formData.append('vehicleType', vehicleData.vehicleType);
            formData.append('vehicleNumber', vehicleData.vehicleNumber);
            formData.append('vehicleRegistration', vehicleData.vehicleRegistration);
            formData.append('vehicleInsurance', vehicleData.vehicleInsurance);
            if (vehicleData.vehicleImage) {
                formData.append('vehicleImage', vehicleData.vehicleImage);
            }

            // Documents
            formData.append('licenseNumber', documentsData.licenseNumber);
            formData.append('licenseExpireDate', documentsData.licenseExpireDate);
            formData.append('identityNumber', documentsData.identityNumber);
            if (documentsData.licenseImage) {
                formData.append('licenseImage', documentsData.licenseImage);
            }
            if (documentsData.identityImage) {
                formData.append('identityImage', documentsData.identityImage);
            }
            if (documentsData.insuranceImage) {
                formData.append('insuranceImage', documentsData.insuranceImage);
            }

            // Banking info
            formData.append('bankName', bankingData.bankName);
            formData.append('bankAccountNumber', bankingData.bankAccountNumber);
            formData.append('bankAccountHolder', bankingData.bankAccountHolder);

            // Service areas
            formData.append('serviceAreas', JSON.stringify(serviceAreas));

            // Send request
            const response = await axios.post(
                'http://localhost:9999/api/auth/register-shipper',
                formData,
                {
                    headers: { 'Content-Type': 'multipart/form-data' }
                }
            );

            if (response.data.success) {
                setSuccessMessage('Đăng ký thành công! Vui lòng kiểm tra email để xác minh tài khoản.');
                setTimeout(() => {
                    window.location.href = '/shipper-login';
                }, 3000);
            }
        } catch (error) {
            setErrorMessage(
                error.response?.data?.message || 
                'Đăng ký thất bại. Vui lòng thử lại.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="shipper-registration-container">
            <div className="registration-card">
                <h1>Đăng Ký Tài Khoản Shipper</h1>

                {/* Progress Indicator */}
                <div className="progress-container">
                    <div className="progress-steps">
                        {[1, 2, 3, 4, 5].map((s) => (
                            <div 
                                key={s}
                                className={`progress-step ${step >= s ? 'active' : ''}`}
                            >
                                <div className="step-number">{s}</div>
                                <div className="step-label">
                                    {s === 1 && 'Tài khoản'}
                                    {s === 2 && 'Phương tiện'}
                                    {s === 3 && 'Tài liệu'}
                                    {s === 4 && 'Ngân hàng'}
                                    {s === 5 && 'Khu vực'}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="progress-bar">
                        <div 
                            className="progress-fill"
                            style={{ width: `${(step / 5) * 100}%` }}
                        ></div>
                    </div>
                </div>

                {/* Error/Success Message */}
                {errorMessage && (
                    <div className="alert alert-error">
                        <FaTimesCircle /> {errorMessage}
                    </div>
                )}
                {successMessage && (
                    <div className="alert alert-success">
                        <FaCheckCircle /> {successMessage}
                    </div>
                )}

                {/* Step 1: Account Information */}
                {step === 1 && (
                    <div className="form-step">
                        <h2>Thông Tin Tài Khoản</h2>
                        <div className="form-group">
                            <label>Họ và tên *</label>
                            <input
                                type="text"
                                name="fullName"
                                value={accountData.fullName}
                                onChange={handleAccountChange}
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
                                    value={accountData.email}
                                    onChange={handleAccountChange}
                                    placeholder="Nhập email"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Số điện thoại *</label>
                                <input
                                    type="tel"
                                    name="phoneNumber"
                                    value={accountData.phoneNumber}
                                    onChange={handleAccountChange}
                                    placeholder="0912345678"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Giới tính</label>
                                <select
                                    name="gender"
                                    value={accountData.gender}
                                    onChange={handleAccountChange}
                                >
                                    <option>Male</option>
                                    <option>Female</option>
                                    <option>Other</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Ngày sinh</label>
                                <input
                                    type="date"
                                    name="dateOfBirth"
                                    value={accountData.dateOfBirth}
                                    onChange={handleAccountChange}
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Mật khẩu *</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={accountData.password}
                                    onChange={handleAccountChange}
                                    placeholder="Ít nhất 6 ký tự"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Xác nhận mật khẩu *</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={accountData.confirmPassword}
                                    onChange={handleAccountChange}
                                    placeholder="Nhập lại mật khẩu"
                                    required
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Vehicle Information */}
                {step === 2 && (
                    <div className="form-step">
                        <h2>Thông Tin Phương Tiện</h2>
                        <div className="form-group">
                            <label>Loại phương tiện *</label>
                            <select
                                name="vehicleType"
                                value={vehicleData.vehicleType}
                                onChange={handleVehicleChange}
                            >
                                <option>Motorbike</option>
                                <option>Car</option>
                                <option>Bicycle</option>
                                <option>Truck</option>
                            </select>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Biển số xe *</label>
                                <input
                                    type="text"
                                    name="vehicleNumber"
                                    value={vehicleData.vehicleNumber}
                                    onChange={handleVehicleChange}
                                    placeholder="VD: 29A-12345"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Số đăng ký xe *</label>
                                <input
                                    type="text"
                                    name="vehicleRegistration"
                                    value={vehicleData.vehicleRegistration}
                                    onChange={handleVehicleChange}
                                    placeholder="Nhập số đăng ký"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Ngày hết hạn bảo hiểm *</label>
                            <input
                                type="date"
                                name="vehicleInsurance"
                                value={vehicleData.vehicleInsurance}
                                onChange={handleVehicleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Ảnh xe *</label>
                            <div className="file-upload-area">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleVehicleImageChange}
                                    id="vehicleImage"
                                    style={{ display: 'none' }}
                                />
                                <label htmlFor="vehicleImage" className="file-upload-label">
                                    <FaUpload /> Chọn ảnh hoặc kéo thả
                                </label>
                                {vehicleData.vehicleImagePreview && (
                                    <div className="image-preview">
                                        <img src={vehicleData.vehicleImagePreview} alt="Vehicle" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: Documents */}
                {step === 3 && (
                    <div className="form-step">
                        <h2>Tài Liệu & Bằng Lái</h2>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Số bằng lái xe *</label>
                                <input
                                    type="text"
                                    name="licenseNumber"
                                    value={documentsData.licenseNumber}
                                    onChange={handleDocumentsChange}
                                    placeholder="Nhập số bằng lái"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Ngày hết hạn bằng lái *</label>
                                <input
                                    type="date"
                                    name="licenseExpireDate"
                                    value={documentsData.licenseExpireDate}
                                    onChange={handleDocumentsChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Số CCCD/CMND *</label>
                            <input
                                type="text"
                                name="identityNumber"
                                value={documentsData.identityNumber}
                                onChange={handleDocumentsChange}
                                placeholder="Nhập số CCCD/CMND"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Ảnh bằng lái xe *</label>
                            <div className="file-upload-area">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleDocumentImageChange(e, 'licenseImage')}
                                    id="licenseImage"
                                    style={{ display: 'none' }}
                                />
                                <label htmlFor="licenseImage" className="file-upload-label">
                                    <FaUpload /> Chọn ảnh bằng lái
                                </label>
                                {documentsData.licenseImagePreview && (
                                    <div className="image-preview">
                                        <img src={documentsData.licenseImagePreview} alt="License" />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Ảnh CCCD/CMND *</label>
                            <div className="file-upload-area">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleDocumentImageChange(e, 'identityImage')}
                                    id="identityImage"
                                    style={{ display: 'none' }}
                                />
                                <label htmlFor="identityImage" className="file-upload-label">
                                    <FaUpload /> Chọn ảnh CCCD/CMND
                                </label>
                                {documentsData.identityImagePreview && (
                                    <div className="image-preview">
                                        <img src={documentsData.identityImagePreview} alt="Identity" />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Ảnh bảo hiểm (tùy chọn)</label>
                            <div className="file-upload-area">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleDocumentImageChange(e, 'insuranceImage')}
                                    id="insuranceImage"
                                    style={{ display: 'none' }}
                                />
                                <label htmlFor="insuranceImage" className="file-upload-label">
                                    <FaUpload /> Chọn ảnh bảo hiểm
                                </label>
                                {documentsData.insuranceImagePreview && (
                                    <div className="image-preview">
                                        <img src={documentsData.insuranceImagePreview} alt="Insurance" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 4: Banking Information */}
                {step === 4 && (
                    <div className="form-step">
                        <h2>Thông Tin Ngân Hàng</h2>
                        <div className="info-box">
                            <p>Thông tin ngân hàng sẽ được dùng để thanh toán thu nhập cho bạn</p>
                        </div>

                        <div className="form-group">
                            <label>Tên ngân hàng *</label>
                            <select
                                name="bankName"
                                value={bankingData.bankName}
                                onChange={handleBankingChange}
                                required
                            >
                                <option value="">Chọn ngân hàng</option>
                                <option>Vietcombank (VCB)</option>
                                <option>BIDV</option>
                                <option>Agribank</option>
                                <option>Techcombank</option>
                                <option>SacomBank</option>
                                <option>ACB</option>
                                <option>VPBank</option>
                                <option>MB Bank</option>
                                <option>TPBank</option>
                                <option>PVcomBank</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Số tài khoản *</label>
                            <input
                                type="text"
                                name="bankAccountNumber"
                                value={bankingData.bankAccountNumber}
                                onChange={handleBankingChange}
                                placeholder="Nhập số tài khoản"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Tên chủ tài khoản *</label>
                            <input
                                type="text"
                                name="bankAccountHolder"
                                value={bankingData.bankAccountHolder}
                                onChange={handleBankingChange}
                                placeholder="Tên chủ tài khoản"
                                required
                            />
                        </div>
                    </div>
                )}

                {/* Step 5: Service Area */}
                {step === 5 && (
                    <div className="form-step">
                        <h2>Khu Vực Phục Vụ</h2>
                        <div className="info-box">
                            <p>Chọn các khu vực bạn muốn cung cấp dịch vụ giao hàng</p>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Tỉnh/Thành phố</label>
                                <select
                                    name="province"
                                    value={serviceAreaData.province}
                                    onChange={handleServiceAreaChange}
                                >
                                    <option>Ho Chi Minh City</option>
                                    <option>Ha Noi</option>
                                    <option>Da Nang</option>
                                    <option>Can Tho</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Quận/Huyện *</label>
                                <input
                                    type="text"
                                    name="district"
                                    value={serviceAreaData.district}
                                    onChange={handleServiceAreaChange}
                                    placeholder="VD: District 1"
                                />
                            </div>
                            <div className="form-group">
                                <label>Phường/Xã *</label>
                                <input
                                    type="text"
                                    name="ward"
                                    value={serviceAreaData.ward}
                                    onChange={handleServiceAreaChange}
                                    placeholder="VD: Ward 1"
                                />
                            </div>
                        </div>

                        <button 
                            type="button" 
                            className="btn btn-secondary btn-add"
                            onClick={handleAddServiceArea}
                        >
                            + Thêm khu vực
                        </button>

                        <div className="service-areas-list">
                            {serviceAreas.map((area, index) => (
                                <div key={index} className="service-area-item">
                                    <span>{area.province}, {area.district}, {area.ward}</span>
                                    <button
                                        type="button"
                                        className="btn-remove"
                                        onClick={() => handleRemoveServiceArea(index)}
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Buttons */}
                <div className="form-buttons">
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setStep(Math.max(1, step - 1))}
                        disabled={step === 1}
                    >
                        Quay Lại
                    </button>

                    {step < 5 ? (
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => {
                                setErrorMessage('');
                                let isValid = false;
                                if (step === 1) isValid = validateStep1();
                                else if (step === 2) isValid = validateStep2();
                                else if (step === 3) isValid = validateStep3();
                                else if (step === 4) isValid = validateStep4();

                                if (isValid) {
                                    setStep(step + 1);
                                }
                            }}
                        >
                            Tiếp Tục
                        </button>
                    ) : (
                        <button
                            type="button"
                            className="btn btn-success"
                            onClick={() => {
                                if (validateStep5()) {
                                    handleSubmit();
                                }
                            }}
                            disabled={loading}
                        >
                            {loading ? 'Đang xử lý...' : 'Hoàn Thành Đăng Ký'}
                        </button>
                    )}
                </div>

                {/* Terms of Service */}
                <div className="terms">
                    <p>
                        Bằng cách đăng ký, bạn đồng ý với <a href="/terms">Điều khoản dịch vụ</a> và <a href="/privacy">Chính sách bảo mật</a> của chúng tôi.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ShipperRegistration;
