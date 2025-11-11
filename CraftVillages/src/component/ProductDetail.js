import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button, Tabs, Tab, Card } from "react-bootstrap";
import {
  FaFacebook,
  FaInstagram,
  FaTwitter,
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
  FaComments,
} from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Header from "./Header";
import Footer from "./Footer";
import UspBanner from "./USPBanner";
import ShopInfo from "./ShopInfo";
import axios from "axios";
import authService from '../services/authService';
import { toast } from 'react-toastify';
import { useCart } from '../contexts/CartContext';
import reviewService from '../services/reviewService';
import { getImageUrl } from '../utils/imageHelper';

function ProductDetail() {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [productDetail, setProductDetail] = useState({});
  const [relatedProducts, setRelatedProducts] = useState([]); // Thêm state cho related products
  const [loadingRelated, setLoadingRelated] = useState(false); // Thêm loading state
  const [reviews, setReviews] = useState([]); // State cho reviews
  const [loadingReviews, setLoadingReviews] = useState(false); // Loading state cho reviews
  const [reviewStats, setReviewStats] = useState({ totalReviews: 0, averageRating: 0 }); // Stats cho reviews
  const [selectedImage, setSelectedImage] = useState(null); // State cho ảnh được chọn
  const [isOwnProduct, setIsOwnProduct] = useState(false); // State để kiểm tra sản phẩm của chính mình
  const navigate = useNavigate();

  useEffect(() => {
    const getApiDetail = async () => {
      if (!id) {
        console.log('No product ID provided');
        return;
      }

      try {
        console.log('Fetching product details for ID:', id);
        const res = await axios.get(`http://localhost:9999/products/${id}`);
        const data = res.data.data;
        console.log('Product data:', data);
        setProductDetail({
          ...data,
          tags: Array.isArray(data.tags) ? data.tags : [],
        });
        setSelectedImage(null); // Reset về ảnh chính khi chuyển sản phẩm
      } catch (err) {
        console.error("Error fetching product detail:", err);
        if (err.response?.status === 404) {
          navigate('/');
        }
      }
    };
    getApiDetail();
  }, [id, navigate]);

  // Thêm useEffect để lấy related products ngẫu nhiên
  useEffect(() => {
    const getRelatedProducts = async () => {
      try {
        setLoadingRelated(true);
        // Lấy tất cả sản phẩm từ database
        const res = await axios.get(`http://localhost:9999/products`);

        // Đảm bảo allProducts là array - API trả về res.data.data.products
        const allProducts = Array.isArray(res.data.data?.products) ? res.data.data.products : [];
        console.log('All products:', allProducts);

        // Lọc bỏ sản phẩm hiện tại và lấy ngẫu nhiên 4 sản phẩm
        const filtered = allProducts
          .filter(product => product._id !== id)
          .sort(() => Math.random() - 0.5) // Xáo trộn ngẫu nhiên
          .slice(0, 4);

        setRelatedProducts(filtered);
      } catch (err) {
        console.error("Error fetching related products:", err);
        setRelatedProducts([]);
      } finally {
        setLoadingRelated(false);
      }
    };

    getRelatedProducts();
  }, [id]);

  // Load reviews cho sản phẩm
  useEffect(() => {
    const loadReviews = async () => {
      if (!id) return;

      try {
        setLoadingReviews(true);
        const reviewData = await reviewService.getProductReviews(id);
        setReviews(reviewData.reviews || []);
        setReviewStats({
          totalReviews: reviewData.totalReviews || 0,
          averageRating: reviewData.averageRating || 0
        });
      } catch (error) {
        console.error('Error loading reviews:', error);
        setReviews([]);
        setReviewStats({ totalReviews: 0, averageRating: 0 });
      } finally {
        setLoadingReviews(false);
      }
    };

    loadReviews();
  }, [id]);

  // Kiểm tra xem user có phải là chủ shop không
  useEffect(() => {
    const checkOwnership = () => {
      const user = authService.getCurrentUser();
      if (!user || !productDetail?.shop?.sellerId) {
        setIsOwnProduct(false);
        return;
      }

      // So sánh userId với sellerId của shop
      const userId = user._id || user.id;
      const sellerId = productDetail.shop.sellerId;

      setIsOwnProduct(userId === sellerId || userId === sellerId.toString());
    };

    checkOwnership();
  }, [productDetail]);

  const increaseQuantity = () => {
    const maxQty = productDetail?.maxQuantityPerOrder || productDetail?.stock || 999;
    setQuantity((prev) => {
      if (prev >= maxQty) {
        toast.warning(`số lượng sản phẩm chỉ còn ${maxQty}  với giá hiện tại (${(productDetail?.displayPrice || 0).toLocaleString()}đ)`);
        return prev;
      }
      return prev + 1;
    });
  };

  const decreaseQuantity = () =>
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const handleCompare = () => {
    const productWithCategory = {
      ...productDetail,
      category: {
        _id: productDetail.categoryId,
        name: productDetail.categoryName || 'Unknown Category'
      }
    };
    navigate("/compare", { state: { initialProduct: productWithCategory } });
  };

  const renderRatingStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;
    for (let i = 0; i < fullStars; i++)
      stars.push(<FaStar key={`star-${i}`} style={{ color: "#ffc107" }} />);
    if (hasHalfStar)
      stars.push(
        <FaStarHalfAlt key="half-star" style={{ color: "#ffc107" }} />
      );
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++)
      stars.push(<FaRegStar key={`empty-${i}`} style={{ color: "#ffc107" }} />);
    return stars;
  };

  const [addingToCart, setAddingToCart] = useState(false);
  const [error, setError] = useState(null);

  const { addToCart, refreshCart } = useCart();

  const handleAddToCart = async () => {
    try {
      const user = authService.getCurrentUser();

      if (!user) {
        toast.warning("Vui lòng đăng nhập để thêm vào giỏ hàng");
        navigate("/login");
        return;
      }

      setAddingToCart(true);
      setError(null);

      const cartItem = {
        productId: id,
        shopId: productDetail.shopId || "68edaeaf7bddb31f3e0ed6f4",
        productName: productDetail.name,
        thumbnailUrl: getImageUrl(productDetail.image),
        priceAtAdd: productDetail.displayPrice || productDetail.price,
        quantity: quantity,
      };

      await addToCart(cartItem);
      await refreshCart();

      toast.success("Đã thêm sản phẩm vào giỏ hàng!");
      navigate("/cart");
    } catch (error) {
      console.error("Error adding to cart:", error);
      const errorMessage = error.response?.data?.message || error.message || "Không thể thêm vào giỏ hàng. Vui lòng thử lại.";
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setAddingToCart(false);
    }
  };

  // Hàm xử lý click vào related product
  const handleRelatedProductClick = (productId) => {
    // Điều hướng đúng route /products/:id
    navigate(`/products/${productId}`);
    window.scrollTo(0, 0); // Scroll to top
  };

  // Hàm hiển thị badge cho sản phẩm
  const getProductBadge = (product) => {
    if (product.discount && product.discount > 0) {
      return { text: `${product.discount}%`, type: 'sale' };
    }
    // Kiểm tra sản phẩm mới (ví dụ: trong vòng 30 ngày)
    const productDate = new Date(product.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now - productDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 30) {
      return { text: 'New', type: 'new' };
    }
    return null;
  };

  const styles = {
    breadcrumb: {
      padding: "15px 0",
      backgroundColor: "#f8f9fa",
      marginBottom: "30px",
    },
    breadcrumbItem: {
      display: "inline-block",
      margin: "0 5px",
      color: "#6c757d",
      textDecoration: "none",
      fontSize: "14px",
    },
    breadcrumbActive: {
      color: "#333",
      fontWeight: "500",
    },
    productContainer: {
      marginBottom: "50px",
      border: "1px solid #e0e0e0",
      borderRadius: "8px",
      padding: "30px",
      backgroundColor: "#fff",
    },
    productImage: {
      width: "100%",
      height: "auto",
      borderRadius: "8px",
      marginBottom: "15px",
    },
    thumbnailContainer: {
      display: "flex",
      flexDirection: "column",
      gap: "10px",
    },
    thumbnail: {
      width: "70px",
      height: "70px",
      objectFit: "cover",
      borderRadius: "4px",
      cursor: "pointer",
      border: "2px solid transparent",
    },
    thumbnailActive: {
      borderColor: "#b8860b",
    },
    productTitle: {
      fontSize: "28px",
      fontWeight: "600",
      marginBottom: "10px",
      color: "#333",
    },
    productPrice: {
      fontSize: "24px",
      fontWeight: "600",
      color: "#b8860b",
      marginRight: "15px",
    },
    productOldPrice: {
      fontSize: "18px",
      color: "#999",
      textDecoration: "line-through",
    },
    productRating: {
      display: "flex",
      alignItems: "center",
      gap: "5px",
      marginBottom: "20px",
    },
    ratingText: {
      fontSize: "14px",
      color: "#666",
      marginLeft: "10px",
    },
    productDescription: {
      fontSize: "16px",
      color: "#555",
      lineHeight: "1.6",
      marginBottom: "20px",
    },
    quantityControl: {
      display: "flex",
      alignItems: "center",
      marginBottom: "20px",
    },
    quantityBtn: {
      width: "40px",
      height: "40px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#f0f0f0",
      border: "none",
      fontSize: "18px",
    },
    quantityInput: {
      width: "60px",
      height: "40px",
      textAlign: "center",
      border: "1px solid #e0e0e0",
    },
    addToCartBtn: {
      backgroundColor: "#b8860b",
      border: "none",
      padding: "10px 25px",
      fontSize: "16px",
      fontWeight: "600",
      borderRadius: "4px",
      marginRight: "15px",
    },
    compareBtn: {
      backgroundColor: "white",
      border: "1px solid #b8860b",
      color: "#b8860b",
      padding: "10px 25px",
      fontSize: "16px",
      fontWeight: "600",
      borderRadius: "4px",
    },
    productMeta: {
      marginTop: "30px",
      borderTop: "1px solid #e0e0e0",
      paddingTop: "20px",
      fontSize: "14px",
    },
    metaItem: {
      marginBottom: "10px",
      display: "flex",
    },
    metaLabel: {
      width: "100px",
      color: "#666",
      fontWeight: "500",
    },
    metaValue: {
      color: "#333",
    },
    socialLinks: {
      marginTop: "10px",
      display: "flex",
      gap: "15px",
    },
    socialIcon: {
      color: "#333",
      fontSize: "20px",
    },
    tabsContainer: {
      marginTop: "50px",
      marginBottom: "50px",
    },
    tabContent: {
      padding: "30px",
      border: "1px solid #dee2e6",
      borderTop: "none",
      borderBottomLeftRadius: "4px",
      borderBottomRightRadius: "4px",
      backgroundColor: "#fff",
    },
    productDetailText: {
      fontSize: "16px",
      color: "#555",
      lineHeight: "1.8",
      marginBottom: "20px",
    },
    productDetailImage: {
      width: "100%",
      height: "auto",
      borderRadius: "8px",
      marginBottom: "30px",
    },
    relatedProductsSection: {
      marginBottom: "50px",
    },
    sectionTitle: {
      fontSize: "28px",
      fontWeight: "600",
      textAlign: "center",
      marginBottom: "30px",
      color: "#333",
    },
    relatedProductCard: {
      border: "none",
      borderRadius: "8px",
      overflow: "hidden",
      boxShadow: "0 5px 15px rgba(0, 0, 0, 0.05)",
      marginBottom: "20px",
      height: "100%",
      cursor: "pointer",
      transition: "transform 0.3s ease",
    },
    relatedProductImage: {
      height: "200px",
      objectFit: "cover",
      width: "100%",
    },
    relatedProductBadge: {
      position: "absolute",
      top: "10px",
      right: "10px",
      padding: "5px 10px",
      borderRadius: "4px",
      fontSize: "12px",
      fontWeight: "600",
      zIndex: "1",
      color: "white",
    },
    saleBadge: {
      backgroundColor: "#e74c3c",
    },
    newBadge: {
      backgroundColor: "#2ecc71",
    },
    relatedProductName: {
      fontSize: "16px",
      fontWeight: "600",
      marginBottom: "5px",
      color: "#333",
    },
    relatedProductCategory: {
      fontSize: "13px",
      color: "#777",
      marginBottom: "10px",
    },
    relatedProductPrice: {
      fontSize: "16px",
      fontWeight: "600",
      color: "#b8860b",
    },
    relatedProductOldPrice: {
      fontSize: "14px",
      color: "#999",
      textDecoration: "line-through",
      marginLeft: "10px",
    },
    showMoreBtn: {
      backgroundColor: "transparent",
      border: "2px solid #b8860b",
      color: "#b8860b",
      padding: "8px 30px",
      fontWeight: "600",
      borderRadius: "4px",
      transition: "all 0.3s ease",
    },
    backButton: {
      backgroundColor: "transparent",
      border: "none",
      color: "#333",
      display: "flex",
      alignItems: "center",
      gap: "5px",
      padding: "0",
      marginBottom: "20px",
      cursor: "pointer",
    },
    loadingText: {
      textAlign: "center",
      fontSize: "16px",
      color: "#666",
      padding: "40px 0",
    },
    noProductsText: {
      textAlign: "center",
      fontSize: "16px",
      color: "#999",
      padding: "40px 0",
    },
  };

  return (
    <>
      <Header />
      <Container>
        <style>
          {`
            .nav-tabs .nav-link {
              color: #666;
              border: 1px solid #dee2e6;
              padding: 10px 20px;
              font-weight: 500;
            }

            .nav-tabs .nav-link.active {
              color: #b8860b;
              background-color: #fff;
              border-bottom-color: transparent;
            }

            .product-card:hover {
              transform: translateY(-5px);
              box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
            }

            .add-to-cart-btn:hover, .compare-btn:hover, .show-more-btn:hover {
              transform: translateY(-2px);
            }

            .add-to-cart-btn:hover {
              background-color: #a67c00 !important;
            }

            .compare-btn:hover {
              background-color: #b8860b !important;
              color: white !important;
            }

            .show-more-btn:hover {
              background-color: #b8860b !important;
              color: white !important;
            }

            .thumbnail:hover {
              border-color: #b8860b !important;
            }
          `}
        </style>

        {/* Breadcrumb */}
        <div style={styles.breadcrumb}>
          <span style={styles.breadcrumbItem}>Shop</span>
          <span style={{ ...styles.breadcrumbItem, ...styles.breadcrumbActive }}>
            {productDetail?.name}
          </span>
        </div>

        {/* Product Details */}
        <div style={styles.productContainer}>
          <Row>
            {/* Thumbnails */}
            <Col md={1} className="d-none d-md-block">
              <div style={styles.thumbnailContainer}>
                <img
                  src={getImageUrl(productDetail?.image)}
                  alt={productDetail?.name}
                  style={{
                    ...styles.thumbnail,
                    ...(selectedImage === null ? styles.thumbnailActive : {})
                  }}
                  onClick={() => setSelectedImage(null)}
                />
                {productDetail?.additionalImages &&
                  productDetail?.additionalImages.map((image, index) => (
                    <img
                      key={index}
                      src={getImageUrl(image)}
                      alt={`${productDetail?.name} ${index + 1}`}
                      style={{
                        ...styles.thumbnail,
                        ...(selectedImage === index ? styles.thumbnailActive : {})
                      }}
                      onClick={() => setSelectedImage(index)}
                    />
                  ))}
              </div>
            </Col>

            {/* Main Product Image */}
            <Col md={5} style={{ position: 'relative' }}>
              <img
                src={
                  selectedImage === null || !productDetail?.additionalImages?.[selectedImage]
                    ? getImageUrl(productDetail?.image)
                    : getImageUrl(productDetail?.additionalImages[selectedImage])
                }
                alt={productDetail?.name}
                style={styles.productImage}
              />

              {/* Out of Stock Badge */}
              {(!productDetail?.stock || productDetail.stock === 0 || productDetail.maxQuantityPerOrder === 0) && (
                <div style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                  zIndex: 10
                }}>
                  HẾT HÀNG
                </div>
              )}
            </Col>

            {/* Product Info */}
            <Col md={6}>
              <h1 style={styles.productTitle}>{productDetail?.name}</h1>

              <div style={styles.productRating}>
                {renderRatingStars(reviewStats.averageRating || productDetail?.rating || 4.5)}
                <span style={styles.ratingText}>
                  {reviewStats.averageRating ? reviewStats.averageRating.toFixed(1) : (productDetail?.rating || 4.5)} sao ({reviewStats.totalReviews || productDetail?.reviews || 0} đánh giá)
                </span>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <span style={styles.productPrice}>
                  {((productDetail?.displayPrice || productDetail?.price || 0) * quantity).toLocaleString()} VND
                </span>
                {productDetail?.oldPrice && (
                  <span style={styles.productOldPrice}>
                    {((productDetail?.oldPrice || 0) * quantity).toLocaleString()} VND
                  </span>
                )}
                {/* Price range warning if prices vary */}
                {productDetail?.priceRange &&
                 productDetail.priceRange.min !== productDetail.priceRange.max && (
                  <div style={{
                    fontSize: '0.85rem',
                    color: '#ff6b6b',
                    marginTop: '8px',
                    padding: '8px 12px',
                    backgroundColor: '#fff3cd',
                    borderRadius: '4px',
                    border: '1px solid #ffc107'
                  }}>
                    ⚠️ Giá có thể thay đổi từ {productDetail.priceRange.min.toLocaleString()} VND
                    đến {productDetail.priceRange.max.toLocaleString()} VND tùy theo tồn kho
                  </div>
                )}
              </div>

              <p style={styles.productDescription}>
                {productDetail?.description ||
                  "Nón lá truyền thống được làm từ lá cọ chằng chịt, chắc mảnh, tỉ mỉ được công dân Việt Nam làm thủ công theo triết lý âm dương ngũ hành."}
              </p>

              <div style={styles.quantityControl}>
                <button
                  style={{
                    ...styles.quantityBtn,
                    opacity: (isOwnProduct || !productDetail?.stock || productDetail.stock === 0) ? 0.5 : 1,
                    cursor: (isOwnProduct || !productDetail?.stock || productDetail.stock === 0) ? 'not-allowed' : 'pointer'
                  }}
                  onClick={decreaseQuantity}
                  disabled={isOwnProduct || !productDetail?.stock || productDetail.stock === 0}
                >
                  -
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 1;
                    const maxQty = productDetail?.maxQuantityPerOrder || productDetail?.stock || 999;
                    if (value > maxQty) {
                      toast.warning(`số lượng sản phẩm chỉ còn ${maxQty}  với giá hiện tại (${(productDetail?.displayPrice || 0).toLocaleString()}đ)`);
                      setQuantity(maxQty);
                    } else {
                      setQuantity(value);
                    }
                  }}
                  style={{
                    ...styles.quantityInput,
                    opacity: (isOwnProduct || !productDetail?.stock || productDetail.stock === 0) ? 0.5 : 1,
                    cursor: (isOwnProduct || !productDetail?.stock || productDetail.stock === 0) ? 'not-allowed' : 'text'
                  }}
                  min="1"
                  max={productDetail?.maxQuantityPerOrder || productDetail?.stock || 999}
                  disabled={isOwnProduct || !productDetail?.stock || productDetail.stock === 0}
                />
                <button
                  style={{
                    ...styles.quantityBtn,
                    opacity: (isOwnProduct || !productDetail?.stock || productDetail.stock === 0) ? 0.5 : 1,
                    cursor: (isOwnProduct || !productDetail?.stock || productDetail.stock === 0) ? 'not-allowed' : 'pointer'
                  }}
                  onClick={increaseQuantity}
                  disabled={isOwnProduct || !productDetail?.stock || productDetail.stock === 0}
                >
                  +
                </button>
              </div>

              {/* Show max quantity warning */}
              {productDetail?.maxQuantityPerOrder &&
               productDetail.maxQuantityPerOrder < (productDetail?.stock || 0) && (
                <div style={{
                  fontSize: '0.85rem',
                  color: '#ff6b6b',
                  marginTop: '8px',
                  padding: '8px 12px',
                  backgroundColor: '#fff3cd',
                  borderRadius: '4px',
                  border: '1px solid #ffc107'
                }}>
                  ⚠️ Tối đa {productDetail.maxQuantityPerOrder} sản phẩm/đơn với giá {(productDetail?.displayPrice || 0).toLocaleString()}đ.
                  Còn {productDetail.stock - productDetail.maxQuantityPerOrder} sản phẩm với giá khác.
                </div>
              )}

              <div style={{ marginBottom: "30px" }}>
                {/* Check if user is trying to buy their own product */}
                {isOwnProduct ? (
                  <div style={{
                    padding: '15px 30px',
                    backgroundColor: '#fff3cd',
                    color: '#856404',
                    border: '2px solid #ffc107',
                    borderRadius: '8px',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    marginBottom: '15px'
                  }}>
                    🚫 Bạn không thể mua sản phẩm của chính mình
                  </div>
                ) : (!productDetail?.stock || productDetail.stock === 0 || productDetail.maxQuantityPerOrder === 0) ? (
                  <div style={{
                    padding: '15px 30px',
                    backgroundColor: '#f8d7da',
                    color: '#721c24',
                    border: '2px solid #f5c6cb',
                    borderRadius: '8px',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    marginBottom: '15px'
                  }}>
                    ❌ Sản phẩm đã hết hàng
                  </div>
                ) : (
                  <>
                    <Button
                      style={styles.addToCartBtn}
                      className="add-to-cart-btn"
                      onClick={handleAddToCart}
                      disabled={addingToCart}
                    >
                      {addingToCart ? 'Đang thêm...' : 'Thêm vào giỏ hàng'}
                    </Button>
                    <Button
                      style={{
                        ...styles.addToCartBtn,
                        background: '#fff',
                        color: '#b8860b',
                        border: '2px solid #b8860b',
                        marginLeft: '10px'
                      }}
                      onClick={() => {
                        const user = authService.getCurrentUser();
                        if (!user) {
                          toast.warning("Vui lòng đăng nhập để chat với shop");
                          navigate("/login");
                          return;
                        }
                        navigate('/chat', { state: { shopId: productDetail.shopId, productId: productDetail._id } });
                      }}
                    >
                      <FaComments style={{ marginRight: '8px' }} />
                      Chat với shop
                    </Button>
                  </>
                )}

                {error && (
                  <div className="text-danger mt-2">
                    {error}
                  </div>
                )}

                <Button
                  style={styles.compareBtn}
                  className="compare-btn"
                  onClick={handleCompare}
                >
                  + So sánh
                </Button>
              </div>

              <div style={styles.productMeta}>
                <div style={styles.metaItem}>
                  <span style={styles.metaLabel}>SKU:</span>
                  <span style={styles.metaValue}>{productDetail?.sku || "NL001"}</span>
                </div>
                <div style={styles.metaItem}>
                  <span style={styles.metaLabel}>Category:</span>
                  <span style={styles.metaValue}>
                    {productDetail?.category?.name}
                  </span>
                </div>
                <div style={styles.metaItem}>
                  <span style={styles.metaLabel}>Tags:</span>
                  <span style={styles.metaValue}>
                    {productDetail?.tags
                      ? productDetail?.tags.join(", ")
                      : "Nón lá, Truyền thống, Dân trang"}
                  </span>
                </div>
                <div style={styles.metaItem}>
                  <span style={styles.metaLabel}>Share:</span>
                  <div style={styles.socialLinks}>
                    <a href="#" style={styles.socialIcon}>
                      <FaFacebook />
                    </a>
                    <a href="#" style={styles.socialIcon}>
                      <FaInstagram />
                    </a>
                    <a href="#" style={styles.socialIcon}>
                      <FaTwitter />
                    </a>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </div>

        {/* Shop Info Section */}
        <Container style={{ marginTop: '30px', marginBottom: '30px' }}>
          <ShopInfo shop={productDetail?.shop} />
        </Container>

        {/* Tabs Section */}
        <div style={styles.tabsContainer}>
          <Tabs defaultActiveKey="description" id="product-tabs">
            <Tab eventKey="description" title="Chi Tiết">
              <div style={styles.tabContent}>
                <p style={styles.productDetailText}>
                  {productDetail?.description || 'Chưa có mô tả chi tiết cho sản phẩm này.'}
                </p>

                {/* Hiển thị tất cả ảnh sản phẩm */}
                {productDetail?.images && productDetail.images.length > 0 && (
                  <Row>
                    {productDetail.images.map((imageUrl, index) => (
                      <Col md={6} key={index} className="mb-3">
                        <img
                          src={getImageUrl(imageUrl)}
                          alt={`${productDetail?.name} - Hình ${index + 1}`}
                          style={styles.productDetailImage}
                        />
                      </Col>
                    ))}
                  </Row>
                )}
              </div>
            </Tab>
            <Tab eventKey="additional" title="Thông tin bổ sung">
              <div style={styles.tabContent}>
                <p style={styles.productDetailText}>
                  Thông tin bổ sung về sản phẩm {productDetail?.name} sẽ được cập nhật sau.
                </p>
              </div>
            </Tab>
            <Tab
              eventKey="reviews"
              title={`Đánh giá (${reviewStats.totalReviews || 0})`}
            >
              <div style={styles.tabContent}>
                {loadingReviews ? (
                  <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <div style={{ fontSize: '16px', color: '#666' }}>Đang tải đánh giá...</div>
                  </div>
                ) : reviews.length > 0 ? (
                  <>
                    {/* Tổng quan đánh giá */}
                    <div style={{
                      backgroundColor: '#f8f9fa',
                      padding: '20px',
                      borderRadius: '8px',
                      marginBottom: '30px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '20px'
                    }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#b8860b' }}>
                          {reviewStats.averageRating ? reviewStats.averageRating.toFixed(1) : '0.0'}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '5px' }}>
                          {renderRatingStars(reviewStats.averageRating || 0)}
                        </div>
                        <div style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>
                          {reviewStats.totalReviews} đánh giá
                        </div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '10px' }}>
                          Đánh giá từ khách hàng
                        </div>
                        <div style={{ fontSize: '14px', color: '#666' }}>
                          Dựa trên {reviewStats.totalReviews} đánh giá thực tế từ khách hàng đã mua sản phẩm này.
                        </div>
                      </div>
                    </div>

                    {/* Danh sách đánh giá */}
                    <div>
                      <h5 style={{ marginBottom: '20px', fontWeight: '600' }}>Đánh giá gần đây</h5>
                      {reviews.map((review, index) => (
                        <div key={review._id || index} style={{
                          border: '1px solid #e9ecef',
                          borderRadius: '8px',
                          padding: '20px',
                          marginBottom: '20px',
                          backgroundColor: '#fff'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                backgroundColor: '#b8860b',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: '16px'
                              }}>
                                {review.reviewer?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                              </div>
                              <div>
                                <div style={{ fontWeight: '600', fontSize: '16px' }}>
                                  {review.reviewer?.fullName || 'Khách hàng'}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
                                  {renderRatingStars(review.rating)}
                                  <span style={{ fontSize: '12px', color: '#666' }}>
                                    {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                                  </span>
                                </div>
                              </div>
                            </div>
                            {review.verifiedPurchase && (
                              <div style={{
                                backgroundColor: '#28a745',
                                color: 'white',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '12px',
                                fontWeight: '600'
                              }}>
                                Đã mua
                              </div>
                            )}
                          </div>

                          <div style={{ marginBottom: '10px' }}>
                            <h6 style={{ fontWeight: '600', marginBottom: '5px' }}>{review.title}</h6>
                            <p style={{ color: '#555', lineHeight: '1.6', margin: 0 }}>
                              {review.content}
                            </p>
                          </div>

                          {/* Hình ảnh đánh giá */}
                          {review.images && review.images.length > 0 && (
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
                              {console.log('Review images:', review.images)}
                              {review.images.map((image, imgIndex) => (
                                <img
                                  key={imgIndex}
                                  src={`http://localhost:9999${image}`}
                                  alt={`Review image ${imgIndex + 1}`}
                                  style={{
                                    width: '80px',
                                    height: '80px',
                                    objectFit: 'cover',
                                    borderRadius: '6px',
                                    border: '1px solid #e9ecef'
                                  }}
                                  onError={(e) => {
                                    console.error('Image load error:', image);
                                    e.target.style.display = 'none';
                                  }}
                                />
                              ))}
                            </div>
                          )}

                          {/* Helpful count */}
                          {review.helpfulCount > 0 && (
                            <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
                              {review.helpfulCount} người thấy hữu ích
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <div style={{ fontSize: '16px', color: '#666', marginBottom: '10px' }}>
                      Chưa có đánh giá nào cho sản phẩm này
                    </div>
                    <div style={{ fontSize: '14px', color: '#999' }}>
                      Hãy là người đầu tiên đánh giá sản phẩm này!
                    </div>
                  </div>
                )}
              </div>
            </Tab>
          </Tabs>
        </div>

        {/* Related Products - Hiển thị sản phẩm ngẫu nhiên */}
        <section style={styles.relatedProductsSection}>
          <h2 style={styles.sectionTitle}>Sản Phẩm Bạn Có Thể Thích</h2>

          {loadingRelated ? (
            <div style={styles.loadingText}>Đang tải sản phẩm...</div>
          ) : relatedProducts.length > 0 ? (
            <Row className="mt-4">
              {relatedProducts.map((product) => {
                const badge = getProductBadge(product);
                return (
                  <Col key={product._id} md={3} sm={6} className="mb-4">
                    <Card
                      style={styles.relatedProductCard}
                      className="product-card"
                      onClick={() => handleRelatedProductClick(product._id)}
                    >
                      <div style={{ position: "relative" }}>
                        {badge && (
                          <div
                            style={{
                              ...styles.relatedProductBadge,
                              ...(badge.type === "sale"
                                ? styles.saleBadge
                                : styles.newBadge),
                            }}
                          >
                            {badge.text}
                          </div>
                        )}
                        <Card.Img
                          variant="top"
                          src={product.image || product.thumbnailUrl}
                          alt={product.name}
                          style={styles.relatedProductImage}
                        />
                      </div>
                      <Card.Body>
                        <Card.Title style={styles.relatedProductName}>
                          {product.name}
                        </Card.Title>
                        <p style={styles.relatedProductCategory}>
                          {product.categoryName || product.category?.name || 'Sản phẩm'}
                        </p>
                        <div>
                          <span style={styles.relatedProductPrice}>
                            {product.price?.toLocaleString()} VND
                          </span>
                          {product.oldPrice && product.oldPrice > product.price && (
                            <span style={styles.relatedProductOldPrice}>
                              {product.oldPrice?.toLocaleString()} VND
                            </span>
                          )}
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          ) : (
            <div style={styles.noProductsText}>
              Không có sản phẩm liên quan
            </div>
          )}

          
        </section>
      </Container>
      <UspBanner />
      <Footer />
    </>
  );
}

export default ProductDetail;