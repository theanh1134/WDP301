# Checkout 500 Error - Fix Guide

## Problem
The checkout process was failing with a 500 Internal Server Error. The error was not providing enough details to identify the root cause.

## Root Causes Identified

### 1. **Phone Number Validation**
- **Issue**: The backend Order schema requires phone numbers to match the pattern `/^[0-9]{10,11}$/` (10-11 digits only)
- **Problem**: Frontend might be sending phone numbers with formatting characters (spaces, dashes, parentheses)
- **Fix**: Strip all non-digit characters from phone number before sending to backend

### 2. **Missing Required Fields**
- **Issue**: Backend expects specific fields in the request payload
- **Problem**: Missing or improperly formatted fields could cause validation errors
- **Fix**: Added validation on both frontend and backend to ensure all required fields are present

### 3. **Poor Error Handling**
- **Issue**: Generic 500 errors without detailed information
- **Problem**: Difficult to debug what's actually failing
- **Fix**: Enhanced error logging and detailed error messages

## Changes Made

### Frontend Changes (`src/component/Checkout.js`)

1. **Phone Number Validation**
   ```javascript
   // Strip non-digit characters from phone number
   const phoneDigits = formData.phone.replace(/\D/g, '');
   if (phoneDigits.length < 10 || phoneDigits.length > 11) {
       alert('Số điện thoại phải có 10-11 chữ số');
       return;
   }
   ```

2. **Data Sanitization**
   ```javascript
   const payload = {
       fullName: formData.fullName.trim(),
       shippingAddress: {
           recipientName: formData.fullName.trim(),
           phoneNumber: phoneDigits, // Only digits
           fullAddress: [formData.address, formData.ward, formData.district, formData.city, formData.country].filter(Boolean).join(', ')
       },
       paymentMethod: paymentMethod.toUpperCase(),
       note: formData.notes || '',
       email: userData?.email || user?.email || ''
   };
   ```

3. **Enhanced Error Logging**
   ```javascript
   console.error('Error details:', {
       message: error.message,
       status: error.response?.status,
       data: error.response?.data,
       stack: error.stack
   });
   ```

4. **Better Error Messages**
   - Now shows specific error messages from backend
   - Falls back to generic message if no specific error available

### Backend Changes (`backend/controllers/orderController.js`)

1. **Request Validation**
   ```javascript
   // Validate required fields
   if (!shippingAddress) {
       return res.status(400).json({ message: 'Shipping address is required' });
   }

   if (!shippingAddress.recipientName || !shippingAddress.phoneNumber || !shippingAddress.fullAddress) {
       return res.status(400).json({ 
           message: 'Missing required shipping address fields',
           details: {
               recipientName: !shippingAddress.recipientName,
               phoneNumber: !shippingAddress.phoneNumber,
               fullAddress: !shippingAddress.fullAddress
           }
       });
   }
   ```

2. **Enhanced Order Creation Error Handling**
   ```javascript
   try {
       savedOrder = await newOrder.save();
   } catch (saveError) {
       if (saveError.name === 'ValidationError') {
           const validationErrors = Object.keys(saveError.errors).map(key => ({
               field: key,
               message: saveError.errors[key].message
           }));
           return res.status(400).json({
               message: 'Order validation failed',
               errors: validationErrors,
               details: saveError.message
           });
       }
       throw saveError;
   }
   ```

3. **Detailed Logging**
   - Added JSON.stringify for complex objects
   - Log full request body
   - Log order data before saving
   - Log validation errors with field details

## How to Test

### 1. Start Backend Server
```bash
cd backend
npm start
```
The server should be running on `http://localhost:9999`

### 2. Start Frontend
```bash
cd CraftVillages
npm start
```
The app should be running on `http://localhost:3000`

### 3. Test Checkout Process

#### Test Case 1: Valid Checkout
1. Login to the application
2. Add products to cart
3. Select products for checkout
4. Go to checkout page
5. Fill in all required fields:
   - Full Name
   - Address, Ward, District, City
   - Phone (10-11 digits, can include formatting)
   - Payment method
6. Submit order
7. **Expected**: Order should be created successfully and redirect to success page

#### Test Case 2: Invalid Phone Number
1. Follow steps 1-4 from Test Case 1
2. Enter phone number with less than 10 digits (e.g., "123456789")
3. Submit order
4. **Expected**: Alert message "Số điện thoại phải có 10-11 chữ số"

#### Test Case 3: Missing Required Fields
1. Follow steps 1-4 from Test Case 1
2. Leave some required fields empty
3. Submit order
4. **Expected**: Form validation should prevent submission

### 4. Check Console Logs

#### Frontend Console (Browser DevTools)
Look for:
- "Checkout payload:" - Shows the data being sent
- "User ID:" - Confirms user is logged in
- "Cart detail:" - Shows cart contents
- Any error messages with detailed information

#### Backend Console (Terminal)
Look for:
- "Checkout request:" - Shows received data
- "Full request body:" - Complete payload
- "Found cart: Yes/No" - Cart lookup result
- "Creating order with data:" - Order data before save
- "Order created successfully:" - Success confirmation
- Any validation errors with field details

## Common Issues and Solutions

### Issue 1: "Cart not found for this user"
**Cause**: User doesn't have an active cart
**Solution**: Add items to cart before checkout

### Issue 2: "Vui lòng chọn ít nhất một sản phẩm để thanh toán"
**Cause**: No items selected in cart
**Solution**: Select at least one item in cart before checkout

### Issue 3: "Sản phẩm [name] không đủ số lượng trong kho"
**Cause**: Insufficient inventory
**Solution**: Reduce quantity or choose different product

### Issue 4: "Order validation failed"
**Cause**: Data doesn't match Order schema requirements
**Solution**: Check the validation errors in the response for specific field issues

### Issue 5: Phone number validation error
**Cause**: Phone number doesn't have 10-11 digits
**Solution**: Enter a valid Vietnamese phone number (10-11 digits)

## Debugging Tips

1. **Check Backend Logs First**: The backend now logs detailed information about what's failing
2. **Check Browser Console**: Frontend logs show the exact payload being sent
3. **Verify User is Logged In**: Check localStorage for user object
4. **Verify Cart Has Items**: Check cart API response
5. **Check Network Tab**: Look at the actual request/response in browser DevTools

## Next Steps

If the error persists:
1. Check the backend console for the exact error message
2. Look for validation errors in the response
3. Verify all required fields are being sent correctly
4. Check that the phone number is in the correct format
5. Ensure the user has an active cart with selected items

