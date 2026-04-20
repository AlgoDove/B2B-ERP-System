const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    type: { type: String, enum: ['LowStock', 'OutOfStock'], required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
