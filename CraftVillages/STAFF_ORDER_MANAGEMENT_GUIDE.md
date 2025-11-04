# 📦 STAFF ORDER MANAGEMENT - HƯỚNG DẪN SỬ DỤNG

## 🎯 Mục đích
Hệ thống quản lý đơn hàng cho Staff nhằm:
1. **Thu thập** các đơn hàng đã được xác nhận (CONFIRMED) từ người mua
2. **Phân phối** đơn hàng cho các Shipper để giao hàng
3. **Theo dõi** quá trình giao hàng từ Staff đến Shipper đến Khách hàng

## 🔄 Luồng hoạt động tổng quan

```
1. Khách hàng đặt hàng → Order tạo với status PENDING
                         ↓
2. Seller xác nhận đơn → Order status: CONFIRMED
                         ↓
3. Staff xem đơn hàng → Hiển thị tất cả đơn CONFIRMED
                         ↓
4. Staff chọn Shipper → Phân công đơn cho Shipper
                         ↓
5. Tạo Shipment record → Order status: SHIPPED
                         ↓
6. Shipper nhận đơn → Bắt đầu giao hàng
                         ↓
7. Shipper cập nhật → PICKED_UP → OUT_FOR_DELIVERY → DELIVERED
```

## 📁 Cấu trúc Files đã tạo

### Frontend
```
CraftVillages/src/
├── component/
│   └── OrderStaff/
│       └── OrderStaff.js          # Giao diện quản lý đơn hàng cho Staff
└── services/
    └── staffOrderService.js        # Service gọi API
```

### Backend
```
CraftVillages/backend/
├── controllers/
│   └── staffOrderController.js    # Xử lý logic nghiệp vụ
├── routes/
│   └── staffOrderRoutes.js        # Định nghĩa API routes
└── models/
    ├── Order.js                   # Model đơn hàng (đã có)
    ├── Shipper.js                 # Model shipper (đã có)
    └── Shipment.js                # Model vận chuyển (đã có)
```

## 🚀 Các API đã tạo

### 1. GET `/stafforders/statistics`
**Mục đích**: Lấy thống kê tổng quan
**Response**:
```json
{
  "success": true,
  "data": {
    "total": 10,        // Tổng đơn hàng
    "pending": 5,       // Chờ phân công
    "assigned": 3,      // Đã phân công
    "delivering": 2     // Đang giao hàng
  }
}
```

### 2. GET `/stafforders`
**Mục đích**: Lấy danh sách đơn hàng
**Query params**:
- `status`: CONFIRMED | SHIPPED | DELIVERED
- `search`: Tìm theo mã đơn, tên KH, SĐT
- `page`, `limit`: Phân trang

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "order_id",
      "buyerInfo": { "fullName": "..." },
      "shippingAddress": { "fullAddress": "..." },
      "items": [...],
      "finalAmount": 500000,
      "status": "CONFIRMED",
      "isAssigned": false,  // Đã phân công chưa
      "shipment": null      // Thông tin shipment nếu có
    }
  ],
  "pagination": { "total": 5, "page": 1, "limit": 20 }
}
```

### 3. GET `/stafforders/available-shippers`
**Mục đích**: Lấy danh sách Shipper online và đã được duyệt
**Response**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "shipper_id",
      "userId": {
        "fullName": "Nguyễn Văn A",
        "phoneNumber": "0123456789"
      },
      "vehicleType": "MOTORBIKE",
      "vehicleNumber": "29A-12345",
      "isOnline": true,
      "status": "APPROVED",
      "rating": { "average": 4.5 },
      "totalDeliveries": 50
    }
  ]
}
```

### 4. POST `/stafforders/:orderId/assign`
**Mục đích**: Phân công đơn hàng cho Shipper
**Body**:
```json
{
  "shipperId": "shipper_id",
  "pickupLocation": {
    "address": "Shop Address",
    "latitude": 10.762622,
    "longitude": 106.660172
  },
  "estimatedDeliveryTime": "2025-10-29T10:00:00.000Z"
}
```

**Những gì xảy ra**:
1. Kiểm tra Order phải có status = CONFIRMED
2. Kiểm tra Shipper phải có status = APPROVED
3. Tạo **Shipment** record mới với:
   - `orderId`: ID đơn hàng
   - `shipperId`: ID shipper được assign
   - `status`: ASSIGNED
   - `trackingHistory`: Lịch sử theo dõi
   - `shippingFee`: Phí ship (tự động tính)
4. Cập nhật Order status → SHIPPED
5. Trả về thông tin Shipment và Order đã cập nhật

**Response**:
```json
{
  "success": true,
  "message": "Order assigned to shipper successfully",
  "data": {
    "shipment": {
      "_id": "shipment_id",
      "orderId": "order_id",
      "shipperId": { ... },
      "status": "ASSIGNED",
      "shippingFee": { "total": 35000 },
      "trackingHistory": [ ... ]
    },
    "order": {
      "_id": "order_id",
      "status": "SHIPPED"
    }
  }
}
```

### 5. GET `/stafforders/:orderId`
**Mục đích**: Xem chi tiết đơn hàng kèm thông tin shipment

### 6. GET `/stafforders/:orderId/shipment`
**Mục đích**: Xem chi tiết shipment và tracking history

### 7. PUT `/stafforders/:orderId/reassign`
**Mục đích**: Chuyển đơn sang Shipper khác
**Body**:
```json
{
  "shipperId": "new_shipper_id",
  "reason": "Shipper cũ không khả dụng"
}
```

