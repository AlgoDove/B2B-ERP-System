const mongoose = require('mongoose');
const Product = require('../models/Product');
const Supplier = require('../models/Supplier');
const Notification = require('../models/Notification');

const normalizeText = (value = '') => String(value).trim().toLowerCase();

const validateSupplierAssignment = async (supplierId, productName) => {
    if (Array.isArray(supplierId)) {
        return { valid: false, message: 'A product can be assigned to only one supplier.' };
    }

    if (!supplierId) {
        return { valid: false, message: 'Supplier is required.' };
    }

    if (!mongoose.Types.ObjectId.isValid(String(supplierId))) {
        return { valid: false, message: 'Supplier id is invalid.' };
    }

    const supplier = await Supplier.findById(supplierId).select('name productName');
    if (!supplier) {
        return { valid: false, message: 'Selected supplier does not exist.' };
    }

    const supplierProductName = normalizeText(supplier.productName);
    const incomingProductName = normalizeText(productName);

    if (supplierProductName && incomingProductName && supplierProductName !== incomingProductName) {
        return {
            valid: false,
            message: `Product ${productName} does not belong to supplier ${supplier.name}.`
        };
    }

    return { valid: true };
};

const checkAndCreateNotification = async (product, force = false) => {
    if (product.status === 'InStock' && !force) return;

    if (product.status === 'LowStock' || product.status === 'OutOfStock') {
        const message = product.status === 'OutOfStock'
            ? `Product ${product.name} (SKU: ${product.sku}) is out of stock.`
            : `Product ${product.name} (SKU: ${product.sku}) is running low on stock (${product.quantity} left).`;

        const existing = await Notification.findOne({
            productId: product._id,
            type: product.status,
            isRead: false
        });

        if (!existing) {
            await Notification.create({
                productId: product._id,
                type: product.status,
                message
            });
        }
    }
};

const createProduct = async (req, res) => {
    try {
        const supplierValidation = await validateSupplierAssignment(req.body.supplier, req.body.name);
        if (!supplierValidation.valid) {
            return res.status(400).json({ message: supplierValidation.message });
        }

        const product = await Product.create(req.body);
        await checkAndCreateNotification(product);

        const populated = await Product.findById(product._id).populate('supplier', 'name email');
        res.status(201).json(populated);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getProducts = async (req, res) => {
    try {
        const products = await Product.find({})
            .populate('supplier', 'name email')
            .sort({ createdAt: -1 });

        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (
            Object.prototype.hasOwnProperty.call(req.body, 'supplier') ||
            Object.prototype.hasOwnProperty.call(req.body, 'name')
        ) {
            const nextSupplier = Object.prototype.hasOwnProperty.call(req.body, 'supplier')
                ? req.body.supplier
                : product.supplier;
            const nextProductName = Object.prototype.hasOwnProperty.call(req.body, 'name')
                ? req.body.name
                : product.name;

            const supplierValidation = await validateSupplierAssignment(nextSupplier, nextProductName);
            if (!supplierValidation.valid) {
                return res.status(400).json({ message: supplierValidation.message });
            }
        }

        Object.assign(product, req.body);
        await product.save();
        await checkAndCreateNotification(product);

        const populated = await Product.findById(product._id).populate('supplier', 'name email');
        res.json(populated);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        await Notification.deleteMany({ productId: product._id });
        res.json({ message: 'Product removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateStock = async (req, res) => {
    try {
        const { quantity, isDelta } = req.body;
        const parsedQty = Number(quantity);

        if (Number.isNaN(parsedQty)) {
            return res.status(400).json({ message: 'Quantity must be a number' });
        }

        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const oldStatus = product.status;

        if (isDelta) {
            product.quantity = Math.max(0, product.quantity + parsedQty);
        } else {
            if (parsedQty < 0) {
                return res.status(400).json({ message: 'Quantity cannot be negative' });
            }
            product.quantity = parsedQty;
        }

        await product.save();

        if (product.status !== oldStatus) {
            await checkAndCreateNotification(product, true);
        }

        const populated = await Product.findById(product._id).populate('supplier', 'name email');
        res.json(populated);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getLowStockProducts = async (req, res) => {
    try {
        const products = await Product.find({ status: { $in: ['LowStock', 'OutOfStock'] } })
            .populate('supplier', 'name email')
            .sort({ updatedAt: -1 });

        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createProduct,
    getProducts,
    updateProduct,
    deleteProduct,
    updateStock,
    getLowStockProducts
};
