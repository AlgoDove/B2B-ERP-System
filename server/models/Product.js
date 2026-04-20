const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    sku: { type: String, required: true, unique: true },
    description: { type: String },
    category: { type: String },
    imageUrl: { type: String, default: '' },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 0 },
    reorderLevel: { type: Number, required: true, default: 10 },
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
    status: { type: String, enum: ['InStock', 'LowStock', 'OutOfStock'], default: 'OutOfStock' },
    lowStockFlag: { type: Boolean, default: true }
}, { timestamps: true });

// Keep stock status derived from quantity/reorder level.
productSchema.pre('save', function (next) {
    if (this.quantity <= 0) {
        this.status = 'OutOfStock';
        this.lowStockFlag = true;
    } else if (this.quantity <= this.reorderLevel) {
        this.status = 'LowStock';
        this.lowStockFlag = true;
    } else {
        this.status = 'InStock';
        this.lowStockFlag = false;
    }
    next();
});

module.exports = mongoose.model('Product', productSchema);
