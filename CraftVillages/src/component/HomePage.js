// HomePage.js
import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { FaShoppingCart, FaSearch, FaEye, FaHeart, FaArrowRight, FaStar, FaFilter } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import USPBanner from './USPBanner';
import ProductDetail from './ProductDetail';
import Header from './Header';
import Footer from './Footer';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getImageUrl } from '../utils/imageHelper';


function HomePage() {
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [products1, setProducts1] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [displayedProducts, setDisplayedProducts] = useState([]);
    const [page, setPage] = useState(1);
    const [scrollY, setScrollY] = useState(0);
    const [isVisible, setIsVisible] = useState({});
    const [showFilters, setShowFilters] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [priceRange, setPriceRange] = useState([0, 10000000]);
    const [selectedRating, setSelectedRating] = useState(0);
    const [sortBy, setSortBy] = useState('default');
    const [displayLimit, setDisplayLimit] = useState(8);
    const [productsLoaded, setProductsLoaded] = useState(false);
    const heroRef = useRef(null);
    const statsRef = useRef(null);

    const navigate = useNavigate();

    // Parallax scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setScrollY(window.scrollY);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Intersection Observer for animations
    useEffect(() => {
        apiGetProducts();

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsVisible(prev => ({
                            ...prev,
                            [entry.target.id]: true
                        }));
                    }
                });
            },
            { threshold: 0.1 }
        );

        // Observe elements
        const elements = document.querySelectorAll('[data-animate]');
        elements.forEach(el => observer.observe(el));

        return () => observer.disconnect();
    }, []);

    const apiGetProducts = async () => {
        try {
            // Load tất cả sản phẩm từ database
            const res = await axios.get(`http://localhost:9999/products?page=1&limit=1000`) // Load tối đa 1000 sản phẩm
            console.log('All products loaded:', res.data.data.products.length);
            const allProducts = res.data.data.products || [];
            setProducts1(allProducts);
            setFilteredProducts(allProducts);
            setProductsLoaded(true);
        } catch (error) {
            console.error('Error loading products:', error);
            setProducts1([]);
            setFilteredProducts([]);
            setProductsLoaded(true);
        }
    }

    // Load more products for display
    const loadMoreProducts = () => {
        setDisplayLimit(prev => prev + 8);
    }

    // Filter và sort products
    useEffect(() => {
        let filtered = [...products1];

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(product =>
                product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.origin?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Category filter
        if (selectedCategory) {
            filtered = filtered.filter(product =>
                product.categoryName === selectedCategory
            );
        }

        // Price range filter
        filtered = filtered.filter(product =>
            product.price >= priceRange[0] && product.price <= priceRange[1]
        );

        // Rating filter
        if (selectedRating > 0) {
            filtered = filtered.filter(product =>
                (product.rating || 0) >= selectedRating
            );
        }

        // Sort
        switch (sortBy) {
            case 'price-low':
                filtered.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                filtered.sort((a, b) => b.price - a.price);
                break;
            case 'rating':
                filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                break;
            case 'name':
                filtered.sort((a, b) => a.name.localeCompare(b.name));
                break;
            default:
                // Keep original order
                break;
        }

        setFilteredProducts(filtered);

        // Reset display limit khi có filter mới (chỉ reset khi đã load products và có thay đổi filter)
        const hasActiveFilters = searchTerm || selectedCategory || selectedRating > 0 || sortBy !== 'default';
        if (productsLoaded && hasActiveFilters) {
            setDisplayLimit(8);
        }
    }, [products1, searchTerm, selectedCategory, priceRange, selectedRating, sortBy, productsLoaded]);

    // Update displayed products based on display limit
    useEffect(() => {
        setDisplayedProducts(filteredProducts.slice(0, displayLimit));
    }, [filteredProducts, displayLimit]);

    // Get unique categories
    const getUniqueCategories = () => {
        const categories = [...new Set(products1.map(product => product.categoryName).filter(Boolean))];
        return categories;
    };

    // Clear all filters
    const clearFilters = () => {
        setSearchTerm('');
        setSelectedCategory('');
        setPriceRange([0, 10000000]);
        setSelectedRating(0);
        setSortBy('default');
        setDisplayLimit(8); // Reset display limit when clearing filters
    };

    // Dữ liệu danh mục sản phẩm
    const categories = [
        {
            id: 1,
            name: 'Sản phẩm Tre mây',
            image: 'https://i.pinimg.com/1200x/9b/f8/d3/9bf8d3e9356e5b4139adc73d42b482a0.jpg',
        },
        {
            id: 2,
            name: 'Sản phẩm Gốm',
            image: 'https://i.pinimg.com/1200x/20/cd/49/20cd49f1f2fea4e207037027f4be4e05.jpg',
        },
        {
            id: 3,
            name: 'Sản phẩm Lụa',
            image: 'https://i.pinimg.com/1200x/a6/97/ea/a697ea74a6388e699b1683f6649d4e74.jpg',
        },
    ];

    // Dữ liệu sản phẩm
    const products = [
        {
            id: 1,
            name: 'Nón lá truyền thống',
            origin: 'Nam Định - Thái Bình',
            price: 75000,
            oldPrice: 100000,
            image: 'https://i.pinimg.com/1200x/4f/54/4d/4f544d2d569a546d345bc89699699691.jpg',
            badge: 'Sale',
            description: 'Nón lá truyền thống được làm từ lá cọ chằng chịt, chắc mảnh, tỉ mỉ được công dân Việt Nam làm thủ công theo triết lý âm dương ngũ hành.',
            rating: 4.5,
            reviews: 12,
            category: 'Nón lá',
            sku: 'NL001',
            tags: ['Nón lá', 'Truyền thống', 'Thủ công'],
            additionalImages: [
                'https://i.pinimg.com/736x/b5/96/d4/b596d46dabe0bc0e1271a366fa4e45eb.jpg',
                'https://i.pinimg.com/736x/d6/6c/37/d66c373637aebaef3b2d7ec3114c1a1e.jpg'
            ]
        },
        {
            id: 2,
            name: 'Đèn lồng',
            origin: 'Đồng Tháp - Phan Thiết',
            price: 75000,
            oldPrice: null,
            image: 'https://i.pinimg.com/736x/1d/b6/af/1db6af30b070047a179b37784cefea06.jpg',
            badge: 'New',
            description: 'Đèn lồng truyền thống được làm thủ công với nhiều màu sắc rực rỡ, thích hợp trang trí không gian sống hoặc làm quà tặng.',
            rating: 4.7,
            reviews: 8,
            category: 'Đèn trang trí',
            sku: 'DL002',
            tags: ['Đèn lồng', 'Trang trí', 'Thủ công'],
            additionalImages: [
                'https://i.pinimg.com/736x/1d/b6/af/1db6af30b070047a179b37784cefea06.jpg',
                'https://i.pinimg.com/736x/1d/b6/af/1db6af30b070047a179b37784cefea06.jpg'
            ]
        },
        {
            id: 3,
            name: 'Sản phẩm tre nứa',
            origin: 'Làng Bát Tràng Hà Nội',
            price: 35000,
            oldPrice: 100000,
            image: 'https://i.pinimg.com/1200x/68/b2/c5/68b2c562fc0356c08d7a9216832c3501.jpg',
            badge: 'Sale',
            description: 'Sản phẩm tre nứa thủ công được đan tỉ mỉ, bền đẹp và có tính ứng dụng cao trong đời sống.',
            rating: 4.2,
            reviews: 15,
            category: 'Đồ gia dụng',
            sku: 'TN003',
            tags: ['Tre nứa', 'Thủ công', 'Gia dụng'],
            additionalImages: [
                'https://i.pinimg.com/1200x/68/b2/c5/68b2c562fc0356c08d7a9216832c3501.jpg',
                'https://i.pinimg.com/736x/97/c1/02/97c102476db4529152d0e6c3b279b7b6.jpg'
            ]
        },
        {
            id: 4,
            name: 'Nón lá Huế',
            origin: 'Làng Mỹ Nghệ Huế',
            price: 80000,
            oldPrice: null,
            image: 'https://i.pinimg.com/736x/b5/96/d4/b596d46dabe0bc0e1271a366fa4e45eb.jpg',
            badge: 'New',
            description: 'Nón lá Huế với hoa văn tinh tế, được làm thủ công bởi các nghệ nhân làng nghề truyền thống.',
            rating: 4.8,
            reviews: 20,
            category: 'Nón lá',
            sku: 'NLH004',
            tags: ['Nón lá', 'Huế', 'Thủ công'],
            additionalImages: [
                'https://i.pinimg.com/736x/b5/96/d4/b596d46dabe0bc0e1271a366fa4e45eb.jpg',
                'https://i.pinimg.com/1200x/4f/54/4d/4f544d2d569a546d345bc89699699691.jpg'
            ]
        },
        {
            id: 5,
            name: 'Túi đeo mây',
            origin: 'Thái Bình',
            price: 150000,
            oldPrice: null,
            image: 'https://i.pinimg.com/736x/d6/6c/37/d66c373637aebaef3b2d7ec3114c1a1e.jpg',
            description: 'Túi đeo mây thủ công với thiết kế tinh tế, vừa thời trang vừa thể hiện nét đẹp văn hóa truyền thống.',
            rating: 4.6,
            reviews: 10,
            category: 'Túi xách',
            sku: 'TDM005',
            tags: ['Túi mây', 'Thời trang', 'Thủ công'],
            additionalImages: [
                'https://i.pinimg.com/736x/d6/6c/37/d66c373637aebaef3b2d7ec3114c1a1e.jpg',
                'https://i.pinimg.com/736x/d6/6c/37/d66c373637aebaef3b2d7ec3114c1a1e.jpg'
            ]
        },
        {
            id: 6,
            name: 'Ghế tre',
            origin: 'Hưng Yên',
            price: 180000,
            oldPrice: null,
            image: 'https://i.pinimg.com/736x/0b/cc/59/0bcc59447c9c1eca32011a681241103e.jpg',
            badge: 'New',
            description: 'Ghế tre chắc chắn, được làm thủ công bởi các nghệ nhân làng nghề, thích hợp sử dụng trong nhà hoặc sân vườn.',
            rating: 4.4,
            reviews: 7,
            category: 'Nội thất',
            sku: 'GT006',
            tags: ['Ghế tre', 'Nội thất', 'Thủ công'],
            additionalImages: [
                'https://i.pinimg.com/736x/0b/cc/59/0bcc59447c9c1eca32011a681241103e.jpg',
                'https://i.pinimg.com/736x/0b/cc/59/0bcc59447c9c1eca32011a681241103e.jpg'
            ]
        },
        {
            id: 7,
            name: 'Giỏ tre trang trí',
            origin: 'Đồng Tháp',
            price: 100000,
            oldPrice: 150000,
            image: 'https://i.pinimg.com/736x/97/c1/02/97c102476db4529152d0e6c3b279b7b6.jpg',
            badge: 'Sale',
            description: 'Giỏ tre trang trí với thiết kế độc đáo, được đan tỉ mỉ, thích hợp để trang trí không gian sống.',
            rating: 4.3,
            reviews: 14,
            category: 'Trang trí',
            sku: 'GTT007',
            tags: ['Giỏ tre', 'Trang trí', 'Thủ công'],
            additionalImages: [
                'https://i.pinimg.com/736x/97/c1/02/97c102476db4529152d0e6c3b279b7b6.jpg',
                'https://i.pinimg.com/736x/97/c1/02/97c102476db4529152d0e6c3b279b7b6.jpg'
            ]
        },
        {
            id: 8,
            name: 'Bình gốm Bát Tràng',
            origin: 'Bát Tràng, Hà Nội',
            price: 250000,
            oldPrice: null,
            image: 'https://i.pinimg.com/1200x/e1/7f/8f/e17f8fe18ac1ab83a6303dc266515813.jpg',
            description: 'Bình gốm Bát Tràng với hoa văn truyền thống, được làm thủ công bởi các nghệ nhân làng nghề nổi tiếng.',
            rating: 4.9,
            reviews: 25,
            category: 'Gốm sứ',
            sku: 'BGBT008',
            tags: ['Gốm sứ', 'Bát Tràng', 'Thủ công'],
            additionalImages: [
                'https://i.pinimg.com/1200x/e1/7f/8f/e17f8fe18ac1ab83a6303dc266515813.jpg',
                'https://i.pinimg.com/1200x/e1/7f/8f/e17f8fe18ac1ab83a6303dc266515813.jpg'
            ]
        },
    ];

    // Hàm xử lý khi người dùng nhấp vào sản phẩm
    const handleProductClick = (product) => {
        const productId = product._id || product.id;
        if (!productId) {
            console.error('No product ID found:', product);
            return;
        }
        navigate(`/products/${productId}`);
        setSelectedProduct(product);
        // Cuộn lên đầu trang khi chuyển đến trang chi tiết
        window.scrollTo(0, 0);
    };

    // Hàm xử lý khi người dùng quay lại từ trang chi tiết
    const handleBack = () => {
        setSelectedProduct(null);
    };

    // Styles
    const styles = {
        // General Styles
        body: {
            fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
            color: "#333",
            backgroundColor: "#fff"
        },
        sectionTitle: {
            fontSize: "28px",
            fontWeight: "600",
            textAlign: "center",
            marginBottom: "30px",
            color: "#333",
            position: "relative",
            paddingBottom: "10px"
        },

        // Enhanced Hero Section
        heroSection: {
            background: "linear-gradient(135deg, #fdf9e6 0%, #f8f4e6 50%, #f3efe6 100%)",
            padding: "0",
            overflow: "hidden",
            position: "relative",
            minHeight: "100vh",
            display: "flex",
            alignItems: "center"
        },
        heroOverlay: {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "radial-gradient(circle at 30% 70%, rgba(184, 134, 11, 0.1) 0%, transparent 50%)",
            pointerEvents: "none"
        },
        heroContent: {
            padding: "80px 60px",
            position: "relative",
            zIndex: 2
        },
        subtitle: {
            fontSize: "18px",
            color: "#b8860b",
            marginBottom: "15px",
            fontWeight: "500",
            letterSpacing: "0.5px",
            textTransform: "uppercase",
            opacity: 0,
            transform: "translateY(30px)",
            animation: "fadeInUp 1s ease-out 0.2s forwards"
        },
        mainTitle: {
            fontSize: "48px",
            fontWeight: "800",
            background: "linear-gradient(135deg, #b8860b 0%, #d4af37 50%, #b8860b 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            marginBottom: "20px",
            lineHeight: "1.2",
            opacity: 0,
            transform: "translateY(30px)",
            animation: "fadeInUp 1s ease-out 0.4s forwards"
        },
        heroDescription: {
            fontSize: "20px",
            color: "#666",
            marginBottom: "40px",
            lineHeight: "1.6",
            opacity: 0,
            transform: "translateY(30px)",
            animation: "fadeInUp 1s ease-out 0.6s forwards"
        },
        exploreButton: {
            background: "linear-gradient(135deg, #b8860b 0%, #d4af37 100%)",
            border: "none",
            padding: "15px 35px",
            fontWeight: "600",
            letterSpacing: "1px",
            marginBottom: "40px",
            borderRadius: "50px",
            fontSize: "16px",
            color: "white",
            cursor: "pointer",
            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            boxShadow: "0 8px 25px rgba(184, 134, 11, 0.3)",
            position: "relative",
            overflow: "hidden",
            opacity: 0,
            transform: "translateY(30px)",
            animation: "fadeInUp 1s ease-out 0.8s forwards"
        },
        heroImageContainer: {
            height: "100vh",
            overflow: "hidden",
            position: "relative"
        },
        heroImage: {
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `translateY(${scrollY * 0.5}px)`,
            transition: "transform 0.1s ease-out"
        },
        heroImageOverlay: {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "linear-gradient(45deg, rgba(184, 134, 11, 0.1) 0%, rgba(212, 175, 55, 0.05) 100%)"
        },
        statsContainer: {
            position: "absolute",
            bottom: "40px",
            left: "60px",
            display: "flex",
            gap: "40px",
            opacity: 0,
            transform: "translateY(30px)",
            animation: "fadeInUp 1s ease-out 1s forwards"
        },
        statItem: {
            textAlign: "center",
            color: "#333"
        },
        statNumber: {
            fontSize: "32px",
            fontWeight: "800",
            color: "#b8860b",
            display: "block",
            lineHeight: "1"
        },
        statLabel: {
            fontSize: "14px",
            color: "#666",
            marginTop: "5px",
            textTransform: "uppercase",
            letterSpacing: "0.5px"
        },

        // Categories Section
        categoriesSection: {
            padding: "60px 0",
            backgroundColor: "#fff"
        },
        categoryCard: {
            position: "relative",
            borderRadius: "8px",
            overflow: "hidden",
            boxShadow: "0 5px 15px rgba(0, 0, 0, 0.1)",
            transition: "all 0.3s ease",
            cursor: "pointer"
        },
        categoryImageContainer: {
            height: "250px",
            overflow: "hidden"
        },
        categoryImage: {
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform 0.5s ease"
        },
        categoryName: {
            position: "absolute",
            bottom: "0",
            left: "0",
            right: "0",
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            padding: "15px",
            textAlign: "center",
            fontSize: "18px",
            fontWeight: "600",
            color: "#333"
        },

        // Enhanced Products Section
        productsSection: {
            padding: "80px 0",
            background: "linear-gradient(180deg, #ffffff 0%, #fafafa 100%)",
            position: "relative"
        },
        productCard: {
            border: "none",
            borderRadius: "20px",
            overflow: "hidden",
            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
            marginBottom: "30px",
            height: "100%",
            cursor: "pointer",
            background: "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(10px)",
            position: "relative",
            transform: "translateY(0)"
        },
        productImageContainer: {
            position: "relative",
            height: "250px",
            overflow: "hidden",
            borderRadius: "20px 20px 0 0"
        },
        productImage: {
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)"
        },
        productOverlay: {
            position: "absolute",
            top: "0",
            left: "0",
            right: "0",
            bottom: "0",
            background: "linear-gradient(135deg, rgba(184, 134, 11, 0.9) 0%, rgba(212, 175, 55, 0.8) 100%)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            opacity: "0",
            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            backdropFilter: "blur(5px)"
        },
        productActions: {
            display: "flex",
            gap: "15px",
            transform: "translateY(20px)",
            transition: "transform 0.4s ease"
        },
        actionBtn: {
            width: "50px",
            height: "50px",
            borderRadius: "50%",
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#b8860b",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            fontSize: "18px",
            boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
            padding: "0"
        },
        quickViewText: {
            color: "white",
            fontSize: "16px",
            fontWeight: "600",
            marginBottom: "20px",
            textAlign: "center",
            transform: "translateY(20px)",
            transition: "transform 0.4s ease"
        },
        wishlistButton: {
            position: "absolute",
            top: "15px",
            right: "15px",
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            border: "none",
            borderRadius: "50%",
            width: "40px",
            height: "40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.3s ease",
            fontSize: "16px",
            color: "#999",
            zIndex: "2",
            opacity: "0",
            transform: "scale(0.8)"
        },
        productBadge: {
            position: "absolute",
            top: "10px",
            right: "10px",
            padding: "5px 10px",
            borderRadius: "4px",
            fontSize: "12px",
            fontWeight: "600",
            zIndex: "1",
            color: "white"
        },
        saleBadge: {
            backgroundColor: "#e74c3c"
        },
        newBadge: {
            backgroundColor: "#2ecc71"
        },
        cartBadge: {
            backgroundColor: "#3498db"
        },
        productDetails: {
            padding: "15px",
            backgroundColor: "white"
        },
        productName: {
            fontSize: "16px",
            fontWeight: "600",
            marginBottom: "5px",
            color: "#333"
        },
        productOrigin: {
            fontSize: "13px",
            color: "#777",
            marginBottom: "10px"
        },
        productPriceContainer: {
            display: "flex",
            alignItems: "center",
            gap: "10px"
        },
        productPrice: {
            fontSize: "16px",
            fontWeight: "600",
            color: "#b8860b"
        },
        productOldPrice: {
            fontSize: "14px",
            color: "#999",
            textDecoration: "line-through"
        },
        showMoreBtn: {
            backgroundColor: "transparent",
            border: "2px solid #b8860b",
            color: "#b8860b",
            padding: "8px 30px",
            fontWeight: "600",
            borderRadius: "4px",
            transition: "all 0.3s ease"
        },

        // Filter Section Styles
        filterSection: {
            backgroundColor: "#f8f9fa",
            padding: "20px 0",
            borderBottom: "1px solid #e9ecef"
        },
        filterTopBar: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "15px",
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "20px",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)"
        },
        sidebarFilter: {
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "20px",
            boxShadow: "0 4px 15px rgba(0, 0, 0, 0.08)",
            height: "fit-content",
            position: "sticky",
            top: "20px"
        },
        sidebarHeader: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
            paddingBottom: "15px",
            borderBottom: "1px solid #e9ecef"
        },
        sidebarTitle: {
            fontSize: "18px",
            fontWeight: "600",
            color: "#333",
            margin: "0"
        },
        closeSidebarBtn: {
            backgroundColor: "transparent",
            border: "none",
            color: "#999",
            fontSize: "20px",
            padding: "0",
            width: "30px",
            height: "30px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            transition: "all 0.3s ease"
        },
        productsContent: {
            paddingLeft: "20px"
        },
        searchContainer: {
            position: "relative",
            flex: "1",
            minWidth: "250px"
        },
        searchInput: {
            width: "100%",
            padding: "12px 45px 12px 15px",
            border: "2px solid #e9ecef",
            borderRadius: "25px",
            fontSize: "14px",
            transition: "all 0.3s ease",
            outline: "none"
        },
        searchIcon: {
            position: "absolute",
            right: "15px",
            top: "50%",
            transform: "translateY(-50%)",
            color: "#b8860b",
            fontSize: "16px"
        },
        filterToggle: {
            backgroundColor: "#b8860b",
            border: "none",
            color: "white",
            padding: "10px 20px",
            borderRadius: "25px",
            fontWeight: "600",
            transition: "all 0.3s ease",
            display: "flex",
            alignItems: "center",
            gap: "8px"
        },
        sortSelect: {
            padding: "10px 15px",
            border: "2px solid #e9ecef",
            borderRadius: "8px",
            fontSize: "14px",
            backgroundColor: "white",
            color: "#333",
            outline: "none",
            transition: "all 0.3s ease"
        },
        filterGroup: {
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            marginBottom: "20px"
        },
        filterLabel: {
            fontSize: "14px",
            fontWeight: "600",
            color: "#333",
            marginBottom: "5px"
        },
        categorySelect: {
            padding: "8px 12px",
            border: "2px solid #e9ecef",
            borderRadius: "6px",
            fontSize: "14px",
            backgroundColor: "white",
            color: "#333",
            outline: "none",
            transition: "all 0.3s ease"
        },
        priceRangeContainer: {
            display: "flex",
            flexDirection: "column",
            gap: "10px"
        },
        priceInput: {
            padding: "8px 12px",
            border: "2px solid #e9ecef",
            borderRadius: "6px",
            fontSize: "14px",
            outline: "none",
            transition: "all 0.3s ease"
        },
        ratingContainer: {
            display: "flex",
            gap: "5px",
            alignItems: "center"
        },
        ratingStar: {
            fontSize: "18px",
            color: "#ddd",
            cursor: "pointer",
            transition: "all 0.2s ease"
        },
        ratingStarActive: {
            color: "#ffc107"
        },
        clearFiltersBtn: {
            backgroundColor: "transparent",
            border: "2px solid #dc3545",
            color: "#dc3545",
            padding: "8px 20px",
            borderRadius: "6px",
            fontSize: "14px",
            fontWeight: "600",
            transition: "all 0.3s ease",
            marginTop: "15px"
        },
        resultsInfo: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
            padding: "15px 20px",
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)"
        },
        resultsCount: {
            fontSize: "16px",
            color: "#666",
            fontWeight: "500"
        },
        noResults: {
            textAlign: "center",
            padding: "60px 20px",
            color: "#999"
        },
        noResultsIcon: {
            fontSize: "48px",
            color: "#ddd",
            marginBottom: "15px"
        }
    };

    // Nếu có sản phẩm được chọn, hiển thị trang chi tiết sản phẩm
    // if (selectedProduct) {

    // }

    // Nếu không có sản phẩm được chọn, hiển thị trang chủ
    return (
        <Container fluid className="p-0">
            {/* Embedded CSS for hover effects and dynamic styles */}
            <style>
                {`
                    /* Enhanced Animations */
                    @keyframes fadeInUp {
                        from {
                            opacity: 0;
                            transform: translateY(30px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }

                    @keyframes float {
                        0%, 100% { transform: translateY(0px); }
                        50% { transform: translateY(-10px); }
                    }

                    @keyframes shimmer {
                        0% { background-position: -200px 0; }
                        100% { background-position: calc(200px + 100%) 0; }
                    }

                    /* Enhanced Hover Effects */
                    .explore-button:hover {
                        background: linear-gradient(135deg, #a67c00 0%, #b8860b 100%) !important;
                        transform: translateY(-3px) scale(1.05);
                        box-shadow: 0 12px 35px rgba(184, 134, 11, 0.4) !important;
                    }

                    .explore-button:hover::before {
                        content: '';
                        position: absolute;
                        top: 0;
                        left: -100%;
                        width: 100%;
                        height: 100%;
                        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
                        animation: shimmer 0.6s ease-in-out;
                    }

                    .category-card:hover {
                        transform: translateY(-8px) scale(1.02);
                        box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
                    }

                    .category-card:hover .category-image {
                        transform: scale(1.1);
                    }

                    .product-card:hover {
                        transform: translateY(-12px) scale(1.02);
                        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
                        z-index: 10;
                    }

                    .product-card:hover .product-image {
                        transform: scale(1.1);
                    }

                    .product-card:hover .product-overlay {
                        opacity: 1;
                    }

                    .product-card:hover .product-actions {
                        transform: translateY(0);
                    }

                    .product-card:hover .quick-view-text {
                        transform: translateY(0);
                    }

                    .product-card:hover .wishlist-button {
                        opacity: 1;
                        transform: scale(1);
                    }

                    .action-btn:hover {
                        transform: scale(1.1);
                        background-color: #b8860b !important;
                        color: white !important;
                    }

                    .wishlist-button:hover {
                        background-color: #e74c3c !important;
                        color: white !important;
                        transform: scale(1.1) !important;
                    }

                    /* Parallax Hero */
                    .hero-parallax {
                        will-change: transform;
                    }
                    
                    .action-btn:hover {
                        background-color: #b8860b !important;
                        color: white !important;
                    }
                    
                    .show-more-btn:hover {
                        background-color: #b8860b !important;
                        color: white !important;
                    }

                    /* Filter Styles */
                    .search-input:focus {
                        border-color: #b8860b !important;
                        box-shadow: 0 0 0 3px rgba(184, 134, 11, 0.1) !important;
                    }

                    .filter-toggle:hover {
                        background-color: #a67c00 !important;
                        transform: translateY(-2px);
                    }

                    .sort-select:focus, .category-select:focus, .price-input:focus {
                        border-color: #b8860b !important;
                        box-shadow: 0 0 0 3px rgba(184, 134, 11, 0.1) !important;
                    }

                    .rating-star:hover {
                        color: #ffc107 !important;
                        transform: scale(1.1);
                    }

                    .clear-filters-btn:hover {
                        background-color: #dc3545 !important;
                        color: white !important;
                    }

                    .close-sidebar-btn:hover {
                        background-color: #f8f9fa !important;
                        color: #333 !important;
                    }

                    /* Media Queries */
                    @media (max-width: 992px) {
                        .hero-content {
                            padding: 40px 30px !important;
                        }
                        
                        .main-title {
                            font-size: 32px !important;
                        }
                    }

                    @media (max-width: 768px) {
                        .hero-content {
                            padding: 30px 20px !important;
                        }
                        
                        .main-title {
                            font-size: 28px !important;
                        }
                        
                        .explore-button {
                            padding: 8px 20px !important;
                        }
                        
                        .category-image-container {
                            height: 200px !important;
                        }
                    }

                    @media (max-width: 576px) {
                        .hero-content {
                            padding: 30px 15px !important;
                        }
                        
                        .main-title {
                            font-size: 24px !important;
                        }
                        
                        .hero-description {
                            font-size: 16px !important;
                        }
                        
                        .category-name {
                            font-size: 16px !important;
                            padding: 10px !important;
                        }
                    }
                `}
            </style>
            {/* Header */}
            <Header />

            {/* Enhanced Hero Section */}
            <div style={styles.heroSection} ref={heroRef}>
                <div style={styles.heroOverlay}></div>
                <Row className="mx-0 h-100">
                    <Col md={6} className="d-flex align-items-center">
                        <div style={styles.heroContent} className="hero-content">
                            <div style={styles.subtitle} data-animate id="hero-subtitle">
                                ✨ Bộ sưu tập từ Hội
                            </div>
                            <h1 style={styles.mainTitle} className="main-title" data-animate id="hero-title">
                                Tinh hoa làng nghề – Gắn kết hôm nay
                            </h1>
                            <p style={styles.heroDescription} className="hero-description" data-animate id="hero-desc">
                                Trải nghiệm văn hóa tinh hoa dân tộc qua những sản phẩm thủ công độc đáo,
                                được chế tác bởi những nghệ nhân tài hoa nhất Việt Nam
                            </p>
                            <Button
                                style={styles.exploreButton}
                                className="explore-button position-relative"
                                data-animate
                                id="hero-button"
                                href='/login'
                            >
                                KHÁM PHÁ NGAY <FaArrowRight className="ms-2" />
                            </Button>

                            {/* Stats Counter */}
                            <div style={styles.statsContainer} ref={statsRef} data-animate id="hero-stats">
                                <div style={styles.statItem}>
                                    <span style={styles.statNumber}>500+</span>
                                    <span style={styles.statLabel}>Sản phẩm</span>
                                </div>
                                <div style={styles.statItem}>
                                    <span style={styles.statNumber}>50+</span>
                                    <span style={styles.statLabel}>Nghệ nhân</span>
                                </div>
                                <div style={styles.statItem}>
                                    <span style={styles.statNumber}>1000+</span>
                                    <span style={styles.statLabel}>Khách hàng</span>
                                </div>
                            </div>
                        </div>
                    </Col>
                    <Col md={6} className="p-0">
                        <div style={styles.heroImageContainer}>
                            <div style={styles.heroImageOverlay}></div>
                            <img
                                src="https://i.pinimg.com/736x/b9/f0/83/b9f0831841c5c0f7c5b2bbc64ceadaf2.jpg"
                                alt="Sản phẩm làng nghề"
                                style={{
                                    ...styles.heroImage,
                                    transform: `translateY(${scrollY * 0.5}px)`
                                }}
                                className="hero-parallax"
                            />
                        </div>
                    </Col>
                </Row>
            </div>

            {/* Categories Section */}
            <section style={styles.categoriesSection}>
                <Container>
                    <h2 style={styles.sectionTitle}>Danh mục trọng tâm</h2>
                    <Row className="mt-4">
                        {categories.map(category => (
                            <Col key={category.id} md={4} className="mb-4">
                                <div style={styles.categoryCard} className="category-card">
                                    <div style={styles.categoryImageContainer} className="category-image-container">
                                        <img
                                            src={category.image}
                                            alt={category.name}
                                            style={styles.categoryImage}
                                            className="category-image"
                                        />
                                    </div>
                                    <div style={styles.categoryName} className="category-name">{category.name}</div>
                                </div>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </section>

            {/* Filter Section - Top Bar */}
            <section style={styles.filterSection}>
                <Container>
                    <div style={styles.filterTopBar}>
                        <div style={styles.searchContainer}>
                            <input
                                type="text"
                                placeholder="Tìm kiếm sản phẩm..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={styles.searchInput}
                                className="search-input"
                            />
                            <FaSearch style={styles.searchIcon} />
                        </div>
                        <Button
                            style={styles.filterToggle}
                            className="filter-toggle"
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <FaFilter />
                            {showFilters ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}
                        </Button>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            style={styles.sortSelect}
                            className="sort-select"
                        >
                            <option value="default">Sắp xếp mặc định</option>
                            <option value="price-low">Giá thấp đến cao</option>
                            <option value="price-high">Giá cao đến thấp</option>
                            <option value="rating">Đánh giá cao nhất</option>
                            <option value="name">Tên A-Z</option>
                        </select>
                    </div>
                </Container>
            </section>

            {/* Products Section with Sidebar */}
            <section style={styles.productsSection}>
                <Container fluid>
                    <Row>
                        {/* Sidebar Filter */}
                        {showFilters && (
                            <Col md={3} lg={2} className="d-none d-md-block">
                                <div style={styles.sidebarFilter}>
                                    <div style={styles.sidebarHeader}>
                                        <h4 style={styles.sidebarTitle}>Bộ lọc</h4>
                                        <Button
                                            style={styles.closeSidebarBtn}
                                            className="close-sidebar-btn"
                                            onClick={() => setShowFilters(false)}
                                        >
                                            ×
                                        </Button>
                                    </div>

                                    <div style={styles.filterGroup}>
                                        <label style={styles.filterLabel}>Danh mục</label>
                                        <select
                                            value={selectedCategory}
                                            onChange={(e) => setSelectedCategory(e.target.value)}
                                            style={styles.categorySelect}
                                            className="category-select"
                                        >
                                            <option value="">Tất cả danh mục</option>
                                            {getUniqueCategories().map(category => (
                                                <option key={category} value={category}>
                                                    {category}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div style={styles.filterGroup}>
                                        <label style={styles.filterLabel}>Khoảng giá (VND)</label>
                                        <div style={styles.priceRangeContainer}>
                                            <input
                                                type="number"
                                                placeholder="Từ"
                                                value={priceRange[0]}
                                                onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                                                style={styles.priceInput}
                                                className="price-input"
                                            />
                                            <input
                                                type="number"
                                                placeholder="Đến"
                                                value={priceRange[1]}
                                                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 10000000])}
                                                style={styles.priceInput}
                                                className="price-input"
                                            />
                                        </div>
                                    </div>

                                    <div style={styles.filterGroup}>
                                        <label style={styles.filterLabel}>Đánh giá tối thiểu</label>
                                        <div style={styles.ratingContainer}>
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <FaStar
                                                    key={star}
                                                    style={{
                                                        ...styles.ratingStar,
                                                        ...(star <= selectedRating ? styles.ratingStarActive : {})
                                                    }}
                                                    className="rating-star"
                                                    onClick={() => setSelectedRating(star === selectedRating ? 0 : star)}
                                                />
                                            ))}
                                            {selectedRating > 0 && (
                                                <span style={{ marginLeft: '10px', fontSize: '14px', color: '#666' }}>
                                                    {selectedRating}+ sao
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <Button
                                        style={styles.clearFiltersBtn}
                                        className="clear-filters-btn"
                                        onClick={clearFilters}
                                    >
                                        Xóa tất cả bộ lọc
                                    </Button>
                                </div>
                            </Col>
                        )}

                        {/* Products Content */}
                        <Col md={showFilters ? 9 : 12} lg={showFilters ? 10 : 12}>
                            <div style={styles.productsContent}>
                                <div style={styles.resultsInfo}>
                                    <h2 style={styles.sectionTitle}>Sản Phẩm</h2>
                                    <div style={styles.resultsCount}>
                                        Hiển thị {displayedProducts.length} / {filteredProducts.length} sản phẩm
                                        {searchTerm && ` cho "${searchTerm}"`}
                                        {selectedCategory && ` trong "${selectedCategory}"`}
                                    </div>
                                </div>

                                {displayedProducts.length > 0 ? (
                                    <>
                                        <Row className="mt-4">
                                            {displayedProducts?.map((product, index) => (
                                                <Col key={product.id} md={4} lg={3} sm={6} className="mb-4">
                                                    <Card
                                                        style={styles.productCard}
                                                        className="product-card"
                                                        onClick={() => handleProductClick(product)}
                                                        data-animate
                                                        id={`product-${product.id}`}
                                                    >
                                                        <div style={styles.productImageContainer} className="product-image-container">
                                                            {/* Enhanced Badge */}
                                                            {product.badge && (
                                                                <div
                                                                    style={{
                                                                        ...styles.productBadge,
                                                                        ...(product.badge === 'Sale' ? styles.saleBadge :
                                                                            product.badge === 'New' ? styles.newBadge : styles.cartBadge)
                                                                    }}
                                                                >
                                                                    {product.badge}
                                                                </div>
                                                            )}

                                                            {/* Wishlist Button */}
                                                            <Button
                                                                style={styles.wishlistButton}
                                                                className="wishlist-button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    alert(`Đã thêm ${product.name} vào danh sách yêu thích`);
                                                                }}
                                                                title="Thêm vào yêu thích"
                                                            >
                                                                <FaHeart />
                                                            </Button>

                                                            <Card.Img
                                                                variant="top"
                                                                src={getImageUrl(product.image)}
                                                                style={styles.productImage}
                                                                className="product-image"
                                                                alt={product.name}
                                                            />

                                                            {/* Enhanced Overlay */}
                                                            <div style={styles.productOverlay} className="product-overlay">
                                                                <div style={styles.quickViewText} className="quick-view-text">
                                                                    Xem nhanh sản phẩm
                                                                </div>
                                                                <div style={styles.productActions} className="product-actions">
                                                                    <Button
                                                                        style={styles.actionBtn}
                                                                        className="action-btn"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            alert(`Đã thêm ${product.name} vào giỏ hàng`);
                                                                        }}
                                                                        title="Thêm vào giỏ hàng"
                                                                    >
                                                                        <FaShoppingCart />
                                                                    </Button>
                                                                    <Button
                                                                        style={styles.actionBtn}
                                                                        className="action-btn"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            // Quick search functionality
                                                                        }}
                                                                        title="Tìm kiếm tương tự"
                                                                    >
                                                                        <FaSearch />
                                                                    </Button>
                                                                    <Button
                                                                        style={styles.actionBtn}
                                                                        className="action-btn"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleProductClick(product);
                                                                        }}
                                                                        title="Xem chi tiết"
                                                                    >
                                                                        <FaEye />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <Card.Body style={styles.productDetails}>
                                                            <Card.Title style={styles.productName}>{product.name}</Card.Title>
                                                            {product.origin && (
                                                                <p style={styles.productOrigin}>{product.origin}</p>
                                                            )}
                                                            <div style={styles.productPriceContainer}>
                                                                <span style={styles.productPrice}>{product.price.toLocaleString()} VND</span>
                                                                {product.oldPrice && (
                                                                    <span style={styles.productOldPrice}>{product.oldPrice.toLocaleString()} VND</span>
                                                                )}
                                                            </div>
                                                        </Card.Body>
                                                    </Card>
                                                </Col>
                                            ))}
                                        </Row>
                                        {displayedProducts.length < filteredProducts.length && (
                                            <div className="text-center mt-4 mb-5">
                                                <Button style={styles.showMoreBtn} className="show-more-btn" onClick={loadMoreProducts}>
                                                    Hiển thị thêm ({filteredProducts.length - displayedProducts.length} sản phẩm)
                                                </Button>
                                            </div>
                                        )}

                                        {displayedProducts.length === filteredProducts.length && filteredProducts.length > 8 && (
                                            <div className="text-center mt-4 mb-5">
                                                <p style={{ color: '#666', fontSize: '14px' }}>
                                                    Đã hiển thị tất cả {filteredProducts.length} sản phẩm
                                                </p>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div style={styles.noResults}>
                                        <div style={styles.noResultsIcon}>🔍</div>
                                        <h3>Không tìm thấy sản phẩm nào</h3>
                                        <p>Hãy thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm</p>
                                        <Button
                                            style={styles.clearFiltersBtn}
                                            className="clear-filters-btn"
                                            onClick={clearFilters}
                                        >
                                            Xóa bộ lọc
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>
            {/* USP Banner Section */}
            <USPBanner />
            {/* Footer */}
            <Footer />
        </Container>

    );
}

export default HomePage;