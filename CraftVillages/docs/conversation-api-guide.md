# 📚 Conversation API - Hướng dẫn sử dụng

## 📋 Mục lục

1. [Schema Overview](#schema-overview)
2. [API Endpoints](#api-endpoints)
3. [Model Methods](#model-methods)
4. [Usage Examples](#usage-examples)
5. [Frontend Integration](#frontend-integration)

---

## 🗂️ Schema Overview

### **Conversation Fields**

| Field | Type | Description |
|-------|------|-------------|
| `buyerId` | ObjectId | ID người mua (ref: User) |
| `shopId` | ObjectId | ID shop (ref: Shop) |
| `subject` | String | Tiêu đề cuộc trò chuyện |
| `conversationType` | Enum | Loại: ORDER_INQUIRY, PRODUCT_QUESTION, COMPLAINT, RETURN_REFUND, GENERAL |
| `orderId` | ObjectId | ID đơn hàng (nếu có) |
| `productId` | ObjectId | ID sản phẩm (nếu có) |
| `messages` | Array | Danh sách tin nhắn |
| `status` | Enum | OPEN, CLOSED, ARCHIVED |
| `priority` | Enum | LOW, NORMAL, HIGH, URGENT |
| `tags` | Array | Tags phân loại |
| `unreadCount` | Object | { buyer: Number, shop: Number } |
| `lastMessageAt` | Date | Thời gian tin nhắn cuối |
| `lastMessagePreview` | String | Preview tin nhắn cuối (100 ký tự) |
| `lastMessageSender` | Enum | USER, SHOP_STAFF, SYSTEM |
| `isArchivedByBuyer` | Boolean | Buyer đã ẩn? |
| `isArchivedByShop` | Boolean | Shop đã ẩn? |

### **Message Fields**

| Field | Type | Description |
|-------|------|-------------|
| `messageId` | ObjectId | ID tin nhắn |
| `sender.type` | Enum | USER, SHOP_STAFF, SYSTEM |
| `sender.userId` | ObjectId | ID người gửi (nếu là USER) |
| `sender.shopId` | ObjectId | ID shop (nếu là SHOP_STAFF) |
| `sender.name` | String | Tên người gửi (cached) |
| `sender.avatar` | String | Avatar người gửi (cached) |
| `messageType` | Enum | TEXT, IMAGE, FILE, SYSTEM_NOTIFICATION |
| `content` | String | Nội dung tin nhắn |
| `attachments` | Array | File đính kèm |
| `replyTo` | ObjectId | ID tin nhắn được reply |
| `deliveredAt` | Date | Thời gian gửi |
| `readAt` | Date | Thời gian đọc |
| `isEdited` | Boolean | Đã sửa? |
| `editedAt` | Date | Thời gian sửa |
| `deletedAt` | Date | Thời gian xóa (soft delete) |

---

## 🔌 API Endpoints

### **1. Lấy danh sách conversations (Buyer)**

```http
GET /api/conversations/buyer/:buyerId
```

**Query Parameters:**
- `includeArchived` (boolean): Bao gồm conversations đã ẩn (default: false)
- `status` (string): Filter theo status (OPEN, CLOSED, ARCHIVED)
- `type` (string): Filter theo conversationType

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "ea3abeecf465b78324a48008",
      "shopId": {
        "_id": "98ed326b04df5be15a36109d",
        "shopName": "Gốm Bát Tràng",
        "avatar": "/uploads/shops/shop1.jpg"
      },
      "subject": "Hỏi về Bình gốm",
      "conversationType": "PRODUCT_QUESTION",
      "unreadCount": {
        "buyer": 2,
        "shop": 0
      },
      "lastMessagePreview": "Bên mình còn nhé, bạn cần số lượng bao nhiêu ạ?",
      "lastMessageAt": "2025-10-08T23:40:00.000Z",
      "status": "OPEN"
    }
  ]
}
```

---

### **2. Lấy danh sách conversations (Shop)**

```http
GET /api/conversations/shop/:shopId
```

**Query Parameters:** Giống như buyer endpoint

**Response:** Tương tự, nhưng populate `buyerId` thay vì `shopId`

---

### **3. Lấy chi tiết conversation**

```http
GET /api/conversations/:conversationId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "ea3abeecf465b78324a48008",
    "buyerId": { ... },
    "shopId": { ... },
    "messages": [
      {
        "messageId": "79ab409ee1b4505fdfe9730a",
        "sender": {
          "type": "USER",
          "userId": "c73db8938862d8a845a80124",
          "name": "Nguyễn Văn A",
          "avatar": "/uploads/avatars/user1.jpg"
        },
        "messageType": "TEXT",
        "content": "Shop ơi, sản phẩm này còn hàng không ạ?",
        "deliveredAt": "2025-10-08T23:25:00.000Z",
        "readAt": "2025-10-08T23:26:00.000Z",
        "isEdited": false,
        "deletedAt": null
      }
    ]
  }
}
```

---

### **4. Tạo conversation mới**

```http
POST /api/conversations
```

**Body:**
```json
{
  "buyerId": "68ec8c156161d0c0b72d3a04",
  "shopId": "98ed326b04df5be15a36109d",
  "conversationType": "PRODUCT_QUESTION",
  "productId": "507f1f77bcf86cd799439011",
  "subject": "Hỏi về Bình gốm Bát Tràng",
  "initialMessage": {
    "content": "Sản phẩm này còn hàng không ạ?",
    "senderInfo": {
      "type": "USER",
      "userId": "68ec8c156161d0c0b72d3a04",
      "name": "Nguyễn Văn A",
      "avatar": "/uploads/avatars/user1.jpg"
    }
  }
}
```

---

### **5. Gửi tin nhắn**

```http
POST /api/conversations/:conversationId/messages
```

**Body:**
```json
{
  "senderInfo": {
    "type": "SHOP_STAFF",
    "shopId": "98ed326b04df5be15a36109d",
    "name": "Gốm Bát Tràng",
    "avatar": "/uploads/shops/shop1.jpg"
  },
  "content": "Bên mình còn nhé, bạn cần số lượng bao nhiêu ạ?",
  "messageType": "TEXT",
  "attachments": [],
  "replyTo": null
}
```

---

### **6. Đánh dấu đã đọc**

```http
PUT /api/conversations/:conversationId/read
```

**Body:**
```json
{
  "readerType": "SHOP"  // hoặc "BUYER"
}
```

---

### **7. Sửa tin nhắn**

```http
PUT /api/conversations/:conversationId/messages/:messageId
```

**Body:**
```json
{
  "content": "Nội dung mới (đã sửa)"
}
```

---

### **8. Xóa tin nhắn (soft delete)**

```http
DELETE /api/conversations/:conversationId/messages/:messageId
```

---

### **9. Archive conversation**

```http
PUT /api/conversations/:conversationId/archive
```

**Body:**
```json
{
  "archiverType": "BUYER"  // hoặc "SHOP"
}
```

---

### **10. Đóng conversation**

```http
PUT /api/conversations/:conversationId/close
```

---

## 🛠️ Model Methods

### **Instance Methods**

#### **1. addMessage()**
```javascript
await conversation.addMessage(
  {
    type: 'USER',
    userId: '68ec8c156161d0c0b72d3a04',
    name: 'Nguyễn Văn A',
    avatar: '/uploads/avatars/user1.jpg'
  },
  'Sản phẩm này còn hàng không ạ?',
  'TEXT',
  [],  // attachments
  null  // replyTo
);
```

#### **2. markAsRead()**
```javascript
await conversation.markAsRead('SHOP');  // Shop đọc tin nhắn
await conversation.markAsRead('BUYER');  // Buyer đọc tin nhắn
```

#### **3. archive()**
```javascript
await conversation.archive('BUYER');  // Buyer ẩn conversation
await conversation.archive('SHOP');   // Shop ẩn conversation
```

#### **4. close()**
```javascript
await conversation.close();  // Đóng conversation
```

### **Static Methods**

#### **1. getByBuyer()**
```javascript
const conversations = await Conversation.getByBuyer(buyerId, includeArchived);
```

#### **2. getByShop()**
```javascript
const conversations = await Conversation.getByShop(shopId, includeArchived);
```

#### **3. getByOrder()**
```javascript
const conversation = await Conversation.getByOrder(orderId);
```

---

## 💡 Usage Examples

### **Example 1: Buyer hỏi về sản phẩm**

```javascript
// 1. Tạo conversation
const conversation = new Conversation({
  buyerId: user._id,
  shopId: product.shopId,
  conversationType: 'PRODUCT_QUESTION',
  productId: product._id,
  subject: `Hỏi về ${product.productName}`
});

