// server/models/RawMaterial.js
const mongoose = require('mongoose');

const rawMaterialSchema = new mongoose.Schema(
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
      required: [true, 'Material name is required'],
      trim: true
    },
    unit: {
      type: String,
      default: 'kg',
      trim: true
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    unitCost: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    }
  },
  {
    timestamps: true
  }
);

rawMaterialSchema.index({ companyId: 1, sku: 1 }, { unique: true });

module.exports = mongoose.model('RawMaterial', rawMaterialSchema);
