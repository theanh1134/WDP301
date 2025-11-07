# WITHDRAWAL FEATURE - TEST CASES

## 🧪 Test Cases cho Tính năng Rút tiền đã cải thiện

### 1. TEST MONGODB TRANSACTION (Race Condition Prevention)

#### Test Case 1.1: Rút tiền đồng thời
**Mục đích:** Kiểm tra transaction có ngăn chặn race condition không

**Setup:**
- User có balance: 1,000,000 VND
- Gửi 2 requests rút tiền đồng thời:
  - Request 1: 800,000 VND
  - Request 2: 800,000 VND

**Expected Result:**
- ✅ Chỉ 1 request thành công
- ✅ Request còn lại bị reject với lỗi "Insufficient balance"
- ✅ Balance cuối cùng = 1,000,000 - 800,000 - fee (không âm)

**Test Script:**
```javascript
// Test với Postman hoặc script
const axios = require('axios');

async function testRaceCondition() {
    const userId = 'YOUR_USER_ID';
    const payload = {
        userId,
        amount: 800000,
        bankInfo: {
            bankName: 'Vietcombank',
            accountNumber: '1234567890',
            accountHolderName: 'NGUYEN VAN A'
        }
    };
    
    // Send 2 requests simultaneously
    const [result1, result2] = await Promise.allSettled([
        axios.post('http://localhost:9999/api/withdrawals', payload),
        axios.post('http://localhost:9999/api/withdrawals', payload)
    ]);
    
    console.log('Request 1:', result1.status, result1.value?.data);
    console.log('Request 2:', result2.status, result2.value?.data);
}
```

---

### 2. TEST RATE LIMITING

#### Test Case 2.1: Giới hạn 5 lần/ngày
**Mục đích:** Kiểm tra rate limiting middleware

**Setup:**
- User có balance đủ lớn
- Gửi 6 requests rút tiền trong cùng 1 ngày

**Expected Result:**
- ✅ 5 requests đầu thành công
- ✅ Request thứ 6 bị reject với status 429
- ✅ Error message: "Bạn đã đạt giới hạn 5 lần rút tiền mỗi ngày"
- ✅ Response có `resetAt` timestamp

**Test với cURL:**
```bash
# Request 1-5 (should succeed)
for i in {1..5}; do
  curl -X POST http://localhost:9999/api/withdrawals \
    -H "Content-Type: application/json" \
    -d '{
      "userId": "YOUR_USER_ID",
      "amount": 100000,
      "bankInfo": {
        "bankName": "Vietcombank",
        "accountNumber": "1234567890",
        "accountHolderName": "NGUYEN VAN A"
      }
    }'
  echo "\n--- Request $i completed ---\n"
done

# Request 6 (should fail)
curl -X POST http://localhost:9999/api/withdrawals \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "YOUR_USER_ID",
    "amount": 100000,
    "bankInfo": {
      "bankName": "Vietcombank",
      "accountNumber": "1234567890",
      "accountHolderName": "NGUYEN VAN A"
    }
  }'
```

---

### 3. TEST AVAILABLE BALANCE CALCULATION

#### Test Case 3.1: Rút tiền khi có pending withdrawals
**Mục đích:** Kiểm tra available balance calculation

**Setup:**
- User có balance: 2,000,000 VND
- Có 1 pending withdrawal: 500,000 VND (nếu hệ thống có PENDING status)
- Gửi request rút: 1,600,000 VND

**Expected Result:**
- ✅ Request bị reject
- ✅ Error: "Số dư khả dụng không đủ"
- ✅ Response details:
  ```json
  {
    "currentBalance": 2000000,
    "pendingWithdrawals": 500000,
    "availableBalance": 1500000,
    "requestedAmount": 1600000,
    "shortfall": 100000
  }
  ```

---

### 4. TEST DYNAMIC FEE CALCULATION

#### Test Case 4.1: Percentage Fee (1%)
**Mục đích:** Kiểm tra tính phí động

**Setup:**
- Active fee config: PERCENTAGE, 1%, min=5000, max=50000
- User tier: NORMAL

**Test Data:**
| Amount | Expected Fee | Calculation |
|--------|--------------|-------------|
| 100,000 | 5,000 | max(1% × 100k, 5k) = 5k |
| 500,000 | 5,000 | 1% × 500k = 5k |
| 1,000,000 | 10,000 | 1% × 1M = 10k |
| 10,000,000 | 50,000 | min(1% × 10M, 50k) = 50k |

