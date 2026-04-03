import { useState, useEffect } from 'react';
import { X, Plus, Trash2, FileText, ChevronDown, CheckCircle } from 'lucide-react';

const mockCustomers = [
    { id: 1, name: 'Mega Structures Inc', code: 'MSI' },
    { id: 2, name: 'Skyline Contractors Ltd', code: 'SCL' },
    { id: 3, name: 'BuildRight Supplies', code: 'BS' },
    { id: 4, name: 'ABC Trading Co', code: 'ATC' },
    { id: 5, name: 'XYZ Materials', code: 'XYZ' },
    { id: 6, name: 'Urban Construct Ltd', code: 'UCL' },
    { id: 7, name: 'Elite Builders Group', code: 'EBG' },
];

const mockProducts = [
    { id: 1, name: 'Cement Bags (50kg)', price: 500 },
    { id: 2, name: 'Steel Rods (10mm)', price: 800 },
    { id: 3, name: 'Bricks (per 1000)', price: 2500 },
    { id: 4, name: 'Sand (per ton)', price: 1200 },
    { id: 5, name: 'Gravel (per ton)', price: 1500 },
    { id: 6, name: 'Timber Planks (per m)', price: 350 },
    { id: 7, name: 'PVC Pipes (6m)', price: 420 },
    { id: 8, name: 'Glass Sheets (per sqm)', price: 950 },
];

const paymentMethods = ['Cash', 'Bank Transfer', 'Credit', 'Cheque'];
const discountTypes = ['Fixed Amount', 'Percentage'];

const inputClass = 'w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all placeholder-slate-400';
const labelClass = 'block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5';

