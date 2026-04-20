import { Edit2, Mail, MapPin, Package, Phone, Trash2 } from 'lucide-react';

export default function SupplierGrid({ suppliers, canDelete, onEdit, onDelete }) {
    if (!suppliers.length) {
        return (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-10 text-center text-slate-500">
                No suppliers found. Add a supplier to maintain procurement visibility.
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {suppliers.map((supplier) => (
                <div key={supplier._id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    <div className="p-5">
                        <div className="mb-4 flex items-start justify-between gap-3">
                            <h3 className="text-lg font-black text-slate-900 leading-tight line-clamp-2">{supplier.name}</h3>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => onEdit(supplier)}
                                    className="rounded-lg border border-slate-300 bg-slate-100 p-1.5 text-slate-600 hover:bg-slate-200"
                                    title="Edit supplier"
                                >
                                    <Edit2 className="h-4 w-4" />
                                </button>
                                {canDelete ? (
                                    <button
                                        type="button"
                                        onClick={() => onDelete(supplier._id)}
                                        className="rounded-lg border border-red-200 bg-red-50 p-1.5 text-red-600 hover:bg-red-100"
                                        title="Delete supplier"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                ) : null}
                            </div>
                        </div>

                        <div className="space-y-2 mb-4">
                            {supplier.email ? (
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <Mail className="h-4 w-4 text-slate-400" />
                                    <a className="hover:text-blue-700" href={`mailto:${supplier.email}`}>{supplier.email}</a>
                                </div>
                            ) : null}

                            {supplier.contactNumber ? (
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <Phone className="h-4 w-4 text-slate-400" />
                                    <span>{supplier.contactNumber}</span>
                                </div>
                            ) : null}

                            {supplier.address ? (
                                <div className="flex items-start gap-2 text-sm text-slate-600">
                                    <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-slate-400" />
                                    <span className="line-clamp-2">{supplier.address}</span>
                                </div>
                            ) : null}

                            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                                <p className="mb-1 flex items-center gap-2 text-sm font-semibold text-slate-700">
                                    <Package className="h-4 w-4 text-slate-500" />
                                    {supplier.productName || 'No product assigned'}
                                </p>
                                <p className="text-xs text-slate-500">
                                    Qty: {supplier.productQuantity ?? 0} | Price: ${Number(supplier.productPrice ?? 0).toFixed(2)}
                                </p>
                            </div>
                        </div>

                        {supplier.notes ? (
                            <p className="border-t border-slate-100 pt-3 text-sm italic text-slate-500 line-clamp-2">
                                "{supplier.notes}"
                            </p>
                        ) : null}
                    </div>
                </div>
            ))}
        </div>
    );
}
