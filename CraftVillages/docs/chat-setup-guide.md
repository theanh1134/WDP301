# 💬 Hướng dẫn cài đặt và test Chat System

## 📋 Tổng quan

Hệ thống chat real-time giữa buyer và shop với các tính năng:
- ✅ Real-time messaging với Socket.IO
- ✅ Conversation list với unread count
- ✅ Typing indicators
- ✅ Message history
- ✅ Chat từ product detail page
- ✅ Giao diện đẹp, đồng bộ với project

---

## 🔧 Bước 1: Cài đặt Dependencies

### **Backend:**

```bash
cd backend
npm install socket.io
```

### **Frontend:**

```bash
cd ..
npm install socket.io-client
```

---

## 🗄️ Bước 2: Setup Database

### **Option 1: Sử dụng data mẫu có sẵn**

Nếu bạn đã có data conversations trong MongoDB (như data bạn cung cấp), chạy migration script:

```bash
cd backend
node scripts/migrateConversations.js
```

### **Option 2: Tạo conversation mới**

Conversations sẽ tự động được tạo khi:
1. Buyer click "Chat với shop" trong ProductDetail
2. Buyer/Shop gửi tin nhắn đầu tiên

---

## 🚀 Bước 3: Khởi động Server

### **Backend:**

```bash
cd backend
npm start
```

Kiểm tra console, bạn sẽ thấy:
```
🚀 Server running on port 9999
💬 Socket.IO ready for real-time chat
```

### **Frontend:**

```bash
cd ..
npm start
```

---

## 🧪 Bước 4: Test Chat System

### **Test 1: Chat từ Product Detail**

1. **Đăng nhập** với tài khoản buyer
2. **Vào trang sản phẩm**: `http://localhost:3000/products/[PRODUCT_ID]`
3. **Click nút "Chat với shop"** (bên cạnh "Thêm vào giỏ hàng")
4. **Kiểm tra:**
   - ✅ Redirect đến `/chat`
   - ✅ Conversation tự động được tạo/mở
   - ✅ Hiển thị thông tin sản phẩm trong chat header
   - ✅ Có thể gửi tin nhắn ngay

### **Test 2: Chat List**

1. **Click icon chat** trong header (icon FaComments)
2. **Kiểm tra:**
   - ✅ Hiển thị danh sách conversations
   - ✅ Hiển thị avatar shop/buyer
   - ✅ Hiển thị preview tin nhắn cuối
   - ✅ Hiển thị thời gian (vừa xong, X phút, X giờ, X ngày)
   - ✅ Hiển thị badge unread count (nếu có)
   - ✅ Hiển thị badge loại conversation (Sản phẩm, Đơn hàng, Chung...)

### **Test 3: Real-time Messaging**

**Chuẩn bị:**
- Mở 2 browser khác nhau (hoặc 1 normal + 1 incognito)
- Browser 1: Đăng nhập buyer
- Browser 2: Đăng nhập seller (shop owner)

**Test:**

1. **Browser 1 (Buyer):**
   - Vào `/chat`
   - Chọn conversation với shop
   - Gửi tin nhắn: "Xin chào shop!"

2. **Browser 2 (Seller):**
   - Vào `/chat`
   - **Kiểm tra:**
     - ✅ Tin nhắn mới xuất hiện ngay lập tức (không cần refresh)
     - ✅ Unread count tăng lên
     - ✅ Conversation nhảy lên đầu danh sách

3. **Browser 2 (Seller):**
   - Click vào conversation
   - **Kiểm tra:**
     - ✅ Unread count về 0
     - ✅ Thấy tin nhắn "Xin chào shop!"
   - Gửi tin nhắn: "Chào bạn! Shop có thể giúp gì cho bạn?"

4. **Browser 1 (Buyer):**
   - **Kiểm tra:**
     - ✅ Tin nhắn của shop xuất hiện ngay lập tức
     - ✅ Không cần refresh

### **Test 4: Typing Indicator**

1. **Browser 1 (Buyer):**
   - Bắt đầu nhập tin nhắn (chưa gửi)

2. **Browser 2 (Seller):**
   - **Kiểm tra:**
     - ✅ Hiển thị "[Tên buyer] đang nhập..." ở cuối chat window

3. **Browser 1 (Buyer):**
   - Dừng nhập (2 giây)

4. **Browser 2 (Seller):**
   - **Kiểm tra:**
     - ✅ Typing indicator biến mất

### **Test 5: Message Grouping by Date**

1. **Tạo tin nhắn cũ** (trong MongoDB Compass):
   ```javascript
   // Thêm message với deliveredAt là hôm qua
   db.conversations.updateOne(
     { _id: ObjectId("...") },
     {
       $push: {
         messages: {
           messageId: new ObjectId(),
           sender: { type: "USER", userId: ObjectId("..."), name: "Test User" },
           content: "Tin nhắn hôm qua",
           deliveredAt: new Date(Date.now() - 86400000) // 1 ngày trước
         }
       }
     }
   )
   ```

2. **Refresh chat page**
3. **Kiểm tra:**
   - ✅ Hiển thị divider "Hôm qua"
   - ✅ Hiển thị divider "Hôm nay"
   - ✅ Messages được group theo ngày

### **Test 6: Multiple Conversations**

1. **Buyer:**
   - Chat với Shop A về Product 1
   - Chat với Shop B về Product 2
   - Chat với Shop A về Product 3

