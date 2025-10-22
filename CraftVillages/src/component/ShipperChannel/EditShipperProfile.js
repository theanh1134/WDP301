import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Card, Row, Col, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { FaSave, FaTimes, FaUpload } from 'react-icons/fa';
import styled from 'styled-components';

const FormGroup = styled(Form.Group)`
  margin-bottom: 1.5rem;
  
  label {
    font-weight: 700;
    color: #333;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }
  
  input, select, textarea {
    border-radius: 8px;
    border: 2px solid #e9ecef;
    padding: 0.75rem 1rem;
    transition: all 0.3s ease;
    
    &:focus {
      border-color: #b8860b;
      box-shadow: 0 0 0 0.2rem rgba(184, 134, 11, 0.15);
    }
  }
`;

const PhotoUploadArea = styled.div`
  border: 2px dashed #b8860b;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: #fafafa;
  
  &:hover {
    background-color: #f5f5f5;
    border-color: #d4af37;
  }
  
  input[type="file"] {
    display: none;
  }
`;

const PreviewImage = styled.div`
  position: relative;
  display: inline-block;
  margin: 0.5rem;
  
  img {
    width: 100px;
    height: 100px;
    object-fit: cover;
    border-radius: 8px;
    border: 2px solid #e9ecef;
  }
  
  button {
    position: absolute;
    top: -8px;
    right: -8px;
    border-radius: 50%;
    width: 32px;
    height: 32px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

function EditShipperProfile({ show, onHide, shipperData, currentUser, onSave }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        phoneNumber: '',
        licenseNumber: '',
        vehicleType: 'MOTORBIKE',
        vehicleNumber: '',
        maxWeight: 50,
        maxVolume: 100,
        serviceAreas: [],
        workingHours: {
            start: '06:00',
            end: '22:00'
        },
        bankInfo: {
            accountName: '',
            accountNumber: '',
            bankName: '',
            accountType: ''
        }
    });
    const [documents, setDocuments] = useState({
        licenseImage: null,
        vehicleRegistration: null,
        insuranceDocument: null
    });
    const [serviceAreasInput, setServiceAreasInput] = useState('');

    useEffect(() => {
        if (show && shipperData && currentUser) {
            setFormData({
                fullName: currentUser?.fullName || '',
                phoneNumber: currentUser?.phoneNumber || '',
                licenseNumber: shipperData?.licenseNumber || '',
                vehicleType: shipperData?.vehicleType || 'MOTORBIKE',
                vehicleNumber: shipperData?.vehicleNumber || '',
                maxWeight: shipperData?.maxWeight || 50,
                maxVolume: shipperData?.maxVolume || 100,
                serviceAreas: shipperData?.serviceAreas || [],
                workingHours: shipperData?.workingHours || {
                    start: '06:00',
                    end: '22:00'
                },
                bankInfo: shipperData?.bankInfo || {
                    accountName: '',
                    accountNumber: '',
                    bankName: '',
                    accountType: ''
                }
            });
            setServiceAreasInput(shipperData?.serviceAreas?.join(', ') || '');
        }
    }, [show, shipperData, currentUser]);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleServiceAreasChange = (e) => {
        const value = e.target.value;
        setServiceAreasInput(value);
        const areas = value.split(',').map(area => area.trim()).filter(area => area);
        setFormData(prev => ({
            ...prev,
            serviceAreas: areas
        }));
    };

    const handleDocumentUpload = (e, docType) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('File không được vượt quá 5MB');
                return;
            }
            
            const reader = new FileReader();
            reader.onloadend = () => {
                setDocuments(prev => ({
                    ...prev,
                    [docType]: {
                        file: file,
                        preview: reader.result
                    }
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const removeDocument = (docType) => {
        setDocuments(prev => ({
            ...prev,
            [docType]: null
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!formData.fullName || !formData.phoneNumber || !formData.licenseNumber) {
            toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
            return;
        }

        if (formData.serviceAreas.length === 0) {
            toast.error('Vui lòng chọn ít nhất một khu vực phục vụ');
            return;
        }

        try {
            setLoading(true);
            
            const updateData = {
                ...formData,
                documents: documents
            };

            await onSave(updateData);
            
            toast.success('Cập nhật thông tin shipper thành công');
            onHide();
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Có lỗi xảy ra khi cập nhật thông tin');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" backdrop="static" keyboard={false}>
            <Modal.Header 
                style={{ 
                    background: 'linear-gradient(135deg, #b8860b 0%, #d4af37 100%)',
                    borderBottom: 'none',
                    color: 'white',
                    borderRadius: '8px 8px 0 0'
                }}
            >
                <Modal.Title style={{ fontWeight: '800', fontSize: '1.25rem' }}>
                    ✏️ Chỉnh sửa thông tin Shipper
                </Modal.Title>
                <button 
                    type="button" 
                    className="btn-close btn-close-white" 
                    onClick={onHide}
                    disabled={loading}
                ></button>
            </Modal.Header>

            <Modal.Body style={{ padding: '2rem', maxHeight: '80vh', overflowY: 'auto' }}>
                <Form onSubmit={handleSubmit}>
                    {/* Personal Information */}
                    <Card className="mb-4" style={{ border: 'none', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                        <Card.Header style={{ background: '#f8f9fa', borderBottom: '2px solid #b8860b', borderRadius: '12px 12px 0 0', padding: '1.25rem' }}>
                            <Card.Title className="mb-0" style={{ fontWeight: '700', color: '#333' }}>
                                👤 Thông tin cá nhân
                            </Card.Title>
                        </Card.Header>
                        <Card.Body style={{ padding: '1.5rem' }}>
                            <Row>
                                <Col md={6}>
                                    <FormGroup>
                                        <Form.Label>Họ và tên</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleFormChange}
                                            placeholder="Nhập họ và tên"
                                            required
                                        />
                                    </FormGroup>
                                </Col>
                                <Col md={6}>
                                    <FormGroup>
                                        <Form.Label>Số điện thoại</Form.Label>
                                        <Form.Control
                                            type="tel"
                                            name="phoneNumber"
                                            value={formData.phoneNumber}
                                            onChange={handleFormChange}
                                            placeholder="Nhập số điện thoại"
                                            pattern="[0-9]{10,11}"
                                            required
                                        />
                                    </FormGroup>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>

                    {/* Vehicle Information */}
                    <Card className="mb-4" style={{ border: 'none', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                        <Card.Header style={{ background: '#f8f9fa', borderBottom: '2px solid #b8860b', borderRadius: '12px 12px 0 0', padding: '1.25rem' }}>
                            <Card.Title className="mb-0" style={{ fontWeight: '700', color: '#333' }}>
                                🚗 Thông tin phương tiện
                            </Card.Title>
                        </Card.Header>
                        <Card.Body style={{ padding: '1.5rem' }}>
                            <Row>
                                <Col md={6}>
                                    <FormGroup>
                                        <Form.Label>Số bằng lái</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="licenseNumber"
                                            value={formData.licenseNumber}
                                            onChange={handleFormChange}
                                            placeholder="Nhập số bằng lái"
                                            required
                                        />
                                    </FormGroup>
                                </Col>
                                <Col md={6}>
                                    <FormGroup>
                                        <Form.Label>Loại phương tiện</Form.Label>
                                        <Form.Select
                                            name="vehicleType"
                                            value={formData.vehicleType}
                                            onChange={handleFormChange}
                                        >
                                            <option value="MOTORBIKE">Xe máy</option>
                                            <option value="CAR">Ô tô</option>
                                            <option value="BIKE">Xe đạp</option>
                                            <option value="TRUCK">Xe tải</option>
                                        </Form.Select>
                                    </FormGroup>
                                </Col>
                            </Row>

                            <Row>
                                <Col md={6}>
                                    <FormGroup>
                                        <Form.Label>Biển số xe</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="vehicleNumber"
                                            value={formData.vehicleNumber}
                                            onChange={handleFormChange}
                                            placeholder="Nhập biển số xe"
                                            required
                                        />
                                    </FormGroup>
                                </Col>
                                <Col md={3}>
                                    <FormGroup>
                                        <Form.Label>Trọng lượng max (kg)</Form.Label>
                                        <Form.Control
                                            type="number"
                                            name="maxWeight"
                                            value={formData.maxWeight}
                                            onChange={handleFormChange}
                                            min="1"
                                        />
                                    </FormGroup>
                                </Col>
                                <Col md={3}>
                                    <FormGroup>
                                        <Form.Label>Thể tích max (L)</Form.Label>
                                        <Form.Control
                                            type="number"
                                            name="maxVolume"
                                            value={formData.maxVolume}
                                            onChange={handleFormChange}
                                            min="1"
                                        />
                                    </FormGroup>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>

                    {/* Service Information */}
                    <Card className="mb-4" style={{ border: 'none', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                        <Card.Header style={{ background: '#f8f9fa', borderBottom: '2px solid #b8860b', borderRadius: '12px 12px 0 0', padding: '1.25rem' }}>
                            <Card.Title className="mb-0" style={{ fontWeight: '700', color: '#333' }}>
                                🗺️ Thông tin phục vụ
                            </Card.Title>
                        </Card.Header>
                        <Card.Body style={{ padding: '1.5rem' }}>
                            <FormGroup>
                                <Form.Label>Khu vực phục vụ (cách nhau bằng dấu phẩy)</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={serviceAreasInput}
                                    onChange={handleServiceAreasChange}
                                    placeholder="VD: Quận 1, Quận 3, Bình Thạnh"
                                    required
                                />
                                <Form.Text className="d-block mt-2">
                                    Các khu vực hiện có: {formData.serviceAreas.join(', ') || 'Chưa có'}
                                </Form.Text>
                            </FormGroup>

                            <Row>
                                <Col md={6}>
                                    <FormGroup>
                                        <Form.Label>Giờ làm việc bắt đầu</Form.Label>
                                        <Form.Control
                                            type="time"
                                            name="workingHours.start"
                                            value={formData.workingHours.start}
                                            onChange={handleFormChange}
                                        />
                                    </FormGroup>
                                </Col>
                                <Col md={6}>
                                    <FormGroup>
                                        <Form.Label>Giờ làm việc kết thúc</Form.Label>
                                        <Form.Control
                                            type="time"
                                            name="workingHours.end"
                                            value={formData.workingHours.end}
                                            onChange={handleFormChange}
                                        />
                                    </FormGroup>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>

                    {/* Bank Information */}
                    <Card className="mb-4" style={{ border: 'none', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                        <Card.Header style={{ background: '#f8f9fa', borderBottom: '2px solid #b8860b', borderRadius: '12px 12px 0 0', padding: '1.25rem' }}>
                            <Card.Title className="mb-0" style={{ fontWeight: '700', color: '#333' }}>
                                💳 Thông tin ngân hàng
                            </Card.Title>
                        </Card.Header>
                        <Card.Body style={{ padding: '1.5rem' }}>
                            <Row>
                                <Col md={6}>
                                    <FormGroup>
                                        <Form.Label>Tên chủ tài khoản</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="bankInfo.accountName"
                                            value={formData.bankInfo.accountName}
                                            onChange={handleFormChange}
                                            placeholder="Nhập tên chủ tài khoản"
                                        />
                                    </FormGroup>
                                </Col>
                                <Col md={6}>
                                    <FormGroup>
                                        <Form.Label>Số tài khoản</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="bankInfo.accountNumber"
                                            value={formData.bankInfo.accountNumber}
                                            onChange={handleFormChange}
                                            placeholder="Nhập số tài khoản"
                                        />
                                    </FormGroup>
                                </Col>
                            </Row>

                            <Row>
                                <Col md={6}>
                                    <FormGroup>
                                        <Form.Label>Tên ngân hàng</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="bankInfo.bankName"
                                            value={formData.bankInfo.bankName}
                                            onChange={handleFormChange}
                                            placeholder="Nhập tên ngân hàng"
                                        />
                                    </FormGroup>
                                </Col>
                                <Col md={6}>
                                    <FormGroup>
                                        <Form.Label>Loại tài khoản</Form.Label>
                                        <Form.Select
                                            name="bankInfo.accountType"
                                            value={formData.bankInfo.accountType}
                                            onChange={handleFormChange}
                                        >
                                            <option value="">-- Chọn loại tài khoản --</option>
                                            <option value="SAVINGS">Tiết kiệm</option>
                                            <option value="CHECKING">Thanh toán</option>
                                            <option value="E_WALLET">Ví điện tử</option>
                                        </Form.Select>
                                    </FormGroup>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>

                    {/* Documents Upload */}
                    <Card className="mb-4" style={{ border: 'none', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                        <Card.Header style={{ background: '#f8f9fa', borderBottom: '2px solid #b8860b', borderRadius: '12px 12px 0 0', padding: '1.25rem' }}>
                            <Card.Title className="mb-0" style={{ fontWeight: '700', color: '#333' }}>
                                📄 Tài liệu
                            </Card.Title>
                        </Card.Header>
                        <Card.Body style={{ padding: '1.5rem' }}>
                            <Row>
                                <Col md={4} className="mb-3">
                                    <Form.Label className="fw-bold">Ảnh bằng lái</Form.Label>
                                    <PhotoUploadArea onClick={() => document.getElementById('licenseImageInput').click()}>
                                        <FaUpload style={{ fontSize: '2rem', color: '#b8860b', marginBottom: '0.5rem' }} />
                                        <p style={{ marginBottom: 0, color: '#999' }}>Click để upload</p>
                                        <input
                                            id="licenseImageInput"
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleDocumentUpload(e, 'licenseImage')}
                                        />
                                    </PhotoUploadArea>
                                    {documents.licenseImage && (
                                        <PreviewImage>
                                            <img src={documents.licenseImage.preview} alt="License" />
                                            <Button 
                                                variant="danger" 
                                                size="sm"
                                                onClick={() => removeDocument('licenseImage')}
                                            >
                                                <FaTimes />
                                            </Button>
                                        </PreviewImage>
                                    )}
                                </Col>

                                <Col md={4} className="mb-3">
                                    <Form.Label className="fw-bold">Giấy đăng ký xe</Form.Label>
                                    <PhotoUploadArea onClick={() => document.getElementById('vehicleRegInput').click()}>
                                        <FaUpload style={{ fontSize: '2rem', color: '#b8860b', marginBottom: '0.5rem' }} />
                                        <p style={{ marginBottom: 0, color: '#999' }}>Click để upload</p>
                                        <input
                                            id="vehicleRegInput"
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleDocumentUpload(e, 'vehicleRegistration')}
                                        />
                                    </PhotoUploadArea>
                                    {documents.vehicleRegistration && (
                                        <PreviewImage>
                                            <img src={documents.vehicleRegistration.preview} alt="Registration" />
                                            <Button 
                                                variant="danger" 
                                                size="sm"
                                                onClick={() => removeDocument('vehicleRegistration')}
                                            >
                                                <FaTimes />
                                            </Button>
                                        </PreviewImage>
                                    )}
                                </Col>

                                <Col md={4} className="mb-3">
                                    <Form.Label className="fw-bold">Giấy bảo hiểm</Form.Label>
                                    <PhotoUploadArea onClick={() => document.getElementById('insuranceInput').click()}>
                                        <FaUpload style={{ fontSize: '2rem', color: '#b8860b', marginBottom: '0.5rem' }} />
                                        <p style={{ marginBottom: 0, color: '#999' }}>Click để upload</p>
                                        <input
                                            id="insuranceInput"
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleDocumentUpload(e, 'insuranceDocument')}
                                        />
                                    </PhotoUploadArea>
                                    {documents.insuranceDocument && (
                                        <PreviewImage>
                                            <img src={documents.insuranceDocument.preview} alt="Insurance" />
                                            <Button 
                                                variant="danger" 
                                                size="sm"
                                                onClick={() => removeDocument('insuranceDocument')}
                                            >
                                                <FaTimes />
                                            </Button>
                                        </PreviewImage>
                                    )}
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Form>
            </Modal.Body>

            <Modal.Footer style={{ borderTop: '2px solid #e9ecef', padding: '1.5rem' }}>
                <Button 
                    variant="outline-secondary" 
                    onClick={onHide}
                    disabled={loading}
                    style={{ borderRadius: '6px', fontWeight: '600' }}
                >
                    <FaTimes className="me-2" />
                    Hủy bỏ
                </Button>
                <Button 
                    variant="primary" 
                    onClick={handleSubmit}
                    disabled={loading}
                    style={{ borderRadius: '6px', fontWeight: '600', minWidth: '120px' }}
                >
                    {loading ? (
                        <>
                            <Spinner animation="border" size="sm" className="me-2" />
                            Đang lưu...
                        </>
                    ) : (
                        <>
                            <FaSave className="me-2" />
                            Lưu thay đổi
                        </>
                    )}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default EditShipperProfile;
