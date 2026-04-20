const Supplier = require('../models/Supplier');

const createSupplier = async (req, res) => {
    try {
        const supplier = await Supplier.create(req.body);
        res.status(201).json(supplier);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getSuppliers = async (req, res) => {
    try {
        const suppliers = await Supplier.find({}).sort({ createdAt: -1 });
        res.json(suppliers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateSupplier = async (req, res) => {
    try {
        const supplier = await Supplier.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!supplier) {
            return res.status(404).json({ message: 'Supplier not found' });
        }

        res.json(supplier);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteSupplier = async (req, res) => {
    try {
        const supplier = await Supplier.findByIdAndDelete(req.params.id);

        if (!supplier) {
            return res.status(404).json({ message: 'Supplier not found' });
        }

        res.json({ message: 'Supplier removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createSupplier,
    getSuppliers,
    updateSupplier,
    deleteSupplier
};
