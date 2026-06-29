const Return = require('../models/Return');
const Sale = require('../models/Sale');
const Product = require('../models/Product');

// ─────────────────────────────────────────────
// @route   POST /api/returns
// @desc    Submit a return/refund request
// @access  Protected
// ─────────────────────────────────────────────
const createReturn = async (req, res) => {
    try {
        const { saleId, returnedItems, reason } = req.body;

        // Validate required fields
        if (!saleId) return res.status(400).json({ error: 'saleId is required' });
        if (!reason || reason.trim() === '') return res.status(400).json({ error: 'Reason is required' });
        if (!returnedItems || !Array.isArray(returnedItems) || returnedItems.length === 0) {
            return res.status(400).json({ error: 'returnedItems must be a non-empty array' });
        }

        // Find the original sale
        const sale = await Sale.findById(saleId);
        if (!sale) return res.status(404).json({ error: 'Original sale not found' });

        // Validate each returned item exists in the original sale
        const enrichedItems = [];
        let refundAmount = 0;

        for (const retItem of returnedItems) {
            const originalItem = sale.items.find(
                i => i.productId.toString() === retItem.productId
            );
            if (!originalItem) {
                return res.status(400).json({
                    error: `Product ${retItem.productId} was not part of the original sale`,
                });
            }
            if (retItem.quantity > originalItem.quantity) {
                return res.status(400).json({
                    error: `Return quantity (${retItem.quantity}) exceeds original sold quantity (${originalItem.quantity}) for ${originalItem.productName}`,
                });
            }

            const subtotal = retItem.quantity * originalItem.unitPrice;
            refundAmount += subtotal;

            enrichedItems.push({
                productId: originalItem.productId,
                productName: originalItem.productName,
                quantity: retItem.quantity,
                unitPrice: originalItem.unitPrice,
                subtotal,
            });
        }

        // Create the return record (status: pending — awaiting approval)
        const returnRecord = await Return.create({
            saleId,
            customerId: sale.customerId,
            returnedItems: enrichedItems,
            refundAmount,
            reason,
            status: 'pending',
            processedBy: req.user.id,
            processedByModel: req.user.role === 'admin' ? 'Admin' : 'SalesStaff',
        });

        res.status(201).json({
            message: 'Return request submitted. Awaiting approval.',
            return: returnRecord,
        });
    } catch (error) {
        console.error('createReturn error:', error.message);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
};

// ─────────────────────────────────────────────
// @route   GET /api/returns
// @desc    Get all return requests
// @access  Protected
// ─────────────────────────────────────────────
const getReturns = async (req, res) => {
    try {
        const { status } = req.query;
        const filter = {};
        if (status) filter.status = status;

        const returns = await Return.find(filter)
            .populate('saleId', 'invoiceNumber finalAmount')
            .populate('customerId', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json(returns);
    } catch (error) {
        console.error('getReturns error:', error.message);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
};

// ─────────────────────────────────────────────
// @route   GET /api/returns/:id
// @desc    Get a single return by ID
// @access  Protected
// ─────────────────────────────────────────────
const getReturnById = async (req, res) => {
    try {
        const returnRecord = await Return.findById(req.params.id)
            .populate('saleId')
            .populate('customerId', 'name email phone');

        if (!returnRecord) return res.status(404).json({ error: 'Return record not found' });

        res.status(200).json(returnRecord);
    } catch (error) {
        console.error('getReturnById error:', error.message);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
};

// ─────────────────────────────────────────────
// @route   PUT /api/returns/:id/approve
// @desc    Approve a return → restores stock
// @access  Protected (admin only)
// ─────────────────────────────────────────────
const approveReturn = async (req, res) => {
    try {
        const returnRecord = await Return.findById(req.params.id);
        if (!returnRecord) return res.status(404).json({ error: 'Return record not found' });

        if (returnRecord.status !== 'pending') {
            return res.status(400).json({ error: `Return is already ${returnRecord.status}` });
        }

        // Restore product stock
        for (const item of returnRecord.returnedItems) {
            await Product.findByIdAndUpdate(item.productId, {
                $inc: { stock: item.quantity },
            });
        }

        // Mark original sale as refunded
        await Sale.findByIdAndUpdate(returnRecord.saleId, {
            paymentStatus: 'refunded',
        });

        returnRecord.status = 'approved';
        returnRecord.resolutionNote = req.body.resolutionNote || 'Approved';
        returnRecord.processedBy = req.user.id;
        returnRecord.processedByModel = req.user.role === 'admin' ? 'Admin' : 'SalesStaff';
        await returnRecord.save();

        res.status(200).json({
            message: 'Return approved. Stock restored.',
            return: returnRecord,
        });
    } catch (error) {
        console.error('approveReturn error:', error.message);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
};

// ─────────────────────────────────────────────
// @route   PUT /api/returns/:id/reject
// @desc    Reject a return request
// @access  Protected (admin only)
// ─────────────────────────────────────────────
const rejectReturn = async (req, res) => {
    try {
        const returnRecord = await Return.findById(req.params.id);
        if (!returnRecord) return res.status(404).json({ error: 'Return record not found' });

        if (returnRecord.status !== 'pending') {
            return res.status(400).json({ error: `Return is already ${returnRecord.status}` });
        }

        returnRecord.status = 'rejected';
        returnRecord.resolutionNote = req.body.resolutionNote || 'Rejected';
        await returnRecord.save();

        res.status(200).json({ message: 'Return rejected', return: returnRecord });
    } catch (error) {
        console.error('rejectReturn error:', error.message);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
};

module.exports = {
    createReturn,
    getReturns,
    getReturnById,
    approveReturn,
    rejectReturn,
};
