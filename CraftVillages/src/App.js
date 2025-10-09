// App.js hoặc file router của bạn
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProductDetail from './component/ProductDetail';
import Compare from './component/Compare';
import HomePage from './component/HomePage';
import Cart from './component/Cart';
import Checkout from './component/Checkout';
import ContactPage from './component/ContactPage';
import TradeCraftsPage from './component/TradeCraftsPage';
import Login from './component/Login'

function App() {
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

    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomePage/>} />
                <Route path="/products/:id" element={<ProductDetail product={sampleProduct} onBack={() => console.log("Go back")} />} />
                <Route path="/compare" element={<Compare />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path='/contact' element={<ContactPage/>}/> 
                <Route path='/blog' element={<TradeCraftsPage/>}/> 
                <Route path='/login' element={<Login/>}/> 
                
                {/* Các route khác */}
            </Routes>
        </Router>
    );
}

export default App;