2. **Kiểm tra:**
   - ✅ Hiển thị 3 conversations riêng biệt
   - ✅ Mỗi conversation hiển thị đúng product info
   - ✅ Switching giữa conversations mượt mà
   - ✅ Messages không bị lẫn lộn

### **Test 7: Seller View**

1. **Đăng nhập seller**
2. **Vào `/chat`**
3. **Kiểm tra:**
   - ✅ Hiển thị danh sách buyers đã chat
   - ✅ Hiển thị avatar + tên buyer
   - ✅ Hiển thị product/order context
   - ✅ Có thể reply tin nhắn
   - ✅ Real-time updates hoạt động

---

## 🎨 Giao diện

### **Chat Page Layout:**

```
┌─────────────────────────────────────────────────────────┐
│                        Header                           │
├──────────────────┬──────────────────────────────────────┤
│                  │                                      │
│  Conversation    │         Chat Window                  │
│  List            │                                      │
│                  │  ┌────────────────────────────────┐  │
│  ┌────────────┐  │  │  Shop Name / Buyer Name        │  │
│  │ Shop A     │  │  │  Product: Bình gốm Bát Tràng   │  │
│  │ Hỏi về...  │  │  └────────────────────────────────┘  │
│  │ 2 phút     │  │                                      │
│  │ [2]        │  │  ┌────────────────────────────────┐  │
│  └────────────┘  │  │         Hôm qua                │  │
│                  │  ├────────────────────────────────┤  │
│  ┌────────────┐  │  │  Shop: Sản phẩm còn hàng nhé   │  │
│  │ Shop B     │  │  │  14:30                         │  │
│  │ Đơn hàng   │  │  ├────────────────────────────────┤  │
│  │ 1 giờ      │  │  │         Hôm nay                │  │
│  └────────────┘  │  ├────────────────────────────────┤  │
│                  │  │  You: Cho mình 2 chiếc         │  │
│                  │  │  10:15                         │  │
│                  │  └────────────────────────────────┘  │
│                  │                                      │
│                  │  ┌────────────────────────────────┐  │
│                  │  │  [Nhập tin nhắn...]        [>] │  │
│                  │  └────────────────────────────────┘  │
└──────────────────┴──────────────────────────────────────┘
```

### **Color Scheme:**

- **Primary Gold**: `#b8860b` (buttons, active states)
- **Light Gold**: `#d4af37` (gradients)
- **Background**: `#f8f9fa` (conversation list, messages area)
- **White**: `#fff` (cards, message bubbles)
- **Text**: `#2c3e50` (primary text)
- **Muted**: `#666`, `#999` (secondary text)

---

## 🐛 Troubleshooting

### **Lỗi: Socket.IO không connect**

**Nguyên nhân:** Backend chưa cài socket.io

**Giải pháp:**
```bash
cd backend
npm install socket.io
npm start
```

### **Lỗi: "Cannot find module 'socket.io-client'"**

**Nguyên nhân:** Frontend chưa cài socket.io-client

**Giải pháp:**
```bash
npm install socket.io-client
npm start
```

### **Lỗi: Conversations không load**

**Nguyên nhân:** 
1. Backend chưa chạy
2. Database chưa có conversations
3. Auth token hết hạn

**Giải pháp:**
1. Kiểm tra backend đang chạy: `http://localhost:9999`
2. Kiểm tra MongoDB có data conversations
3. Đăng xuất và đăng nhập lại

### **Lỗi: Real-time không hoạt động**

**Nguyên nhân:** Socket.IO chưa connect

**Giải pháp:**
1. Mở DevTools Console
2. Kiểm tra log: "✅ Connected to Socket.IO"
3. Nếu không thấy, check CORS settings trong `backend/server.js`

### **Lỗi: Typing indicator không hiện**

**Nguyên nhân:** Socket events chưa được emit

**Giải pháp:**
1. Kiểm tra console có log "typing-start" events
2. Kiểm tra cả 2 browsers đều connected to socket

---

## 📊 Database Structure

### **Conversation Document:**

```javascript
{
  _id: ObjectId("..."),
  buyerId: ObjectId("..."),
  shopId: ObjectId("..."),
  conversationType: "PRODUCT_QUESTION",
  productId: ObjectId("..."),
  subject: "Hỏi về Bình gốm Bát Tràng",
  messages: [
    {
      messageId: ObjectId("..."),
      sender: {
        type: "USER",
        userId: ObjectId("..."),
        name: "Nguyễn Văn A",
        avatar: "/uploads/avatars/user1.jpg"
      },
      messageType: "TEXT",
      content: "Sản phẩm này còn hàng không ạ?",
      deliveredAt: ISODate("2025-01-19T10:00:00Z"),
      readAt: ISODate("2025-01-19T10:05:00Z")
    }
  ],
  unreadCount: {
    buyer: 0,
    shop: 1
  },
  lastMessageAt: ISODate("2025-01-19T10:00:00Z"),
  lastMessagePreview: "Sản phẩm này còn hàng không ạ?",
  status: "OPEN",
  createdAt: ISODate("2025-01-19T10:00:00Z"),
  updatedAt: ISODate("2025-01-19T10:00:00Z")
}
```

---

## 🎯 Kết luận

Sau khi hoàn thành các bước trên, bạn sẽ có:

- ✅ Hệ thống chat real-time hoàn chỉnh
- ✅ Giao diện đẹp, đồng bộ với project
- ✅ Typing indicators
- ✅ Unread count
- ✅ Message history
- ✅ Chat từ product detail
- ✅ Lưu trữ vào database

**Enjoy chatting!** 💬🎉

