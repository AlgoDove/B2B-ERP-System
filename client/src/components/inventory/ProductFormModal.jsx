import { useState } from 'react';
import { ImagePlus, Trash2, X } from 'lucide-react';
import { createProduct, updateProduct } from '../../services/inventoryApi';
import AlertBanner from './AlertBanner';

const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Failed to read image'));
    reader.readAsDataURL(file);
});

const compressImage = (file) => new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
        const canvas = document.createElement('canvas');
        const maxWidth = 1400;
        const maxHeight = 1400;

        let { width, height } = image;
        if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
        }

        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext('2d');
        if (!context) {
            URL.revokeObjectURL(objectUrl);
            reject(new Error('Failed to process image'));
            return;
        }

        context.drawImage(image, 0, 0, width, height);
        const compressedData = canvas.toDataURL('image/jpeg', 0.82);
        URL.revokeObjectURL(objectUrl);
        resolve(compressedData);
    };

    image.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Failed to process image'));
    };

    image.src = objectUrl;
});

export default function ProductFormModal({ product, suppliers, onClose, onSave }) {
    const [formData, setFormData] = useState({
        name: product?.name || '',
        sku: product?.sku || '',
        description: product?.description || '',
        category: product?.category || '',
        imageUrl: product?.imageUrl || '',
        price: product?.price || 0,
        quantity: product?.quantity || 0,
        reorderLevel: product?.reorderLevel || 10,
        supplier: product?.supplier?._id || product?.supplier || ''
    });
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const validateForm = () => {
        const nextErrors = {};

        const name = String(formData.name || '').trim();
        const sku = String(formData.sku || '').trim().toUpperCase();
        const category = String(formData.category || '').trim();
        const description = String(formData.description || '').trim();
        const price = Number(formData.price);
        const quantity = Number(formData.quantity);
        const reorderLevel = Number(formData.reorderLevel);

        if (!name) {
            nextErrors.name = 'Product name is required.';
        } else if (name.length < 2 || name.length > 80) {
            nextErrors.name = 'Product name must be 2 to 80 characters.';
        }

        if (!sku) {
            nextErrors.sku = 'SKU is required.';
        } else if (!/^[A-Z0-9_-]{2,30}$/.test(sku)) {
            nextErrors.sku = 'SKU must be 2 to 30 chars (A-Z, 0-9, _, -).';
        }

        if (category.length > 50) {
            nextErrors.category = 'Category cannot exceed 50 characters.';
        }

        if (description.length > 500) {
            nextErrors.description = 'Description cannot exceed 500 characters.';
        }

        if (!Number.isFinite(price) || price < 0) {
            nextErrors.price = 'Price must be a valid non-negative number.';
        }

        if (!product && (!Number.isFinite(quantity) || quantity < 0 || !Number.isInteger(quantity))) {
            nextErrors.quantity = 'Initial quantity must be a non-negative whole number.';
        }

        if (!Number.isFinite(reorderLevel) || reorderLevel < 0 || !Number.isInteger(reorderLevel)) {
            nextErrors.reorderLevel = 'Reorder level must be a non-negative whole number.';
        }

        if (!formData.supplier) {
            nextErrors.supplier = 'Supplier is required.';
        }

        return {
            isValid: Object.keys(nextErrors).length === 0,
            nextErrors,
            normalized: {
                ...formData,
                name,
                sku,
                category,
                description,
                price,
                quantity: Number.isFinite(quantity) ? quantity : 0,
                reorderLevel
            }
        };
    };

    const onUploadImage = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setError('Please select a valid image file.');
            return;
        }

        if (file.size > 8 * 1024 * 1024) {
            setError('Image file is too large. Please use an image below 8MB.');
            return;
        }

        try {
            const imageDataUrl = file.size > 1024 * 1024
                ? await compressImage(file)
                : await readFileAsDataUrl(file);

            setFormData((prev) => ({ ...prev, imageUrl: imageDataUrl }));
            setError('');
        } catch {
            setError('Failed to process image. Please try another file.');
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setFieldErrors({});

        if (!suppliers?.length) {
            setError('Please add a supplier before creating products.');
            return;
        }

        const { isValid, nextErrors, normalized } = validateForm();
        if (!isValid) {
            setFieldErrors(nextErrors);
            return;
        }

        setLoading(true);

        try {
            const selectedSupplier = suppliers.find((item) => item._id === normalized.supplier);
            if (!selectedSupplier) {
                setError('Please select a valid supplier.');
                setLoading(false);
                return;
            }

            const productName = String(normalized.name).trim().toLowerCase();
            const supplierProductName = String(selectedSupplier.productName || '').trim().toLowerCase();
            if (productName && supplierProductName && productName !== supplierProductName) {
                setError(`Product ${normalized.name} does not belong to supplier ${selectedSupplier.name}.`);
                setLoading(false);
                return;
            }

            if (product) {
                await updateProduct(product._id, normalized);
            } else {
                await createProduct(normalized);
            }
            onSave();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save product');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-card max-w-3xl">
                <div className="modal-header">
                    <h3 className="modal-title">{product ? 'Edit Product' : 'Add Product'}</h3>
                    <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-700">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="modal-body">
                    <AlertBanner type="error" message={error} onClose={() => setError('')} />

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="field-label">Name</label>
                                <input
                                    required
                                    type="text"
                                    maxLength={80}
                                    className="field"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                                {fieldErrors.name ? <p className="mt-1 text-xs font-semibold text-red-600">{fieldErrors.name}</p> : null}
                            </div>
                            <div>
                                <label className="field-label">SKU</label>
                                <input
                                    required
                                    type="text"
                                    maxLength={30}
                                    className="field"
                                    value={formData.sku}
                                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                />
                                {fieldErrors.sku ? <p className="mt-1 text-xs font-semibold text-red-600">{fieldErrors.sku}</p> : null}
                            </div>
                            <div>
                                <label className="field-label">Category</label>
                                <input
                                    type="text"
                                    maxLength={50}
                                    className="field"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                />
                                {fieldErrors.category ? <p className="mt-1 text-xs font-semibold text-red-600">{fieldErrors.category}</p> : null}
                            </div>
                            <div>
                                <label className="field-label">Price</label>
                                <input
                                    required
                                    min="0"
                                    step="0.01"
                                    type="number"
                                    className="field"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                />
                                {fieldErrors.price ? <p className="mt-1 text-xs font-semibold text-red-600">{fieldErrors.price}</p> : null}
                            </div>
                            {!product ? (
                                <div>
                                    <label className="field-label">Initial Quantity</label>
                                    <input
                                        required
                                        min="0"
                                        type="number"
                                        className="field"
                                        value={formData.quantity}
                                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                    />
                                    {fieldErrors.quantity ? <p className="mt-1 text-xs font-semibold text-red-600">{fieldErrors.quantity}</p> : null}
                                </div>
                            ) : null}
                            <div>
                                <label className="field-label">Reorder Level</label>
                                <input
                                    required
                                    min="0"
                                    type="number"
                                    className="field"
                                    value={formData.reorderLevel}
                                    onChange={(e) => setFormData({ ...formData, reorderLevel: e.target.value })}
                                />
                                {fieldErrors.reorderLevel ? <p className="mt-1 text-xs font-semibold text-red-600">{fieldErrors.reorderLevel}</p> : null}
                            </div>
                            <div className="md:col-span-2">
                                <label className="field-label">Supplier</label>
                                <select
                                    required
                                    className="field"
                                    value={formData.supplier}
                                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                                >
                                    <option value="">Select a supplier...</option>
                                    {suppliers.map((supplier) => (
                                        <option key={supplier._id} value={supplier._id}>{supplier.name}</option>
                                    ))}
                                </select>
                                {fieldErrors.supplier ? <p className="mt-1 text-xs font-semibold text-red-600">{fieldErrors.supplier}</p> : null}
                            </div>
                            <div className="md:col-span-2">
                                <label className="field-label">Description</label>
                                <textarea
                                    rows="3"
                                    maxLength={500}
                                    className="field"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                                {fieldErrors.description ? <p className="mt-1 text-xs font-semibold text-red-600">{fieldErrors.description}</p> : null}
                            </div>

                            <div className="md:col-span-2">
                                <label className="field-label">Product Image</label>
                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <label className="btn btn-secondary cursor-pointer">
                                            <ImagePlus className="h-4 w-4" />
                                            Upload
                                            <input type="file" accept="image/*" className="hidden" onChange={onUploadImage} />
                                        </label>
                                        {formData.imageUrl ? (
                                            <button
                                                type="button"
                                                className="btn btn-secondary"
                                                onClick={() => setFormData((prev) => ({ ...prev, imageUrl: '' }))}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                Remove
                                            </button>
                                        ) : null}
                                    </div>

                                    {formData.imageUrl ? (
                                        <div className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-white">
                                            <img src={formData.imageUrl} alt="Product preview" className="h-44 w-full object-cover" />
                                        </div>
                                    ) : (
                                        <p className="mt-3 text-xs text-slate-500">PNG, JPG, or WebP.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
                            <button type="submit" disabled={loading} className="btn btn-primary disabled:opacity-60">
                                {loading ? 'Saving...' : 'Save Product'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
