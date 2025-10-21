import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaImage, FaInfoCircle, FaArrowLeft } from 'react-icons/fa';
import { toast } from 'react-toastify';
import authService from '../../services/authService';
import shopService from '../../services/shopService';
import productService from '../../services/productService';
import categoryService from '../../services/categoryService';
import 'bootstrap/dist/css/bootstrap.min.css';

// Styled Components
const PageWrapper = styled.div`
  background-color: #f5f5f5;
  min-height: 100vh;
  padding: 2rem 0;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const PageHeader = styled.div`
  background: white;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const BackButton = styled(Button)`
  background: transparent;
  border: none;
  color: #666;
  padding: 0.5rem;
  
  &:hover {
    background: #f5f5f5;
    color: #333;
  }
`;

const Sidebar = styled.div`
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  position: sticky;
  top: 2rem;
`;

const SidebarItem = styled.div`
  padding: 0.75rem 0;
  color: ${props => props.active ? '#b8860b' : '#666'};
  font-weight: ${props => props.active ? '600' : '400'};
  cursor: pointer;
  border-left: 3px solid ${props => props.active ? '#b8860b' : 'transparent'};
  padding-left: 1rem;
  margin-left: -1.5rem;
  transition: all 0.2s ease;
  
  &:hover {
    color: #b8860b;
    background: #fff8e6;
  }
`;

const ContentCard = styled(Card)`
  border: none;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  margin-bottom: 1.5rem;
`;

const SectionTitle = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #f0f0f0;
`;

const ImageUploadArea = styled.div`
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fafafa;
  
  &:hover {
    border-color: #b8860b;
    background: #fff8e6;
  }
`;

const ImagePreviewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const ImagePreview = styled.div`
  position: relative;
  width: 100px;
  height: 100px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .remove-btn {
    position: absolute;
    top: 4px;
    right: 4px;
    background: rgba(0,0,0,0.6);
    color: white;
    border: none;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &:hover {
      background: rgba(0,0,0,0.8);
    }
  }
`;

const InfoBox = styled.div`
  background: #fff8e6;
  border-left: 3px solid #b8860b;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: #666;
`;

const CharCount = styled.span`
  float: right;
  font-size: 0.85rem;
  color: ${props => props.$exceeded ? '#dc3545' : '#999'};
