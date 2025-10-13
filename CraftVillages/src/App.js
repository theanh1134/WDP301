// App.js hoặc file router của bạn
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProductDetail from './component/ProductDetail';
import Compare from './component/Compare';
import HomePage from './component/HomePage';
import Cart from './component/Cart';
import Checkout from './component/Checkout';
import ContactPage from './component/ContactPage';
import TradeCraftsPage from './component/TradeCraftsPage';
import Login from './component/Login';
import Register from './component/Register';
import ForgotPassword from './component/ForgotPassword';
import ResendVerification from './component/ResendVerification';
import authService from './services/authService';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem('authToken');
            const user = authService.getCurrentUser();

            if (token && user) {
                setIsAuthenticated(true);
                setIsEmailVerified(user.isEmailVerified || false);
            } else {
                setIsAuthenticated(false);
                setIsEmailVerified(false);
            }
            setIsLoading(false);
        };

        checkAuth();
    }, []);

    // Dữ liệu mẫu cho sản phẩm
    const sampleProduct = {
        id: 1,
        name: 'Nón lá truyền thống',
        price: 200000,
        oldPrice: 250000,
        sku: 'TFCBUSDSL05H15',
        origin: 'Cói, Tre, Hồ',
        material: 'Cói, Tre, Hồ',
        finish: 'Nguyên bản',
        decoration: 'Không có họa tiết',
        image: 'https://i.pinimg.com/1200x/4f/54/4d/4f544d2d569a546d345bc89699699691.jpg',
        rating: 4.7,
        reviews: 234
    };

    // Protected Route Component
    const ProtectedRoute = ({ children }) => {
        if (isLoading) {
            return <div>Loading...</div>;
        }

        if (!isAuthenticated) {
            return <Navigate to="/login" replace />;
        }

        if (!isEmailVerified) {
            return <Navigate to="/login" replace />;
        }

        return children;
    };

    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/products/:id" element={<ProductDetail product={sampleProduct} onBack={() => console.log("Go back")} />} />
                <Route path="/compare" element={<Compare />} />
                <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
                <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                <Route path='/contact' element={<ContactPage />} />
                <Route path='/blog' element={<TradeCraftsPage />} />
                <Route path='/login' element={<Login />} />
                <Route path='/register' element={<Register />} />
                <Route path='/forgot-password' element={<ForgotPassword />} />
                <Route path='/resend-verification' element={<ResendVerification />} />

                {/* Các route khác */}
            </Routes>
        </Router>
    );
}

export default App;