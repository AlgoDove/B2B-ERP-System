import { Edit2, RefreshCcw, Trash2 } from 'lucide-react';

export default function ProductList({ products, canDelete, onEdit, onUpdateStock, onDelete }) {
    const getStatusColor = (status) => {
        switch (status) {
            case 'InStock':
                return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 'LowStock':
                return 'bg-amber-100 text-amber-800 border-amber-200';
            case 'OutOfStock':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    if (!products.length) {
        return (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-10 text-center text-slate-500">
                No products found. Add your first product to begin tracking inventory.
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-[10px] font-black tracking-widest uppercase text-slate-500">Product</th>
                            <th className="px-4 py-3 text-left text-[10px] font-black tracking-widest uppercase text-slate-500">Supplier</th>
                            <th className="px-4 py-3 text-left text-[10px] font-black tracking-widest uppercase text-slate-500">SKU</th>
                            <th className="px-4 py-3 text-left text-[10px] font-black tracking-widest uppercase text-slate-500">Quantity</th>
                            <th className="px-4 py-3 text-left text-[10px] font-black tracking-widest uppercase text-slate-500">Status</th>
                            <th className="px-4 py-3 text-right text-[10px] font-black tracking-widest uppercase text-slate-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                        {products.map((product) => (
                            <tr key={product._id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-4 py-3 whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                        {product.imageUrl ? (
                                            <img
                                                src={product.imageUrl}
                                                alt={product.name}
                                                className="h-11 w-11 rounded-lg border border-slate-200 object-cover"
                                            />
                                        ) : (
                                            <div className="h-11 w-11 rounded-lg border border-slate-200 bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                                                IMG
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">{product.name}</p>
                                            <p className="text-xs text-slate-500">{product.category || 'Uncategorized'}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700">
                                    {product.supplier?.name || 'No supplier'}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">{product.sku}</td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                    <p className="text-sm font-semibold text-slate-900">{product.quantity}</p>
                                    <p className="text-xs text-slate-500">Reorder at {product.reorderLevel}</p>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                    <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-bold ${getStatusColor(product.status)}`}>
                                        {product.status}
                                    </span>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-right">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            type="button"
                                            onClick={() => onUpdateStock(product)}
                                            className="rounded-lg border border-blue-200 bg-blue-50 p-2 text-blue-700 hover:bg-blue-100"
                                            title="Update stock"
                                        >
                                            <RefreshCcw className="h-4 w-4" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => onEdit(product)}
                                            className="rounded-lg border border-slate-300 bg-slate-100 p-2 text-slate-700 hover:bg-slate-200"
                                            title="Edit product"
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </button>
                                        {canDelete ? (
                                            <button
                                                type="button"
                                                onClick={() => onDelete(product._id)}
                                                className="rounded-lg border border-red-200 bg-red-50 p-2 text-red-700 hover:bg-red-100"
                                                title="Delete product"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        ) : null}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