`;

const SubmitButton = styled(Button)`
  background: linear-gradient(135deg, #b8860b 0%, #d4af37 100%);
  border: none;
  padding: 0.75rem 2rem;
  font-weight: 600;
  
  &:hover {
    background: linear-gradient(135deg, #a07609 0%, #c49d2f 100%);
  }
  
  &:disabled {
    background: #ccc;
  }
`;

const PreviewPanel = styled.div`
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  position: sticky;
  top: 2rem;
`;

function AddProduct() {
    const navigate = useNavigate();
    const [shopData, setShopData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeSection, setActiveSection] = useState('basic');
    
    const [formData, setFormData] = useState({
        productName: '',
        description: '',
        categoryId: '',
        sellingPrice: '',
        costPrice: '',
        images: [],
        quantity: '',
        sku: ''
    });

    const [categories, setCategories] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);

    useEffect(() => {
        const initData = async () => {
            try {
                const user = authService.getCurrentUser();
                if (!user) {
                    toast.error('Vui lòng đăng nhập');
                    navigate('/login');
                    return;
                }

                const shopResponse = await shopService.checkUserShop(user._id);
                if (!shopResponse.success || !shopResponse.data) {
                    toast.warning('Bạn chưa đăng ký shop');
                    navigate('/seller-registration');
                    return;
                }
                setShopData(shopResponse.data);

                // Load categories from API
                const categoriesResponse = await categoryService.getAllCategories();
                if (categoriesResponse.success) {
                    setCategories(categoriesResponse.data);
                } else {
                    toast.error('Không thể tải danh mục');
                }
            } catch (error) {
                console.error('Error loading data:', error);
                toast.error('Không thể tải dữ liệu');
            }
        };

        initData();
    }, [navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + imagePreviews.length > 9) {
            toast.warning('Tối đa 9 ảnh');
            return;
        }

        const newPreviews = files.map(file => ({
            file,
            url: URL.createObjectURL(file)
        }));

        setImagePreviews(prev => [...prev, ...newPreviews]);
        setFormData(prev => ({
            ...prev,
            images: [...prev.images, ...files]
        }));
    };

    const removeImage = (index) => {
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.productName || !formData.description || !formData.sellingPrice || !formData.categoryId) {
            toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
            return;
        }

        if (imagePreviews.length === 0) {
            toast.error('Vui lòng thêm ít nhất 1 ảnh sản phẩm');
            return;
        }

        if (!shopData || !shopData._id) {
            toast.error('Không tìm thấy thông tin shop');
            return;
        }

        setLoading(true);
        try {
            const productData = {
                shopId: shopData._id,
                categoryId: formData.categoryId,
                productName: formData.productName,
                description: formData.description,
                sellingPrice: formData.sellingPrice,
                costPrice: formData.costPrice || null,
                quantity: formData.quantity || 0,
                sku: formData.sku || '',
                images: formData.images
            };

            const response = await productService.createProduct(productData);

            if (response.success) {
                toast.success(response.message || 'Thêm sản phẩm thành công!');
                navigate('/seller-dashboard');
            } else {
                toast.error(response.message || 'Không thể thêm sản phẩm');
            }
        } catch (error) {
            console.error('Error creating product:', error);
            toast.error(error.message || 'Không thể thêm sản phẩm');
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageWrapper>
            <Container>
                <PageHeader>
                    <BackButton onClick={() => navigate('/seller-dashboard')}>
                        <FaArrowLeft size={20} />
                    </BackButton>
                    <h4 style={{ margin: 0 }}>Thêm Sản Phẩm Mới</h4>
                </PageHeader>

                <Row>
                    {/* Sidebar Navigation */}
                    <Col md={2}>
                        <Sidebar>
                            <SidebarItem
                                active={activeSection === 'basic'}
                                onClick={() => setActiveSection('basic')}
                            >
                                Thông tin cơ bản
                            </SidebarItem>
                            <SidebarItem
                                active={activeSection === 'details'}
                                onClick={() => setActiveSection('details')}
                            >
                                Thông tin chi tiết
                            </SidebarItem>
                            <SidebarItem
                                active={activeSection === 'sales'}
                                onClick={() => setActiveSection('sales')}
                            >
                                Thông tin bán hàng
                            </SidebarItem>
                            <SidebarItem
                                active={activeSection === 'shipping'}
                                onClick={() => setActiveSection('shipping')}
                            >
                                Vận chuyển
                            </SidebarItem>
                            <SidebarItem
                                active={activeSection === 'other'}
                                onClick={() => setActiveSection('other')}
                            >
                                Thông tin khác
                            </SidebarItem>
                        </Sidebar>
                    </Col>

                    {/* Main Content */}
                    <Col md={7}>
                        <Form onSubmit={handleSubmit}>
                            {/* Thông tin cơ bản */}
                            <ContentCard id="basic">
                                <Card.Body>
                                    <SectionTitle>Thông tin cơ bản</SectionTitle>

                                    {/* Hình ảnh sản phẩm */}
                                    <Form.Group className="mb-4">
                                        <Form.Label>
                                            <FaImage style={{ marginRight: '0.5rem', color: '#b8860b' }} />
                                            Hình ảnh sản phẩm <span style={{ color: 'red' }}>*</span>
                                        </Form.Label>
                                        <InfoBox>
                                            <FaInfoCircle style={{ marginRight: '0.5rem' }} />
                                            Tải lên tối đa 9 ảnh. Kích thước tối đa 5MB, định dạng JPG/PNG.
                                            Ảnh đầu tiên sẽ là ảnh đại diện sản phẩm.
                                        </InfoBox>

                                        <ImageUploadArea onClick={() => document.getElementById('imageInput').click()}>
                                            <FaImage size={40} color="#b8860b" />
                                            <p style={{ marginTop: '1rem', marginBottom: '0.5rem', color: '#666' }}>
                                                Thêm hình ảnh ({imagePreviews.length}/9)
                                            </p>
                                            <small style={{ color: '#999' }}>
                                                Click để chọn ảnh hoặc kéo thả vào đây
                                            </small>
                                        </ImageUploadArea>

                                        <input
                                            id="imageInput"
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            style={{ display: 'none' }}
                                            onChange={handleImageUpload}
                                        />

                                        {imagePreviews.length > 0 && (
                                            <ImagePreviewGrid>
                                                {imagePreviews.map((preview, index) => (
                                                    <ImagePreview key={index}>
                                                        <img src={preview.url} alt={`Preview ${index + 1}`} />
                                                        <button
                                                            className="remove-btn"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                removeImage(index);
                                                            }}
                                                        >
                                                            ×
                                                        </button>
                                                        {index === 0 && (
                                                            <div style={{
                                                                position: 'absolute',
                                                                bottom: 0,
                                                                left: 0,
                                                                right: 0,
                                                                background: 'rgba(184, 134, 11, 0.9)',
                                                                color: 'white',
                                                                fontSize: '0.7rem',
                                                                padding: '0.25rem',
                                                                textAlign: 'center'
                                                            }}>
                                                                Ảnh bìa
                                                            </div>
                                                        )}
                                                    </ImagePreview>
                                                ))}
                                            </ImagePreviewGrid>
                                        )}
                                    </Form.Group>

                                    {/* Tên sản phẩm */}
                                    <Form.Group className="mb-4">
                                        <Form.Label>
                                            Tên sản phẩm <span style={{ color: 'red' }}>*</span>
                                        </Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="productName"
                                            value={formData.productName}
                                            onChange={handleInputChange}
                                            placeholder="Tên sản phẩm + Thương hiệu + Model + Thông số kỹ thuật"
                                            maxLength={120}
                                        />
                                        <CharCount $exceeded={formData.productName.length > 120}>
                                            {formData.productName.length}/120
                                        </CharCount>
                                    </Form.Group>

                                    {/* Ngành hàng */}
                                    <Form.Group className="mb-4">
                                        <Form.Label>
                                            Ngành hàng <span style={{ color: 'red' }}>*</span>
                                        </Form.Label>
                                        <Form.Select
                                            name="categoryId"
                                            value={formData.categoryId}
                                            onChange={handleInputChange}
                                        >
                                            <option value="">Chọn ngành hàng</option>
                                            {categories.map(cat => (
                                                <option key={cat._id} value={cat._id}>
                                                    {cat.categoryName}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>

                                    {/* Mô tả sản phẩm */}
                                    <Form.Group className="mb-4">
                                        <Form.Label>
                                            Mô tả sản phẩm <span style={{ color: 'red' }}>*</span>
                                        </Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={8}
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            placeholder="Nhập mô tả chi tiết về sản phẩm..."
                                            maxLength={2000}
                                        />
                                        <CharCount $exceeded={formData.description.length > 2000}>
                                            {formData.description.length}/2000
                                        </CharCount>
                                    </Form.Group>
                                </Card.Body>
                            </ContentCard>

                            {/* Thông tin bán hàng */}
                            <ContentCard id="sales">
                                <Card.Body>
                                    <SectionTitle>Thông tin bán hàng</SectionTitle>

                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-4">
                                                <Form.Label>
                                                    Giá bán <span style={{ color: 'red' }}>*</span>
                                                </Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    name="sellingPrice"
                                                    value={formData.sellingPrice}
                                                    onChange={handleInputChange}
                                                    placeholder="Nhập giá bán"
                                                    min="0"
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-4">
                                                <Form.Label>
                                                    Giá nhập
                                                </Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    name="costPrice"
                                                    value={formData.costPrice}
                                                    onChange={handleInputChange}
                                                    placeholder="Nhập giá vốn"
                                                    min="0"
                                                />
                                                <Form.Text className="text-muted">
                                                    Để trống sẽ tự động tính 70% giá bán
                                                </Form.Text>
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-4">
                                                <Form.Label>
                                                    Kho hàng <span style={{ color: 'red' }}>*</span>
                                                </Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    name="quantity"
                                                    value={formData.quantity}
                                                    onChange={handleInputChange}
                                                    placeholder="Nhập số lượng"
                                                    min="0"
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-4">
                                                <Form.Label>SKU sản phẩm</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="sku"
                                                    value={formData.sku}
                                                    onChange={handleInputChange}
                                                    placeholder="Nhập mã SKU"
                                                />
                                                <Form.Text className="text-muted">
                                                    Mã SKU giúp bạn quản lý sản phẩm dễ dàng hơn
                                                </Form.Text>
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </ContentCard>

                            {/* Submit Buttons */}
                            <div style={{
                                background: 'white',
                                padding: '1.5rem',
                                borderRadius: '8px',
                                boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                                display: 'flex',
                                gap: '1rem',
                                justifyContent: 'flex-end'
                            }}>
                                <Button
                                    variant="outline-secondary"
                                    onClick={() => navigate('/seller-dashboard')}
                                >
                                    Hủy
                                </Button>
                                <Button
                                    variant="outline-primary"
                                    disabled={loading}
                                >
                                    Lưu & Ẩn
                                </Button>
                                <SubmitButton
                                    type="submit"
                                    disabled={loading}
                                >
                                    {loading ? 'Đang xử lý...' : 'Lưu & Hiển thị'}
                                </SubmitButton>
                            </div>
                        </Form>
                    </Col>

                    {/* Preview Panel */}
                    <Col md={3}>
                        <PreviewPanel>
                            <h6 style={{ marginBottom: '1rem', color: '#666' }}>Xem trước</h6>

                            {imagePreviews.length > 0 ? (
                                <div style={{
                                    width: '100%',
                                    aspectRatio: '1/1',
                                    border: '1px solid #e0e0e0',
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    marginBottom: '1rem'
                                }}>
                                    <img
                                        src={imagePreviews[0].url}
                                        alt="Preview"
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                </div>
                            ) : (
                                <div style={{
                                    width: '100%',
                                    aspectRatio: '1/1',
                                    border: '2px dashed #d9d9d9',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#999',
                                    marginBottom: '1rem'
                                }}>
                                    <FaImage size={40} />
                                </div>
                            )}

                            <h6 style={{
                                fontSize: '0.95rem',
                                color: '#333',
                                marginBottom: '0.5rem',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical'
                            }}>
                                {formData.productName || 'Tên sản phẩm'}
                            </h6>

                            {formData.sellingPrice && (
                                <div style={{
                                    fontSize: '1.2rem',
                                    color: '#b8860b',
                                    fontWeight: 'bold',
                                    marginBottom: '0.5rem'
                                }}>
                                    {new Intl.NumberFormat('vi-VN', {
                                        style: 'currency',
                                        currency: 'VND'
                                    }).format(formData.sellingPrice)}
                                </div>
                            )}

                            <div style={{
                                fontSize: '0.85rem',
                                color: '#666',
                                marginTop: '1rem',
                                padding: '0.75rem',
                                background: '#f8f8f8',
                                borderRadius: '4px'
                            }}>
                                <div style={{ marginBottom: '0.5rem' }}>
                                    <strong>Cửa hàng:</strong> {shopData?.shopName || 'Shop của bạn'}
                                </div>
                                {formData.quantity && (
                                    <div>
                                        <strong>Kho:</strong> {formData.quantity} sản phẩm
                                    </div>
                                )}
                            </div>
                        </PreviewPanel>
                    </Col>
                </Row>
            </Container>
        </PageWrapper>
    );
}

export default AddProduct;