await conversation.save();

// 2. Gửi tin nhắn đầu tiên
await conversation.addMessage(
  {
    type: 'USER',
    userId: user._id,
    name: user.fullName,
    avatar: user.avatar
  },
  'Sản phẩm này còn hàng không ạ?'
);
```

---

### **Example 2: Shop trả lời**

```javascript
// 1. Lấy conversation
const conversation = await Conversation.findById(conversationId);

// 2. Gửi tin nhắn
await conversation.addMessage(
  {
    type: 'SHOP_STAFF',
    shopId: shop._id,
    name: shop.shopName,
    avatar: shop.avatar
  },
  'Bên mình còn nhé, bạn cần số lượng bao nhiêu ạ?'
);

// 3. Đánh dấu đã đọc tin nhắn của buyer
await conversation.markAsRead('SHOP');
```

---

### **Example 3: Tạo conversation từ đơn hàng**

```javascript
// Khi buyer hỏi về đơn hàng
const conversation = new Conversation({
  buyerId: order.buyerInfo.userId,
  shopId: order.items[0].shopId,
  conversationType: 'ORDER_INQUIRY',
  orderId: order._id,
  subject: `Hỏi về đơn hàng #${order._id.slice(-6)}`,
  priority: 'HIGH'  // Đơn hàng ưu tiên cao
});