## 💡 Cách sử dụng Frontend

### 1. Import Component vào Router
```javascript
// src/router/AppRouter.js
import OrderStaff from '../component/OrderStaff/OrderStaff';

<Route path="/staff/orders" element={<OrderStaff />} />
```

### 2. Thêm menu vào Sidebar
```javascript
<MenuItem onClick={() => navigate('/staff/orders')}>
  📦 Quản lý đơn hàng
</MenuItem>
```

### 3. Component tự động:
- Load statistics khi mount
- Load danh sách orders với filter
- Hiển thị modal chọn shipper
- Gọi API assign khi xác nhận

## 🔗 Liên kết với Shipper

Sau khi Staff assign đơn hàng:

### 1. Shipper nhận được đơn
```javascript
// File: ShipperOrders.js (component của Shipper)
// API: GET /shipper/orders/:userId
// Sẽ thấy đơn hàng với status = ASSIGNED
```

### 2. Shipper cập nhật trạng thái
```javascript
// API: PUT /shipper/shipment/:shipmentId/status
// Body: { status: "PICKED_UP" } → "OUT_FOR_DELIVERY" → "DELIVERED"
```

### 3. Flow tracking
```
ASSIGNED (Staff phân công)
   ↓
PICKED_UP (Shipper đã lấy hàng)
   ↓
OUT_FOR_DELIVERY (Đang giao)
   ↓
DELIVERED (Đã giao thành công)
```

## 🎨 Giao diện Features

### Dashboard Stats
- ✅ Tổng đơn hàng
- ⏳ Chờ phân công
- ✈️ Đã phân công
- 🚚 Đang giao

### Order List
- 🔍 Tìm kiếm theo mã đơn, KH, SĐT
- 🔽 Filter theo trạng thái
- 👁️ Xem chi tiết đơn hàng
- 🚚 Nút "Phân công" cho đơn CONFIRMED

### Assign Modal
- Hiển thị thông tin đơn hàng
- Danh sách Shipper online
- Thông tin Shipper: Phương tiện, Rating, Số đơn đã giao
- Chọn và Assign

## ⚠️ Lưu ý quan trọng

### 1. Authentication
- Tất cả API yêu cầu JWT token
- Token được gửi qua header: `Authorization: Bearer <token>`

### 2. Order Status Flow
```
PENDING → CONFIRMED → SHIPPED → DELIVERED
           ↑ Seller       ↑ Staff    ↑ Shipper
```

### 3. Điều kiện Assign
- Order phải có status = CONFIRMED
- Shipper phải có status = APPROVED và isOnline = true
- Một order chỉ được assign 1 lần (trừ khi reassign)

### 4. Shipping Fee Calculation
Backend tự động tính phí ship dựa trên:
- Base fee: 20,000 VND
- Distance fee: 15,000 VND
- Weight fee: weight > 1kg → +5,000 VND/kg

## 🧪 Testing

### Kiểm tra luồng hoàn chỉnh:

1. **Tạo đơn hàng mẫu** (CONFIRMED status)
```bash
# Hoặc dùng frontend checkout
```

2. **Tạo Shipper mẫu** (APPROVED status, isOnline = true)
```bash
# Hoặc dùng Shipper Dashboard để set online
```

3. **Test API từ Staff**
```bash
# Xem test commands trong TEST_STAFF_ORDERS.md
```

4. **Kiểm tra Shipper Dashboard**
```bash
# Sau khi assign, check shipper orders API
GET /shipper/orders/:userId
```

## 📝 Các file liên quan

### Models cần thiết:
- ✅ `Order.js` - Đơn hàng
- ✅ `Shipper.js` - Thông tin shipper
- ✅ `Shipment.js` - Thông tin vận chuyển
- ✅ `ShipperEarnings.js` - Thu nhập shipper
- ✅ `User.js` - Thông tin user

### Controllers liên quan:
- ✅ `staffOrderController.js` - Logic Staff
- ✅ `shipperController.js` - Logic Shipper (đã có)
- ✅ `orderController.js` - Logic Order (đã có)

## 🎯 Next Steps

### Tính năng có thể mở rộng:
1. **Real-time notifications** cho Shipper khi được assign
2. **Map integration** để tính distance thực tế
3. **Auto-assign algorithm** dựa trên location, rating, workload
4. **Shipper rating** sau khi giao hàng
5. **Cancel/Reassign** từ Staff khi Shipper không thể giao
6. **Analytics** - Thống kê hiệu suất shipper, thời gian giao hàng
7. **Push notifications** khi có đơn mới

## 🐛 Troubleshooting

### Lỗi "Access denied. No token provided"
→ Kiểm tra localStorage có token chưa
→ Token có còn hạn không

### Lỗi "Order must be CONFIRMED"
→ Kiểm tra status của order trong database
→ Đảm bảo Seller đã confirm order

### Lỗi "Shipper is not approved"
→ Kiểm tra status của Shipper
→ Admin cần approve shipper trước

### Không thấy Shipper nào
→ Kiểm tra isOnline = true
→ Kiểm tra status = APPROVED

## 📞 Hỗ trợ

Nếu có vấn đề, kiểm tra:
1. Backend console logs
2. Browser console (Network tab)
3. MongoDB data (Order, Shipper, Shipment collections)

---

**Tác giả**: GitHub Copilot
**Ngày tạo**: 28/10/2025
**Version**: 1.0
