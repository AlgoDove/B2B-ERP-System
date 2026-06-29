const mongoose = require('mongoose');

/**
 * Return Model
 * Handles refunds and product returns linked to an original sale.
 * When a return is approved, inventory is restored automatically.
 */
const returnSchema = new mongoose.Schema(
    {
        // Reference to the original sale
        saleId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Sale',
            required: [true, 'Sale ID is required'],
        },

        // Reference to the customer
        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Customer',
            required: [true, 'Customer ID is required'],
        },

        // Items being returned (subset of original sale items)
        returnedItems: [
            {
                productId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Product',
                    required: true,
                },
                productName: { type: String, required: true },
                quantity: {
                    type: Number,
                    required: true,
                    min: [1, 'Return quantity must be at least 1'],
                },
                unitPrice: { type: Number, required: true },
                subtotal: { type: Number, required: true },
            },
        ],

        // Total refund amount
        refundAmount: {
            type: Number,
            required: true,
            min: [0, 'Refund amount cannot be negative'],
        },

        // Reason for return
        reason: {
            type: String,
            required: [true, 'Return reason is required'],
            trim: true,
        },

        // Current status of the return request
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending',
        },

        // Admin/staff note on decision
        resolutionNote: {
            type: String,
            default: '',
        },

        // Who processed the return
        processedBy: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: 'processedByModel',
        },
        processedByModel: {
            type: String,
            enum: ['Admin', 'SalesStaff'],
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Return', returnSchema);
