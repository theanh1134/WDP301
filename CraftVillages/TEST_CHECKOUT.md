# Test Checkout - Hướng dẫn Debug

## Bước 1: Kiểm tra Console Log

### Frontend (Browser Console - F12)
Khi bạn click nút "Đặt hàng", hãy tìm các dòng log sau:

```
=== VALIDATING FORM DATA ===
Form data: { fullName: "...", phone: "...", address: "...", ... }
Phone validation: { original: "...", digits: "...", length: ... }
Full address: "..."
=== SENDING CHECKOUT REQUEST ===
Checkout payload: { ... }
```

**Kiểm tra:**
- ✅ `fullName` có giá trị không?
- ✅ `phone` có đủ 10-11 chữ số không?
- ✅ `fullAddress` có đầy đủ không?
- ✅ `phoneNumber` trong payload chỉ chứa số không?

### Backend (Terminal)
Trong terminal chạy backend, tìm:

```
Checkout request: { userId: "...", shippingAddress: {...}, ... }
Full request body: { ... }
```

**Kiểm tra:**
- ✅ `userId` có giá trị không?
- ✅ `shippingAddress` có đầy đủ 3 trường: recipientName, phoneNumber, fullAddress?
- ✅ `fullName` có trong request body không?

## Bước 2: Xác định lỗi cụ thể

### Nếu lỗi 400 với message cụ thể:

#### "Thiếu thông tin địa chỉ giao hàng"
**Nguyên nhân:** Một trong các trường sau bị thiếu:
- recipientName
- phoneNumber  
- fullAddress

**Giải pháp:** Điền đầy đủ thông tin vào form

#### "Số điện thoại không hợp lệ"
**Nguyên nhân:** Phone number không phải 10-11 chữ số

**Giải pháp:** Nhập số điện thoại hợp lệ (VD: 0123456789)

#### "Full name is required"
**Nguyên nhân:** Thiếu trường fullName

**Giải pháp:** Nhập họ tên

#### "Cart not found for this user"
**Nguyên nhân:** User không có giỏ hàng active

**Giải pháp:** Thêm sản phẩm vào giỏ hàng trước

#### "Vui lòng chọn ít nhất một sản phẩm để thanh toán"
**Nguyên nhân:** Không có sản phẩm nào được chọn trong giỏ

**Giải pháp:** Chọn ít nhất 1 sản phẩm trong giỏ hàng

#### "Sản phẩm [tên] không đủ số lượng trong kho"
**Nguyên nhân:** Hết hàng

**Giải pháp:** Giảm số lượng hoặc chọn sản phẩm khác

## Bước 3: Kiểm tra dữ liệu chi tiết

### Mở Browser Console và chạy:
```javascript
// Kiểm tra user
console.log('User:', JSON.parse(localStorage.getItem('user')));

// Kiểm tra form data (sau khi điền form)
// Xem trong console log "Form data: ..."
```

### Kiểm tra Backend Response:
Trong tab Network của DevTools:
1. Tìm request đến `/orders/.../checkout`
2. Click vào request đó
3. Xem tab "Response" để thấy lỗi chi tiết

## Bước 4: Test Case mẫu

### Test với dữ liệu hợp lệ:
```
Họ tên: Nguyễn Văn A
Địa chỉ: 123 Đường ABC
Phường/Xã: Phường 1
Quận/Huyện: Quận 1
Tỉnh/TP: TP. Hồ Chí Minh
Quốc gia: Việt Nam
Số điện thoại: 0123456789
Phương thức thanh toán: COD
```

**Kết quả mong đợi:**
- Payload gửi đi:
```json
{
  "fullName": "Nguyễn Văn A",
  "shippingAddress": {
    "recipientName": "Nguyễn Văn A",
    "phoneNumber": "0123456789",
    "fullAddress": "123 Đường ABC, Phường 1, Quận 1, TP. Hồ Chí Minh, Việt Nam"
  },
  "paymentMethod": "COD",
  "note": "",
  "email": "user@example.com"
}
```

## Bước 5: Các lỗi thường gặp

### Lỗi: "Order validation failed"
**Nguyên nhân:** Dữ liệu order không đúng schema

**Cách debug:**
1. Xem backend console log "Creating order with data:"
2. Kiểm tra các trường:
   - `buyerInfo.userId` - phải là ObjectId hợp lệ
   - `buyerInfo.fullName` - không được rỗng
   - `shippingAddress.phoneNumber` - phải match /^[0-9]{10,11}$/
   - `items` - phải có ít nhất 1 item
   - `subtotal`, `finalAmount` - phải >= 0

### Lỗi: "Subtotal does not match items total"
**Nguyên nhân:** Tổng tiền tính toán không khớp

**Cách debug:**
Backend sẽ log chi tiết:
```
Subtotal validation failed: {
  provided: 100000,
  calculated: 95000,
  difference: 5000,
  items: [...]
}
```

**Giải pháp:** Kiểm tra giá sản phẩm trong cart

### Lỗi: "Final amount does not match total"
**Nguyên nhân:** Tổng cuối không bằng subtotal + shipping + tip

**Cách debug:**
Backend sẽ log:
```
Final amount validation failed: {
  provided: 100000,
  calculated: 105000,
  subtotal: 100000,
  shippingFee: 5000,
  tipAmount: 0
}
```

## Bước 6: Nếu vẫn lỗi

Hãy copy toàn bộ thông tin sau và gửi cho tôi:

### Từ Browser Console:
```
1. Dòng "=== VALIDATING FORM DATA ===" và các dòng sau đó
2. Dòng "Checkout payload:" 
3. Dòng "=== CHECKOUT ERROR DEBUG ===" và tất cả error logs
```

### Từ Backend Terminal:
```
1. Dòng "Checkout request:"
2. Dòng "Full request body:"
3. Tất cả error logs (nếu có)
```

### Từ Network Tab:
```
1. Request URL
2. Request Method
3. Request Payload (tab "Payload")
4. Response (tab "Response")
```

## Quick Fix Commands

### Nếu backend không chạy:
```bash
cd backend
npm start
```

### Nếu frontend không chạy:
```bash
cd CraftVillages
npm start
```

### Clear cache và restart:
```bash
# Stop cả frontend và backend (Ctrl+C)
# Xóa cache
rm -rf node_modules/.cache  # hoặc xóa thủ công folder .cache

# Restart
npm start
```

