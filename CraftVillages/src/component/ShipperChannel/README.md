# Shipper Dashboard

Dashboard dành cho shipper (người giao hàng) trong hệ thống CraftVillages.

## Tính năng chính

### 1. Dashboard Overview
- **Thống kê tổng quan**: Tổng đơn hàng, đã hoàn thành, đang xử lý
- **Thu nhập**: Tổng thu nhập, đánh giá trung bình
- **Trạng thái**: Online/Offline status
- **Đơn hàng gần đây**: Danh sách các đơn hàng được assign

### 2. Quản lý đơn hàng
- **Danh sách đơn hàng**: Tất cả đơn hàng được assign
- **Chi tiết đơn hàng**: Thông tin khách hàng, địa chỉ, sản phẩm
- **Cập nhật trạng thái**: Picked up, Out for delivery, Delivered
- **Xác nhận giao hàng**: Chụp ảnh, ghi chú

### 3. Thu nhập
- **Thống kê thu nhập**: Theo ngày, tháng
- **Chi tiết thanh toán**: Phí cơ bản, phí khoảng cách, thưởng
- **Trạng thái thanh toán**: Đã thanh toán, chờ thanh toán
- **Xuất báo cáo**: Export dữ liệu thu nhập

### 4. Thông tin cá nhân
- **Profile shipper**: Thông tin cá nhân, phương tiện
- **Cài đặt**: Thông báo, giờ làm việc, khu vực phục vụ

## Cấu trúc file

```
ShipperChannel/
├── ShipperDashboard.js    # Component chính
├── OrderDetail.js         # Modal chi tiết đơn hàng
├── Earnings.js           # Component quản lý thu nhập
└── README.md             # Hướng dẫn sử dụng
```

## API Endpoints cần thiết

### Shipper Service
- `GET /api/shipper/dashboard/:userId` - Thống kê dashboard
- `GET /api/shipper/orders/:userId` - Danh sách đơn hàng
- `GET /api/shipper/orders/detail/:orderId` - Chi tiết đơn hàng
- `PUT /api/shipper/orders/:orderId/status` - Cập nhật trạng thái
- `POST /api/shipper/orders/:orderId/confirm-delivery` - Xác nhận giao hàng
- `GET /api/shipper/earnings/:userId` - Thu nhập
- `PUT /api/shipper/location/:userId` - Cập nhật vị trí
- `GET /api/shipper/reviews/:userId` - Đánh giá
- `PUT /api/shipper/profile/:userId` - Cập nhật profile
- `PUT /api/shipper/settings/:userId` - Cập nhật cài đặt

## Database Schema

### Bảng cần thiết
1. **shippers** - Thông tin đơn vị vận chuyển
2. **shipments** - Chi tiết vận chuyển đơn hàng
3. **reviewShipper** - Đánh giá shipper
4. **ShipperAssignment** - Quản lý assign đơn hàng
5. **ShipperEarnings** - Thu nhập shipper
6. **ShipperSettings** - Cài đặt shipper
7. **User** - Thông tin người dùng (có thêm shipperInfo)

## Cách sử dụng

### 1. Truy cập Dashboard
- Đăng nhập với tài khoản có role `SHIPPER`
- Click vào "Kênh Shipper" trên Header
- Hoặc truy cập trực tiếp `/shipper-dashboard`

### 2. Quản lý đơn hàng
- Xem danh sách đơn hàng được assign
- Click "Xem chi tiết" để xem thông tin chi tiết
- Cập nhật trạng thái giao hàng
- Chụp ảnh xác nhận giao hàng

### 3. Theo dõi thu nhập
- Xem thống kê thu nhập theo thời gian
- Lọc theo ngày bắt đầu và kết thúc
- Xuất báo cáo thu nhập

### 4. Cập nhật thông tin
- Chỉnh sửa thông tin cá nhân
- Cập nhật cài đặt thông báo
- Thay đổi trạng thái online/offline

## Theme và Styling

Dashboard sử dụng theme tương tự Seller Dashboard:
- **Màu chính**: Blue gradient (#1976d2 → #42a5f5)
- **Màu phụ**: Gold accent (#b8860b)
- **Typography**: Bootstrap + custom fonts
- **Icons**: React Icons (Font Awesome)
- **Layout**: Sidebar + Main content

## Responsive Design

- **Desktop**: Sidebar cố định, main content responsive
- **Tablet**: Sidebar có thể collapse
- **Mobile**: Sidebar overlay, touch-friendly buttons

## Tính năng tương lai

1. **Real-time tracking**: GPS tracking, live location
2. **Push notifications**: Thông báo đơn hàng mới
3. **Route optimization**: Tối ưu đường đi
4. **Chat integration**: Liên lạc với khách hàng
5. **Performance analytics**: Phân tích hiệu suất giao hàng

## Lưu ý

- Cần implement backend APIs tương ứng
- Cần thêm role `SHIPPER` vào hệ thống
- Cần tích hợp với hệ thống thanh toán
- Cần implement real-time features với Socket.io
