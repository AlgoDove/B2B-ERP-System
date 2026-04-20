import { useState } from 'react';
import { ArrowDownCircle, ArrowUpCircle, X } from 'lucide-react';
import { updateProductStock } from '../../services/inventoryApi';
import AlertBanner from './AlertBanner';

export default function StockUpdateModal({ product, onClose, onUpdate }) {
    const [updateType, setUpdateType] = useState('add');
    const [quantity, setQuantity] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const validateQuantity = () => {
        const parsedQty = Number(quantity);

        if (!Number.isFinite(parsedQty) || !Number.isInteger(parsedQty) || parsedQty < 0) {
            return 'Quantity must be a non-negative whole number.';
        }

        if (updateType !== 'absolute' && parsedQty === 0) {
            return 'Quantity change must be greater than zero.';
        }

        if (updateType === 'subtract' && parsedQty > Number(product.quantity || 0)) {
            return 'Cannot remove more stock than currently available.';
        }

        return '';
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');

        const validationError = validateQuantity();
        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);

        try {
            const parsedQty = Number(quantity);
            let finalQuantity = parsedQty;
            let isDelta = false;

            if (updateType === 'add') {
                isDelta = true;
            } else if (updateType === 'subtract') {
                finalQuantity = -parsedQty;
                isDelta = true;
            }

            await updateProductStock(product._id, finalQuantity, isDelta);
            onUpdate();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update stock');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-card max-w-md">
                <div className="modal-header">
                    <h3 className="modal-title">Update Stock: {product.name}</h3>
                    <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-700">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="modal-body">
                    <AlertBanner type="error" message={error} onClose={() => setError('')} />

                    <div className="mb-5 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <span className="text-sm font-semibold text-slate-600">Current Stock</span>
                        <span className="text-2xl font-black text-slate-900">{product.quantity}</span>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-3 gap-2">
                            <button
                                type="button"
                                onClick={() => setUpdateType('add')}
                                className={`rounded-lg border px-3 py-2 text-sm font-semibold ${updateType === 'add' ? 'border-blue-300 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                            >
                                <ArrowUpCircle className="mx-auto mb-1 h-5 w-5 text-emerald-600" />
                                Add
                            </button>
                            <button
                                type="button"
                                onClick={() => setUpdateType('subtract')}
                                className={`rounded-lg border px-3 py-2 text-sm font-semibold ${updateType === 'subtract' ? 'border-blue-300 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                            >
                                <ArrowDownCircle className="mx-auto mb-1 h-5 w-5 text-red-600" />
                                Remove
                            </button>
                            <button
                                type="button"
                                onClick={() => setUpdateType('absolute')}
                                className={`rounded-lg border px-3 py-2 text-sm font-semibold ${updateType === 'absolute' ? 'border-blue-300 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                            >
                                <span className="mb-1 block text-lg font-bold">=</span>
                                Set
                            </button>
                        </div>

                        <div>
                            <label className="field-label">
                                {updateType === 'absolute' ? 'New Total Quantity' : 'Quantity Change'}
                            </label>
                            <input
                                required
                                min="0"
                                type="number"
                                step="1"
                                className="field"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                            />
                        </div>

                        <div className="modal-actions">
                            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
                            <button type="submit" disabled={loading} className="btn btn-primary disabled:opacity-60">
                                {loading ? 'Updating...' : 'Confirm Update'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
