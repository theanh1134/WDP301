const Return = require('../models/return');
const User = require('../models/User');


const getAllReturns = async (req, res) => {
  try {
    const returns = await Return.find()
      .populate({
        path: 'orderId',
        select: 'orderCode totalAmount paymentStatus createdAt'
      })
      .populate({
        path: 'buyerId',
        select: 'fullName email phoneNumber'
      })
      .populate({
        path: 'shopId',
        select: 'shopName ownerName contactNumber'
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: returns.length,
      data: returns
    });
  } catch (error) {
    console.error('Error fetching returns:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching return data',
      error: error.message
    });
  }
};

const getReturnById = async (req, res) => {
  try {
    const { id } = req.params;

    // Tìm đơn hoàn hàng theo ID
    const returnDetail = await Return.findById(id)
      .populate({
        path: 'orderId',
        select: 'orderCode totalAmount paymentStatus createdAt'
      })
      .populate({
        path: 'buyerId',
        select: 'fullName email phoneNumber address'
      })
      .populate({
        path: 'shopId',
        select: 'shopName ownerName contactNumber address'
      })
      .populate({
        path: 'items.productId',
        select: 'name images sku' // Populate sản phẩm (nếu cần)
      });

    if (!returnDetail) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hoàn hàng với ID này.'
      });
    }

    res.status(200).json({
      success: true,
      data: returnDetail
    });
  } catch (error) {
    console.error('Error fetching return detail:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy chi tiết đơn hoàn hàng',
      error: error.message
    });
  }
};


const updateReturnStatus = async (req, res, newStatus, note = '') => {
  try {
    const { id } = req.params;
    const staffId = req.user?._id; // giả sử middleware auth có gán user vào req.user

    const returnOrder = await Return.findById(id);
    if (!returnOrder) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hoàn hàng.' });
    }

    // Chỉ cho phép cập nhật nếu đang ở trạng thái REQUESTED
    if (returnOrder.status !== 'REQUESTED') {
      return res.status(400).json({
        success: false,
        message: `Không thể cập nhật. Đơn hoàn hàng hiện đang ở trạng thái ${returnOrder.status}.`
      });
    }

    // 💰 XỬ LÝ HOÀN TIỀN KHI DUYỆT ĐƠN HÀNG
    if (newStatus === 'APPROVED') {
      console.log(`💰 Processing refund for return ${id}...`);
      
      try {
        // Tính toán số tiền hoàn lại
        const itemsTotal = returnOrder.items.reduce((sum, item) => {
          return sum + (item.unitPrice * item.quantity);
        }, 0);
        
        // Số tiền hoàn lại = tổng tiền sản phẩm - phí ship (nếu có)
        const shippingFee = returnOrder.shippingFee || 0;
        const refundAmount = itemsTotal - shippingFee;
        
        console.log(`📋 Refund calculation:`, {
          itemsTotal: itemsTotal.toLocaleString(),
          shippingFee: shippingFee.toLocaleString(), 
          refundAmount: refundAmount.toLocaleString(),
          returnId: id
        });

        if (refundAmount > 0) {
          // Tìm user và cập nhật balance
          const user = await User.findById(returnOrder.buyerId);
          if (!user) {
            throw new Error('Không tìm thấy người dùng');
          }

          // Cập nhật balance
          await user.addBalance(refundAmount, `Hoàn tiền đơn hàng trả về ${returnOrder.rmaCode}`);

          // Cập nhật amounts trong returnOrder
          returnOrder.amounts = {
            subtotal: itemsTotal,
            shippingFee: shippingFee,
            restockingFee: 0,
            refundTotal: refundAmount,
            currency: 'VND'
          };

          console.log(`✅ Successfully added ${refundAmount.toLocaleString()} VND to user ${user._id} balance`);
        } else {
          console.warn(`⚠️ Refund amount is ${refundAmount}, no money will be added to balance`);
        }
      } catch (refundError) {
        console.error('❌ Error processing refund:', refundError);
        return res.status(500).json({
          success: false,
          message: 'Lỗi khi xử lý hoàn tiền: ' + refundError.message
        });
      }
    }

    // Cập nhật trạng thái chính
    returnOrder.status = newStatus;

    // Ghi lại lịch sử thay đổi trạng thái
    returnOrder.statusEvents.push({
      status: newStatus,
      at: new Date(),
      by: { type: 'SHOP_STAFF', id: staffId },
      note
    });

    // Nếu được duyệt -> có thể sinh thêm trạng thái kế tiếp (ví dụ tự động đặt lịch pickup)
    if (newStatus === 'APPROVED' && returnOrder.returnMethod === 'PICKUP') {
      returnOrder.status = 'APPROVED';
      // returnOrder.statusEvents.push({
      //   status: 'APPROVED',
      //   at: new Date(),
      //   by: { type: 'SYSTEM' },
      //   note: 'Đặt lịch lấy hàng'
      // });
    }

    await returnOrder.save();

    res.json({
      success: true,
      message: `Cập nhật trạng thái đơn hoàn hàng thành công (${newStatus}).`,
      data: returnOrder
    });
  } catch (error) {
    console.error('Lỗi cập nhật trạng thái:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
  }
};

// ✅ Xác nhận hoàn hàng
const approveReturn = async (req, res) => {
  await updateReturnStatus(req, res, 'APPROVED', req.body.note || 'Đơn hàng đã được duyệt.');
};

// ❌ Từ chối hoàn hàng
const rejectReturn = async (req, res) => {
  await updateReturnStatus(req, res, 'REJECTED', req.body.note || 'Đơn hàng bị từ chối.');
};

module.exports = { getAllReturns, getReturnById, approveReturn, rejectReturn };
