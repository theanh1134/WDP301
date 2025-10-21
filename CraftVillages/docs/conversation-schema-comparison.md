# 📊 So sánh Schema Conversation - Cũ vs Mới

## ❌ Schema CŨ (Hiện tại)

```json
{
  "_id": ObjectId,
  "buyerId": ObjectId,
  "shopId": ObjectId,
  "subject": String,
  "messages": [
    {
      "messageId": ObjectId,
      "sender": {
        "type": "USER" | "SHOP_STAFF",
        "userId": ObjectId | null,
        "shopId": ObjectId | null
      },
      "content": String,
      "attachments": [],
      "deliveredAt": Date,
      "readAt": Date
    }
  ],
  "lastMessageAt": Date,
  "status": "OPEN" | "CLOSED",
  "createdAt": Date,
  "updatedAt": Date
}
```

### Vấn đề:
- ❌ Không có `conversationType` → Không phân loại được
- ❌ Không có `orderId`, `productId` → Không biết context
- ❌ Không có `unreadCount` → Phải đếm mỗi lần
- ❌ Không có sender info (name, avatar) → Phải query thêm
- ❌ Không có `messageType` → Không phân biệt text/image/file
- ❌ Không có `replyTo` → Không thể reply tin nhắn
- ❌ Không có `isEdited`, `deletedAt` → Không thể sửa/xóa
- ❌ Không có `priority`, `tags` → Không quản lý được
- ❌ Không có `isArchived` → Không thể ẩn conversation

---

## ✅ Schema MỚI (Đề xuất)

```json
{
  "_id": ObjectId,
  "buyerId": ObjectId (ref: User),
  "shopId": ObjectId (ref: Shop),
  
  // Metadata
  "subject": String,
  "conversationType": "ORDER_INQUIRY" | "PRODUCT_QUESTION" | "COMPLAINT" | "RETURN_REFUND" | "GENERAL",
  
  // References
  "orderId": ObjectId (ref: Order) | null,
  "productId": ObjectId (ref: Product) | null,
  
  // Messages
  "messages": [
    {
      "messageId": ObjectId,
      "sender": {
        "type": "USER" | "SHOP_STAFF" | "SYSTEM",
        "userId": ObjectId | null,
        "shopId": ObjectId | null,
        "name": String,        // ✅ Cache tên
        "avatar": String       // ✅ Cache avatar
      },
      "messageType": "TEXT" | "IMAGE" | "FILE" | "SYSTEM_NOTIFICATION",
      "content": String,
      "attachments": [
        {
          "fileUrl": String,
          "fileName": String,
          "fileSize": Number,
          "fileType": String
        }
      ],
      "replyTo": ObjectId | null,  // ✅ Reply tin nhắn
      "deliveredAt": Date,
      "readAt": Date | null,
      "isEdited": Boolean,         // ✅ Đánh dấu đã sửa
      "editedAt": Date | null,
      "deletedAt": Date | null     // ✅ Soft delete
    }
  ],
  
  // Status & Priority
  "status": "OPEN" | "CLOSED" | "ARCHIVED",
  "priority": "LOW" | "NORMAL" | "HIGH" | "URGENT",
  "tags": [String],
  
  // Unread tracking
  "unreadCount": {
    "buyer": Number,
    "shop": Number
  },
  
  // Last message preview
  "lastMessageAt": Date,
  "lastMessagePreview": String,
  "lastMessageSender": "USER" | "SHOP_STAFF" | "SYSTEM",
  
  // Archive flags
  "isArchivedByBuyer": Boolean,
  "isArchivedByShop": Boolean,
  
  // Notification tracking
  "notificationSent": Boolean,
  "emailSent": Boolean,
  
  "createdAt": Date,
  "updatedAt": Date
}
```

---

## 🎯 Cải thiện chính

### 1. **Phân loại conversation**
```javascript
conversationType: 'ORDER_INQUIRY'  // Hỏi về đơn hàng
conversationType: 'PRODUCT_QUESTION'  // Hỏi về sản phẩm
conversationType: 'COMPLAINT'  // Khiếu nại
conversationType: 'RETURN_REFUND'  // Đổi trả/hoàn tiền
conversationType: 'GENERAL'  // Trao đổi chung
```

### 2. **Reference đến Order/Product**
```javascript
// Ví dụ: Conversation về đơn hàng #ABC123
{
  conversationType: 'ORDER_INQUIRY',
  orderId: '68f45da9789b3a99350f874a',
  subject: 'Hỏi về đơn hàng #ABC123'
}

// Ví dụ: Hỏi về sản phẩm
{
  conversationType: 'PRODUCT_QUESTION',
  productId: '507f1f77bcf86cd799439011',
  subject: 'Hỏi về Bình gốm Bát Tràng'
}
```

### 3. **Cache sender info**
```javascript
// Trước: Phải query User/Shop mỗi lần
sender: {
  type: 'USER',
  userId: '68ec8c156161d0c0b72d3a04'
}

// Sau: Có sẵn name + avatar
sender: {
  type: 'USER',
  userId: '68ec8c156161d0c0b72d3a04',
  name: 'Nguyễn Văn A',
  avatar: '/uploads/avatars/user123.jpg'
}
```

### 4. **Unread count**
```javascript
// Trước: Phải đếm messages chưa đọc
const unreadCount = conversation.messages.filter(m => !m.readAt && m.sender.type === 'SHOP_STAFF').length;

// Sau: Có sẵn
unreadCount: {
  buyer: 3,  // Buyer có 3 tin chưa đọc
  shop: 0    // Shop đã đọc hết
}
```