await conversation.save();

await conversation.addMessage(
  {
    type: 'USER',
    userId: order.buyerInfo.userId,
    name: order.buyerInfo.fullName,
    avatar: buyer.avatar
  },
  'Đơn hàng của tôi đến khi nào ạ?'
);
```

---

### **Example 4: Reply tin nhắn**

```javascript
const previousMessageId = conversation.messages[0].messageId;

await conversation.addMessage(
  {
    type: 'SHOP_STAFF',
    shopId: shop._id,
    name: shop.shopName,
    avatar: shop.avatar
  },
  'Đơn hàng sẽ đến trong 3-5 ngày ạ',
  'TEXT',
  [],
  previousMessageId  // Reply tin nhắn trước
);
```

---

## 🎨 Frontend Integration

### **React Component Example**

```jsx
import React, { useState, useEffect } from 'react';
import conversationService from '../services/conversationService';

function ConversationList({ userId, userType }) {
  const [conversations, setConversations] = useState([]);
  
  useEffect(() => {
    loadConversations();
  }, []);
  
  const loadConversations = async () => {
    const data = userType === 'BUYER'
      ? await conversationService.getByBuyer(userId)
      : await conversationService.getByShop(userId);
    setConversations(data);
  };
  
  return (
    <div>
      {conversations.map(conv => (
        <div key={conv._id} className="conversation-item">
          <div className="avatar">
            <img src={conv.shopId?.avatar || conv.buyerId?.avatar} />
          </div>
          <div className="content">
            <h4>{conv.subject}</h4>
            <p>{conv.lastMessagePreview}</p>
            <span>{new Date(conv.lastMessageAt).toLocaleString()}</span>
          </div>
          {conv.unreadCount[userType.toLowerCase()] > 0 && (
            <span className="badge">{conv.unreadCount[userType.toLowerCase()]}</span>
          )}
        </div>
      ))}
    </div>
  );
}
```

---

## 🔔 Notification Integration

### **Socket.IO Example**

```javascript
// Server-side
io.on('connection', (socket) => {
  socket.on('join-conversation', (conversationId) => {
    socket.join(`conversation-${conversationId}`);
  });
  
  socket.on('send-message', async (data) => {
    const conversation = await Conversation.findById(data.conversationId);
    const message = await conversation.addMessage(
      data.senderInfo,
      data.content,
      data.messageType
    );
    
    // Broadcast to all users in conversation
    io.to(`conversation-${data.conversationId}`).emit('new-message', message);
    
    // Send notification to recipient
    const recipientType = data.senderInfo.type === 'USER' ? 'SHOP' : 'BUYER';
    io.to(`user-${conversation[recipientType.toLowerCase() + 'Id']}`).emit('notification', {
      type: 'NEW_MESSAGE',
      conversationId: conversation._id,
      message: data.content
    });
  });
});
```

---

## 📝 Best Practices

1. **Luôn cache sender info** khi gửi tin nhắn để tránh query thêm
2. **Sử dụng conversationType** để phân loại và filter
3. **Set priority** cho conversations quan trọng (đơn hàng, khiếu nại)
4. **Sử dụng tags** để dễ tìm kiếm và phân loại
5. **Implement real-time** với Socket.IO cho trải nghiệm tốt hơn
6. **Soft delete** tin nhắn thay vì xóa hẳn
7. **Archive** thay vì delete conversation

---

## 🚀 Next Steps

1. Implement API endpoints trong `backend/controllers/conversationController.js`
2. Tạo routes trong `backend/routes/conversationRoutes.js`
3. Tạo service trong `frontend/src/services/conversationService.js`
4. Tạo UI components cho chat
5. Integrate Socket.IO cho real-time messaging
6. Thêm notification system

