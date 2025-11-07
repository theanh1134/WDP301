# 🧪 REFUND FIX - TEST GUIDE

## 📋 TEST SCENARIO

**Mục tiêu:** Verify rằng khi staff approve return, tiền được hoàn lại vào tài khoản user.

---

## 🔧 SETUP

### 1. Ensure server is running

```bash
cd backend
npm start
```

### 2. Prepare test data

**Cần có:**
- ✅ User account với balance ban đầu (ví dụ: 0 VND)
- ✅ Order đã hoàn thành
- ✅ Return request với status = REQUESTED

---

## 🧪 TEST CASE 1: Staff Approve Return

### Step 1: Check user balance BEFORE

**API:** `GET /api/users/:userId/balance`

```bash
curl -X GET http://localhost:9999/api/users/USER_ID/balance
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "userId": "...",
    "fullName": "...",
    "email": "...",
    "balance": 0,
    "formattedBalance": "0 VND"
  }
}
```

**Note:** Ghi lại balance ban đầu (ví dụ: 0 VND)

---

### Step 2: Staff approve return

**API:** `PUT /api/staff/returns/:returnId/approve`

```bash
curl -X PUT http://localhost:9999/api/staff/returns/RETURN_ID/approve \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer STAFF_TOKEN" \
  -d '{
    "note": "Test refund fix"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Duyệt đơn hoàn hàng thành công.",
  "data": {
    "_id": "...",
    "rmaCode": "RMA-...",
    "status": "APPROVED",
    "amounts": {
      "subtotal": 3400000,
      "shippingFee": 0,
      "restockingFee": 0,
      "refundTotal": 3400000,
      "currency": "VND"
    }
  }
}
```

**Expected Server Logs:**
```
💰 Processing refund for return ...
📋 Refund calculation: {
  itemsTotal: '3,400,000',
  shippingFee: '0',
  refundAmount: '3,400,000',
  returnId: '...'
}
💰 Added 3,400,000 VND to user ... balance. New balance: 3,400,000 VND. Reason: Hoàn tiền đơn hàng trả về RMA-...
✅ Successfully added 3,400,000 VND to user ... balance
```

---

### Step 3: Check user balance AFTER

**API:** `GET /api/users/:userId/balance`

```bash
curl -X GET http://localhost:9999/api/users/USER_ID/balance
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "userId": "...",
    "fullName": "...",
    "email": "...",
    "balance": 3400000,
    "formattedBalance": "3,400,000 VND"
  }
}
```

**Verification:**
- ✅ Balance tăng lên = refundAmount
- ✅ New balance = Old balance + refundAmount

---

## 🧪 TEST CASE 2: Refund Calculation

### Scenario: Multiple items with shipping fee

**Test Data:**
```json
{
  "items": [
    { "unitPrice": 1000000, "quantity": 2 },
    { "unitPrice": 500000, "quantity": 1 }
  ],
  "shippingFee": 50000
}
```

**Expected Calculation:**
```
itemsTotal = (1,000,000 × 2) + (500,000 × 1) = 2,500,000 VND
refundAmount = 2,500,000 - 50,000 = 2,450,000 VND
```

**Verification:**
- ✅ Check returnOrder.amounts.subtotal = 2,500,000
- ✅ Check returnOrder.amounts.shippingFee = 50,000
- ✅ Check returnOrder.amounts.refundTotal = 2,450,000
- ✅ Check user balance increased by 2,450,000

---

## 🧪 TEST CASE 3: Prevent Duplicate Refund

### Step 1: Approve return (first time)

```bash
curl -X PUT http://localhost:9999/api/staff/returns/RETURN_ID/approve \
  -H "Authorization: Bearer STAFF_TOKEN"
```

**Expected:** Success, balance increased

---

### Step 2: Try to approve again (second time)

```bash
curl -X PUT http://localhost:9999/api/staff/returns/RETURN_ID/approve \
  -H "Authorization: Bearer STAFF_TOKEN"
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Không thể cập nhật. Đơn hoàn hàng hiện đang ở trạng thái APPROVED."
}
```