**Test Script:**
```javascript
const WithdrawalFeeConfig = require('../models/WithdrawalFeeConfig');

async function testFeeCalculation() {
    const testCases = [
        { amount: 100000, expected: 5000 },
        { amount: 500000, expected: 5000 },
        { amount: 1000000, expected: 10000 },
        { amount: 10000000, expected: 50000 }
    ];
    
    for (const test of testCases) {
        const fee = await WithdrawalFeeConfig.calculateFee(test.amount, 'NORMAL');
        console.log(`Amount: ${test.amount}, Fee: ${fee}, Expected: ${test.expected}, Pass: ${fee === test.expected}`);
    }
}
```

#### Test Case 4.2: VIP Exemption
**Setup:**
- User tier: VIP hoặc PLATINUM

**Expected Result:**
- ✅ Fee = 0 cho mọi amount

---

### 5. TEST VALIDATION

#### Test Case 5.1: Minimum Amount
**Input:** amount = 500 VND
**Expected:** ❌ Error: "Số tiền rút tối thiểu là 1.000 VNĐ"

#### Test Case 5.2: Maximum Amount
**Input:** amount = 60,000,000 VND
**Expected:** ❌ Error: "Số tiền rút tối đa là 50.000.000 VNĐ mỗi giao dịch"

#### Test Case 5.3: Invalid Bank Account
**Input:** accountNumber = "123" (too short)
**Expected:** ❌ Error: "Số tài khoản chỉ được chứa số và có độ dài 6-20 ký tự"

#### Test Case 5.4: Missing Bank Info
**Input:** bankInfo.accountHolderName = ""
**Expected:** ❌ Error: "Thiếu thông tin ngân hàng bắt buộc: accountHolderName"

---

### 6. TEST MINIMUM BALANCE REQUIREMENT

#### Test Case 6.1: Giữ lại số dư tối thiểu
**Setup:**
- MIN_BALANCE_REQUIRED = 10,000 VND (set in .env)
- User balance: 100,000 VND
- Request amount: 95,000 VND

**Expected Result:**
- ✅ Request bị reject
- ✅ Error: "Bạn phải giữ lại tối thiểu 10,000 VNĐ trong tài khoản"

---

### 7. TEST ERROR HANDLING

#### Test Case 7.1: User không tồn tại
**Input:** userId = "invalid_id"
**Expected:** 
- Status: 404
- Error: "Không tìm thấy người dùng"

#### Test Case 7.2: Insufficient Balance
**Setup:**
- User balance: 50,000 VND
- Request amount: 100,000 VND

**Expected:**
- Status: 400
- Error: "Số dư khả dụng không đủ"
- Details có shortfall amount

---

## 🚀 HƯỚNG DẪN CHẠY TESTS

### 1. Setup Environment
```bash
cd backend

# Install dependencies
npm install

# Setup .env
echo "WITHDRAWAL_DAILY_LIMIT=5" >> .env
echo "MAX_PENDING_WITHDRAWALS=3" >> .env
echo "MIN_BALANCE_REQUIRED=10000" >> .env
```

### 2. Seed Fee Config
```bash
node scripts/seedWithdrawalFeeConfig.js
```

### 3. Manual Testing với Postman

**Import Collection:**
- Create new collection "Withdrawal Tests"
- Add requests theo test cases trên

**Example Request:**
```
POST http://localhost:9999/api/withdrawals
Content-Type: application/json

{
  "userId": "{{userId}}",
  "amount": 500000,
  "bankInfo": {
    "bankName": "Vietcombank",
    "accountNumber": "1234567890123",
    "accountHolderName": "NGUYEN VAN A",
    "branchName": "Ha Noi"
  }
}
```

### 4. Automated Testing (Optional)

Nếu muốn viết automated tests với Jest/Mocha:

```bash
npm install --save-dev jest supertest

# Create test file
# tests/withdrawal.test.js

# Run tests
npm test
```

---

## ✅ CHECKLIST

- [ ] Transaction prevents race condition
- [ ] Rate limiting works (5/day)
- [ ] Available balance calculated correctly
- [ ] Dynamic fee calculation works
- [ ] VIP exemption works
- [ ] All validations work
- [ ] Minimum balance requirement works
- [ ] Error handling comprehensive
- [ ] Logging is clear and helpful
- [ ] Response format consistent

---

## 📝 NOTES

1. **MongoDB Transaction Requirements:**
   - MongoDB phải chạy ở replica set mode để hỗ trợ transactions
   - Nếu local development, có thể skip transaction bằng cách comment out session code

2. **Rate Limit Reset:**
   - Reset vào 00:00 mỗi ngày
   - Có thể clear manually bằng cách xóa withdrawal records trong DB

3. **Fee Config:**
   - Chỉ có 1 config active tại 1 thời điểm
   - Có thể switch giữa FIXED/PERCENTAGE/TIERED bằng cách update `isActive`

4. **Performance:**
   - Transaction có thể làm chậm request (~50-100ms)
   - Acceptable trade-off cho data consistency

