import { useState } from 'react';
import { X } from 'lucide-react';
import { createSupplier, updateSupplier } from '../../services/inventoryApi';
import AlertBanner from './AlertBanner';

export default function SupplierFormModal({ supplier, onClose, onSave }) {
    const [formData, setFormData] = useState({
        name: supplier?.name || '',
        email: supplier?.email || '',
        contactNumber: supplier?.contactNumber || '',
        address: supplier?.address || '',
        notes: supplier?.notes || '',
        productName: supplier?.productName || '',
        productQuantity: supplier?.productQuantity ?? 0,
        productPrice: supplier?.productPrice ?? 0
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});

    const validateForm = () => {
        const nextErrors = {};

        const name = String(formData.name || '').trim();
        const email = String(formData.email || '').trim();
        const contactNumber = String(formData.contactNumber || '').trim();
        const address = String(formData.address || '').trim();
        const notes = String(formData.notes || '').trim();
        const productName = String(formData.productName || '').trim();
        const productQuantity = Number(formData.productQuantity);
        const productPrice = Number(formData.productPrice);

        if (!name) {
            nextErrors.name = 'Company name is required.';
        } else if (name.length < 2 || name.length > 100) {
            nextErrors.name = 'Company name must be 2 to 100 characters.';
        }

        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            nextErrors.email = 'Please enter a valid email address.';
        }

        if (contactNumber && !/^[+()\-\s0-9]{7,20}$/.test(contactNumber)) {
            nextErrors.contactNumber = 'Contact number must be 7 to 20 digits and symbols (+, -, ()).';
        }

        if (address.length > 250) {
            nextErrors.address = 'Address cannot exceed 250 characters.';
        }

        if (notes.length > 500) {
            nextErrors.notes = 'Notes cannot exceed 500 characters.';
        }

        if (!Number.isFinite(productQuantity) || productQuantity < 0 || !Number.isInteger(productQuantity)) {
            nextErrors.productQuantity = 'Quantity must be a non-negative whole number.';
        }

        if (!Number.isFinite(productPrice) || productPrice < 0) {
            nextErrors.productPrice = 'Price must be a valid non-negative number.';
        }

        if (!productName && (productQuantity > 0 || productPrice > 0)) {
            nextErrors.productName = 'Product name is required when quantity or price is provided.';
        }

        return {
            isValid: Object.keys(nextErrors).length === 0,
            nextErrors,
            normalized: {
                ...formData,
                name,
                email,
                contactNumber,
                address,
                notes,
                productName,
                productQuantity,
                productPrice
            }
        };
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setFieldErrors({});

        const { isValid, nextErrors, normalized } = validateForm();
        if (!isValid) {
            setFieldErrors(nextErrors);
            return;
        }

        setLoading(true);

        try {
            let saved;
            if (supplier) {
                saved = await updateSupplier(supplier._id, normalized);
            } else {
                saved = await createSupplier(normalized);
            }
            onSave(saved);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save supplier');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-card max-w-2xl">
                <div className="modal-header">
                    <h3 className="modal-title">{supplier ? 'Edit Supplier' : 'Add Supplier'}</h3>
                    <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-700">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="modal-body">
                    <AlertBanner type="error" message={error} onClose={() => setError('')} />

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="field-label">Company Name</label>
                            <input
                                required
                                type="text"
                                maxLength={100}
                                className="field"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                            {fieldErrors.name ? <p className="mt-1 text-xs font-semibold text-red-600">{fieldErrors.name}</p> : null}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="field-label">Email</label>
                                <input
                                    type="email"
                                    maxLength={120}
                                    className="field"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                                {fieldErrors.email ? <p className="mt-1 text-xs font-semibold text-red-600">{fieldErrors.email}</p> : null}
                            </div>
                            <div>
                                <label className="field-label">Contact Number</label>
                                <input
                                    type="text"
                                    maxLength={20}
                                    className="field"
                                    value={formData.contactNumber}
                                    onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                                />
                                {fieldErrors.contactNumber ? <p className="mt-1 text-xs font-semibold text-red-600">{fieldErrors.contactNumber}</p> : null}
                            </div>
                        </div>

                        <div>
                            <label className="field-label">Address</label>
                            <textarea
                                rows="2"
                                maxLength={250}
                                className="field"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            />
                            {fieldErrors.address ? <p className="mt-1 text-xs font-semibold text-red-600">{fieldErrors.address}</p> : null}
                        </div>

                        <div>
                            <label className="field-label">Notes</label>
                            <textarea
                                rows="3"
                                maxLength={500}
                                className="field"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            />
                            {fieldErrors.notes ? <p className="mt-1 text-xs font-semibold text-red-600">{fieldErrors.notes}</p> : null}
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                            <p className="field-label mb-3">Primary Product Details</p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="field-label">Product Name</label>
                                    <input
                                        type="text"
                                        maxLength={80}
                                        className="field"
                                        value={formData.productName}
                                        onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                                    />
                                    {fieldErrors.productName ? <p className="mt-1 text-xs font-semibold text-red-600">{fieldErrors.productName}</p> : null}
                                </div>
                                <div>
                                    <label className="field-label">Quantity</label>
                                    <input
                                        min="0"
                                        type="number"
                                        className="field"
                                        value={formData.productQuantity}
                                        onChange={(e) => setFormData({ ...formData, productQuantity: e.target.value })}
                                    />
                                    {fieldErrors.productQuantity ? <p className="mt-1 text-xs font-semibold text-red-600">{fieldErrors.productQuantity}</p> : null}
                                </div>
                                <div>
                                    <label className="field-label">Price</label>
                                    <input
                                        min="0"
                                        step="0.01"
                                        type="number"
                                        className="field"
                                        value={formData.productPrice}
                                        onChange={(e) => setFormData({ ...formData, productPrice: e.target.value })}
                                    />
                                    {fieldErrors.productPrice ? <p className="mt-1 text-xs font-semibold text-red-600">{fieldErrors.productPrice}</p> : null}
                                </div>
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
                            <button type="submit" disabled={loading} className="btn btn-primary disabled:opacity-60">
                                {loading ? 'Saving...' : 'Save Supplier'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
