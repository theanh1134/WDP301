import { createBrowserRouter, createRoutesFromElements, Route } from 'react-router-dom';
import ProductDetail from '../component/ProductDetail';
import Compare from '../component/Compare';
import HomePage from '../component/HomePage';
import Cart from '../component/Cart';
import Checkout from '../component/Checkout';
import ContactPage from '../component/ContactPage';
import TradeCraftsPage from '../component/TradeCraftsPage';
import Login from '../component/Login';
import Register from '../component/Register';
import ForgotPassword from '../component/ForgotPassword';
import ResendVerification from '../component/ResendVerification';
import SellerRegistration from '../component/SellerChannel/SellerRegistration';
import SellerStaff from '../component/SellerChannel/SellerDashboard';
import AddProduct from '../component/SellerChannel/AddProduct';
import EditProduct from '../component/SellerChannel/EditProduct';
import ProductStatistics from '../component/SellerChannel/ProductStatistics';
import ProtectedRoute from '../components/ProtectedRoute';
import RoleProtectedRoute from '../components/RoleProtectedRoute';
import Profile from '../component/Profile';
import OrderSuccess from '../component/OrderSuccess';
import OrderHistory from '../component/OrderHistory';
import OrderStatus from '../component/OrderStatus';
import ShopProducts from '../component/ShopProducts';
import ChatPage from '../component/Chat/ChatPage';
import StaffSeller from '../component/SellerStaff/StaffSeller';
import ShopDetailPage from '../component/SellerStaff/SellerDetail';
import DashboardLayout from '../component/SellerStaff/DashboardLayout';
import StaffReturn from '../component/SellerStaff/StaffReturn';
import ReturnDetailPage from '../component/SellerStaff/StaffReturnDetail';
import ConfirmPage from '../component/ConfirmPage';
import ShipperLogin from '../component/ShipperChannel/ShipperLogin';
import ShipperDashboard from '../component/ShipperChannel/ShipperDashboard';
import RefundPage from '../component/Refund';
import RefundHistory from '../component/RefundHistory.js';
import AdminLayout from '../component/AdminBusiness/AdminLayout';
import AdminDashboard from '../component/AdminBusiness/AdminDashboard';
import CommissionAnalytics from '../component/AdminBusiness/CommissionAnalytics';
import SellerManagement from '../component/AdminBusiness/SellerManagement';

// Create router with future flags enabled
export const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path="/">
            <Route index element={<HomePage />} />
            <Route path="products/:id" element={<ProductDetail />} />
            <Route path="compare" element={<Compare />} />
            <Route
                path="cart"
                element={
                    <ProtectedRoute>
                        <Cart />
                    </ProtectedRoute>
                }
            />
            <Route
                path="checkout"
                element={
                    <ProtectedRoute>
                        <Checkout />
                    </ProtectedRoute>
                }
            />
            <Route path="contact" element={<ContactPage />} />
            <Route path="blog" element={<TradeCraftsPage />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="resend-verification" element={<ResendVerification />} />
            <Route path="seller-registration" element={<SellerRegistration />} />
            <Route path="seller-dashboard" element={<SellerStaff />} />
            <Route path="add-product" element={<AddProduct />} />
            <Route path="edit-product/:id" element={<EditProduct />} />
            <Route path="product-statistics/:id" element={<ProductStatistics />} />
            <Route path="/refund" element={<RefundPage />} />
            <Route path="/refund-history" element={<RefundHistory />} />

            <Route
                path="profile"
                element={
                    <ProtectedRoute>
                        <Profile />
                    </ProtectedRoute>
                }
            />
            <Route path="order-success/:id" element={<OrderSuccess />} />
            <Route
                path="orders"
                element={
                    <ProtectedRoute>
                        <OrderHistory />
                    </ProtectedRoute>
                }
            />
            <Route
                path="return"
                element={
                    <ProtectedRoute>
                        <ConfirmPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="orders/:id"
                element={
                    <ProtectedRoute>
                        <OrderStatus />
                    </ProtectedRoute>
                }
            />
            <Route path="shop/:shopId" element={<ShopProducts />} />
            <Route
                path="chat"
                element={
                    <ProtectedRoute>
                        <ChatPage />
                    </ProtectedRoute>
                }
            />
            <Route path="/staff" element={
                <RoleProtectedRoute allowedRoles={['SELLER_STAFF', 'RETURN_STAFF', 'ADMIN_BUSINESS']}>
                    <DashboardLayout />
                </RoleProtectedRoute>
            }>
                <Route path="" element={<StaffSeller />} />
                <Route path=":id" element={<ShopDetailPage />} />
                <Route path="returns" element={<StaffReturn />} />
                <Route path="returns/:id" element={<ReturnDetailPage />} />
            </Route>
            {/* Staff Dashboard alias routes */}
            <Route path="/staff-dashboard" element={
                <RoleProtectedRoute allowedRoles={['SELLER_STAFF', 'RETURN_STAFF', 'ADMIN_BUSINESS']}>
                    <DashboardLayout />
                </RoleProtectedRoute>
            }>
                <Route path="" element={<StaffSeller />} />
                <Route path=":id" element={<ShopDetailPage />} />
                <Route path="returns" element={<StaffReturn />} />
                <Route path="returns/:id" element={<ReturnDetailPage />} />
            </Route>
            {/* Admin Business Dashboard */}
            <Route path="/admin-dashboard" element={
                <RoleProtectedRoute allowedRoles={['ADMIN_BUSINESS']}>
                    <AdminLayout />
                </RoleProtectedRoute>
            }>
                <Route index element={<AdminDashboard />} />
                <Route path="revenue" element={<AdminDashboard />} />
                <Route path="commission" element={<CommissionAnalytics />} />
                <Route path="gmv" element={<AdminDashboard />} />
                <Route path="sellers" element={<SellerManagement />} />
                <Route path="orders" element={<AdminDashboard />} />
                <Route path="customers" element={<AdminDashboard />} />
                <Route path="products" element={<AdminDashboard />} />
                <Route path="returns" element={<AdminDashboard />} />
                <Route path="reviews" element={<AdminDashboard />} />
                <Route path="marketing" element={<AdminDashboard />} />
                <Route path="reports" element={<AdminDashboard />} />
                <Route path="settings" element={<AdminDashboard />} />
            </Route>
            <Route path="shipper-login" element={<ShipperLogin />} />
            <Route
                path="shipper-dashboard"
                element={
                    <ProtectedRoute>
                        <ShipperDashboard />
                    </ProtectedRoute>
                }
            />
        </Route>
    ),
    {
        future: {
            v7_startTransition: true,
            v7_relativeSplatPath: true
        }
    }
);
