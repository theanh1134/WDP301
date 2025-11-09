# Test Script - 7-Day Automatic Seller Payment

## 📋 Mục đích

Script này giúp test hệ thống thanh toán tự động cho seller sau 7 ngày kể từ khi order chuyển sang DELIVERED.

---

## 🚀 Cách sử dụng

### 1. Chế độ Interactive (Khuyến nghị)

```bash
cd backend
node scripts/test7DayPayment.js
```

**Menu sẽ hiển thị:**
```
📋 Test Menu:
============================================================
1. Display current unpaid orders
2. Create test order (10 days old) - ELIGIBLE
3. Create test order (5 days old) - NOT ELIGIBLE
4. Run payment job manually
5. Full test scenario
0. Exit
============================================================
```

---

### 2. Chế độ Command Line

#### Hiển thị các order chưa thanh toán

```bash
node scripts/test7DayPayment.js --display
```

**Output:**
```
📊 Current Unpaid DELIVERED Orders:

✅ ELIGIBLE | Order: 6901b0b864192cf90db91edc
   Created: 25/10/2025 14:30:00 (14 days ago)
   Amount: 680,000 VND
   Status: Ready for payment
   Has Refund: No

⏳ WAITING  | Order: 6901b0b864192cf90db91edd
   Created: 05/11/2025 10:15:00 (3 days ago)
   Amount: 450,000 VND
   Status: Wait 4 more day(s)
   Has Refund: No

📈 Summary:
   ✅ Eligible for payment (>7 days): 1
   ⏳ Waiting (<7 days): 1
```

---

#### Chạy payment job ngay lập tức

```bash
node scripts/test7DayPayment.js --run
```

**Output:**
```
🚀 Running Seller Payment Job...

🔄 [CRON JOB] Starting automatic seller payment processing...
⏰ Time: 08/11/2025 15:30:00

📅 Processing orders DELIVERED before: 01/11/2025 15:30:00
   (Orders must be at least 7 days old)

📦 Found 5 unpaid DELIVERED orders (>7 days old)

[1/5] Processing Order: 6901b0b864192cf90db91edc
   Created: 25/10/2025 14:30:00 (14 days ago)
   ✅ SUCCESS: TXN_SELLER_1731067848248_123 - 646,000 VND

[2/5] Processing Order: 6901b0b864192cf90db91edd
   Created: 28/10/2025 10:15:00 (11 days ago)
   ⚠️  SKIPPED: Order has active refund request

📊 SUMMARY:
   Total: 5 | ✅ Success: 4 | ⚠️  Skipped: 1 | ❌ Failed: 0
✅ [CRON JOB] Automatic seller payment processing completed!
```

---

#### Chạy full test scenario

```bash
node scripts/test7DayPayment.js --full-test
```

**Scenario này sẽ:**
1. ✅ Hiển thị trạng thái hiện tại
2. ✅ Tạo 2 test orders (1 eligible, 1 not eligible)
3. ✅ Chạy payment job
4. ✅ Verify kết quả
5. ✅ Hiển thị seller balance

---

## 🧪 Test Cases

### Test Case 1: Order đủ 7 ngày

```bash
# Chọn option 2 trong interactive mode
# Hoặc tạo order thủ công:
```

**Expected Result:**
- ✅ Order được thanh toán
- ✅ Seller balance tăng (đã trừ phí sàn)
- ✅ `order.sellerPayment.isPaid = true`
- ✅ SellerTransaction được tạo

---

### Test Case 2: Order chưa đủ 7 ngày

```bash
# Chọn option 3 trong interactive mode
```

**Expected Result:**
- ⏳ Order KHÔNG được thanh toán
- ⏳ Seller balance không thay đổi
- ⏳ `order.sellerPayment.isPaid = false`

---

### Test Case 3: Order có refund request

**Setup:**
1. Tạo order đủ 7 ngày
2. Tạo return request cho order đó
3. Chạy payment job

**Expected Result:**
- ⚠️ Order bị SKIP
- ⚠️ Log: "SKIPPED: Order has active refund request"
- ⚠️ Seller không nhận được tiền

---

### Test Case 4: Order đã thanh toán rồi

**Setup:**
1. Tạo order đủ 7 ngày
2. Chạy payment job lần 1 → Thanh toán thành công
3. Chạy payment job lần 2

**Expected Result:**
- ⚠️ Order bị SKIP
- ⚠️ Log: "SKIPPED: Seller already paid for this order"
- ⚠️ Không tạo duplicate transaction

---

## 📊 Verify Results

### 1. Kiểm tra Order

```javascript
const order = await Order.findById(orderId);
console.log(order.sellerPayment);
```

**Expected:**
```javascript
{
  isPaid: true,
  paidAt: 2025-11-08T02:00:00.000Z,
  transactionId: "690ebe18e56cf95468332ed7",
  platformFee: 34000,
  platformFeeRate: 5,
  netAmount: 646000
}
```

---

### 2. Kiểm tra Seller Balance

```javascript
const seller = await User.findById(sellerId);
console.log('Balance:', seller.getBalance());
```

**Expected:**
- Balance tăng = `netAmount` (đã trừ phí sàn)

---

### 3. Kiểm tra SellerTransaction

```javascript
const transaction = await SellerTransaction.findById(transactionId);
console.log(transaction);
```

**Expected:**
```javascript
{
  sellerId: "...",
  type: "ORDER_PAYMENT",
  amount: 646000,
  platformFee: 34000,
  netAmount: 646000,
  orderId: "...",
  status: "COMPLETED",
  transactionCode: "TXN_SELLER_xxx"
}
```

---

## 🔧 Troubleshooting

### Issue 1: "No seller found in database"

**Solution:**
```bash
# Tạo seller trong database trước
# Hoặc sử dụng seller ID có sẵn
```

---

### Issue 2: Script không kết nối được database

**Solution:**
```bash
# Kiểm tra .env file
MONGO_URI=mongodb://localhost:27017/craftvillages

# Đảm bảo MongoDB đang chạy
```

---

### Issue 3: Order không được thanh toán

**Check:**
1. ✅ Order status = DELIVERED?
2. ✅ Order đã > 7 ngày?
3. ✅ Không có refund request?
4. ✅ Chưa thanh toán trước đó?

---

## 📝 Notes

### Về Test Orders

- Test orders được tạo với `createdAt` trong quá khứ
- Không ảnh hưởng đến production data
- Có thể xóa sau khi test xong

### Về Seller Balance

- Test script sẽ thay đổi seller balance thật
- Nên test trên development/staging environment
- Backup database trước khi test

### Về Cron Job

- Script này chỉ test logic, không test cron schedule
- Để test cron schedule, đợi đến 2:00 AM hoặc thay đổi schedule

---

## 🎯 Quick Start

**Cách nhanh nhất để test:**

```bash
# 1. Chạy full test
cd backend
node scripts/test7DayPayment.js --full-test

# 2. Xem kết quả
node scripts/test7DayPayment.js --display
```

---

## 📞 Support

Nếu có vấn đề:
1. Kiểm tra logs trong console
2. Kiểm tra database connection
3. Verify seller tồn tại trong database
4. Check MongoDB logs

---

**Last Updated:** 2025-11-09