### 5. **Message features**
```javascript
// Reply tin nhắn
{
  messageId: 'msg123',
  content: 'Vâng, sản phẩm còn hàng ạ',
  replyTo: 'msg122'  // Reply tin nhắn trước
}

// Sửa tin nhắn
{
  content: 'Sản phẩm còn 10 chiếc (đã sửa)',
  isEdited: true,
  editedAt: '2025-01-19T10:30:00Z'
}

// Xóa tin nhắn (soft delete)
{
  content: 'Tin nhắn đã bị xóa',
  deletedAt: '2025-01-19T11:00:00Z'
}
```

### 6. **Priority & Tags**
```javascript
// Đánh dấu khẩn cấp
{
  priority: 'URGENT',
  tags: ['Khiếu nại', 'Sản phẩm lỗi']
}

// Conversation thường
{
  priority: 'NORMAL',
  tags: ['Hỏi giá', 'Tư vấn']
}
```

### 7. **Archive**
```javascript
// Buyer ẩn conversation
isArchivedByBuyer: true

// Shop ẩn conversation
isArchivedByShop: true

// Query: Chỉ lấy conversation chưa archive
Conversation.find({ buyerId, isArchivedByBuyer: false })
```

---

## 📝 Migration Script

Để migrate từ schema cũ sang mới:

```javascript
// backend/scripts/migrateConversations.js
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const Shop = require('../models/Shop');

async function migrateConversations() {
  const conversations = await Conversation.find({});
  
  for (const conv of conversations) {
    // 1. Set default conversationType
    if (!conv.conversationType) {
      conv.conversationType = 'GENERAL';
    }
    
    // 2. Calculate unreadCount
    conv.unreadCount = {
      buyer: conv.messages.filter(m => !m.readAt && m.sender.type === 'SHOP_STAFF').length,
      shop: conv.messages.filter(m => !m.readAt && m.sender.type === 'USER').length
    };
    
    // 3. Set lastMessagePreview
    const lastMsg = conv.messages[conv.messages.length - 1];
    if (lastMsg) {
      conv.lastMessagePreview = lastMsg.content.substring(0, 100);
      conv.lastMessageSender = lastMsg.sender.type;
    }
    
    // 4. Cache sender info
    for (const msg of conv.messages) {
      if (msg.sender.type === 'USER' && msg.sender.userId) {
        const user = await User.findById(msg.sender.userId);
        if (user) {
          msg.sender.name = user.fullName;
          msg.sender.avatar = user.avatar;
        }
      } else if (msg.sender.type === 'SHOP_STAFF' && msg.sender.shopId) {
        const shop = await Shop.findById(msg.sender.shopId);
        if (shop) {
          msg.sender.name = shop.shopName;
          msg.sender.avatar = shop.avatar;
        }
      }
      
      // Set default messageType
      if (!msg.messageType) {
        msg.messageType = 'TEXT';
      }
    }
    
    // 5. Set default values
    if (!conv.priority) conv.priority = 'NORMAL';
    if (!conv.tags) conv.tags = [];
    if (conv.isArchivedByBuyer === undefined) conv.isArchivedByBuyer = false;
    if (conv.isArchivedByShop === undefined) conv.isArchivedByShop = false;
    
    await conv.save();
    console.log(`Migrated conversation ${conv._id}`);
  }
  
  console.log('Migration completed!');
}

migrateConversations();
```

---

## 🚀 Sử dụng Schema mới

### **1. Tạo conversation mới**
```javascript
const conversation = new Conversation({
  buyerId: '68ec8c156161d0c0b72d3a04',
  shopId: '98ed326b04df5be15a36109d',
  conversationType: 'PRODUCT_QUESTION',
  productId: '507f1f77bcf86cd799439011',
  subject: 'Hỏi về Bình gốm Bát Tràng'
});

await conversation.save();
```

### **2. Thêm tin nhắn**
```javascript
await conversation.addMessage(
  {
    type: 'USER',
    userId: '68ec8c156161d0c0b72d3a04',
    name: 'Nguyễn Văn A',
    avatar: '/uploads/avatars/user123.jpg'
  },
  'Sản phẩm này còn hàng không ạ?',
  'TEXT'
);
```

### **3. Đánh dấu đã đọc**
```javascript
await conversation.markAsRead('SHOP');  // Shop đọc tin nhắn
```

### **4. Lấy conversations của buyer**
```javascript
const conversations = await Conversation.getByBuyer(buyerId);
```

### **5. Lấy conversations của shop**
```javascript
const conversations = await Conversation.getByShop(shopId);
```

---

## 📊 Kết luận

| Tính năng | Schema Cũ | Schema Mới |
|-----------|-----------|------------|
| Phân loại conversation | ❌ | ✅ 5 loại |
| Reference Order/Product | ❌ | ✅ |
| Unread count | ❌ Phải đếm | ✅ Có sẵn |
| Sender info cache | ❌ | ✅ name + avatar |
| Message types | ❌ | ✅ TEXT/IMAGE/FILE/SYSTEM |
| Reply message | ❌ | ✅ |
| Edit/Delete message | ❌ | ✅ |
| Priority & Tags | ❌ | ✅ |
| Archive | ❌ | ✅ |
| Last message preview | ❌ | ✅ |

**Khuyến nghị:** Nên migrate sang schema mới để có đầy đủ tính năng cho hệ thống chat/messaging.

