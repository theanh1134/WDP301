import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Row, Col, Spinner } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { FaImage, FaInfoCircle, FaArrowLeft, FaEdit } from 'react-icons/fa';
import { toast } from 'react-toastify';
import authService from '../../services/authService';
import shopService from '../../services/shopService';
import productService from '../../services/productService';
import categoryService from '../../services/categoryService';
import EditBatchModal from './EditBatchModal';
import 'bootstrap/dist/css/bootstrap.min.css';

// Styled Components (reuse from AddProduct)
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

const LoadingOverlay = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
`;

function EditProduct() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [shopData, setShopData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingProduct, setLoadingProduct] = useState(true);
    
    const [formData, setFormData] = useState({
        productName: '',
        description: '',
        categoryId: '',
        images: [],
        sku: ''
    });

    const [categories, setCategories] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [existingImages, setExistingImages] = useState([]);
    const [inventoryBatches, setInventoryBatches] = useState([]);
    const [showEditBatchModal, setShowEditBatchModal] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState(null);

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

                // Load categories
                const categoriesResponse = await categoryService.getAllCategories();
                if (categoriesResponse.success) {
                    setCategories(categoriesResponse.data);
                }

                // Load product data
                const productResponse = await productService.getProductById(id);
                console.log('Product response:', productResponse);
                if (productResponse.success) {
                    const product = productResponse.data;
                    console.log('Product data:', product);

                    // Store inventory batches
                    if (product.inventoryBatches && product.inventoryBatches.length > 0) {
                        setInventoryBatches(product.inventoryBatches);
                    }

                    setFormData({
                        productName: product.productName || product.name || '',
                        description: product.description || '',
                        categoryId: product.categoryId || product.category?._id || '',
                        images: [],
                        sku: product.sku || ''
                    });

                    // Set existing images
                    if (product.images && product.images.length > 0) {
                        const existingImgs = product.images
                            .filter(img => img) // Filter out null/undefined
                            .map(img => {
                                // Handle both string URLs and object with url property
                                let imageUrl = '';
                                if (typeof img === 'string') {
                                    imageUrl = img.startsWith('http') ? img : `http://localhost:9999${img}`;
                                } else if (img && img.url) {
                                    imageUrl = img.url.startsWith('http') ? img.url : `http://localhost:9999${img.url}`;
                                }
                                return {
                                    url: imageUrl,
                                    isExisting: true
                                };
                            })
                            .filter(img => img.url); // Remove empty URLs
                        setExistingImages(existingImgs);
                        setImagePreviews(existingImgs);
                    }
                } else {
                    toast.error('Không tìm thấy sản phẩm');
                    navigate('/seller-dashboard');
                }
            } catch (error) {
                console.error('Error loading data:', error);
                toast.error('Không thể tải dữ liệu');
                navigate('/seller-dashboard');
            } finally {
                setLoadingProduct(false);
            }
        };

        initData();
    }, [navigate, id]);

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
            url: URL.createObjectURL(file),
            isExisting: false
        }));

        setImagePreviews(prev => [...prev, ...newPreviews]);
        setFormData(prev => ({
            ...prev,
            images: [...prev.images, ...files]
        }));
    };

    const removeImage = (index) => {
        const imageToRemove = imagePreviews[index];
        
        // Remove from previews
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
        
        // If it's a new image, remove from formData.images
        if (!imageToRemove.isExisting) {
            setFormData(prev => ({
                ...prev,
                images: prev.images.filter((_, i) => {
                    // Find the index in the new images array
                    const newImageIndex = imagePreviews.filter(p => !p.isExisting).indexOf(imageToRemove);
                    return i !== newImageIndex;
                })
            }));
        } else {
            // If it's an existing image, remove from existingImages
            setExistingImages(prev => prev.filter(img => img.url !== imageToRemove.url));
        }
    };

    const handleEditBatch = (batch) => {
        setSelectedBatch(batch);
        setShowEditBatchModal(true);
    };

    const handleBatchUpdateSuccess = async (data) => {
        toast.success(data.message || 'Cập nhật lô hàng thành công!');
        setShowEditBatchModal(false);
        setSelectedBatch(null);

        // Reload product data to get updated batches
        try {
            const product = await productService.getDetailProduct(id);
            if (product.inventoryBatches && product.inventoryBatches.length > 0) {
                setInventoryBatches(product.inventoryBatches);
            }
        } catch (error) {
            console.error('Error reloading product:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.productName || !formData.description || !formData.categoryId) {
            toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
            return;
        }

        if (imagePreviews.length === 0) {
            toast.error('Vui lòng thêm ít nhất 1 ảnh sản phẩm');
            return;
        }

        setLoading(true);
        try {
            const productData = {
                productName: formData.productName,
                description: formData.description,
                categoryId: formData.categoryId,
                sku: formData.sku || '',
                images: formData.images
            };

            const response = await productService.updateProduct(id, productData);

            if (response.success) {
                toast.success(response.message || 'Cập nhật sản phẩm thành công!');
                navigate('/seller-dashboard');
            } else {
                toast.error(response.message || 'Không thể cập nhật sản phẩm');
            }
        } catch (error) {
            console.error('Error updating product:', error);
            toast.error(error.message || 'Không thể cập nhật sản phẩm');
        } finally {
            setLoading(false);
        }
    };

    if (loadingProduct) {
        return (
            <PageWrapper>
                <LoadingOverlay>
                    <Spinner animation="border" variant="warning" />
                </LoadingOverlay>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper>
            <Container>
                <PageHeader>
                    <BackButton onClick={() => navigate('/seller-dashboard')}>
                        <FaArrowLeft size={20} />
                    </BackButton>
                    <h4 style={{ margin: 0 }}>Chỉnh Sửa Sản Phẩm</h4>
                </PageHeader>

                <Row>
                    {/* Main Content */}
                    <Col md={9}>
                        <Form onSubmit={handleSubmit}>
                            {/* Thông tin cơ bản */}
                            <ContentCard>
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

                            {/* Thông tin khác */}
                            <ContentCard>
                                <Card.Body>
                                    <SectionTitle>Thông tin khác</SectionTitle>

                                    <Row>
                                        <Col md={12}>
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

                            {/* Danh sách lô hàng */}
                            {inventoryBatches.length > 0 && (
                                <ContentCard>
                                    <Card.Body>
                                        <SectionTitle>
                                            Danh sách lô hàng
                                            <span style={{ fontSize: '0.9rem', color: '#666', fontWeight: 'normal', marginLeft: '10px' }}>
                                                ({inventoryBatches.length} lô)
                                            </span>
                                        </SectionTitle>
                                        <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '15px' }}>
                                            💡 Click nút "Sửa" để cập nhật giá bán/giá nhập của từng lô hàng.
                                        </div>
                                        <div style={{ overflowX: 'auto' }}>
                                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                <thead>
                                                    <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                                                        <th style={{ padding: '12px', textAlign: 'left' }}>Lô #</th>
                                                        <th style={{ padding: '12px', textAlign: 'right' }}>Số lượng nhập</th>
                                                        <th style={{ padding: '12px', textAlign: 'right' }}>Còn lại</th>
                                                        <th style={{ padding: '12px', textAlign: 'right' }}>Giá nhập</th>
                                                        <th style={{ padding: '12px', textAlign: 'right' }}>Giá bán</th>
                                                        <th style={{ padding: '12px', textAlign: 'right' }}>Lợi nhuận/sp</th>
                                                        <th style={{ padding: '12px', textAlign: 'left' }}>Ngày nhập</th>
                                                        <th style={{ padding: '12px', textAlign: 'center' }}>Thao tác</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {inventoryBatches.map((batch, index) => {
                                                        const profit = (batch.sellingPrice || 0) - (batch.costPrice || 0);
                                                        const profitPercent = batch.costPrice > 0
                                                            ? ((profit / batch.costPrice) * 100).toFixed(1)
                                                            : 0;

                                                        return (
                                                            <tr key={batch._id || index} style={{ borderBottom: '1px solid #dee2e6' }}>
                                                                <td style={{ padding: '12px' }}>Lô {index + 1}</td>
                                                                <td style={{ padding: '12px', textAlign: 'right' }}>
                                                                    {batch.quantityReceived || 0}
                                                                </td>
                                                                <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>
                                                                    {batch.quantityRemaining || 0}
                                                                </td>
                                                                <td style={{ padding: '12px', textAlign: 'right' }}>
                                                                    {new Intl.NumberFormat('vi-VN', {
                                                                        style: 'currency',
                                                                        currency: 'VND'
                                                                    }).format(batch.costPrice || 0)}
                                                                </td>
                                                                <td style={{ padding: '12px', textAlign: 'right' }}>
                                                                    {new Intl.NumberFormat('vi-VN', {
                                                                        style: 'currency',
                                                                        currency: 'VND'
                                                                    }).format(batch.sellingPrice || 0)}
                                                                </td>
                                                                <td style={{ padding: '12px', textAlign: 'right', color: profit > 0 ? '#28a745' : '#dc3545' }}>
                                                                    {new Intl.NumberFormat('vi-VN', {
                                                                        style: 'currency',
                                                                        currency: 'VND'
                                                                    }).format(profit)}
                                                                    <br />
                                                                    <small>({profitPercent}%)</small>
                                                                </td>
                                                                <td style={{ padding: '12px' }}>
                                                                    {new Date(batch.receivedDate).toLocaleDateString('vi-VN')}
                                                                </td>
                                                                <td style={{ padding: '12px', textAlign: 'center' }}>
                                                                    <Button
                                                                        variant="outline-primary"
                                                                        size="sm"
                                                                        onClick={() => handleEditBatch(batch)}
                                                                        style={{
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            gap: '5px',
                                                                            margin: '0 auto'
                                                                        }}
                                                                    >
                                                                        <FaEdit /> Sửa
                                                                    </Button>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                                <tfoot>
                                                    <tr style={{ backgroundColor: '#f8f9fa', fontWeight: 'bold', borderTop: '2px solid #dee2e6' }}>
                                                        <td style={{ padding: '12px' }}>Tổng</td>
                                                        <td style={{ padding: '12px', textAlign: 'right' }}>
                                                            {inventoryBatches.reduce((sum, b) => sum + (b.quantityReceived || 0), 0)}
                                                        </td>
                                                        <td style={{ padding: '12px', textAlign: 'right' }}>
                                                            {inventoryBatches.reduce((sum, b) => sum + (b.quantityRemaining || 0), 0)}
                                                        </td>
                                                        <td colSpan="5"></td>
                                                    </tr>
                                                </tfoot>
                                            </table>
                                        </div>
                                    </Card.Body>
                                </ContentCard>
                            )}

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
                                <SubmitButton
                                    type="submit"
                                    disabled={loading}
                                >
                                    {loading ? 'Đang cập nhật...' : 'Cập nhật sản phẩm'}
                                </SubmitButton>
                            </div>
                        </Form>
                    </Col>
                </Row>
            </Container>

            {/* Edit Batch Modal */}
            <EditBatchModal
                show={showEditBatchModal}
                onHide={() => {
                    setShowEditBatchModal(false);
                    setSelectedBatch(null);
                }}
                batch={selectedBatch}
                productId={id}
                onSuccess={handleBatchUpdateSuccess}
            />
        </PageWrapper>
    );
}

export default EditProduct;

