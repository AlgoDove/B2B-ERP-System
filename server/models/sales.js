const mongoose = require('mongoose');

/**
 * Sale Item Sub-Schema
 * Each item in the sale has a product reference, quantity, and price.
 */
const saleItemSchema = new mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: [true, 'Product ID is required'],
        },
        productName: {
            type: String,
            required: true, // snapshot at time of sale
        },
        quantity: {
            type: Number,
            required: [true, 'Quantity is required'],
            min: [1, 'Quantity must be at least 1'],
        },
        unitPrice: {
            type: Number,
            required: [true, 'Unit price is required'],
            min: [0, 'Unit price cannot be negative'],
        },
        subtotal: {
            type: Number,
            required: true, // quantity × unitPrice
        },
    },
    { _id: false }
);

/**
 * Sale Model
 * Represents a complete sales transaction (invoice).
 */
const saleSchema = new mongoose.Schema(
    {
        invoiceNumber: {
            type: String,
            unique: true,
            // auto-generated before save (see pre-save hook)
        },

        // Reference to the B2B customer
        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Customer',
            required: [true, 'Customer ID is required'],
        },

        // Array of purchased items
        items: {
            type: [saleItemSchema],
            validate: {
                validator: (arr) => arr.length > 0,
                message: 'At least one item is required',
            },
        },

        // Sum of all item subtotals (before discount)
        totalAmount: {
            type: Number,
            required: true,
            min: [0, 'Total amount cannot be negative'],
        },

        // Discount amount (in currency, not %)
        discount: {
            type: Number,
            default: 0,
            min: [0, 'Discount cannot be negative'],
        },

        // totalAmount - discount
        finalAmount: {
            type: Number,
            required: true,
            min: [0, 'Final amount cannot be negative'],
        },

        // How the customer paid
        paymentMethod: {
            type: String,
            enum: {
                values: ['cash', 'card', 'credit'],
                message: 'Payment method must be cash, card, or credit',
            },
            required: [true, 'Payment method is required'],
        },

        // Payment state
        paymentStatus: {
            type: String,
            enum: ['pending', 'paid', 'partial', 'refunded'],
            default: 'pending',
        },

        // Notes / special instructions
        notes: {
            type: String,
            default: '',
        },

        // Who created this sale (SalesStaff or Admin)
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: 'createdByModel',
        },
        createdByModel: {
            type: String,
            enum: ['Admin', 'SalesStaff'],
        },
    },
    { timestamps: true } // adds createdAt and updatedAt automatically
);

/**
 * Pre-save hook: auto-generate invoice number
 * Format: INV-YYYYMMDD-XXXX (e.g. INV-20240316-0001)
 */
saleSchema.pre('save', async function (next) {
    if (!this.invoiceNumber) {
        const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const count = await mongoose.model('Sale').countDocuments();
        this.invoiceNumber = `INV-${today}-${String(count + 1).padStart(4, '0')}`;
    }
    next();
});

module.exports = mongoose.model('Sale', saleSchema);
