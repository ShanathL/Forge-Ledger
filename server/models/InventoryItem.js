// server/models/InventoryItem.js
const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true
    },
    sku: {
      type: String,
      required: true,
      trim: true
    },
    name: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    unit: {
      type: String,
      default: 'pcs',
      trim: true
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    purchasePrice: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    sellingPrice: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    gstRate: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      max: 100
    }
  },
  {
    timestamps: true
  }
);

inventoryItemSchema.index({ companyId: 1, sku: 1 }, { unique: true });

module.exports = mongoose.model('InventoryItem', inventoryItemSchema);