export default function InvoiceFormModal({ isOpen, onClose, onSubmit }) {
    const [formData, setFormData] = useState({
        customer: '',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'Cash',
        notes: '',
        lineItems: [{ product: '', qty: 1, unitPrice: 0, subtotal: 0 }],
        discountType: 'Fixed Amount',
        discount: 0,
    });
    const [errors, setErrors] = useState({});
    const [submitted, setSubmitted] = useState(false);

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            setFormData({
                customer: '',
                date: new Date().toISOString().split('T')[0],
                paymentMethod: 'Cash',
                notes: '',
                lineItems: [{ product: '', qty: 1, unitPrice: 0, subtotal: 0 }],
                discountType: 'Fixed Amount',
                discount: 0,
            });
            setErrors({});
            setSubmitted(false);
        }
    }, [isOpen]);

    const calculateTotals = () => {
        const itemsSubtotal = formData.lineItems.reduce((sum, item) => sum + (item.qty * item.unitPrice), 0);
        const discountAmount = formData.discountType === 'Percentage'
            ? (itemsSubtotal * formData.discount) / 100
            : Number(formData.discount);
        return {
            subtotal: itemsSubtotal,
            discount: Math.max(0, discountAmount),
            total: Math.max(0, itemsSubtotal - discountAmount),
        };
    };

    const totals = calculateTotals();

    const handleLineItemChange = (index, field, value) => {
        const newItems = [...formData.lineItems];
        if (field === 'product') {
            const product = mockProducts.find(p => p.id === parseInt(value));
            newItems[index].product = value;
            newItems[index].unitPrice = product ? product.price : 0;
        } else if (field === 'qty') {
            newItems[index].qty = Math.max(1, parseInt(value) || 1);
        } else if (field === 'unitPrice') {
            newItems[index].unitPrice = parseFloat(value) || 0;
        }
        newItems[index].subtotal = newItems[index].qty * newItems[index].unitPrice;
        setFormData({ ...formData, lineItems: newItems });
    };

    const addLineItem = () => {
        setFormData({
            ...formData,
            lineItems: [...formData.lineItems, { product: '', qty: 1, unitPrice: 0, subtotal: 0 }],
        });
    };

    const removeLineItem = (index) => {
        if (formData.lineItems.length > 1) {
            setFormData({ ...formData, lineItems: formData.lineItems.filter((_, i) => i !== index) });
        }
    };

    const validate = () => {
        const errs = {};
        if (!formData.customer) errs.customer = 'Please select a customer';
        if (!formData.date) errs.date = 'Please select a date';
        if (!formData.lineItems.some(i => i.product && i.qty > 0)) errs.lineItems = 'Add at least one product';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;
        const customer = mockCustomers.find(c => c.id === parseInt(formData.customer));
        onSubmit({
            customer: customer?.name || '',
            customerCode: customer?.code || '',
            date: formData.date,
            paymentMethod: formData.paymentMethod,
            notes: formData.notes,
            lineItems: formData.lineItems.filter(i => i.product),
            discountType: formData.discountType,
            discount: formData.discount,
            subtotal: totals.subtotal,
            discountAmount: totals.discount,
            total: totals.total,
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div
                className="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                            <FileText size={20} className="text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-slate-900 leading-tight">Create New Invoice</h2>
                            <p className="text-xs text-slate-400 font-medium">Fill in the details below</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-600"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Scrollable Body */}
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

                        {/* Customer + Date */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Customer <span className="text-red-500 normal-case text-xs">*</span></label>
                                <select
                                    value={formData.customer}
                                    onChange={e => setFormData({ ...formData, customer: e.target.value })}
                                    className={`${inputClass} ${errors.customer ? 'border-red-400 ring-1 ring-red-400' : ''}`}
                                >
                                    <option value="">Select a customer…</option>
                                    {mockCustomers.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                                {errors.customer && <p className="text-red-500 text-xs mt-1 font-medium">{errors.customer}</p>}
                            </div>
                            <div>
                                <label className={labelClass}>Date <span className="text-red-500 normal-case text-xs">*</span></label>
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                    className={`${inputClass} ${errors.date ? 'border-red-400 ring-1 ring-red-400' : ''}`}
                                />
                                {errors.date && <p className="text-red-500 text-xs mt-1 font-medium">{errors.date}</p>}
                            </div>
                        </div>

                        {/* Payment Method + Notes */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Payment Method <span className="text-red-500 normal-case text-xs">*</span></label>
                                <select
                                    value={formData.paymentMethod}
                                    onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}
                                    className={inputClass}
                                >
                                    {paymentMethods.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className={labelClass}>Notes (optional)</label>
                                <input
                                    type="text"
                                    value={formData.notes}
                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                    placeholder="e.g. Special order, bulk discount"
                                    className={inputClass}
                                />
                            </div>
                        </div>

                        {/* Line Items */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className={labelClass + ' mb-0'}>Line Items <span className="text-red-500 normal-case text-xs">*</span></label>
                                <span className="text-xs text-slate-400">{formData.lineItems.length} item{formData.lineItems.length !== 1 ? 's' : ''}</span>
                            </div>

                            <div className="border border-slate-200 rounded-xl overflow-hidden">
                                {/* Column headers */}
                                <div className="grid grid-cols-12 gap-2 px-4 py-2.5 bg-slate-50 border-b border-slate-200">
                                    <div className="col-span-5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Product</div>
                                    <div className="col-span-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Qty</div>
                                    <div className="col-span-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Unit Price</div>
                                    <div className="col-span-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Subtotal</div>
                                    <div className="col-span-1"></div>
                                </div>

                                <div className="divide-y divide-slate-100">
                                    {formData.lineItems.map((item, index) => (
                                        <div key={index} className="grid grid-cols-12 gap-2 px-4 py-3 items-center hover:bg-slate-50/60 transition-colors">
                                            <div className="col-span-5">
                                                <select
                                                    value={item.product}
                                                    onChange={e => handleLineItemChange(index, 'product', e.target.value)}
                                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                >
                                                    <option value="">Select product…</option>
                                                    {mockProducts.map(p => (
                                                        <option key={p.id} value={p.id}>{p.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="col-span-2">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={item.qty}
                                                    onChange={e => handleLineItemChange(index, 'qty', e.target.value)}
                                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={item.unitPrice}
                                                    onChange={e => handleLineItemChange(index, 'unitPrice', e.target.value)}
                                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                />
                                            </div>
                                            <div className="col-span-2 text-sm font-bold text-slate-800">
                                                ₦{item.subtotal.toLocaleString()}
                                            </div>
                                            <div className="col-span-1 flex justify-center">
                                                <button
                                                    type="button"
                                                    onClick={() => removeLineItem(index)}
                                                    disabled={formData.lineItems.length === 1}
                                                    className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {errors.lineItems && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.lineItems}</p>}

                            <button
                                type="button"
                                onClick={addLineItem}
                                className="mt-3 flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-xl text-sm font-semibold transition-colors"
                            >
                                <Plus size={16} />
                                Add Another Item
                            </button>
                        </div>

                        {/* Discount */}
                        <div className="grid grid-cols-2 gap-4 pt-1 border-t border-slate-100">
                            <div>
                                <label className={labelClass}>Discount Type</label>
                                <select
                                    value={formData.discountType}
                                    onChange={e => setFormData({ ...formData, discountType: e.target.value })}
                                    className={inputClass}
                                >
                                    {discountTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className={labelClass}>
                                    Discount ({formData.discountType === 'Percentage' ? '%' : '₦'})
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={formData.discount}
                                    onChange={e => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                                    className={inputClass}
                                />
                            </div>
                        </div>

                        {/* Totals Summary */}
                        <div className="bg-gradient-to-br from-slate-50 to-blue-50/50 border border-slate-200 rounded-xl p-4 space-y-2.5">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500 font-medium">Subtotal</span>
                                <span className="font-semibold text-slate-800">₦{totals.subtotal.toLocaleString()}</span>
                            </div>
                            {totals.discount > 0 && (
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500 font-medium">Discount</span>
                                    <span className="font-semibold text-emerald-600">−₦{totals.discount.toLocaleString()}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center pt-2.5 border-t border-slate-200">
                                <span className="text-base font-bold text-slate-800">Total</span>
                                <span className="text-2xl font-black text-blue-600">₦{totals.total.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50 shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 border border-slate-200 bg-white text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 active:scale-95 transition-all text-sm flex items-center justify-center gap-2 shadow-sm shadow-blue-200"
                        >
                            <CheckCircle size={16} />
                            Create Invoice
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