**Verification:**
- ✅ Request rejected
- ✅ Balance NOT increased again
- ✅ No duplicate refund

---

## 🧪 TEST CASE 4: Error Handling

### Scenario 1: User not found

**Setup:** Delete user or use invalid userId in return

**Expected:**
```json
{
  "success": false,
  "message": "Lỗi khi xử lý hoàn tiền: Không tìm thấy người dùng"
}
```

---

### Scenario 2: Refund amount = 0

**Setup:** Return with items total = shipping fee

**Expected Server Log:**
```
⚠️ Refund amount is 0, no money will be added to balance
```

**Verification:**
- ✅ No error thrown
- ✅ Balance unchanged
- ✅ Return status still updated to APPROVED

---

## 📊 VERIFICATION CHECKLIST

After running all tests:

- [ ] User balance increases correctly
- [ ] Refund calculation is accurate
- [ ] returnOrder.amounts is updated
- [ ] Server logs show refund messages
- [ ] Duplicate refund is prevented
- [ ] Error handling works
- [ ] No syntax errors
- [ ] No server crashes

---

## 🔍 DEBUGGING

### If balance is still 0:

**Check 1: Server logs**
```bash
# Look for:
💰 Processing refund for return ...
✅ Successfully added X VND to user Y balance
```

**If NOT found:** Code might not be executed

---

**Check 2: Database**
```javascript
// In MongoDB shell or Compass
db.users.findOne({ _id: ObjectId("USER_ID") })

// Check balance field
```

**If balance = 0:** Code might have error

---

**Check 3: Return status**
```javascript
db.returns.findOne({ _id: ObjectId("RETURN_ID") })

// Check:
// - status should be "APPROVED"
// - amounts.refundTotal should have value
```

---

**Check 4: Code**
```javascript
// In staffReturnController.js
// Line 237: Should NOT have // comment
await user.addBalance(refundAmount, `Hoàn tiền đơn hàng trả về ${returnOrder.rmaCode}`);
```

---

## 🐛 COMMON ISSUES

### Issue 1: "User not found"

**Cause:** buyerId in return is invalid or user deleted

**Fix:** Check return.buyerId matches existing user

---

### Issue 2: Balance not updated

**Cause:** Code still commented out

**Fix:** Verify line 128 and 237 are uncommented

---

### Issue 3: Refund amount = 0

**Cause:** Items total = shipping fee

**Fix:** Check return.items and return.shippingFee values

---

## 📝 MANUAL TEST STEPS

### Using Postman:

1. **Create collection** "Refund Fix Test"

2. **Add requests:**
   - GET User Balance (Before)
   - PUT Approve Return
   - GET User Balance (After)

3. **Set variables:**
   - `{{baseUrl}}` = http://localhost:9999
   - `{{userId}}` = Your test user ID
   - `{{returnId}}` = Your test return ID
   - `{{staffToken}}` = Staff auth token

4. **Run collection** and verify results

---

### Using Frontend:

1. **Login as staff**
2. **Go to Returns Management**
3. **Find return with status REQUESTED**
4. **Note user's current balance**
5. **Click "Chấp nhận" (Approve)**
6. **Check user's balance again**
7. **Verify balance increased**

---

## ✅ SUCCESS CRITERIA

Test is successful if:

1. ✅ User balance increases by refundAmount
2. ✅ Server logs show refund messages
3. ✅ returnOrder.amounts is updated correctly
4. ✅ Return status changes to APPROVED
5. ✅ Duplicate refund is prevented
6. ✅ Error handling works properly
7. ✅ No server errors or crashes

---

## 📞 SUPPORT

**Test failed?** Check:
1. Server logs for errors
2. Database for user balance
3. Code for commented lines
4. Return status and amounts

**Still not working?** Review `REFUND_FIX.md` for details.

---

**Version:** 1.0.0  
**Date:** 2025-01-07  
**Status:** Ready for Testing

