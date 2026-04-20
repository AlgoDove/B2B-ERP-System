const express = require('express');
const router = express.Router();
const {
    createProduct,
    getProducts,
    updateProduct,
    deleteProduct,
    updateStock,
    getLowStockProducts
} = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/auth');

router.route('/')
    .get(protect, getProducts)
    .post(protect, createProduct);

router.get('/low-stock', protect, getLowStockProducts);

router.route('/:id')
    .put(protect, updateProduct)
    .delete(protect, adminOnly, deleteProduct);

router.patch('/:id/stock', protect, updateStock);

module.exports = router;
