const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String },
    contactNumber: { type: String },
    address: { type: String },
    notes: { type: String },
    productName: { type: String },
    productQuantity: { type: Number, default: 0 },
    productPrice: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Supplier', supplierSchema);
