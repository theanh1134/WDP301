const mongoose = require('mongoose');

const EvidenceSchema = new mongoose.Schema({
  type: { type: String, enum: ['image', 'video', 'other'], required: true },
  url: { type: String, required: true }
});

const PickupAddressSchema = new mongoose.Schema({
  recipientName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  fullAddress: { type: String, required: true }
});

const DropoffSchema = new mongoose.Schema({
  carrierCode: { type: String, required: true },
  dropoffCode: { type: String, required: true },
  dropoffAddress: { type: String, required: true }
});

const ItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true }
});

const StatusEventSchema = new mongoose.Schema({
  status: { type: String, required: true },
  at: { type: Date, required: true },
  by: {
    type: {
      type: String, // USER | SHOP_STAFF | SYSTEM
      required: true
    },
    id: { type: mongoose.Schema.Types.ObjectId }
  },
  note: { type: String, default: '' }
});

const AmountsSchema = new mongoose.Schema({
  subtotal: { type: Number, required: true },
  shippingFee: { type: Number, default: 0 },
  restockingFee: { type: Number, default: 0 },
  refundTotal: { type: Number, required: true },
  currency: { type: String, default: 'VND' }
});

const ReturnSchema = new mongoose.Schema(
  {
    rmaCode: { type: String, required: true, unique: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },

    reasonCode: {
      type: String,
      enum: ['DAMAGED_ITEM', 'NOT_AS_DESCRIBED', 'WRONG_ITEM', 'OTHER'],
      required: true
    },
    reasonDetail: { type: String, default: '' },
    evidences: [EvidenceSchema],

    requestedResolution: {
      type: String,
      enum: ['REFUND', 'REPLACE', 'REPAIR'],
      required: true
    },
    refundMethod: {
      type: String,
      enum: ['ORIGINAL', 'MANUAL', null],
      default: null
    },
    returnMethod: {
      type: String,
      enum: ['PICKUP', 'DROP_OFF'],
      required: true
    },

    pickupAddress: { type: PickupAddressSchema },
    dropoff: { type: DropoffSchema },

    items: [ItemSchema],
    status: {
      type: String,
      enum: [
        'REQUESTED',
        'APPROVED',
        'REJECTED',
        'PICKUP_SCHEDULED',
        'RETURNED',
        'REFUNDED',
        'COMPLETED',
        'CANCELLED'
      ],
      required: true
    },
    statusEvents: [StatusEventSchema],

    amounts: { type: AmountsSchema, required: true }
  },
  {
    timestamps: true // auto create createdAt & updatedAt
  }
);

module.exports = mongoose.model('Return', ReturnSchema);
