import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import AlertBanner from '../components/inventory/AlertBanner';
import SupplierFormModal from '../components/inventory/SupplierFormModal';
import SupplierGrid from '../components/inventory/SupplierGrid';
import { deleteSupplier, fetchSuppliers } from '../services/inventoryApi';

export default function SupplierManagement({ user }) {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [showForm, setShowForm] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState(null);

    const isAdmin = user?.role === 'admin';

    const loadSuppliers = async () => {
        try {
            setLoading(true);
            const data = await fetchSuppliers();
            setSuppliers(data);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load suppliers');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSuppliers();
    }, []);

    const handleDelete = async (supplierId) => {
        const confirmed = window.confirm('Delete this supplier? Ensure no active products depend on it.');
        if (!confirmed) return;

        try {
            await deleteSupplier(supplierId);
            await loadSuppliers();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete supplier');
        }
    };

    const handleSaved = (savedSupplier) => {
        setShowForm(false);
        setEditingSupplier(null);

        if (savedSupplier) {
            setSuppliers((prev) => {
                const existing = prev.find((item) => item._id === savedSupplier._id);
                if (!existing) {
                    return [savedSupplier, ...prev];
                }
                return prev.map((item) => item._id === savedSupplier._id ? savedSupplier : item);
            });
            return;
        }

        loadSuppliers();
    };

    if (!isAdmin) {
        return (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center">
                <h2 className="text-xl font-black text-slate-900">Access Restricted</h2>
                <p className="mt-2 text-sm text-slate-500">Only administrators can manage suppliers.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Supplier Management</h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Maintain supplier records, product mapping, and procurement contacts.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => {
                        setEditingSupplier(null);
                        setShowForm(true);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700"
                >
                    <Plus className="h-4 w-4" />
                    Add Supplier
                </button>
            </div>

            <AlertBanner type="error" message={error} onClose={() => setError('')} />

            {loading ? (
                <div className="flex h-48 items-center justify-center">
                    <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <SupplierGrid
                    suppliers={suppliers}
                    canDelete={isAdmin}
                    onEdit={(supplier) => {
                        setEditingSupplier(supplier);
                        setShowForm(true);
                    }}
                    onDelete={handleDelete}
                />
            )}

            {showForm ? (
                <SupplierFormModal
                    supplier={editingSupplier}
                    onClose={() => {
                        setShowForm(false);
                        setEditingSupplier(null);
                    }}
                    onSave={handleSaved}
                />
            ) : null}
        </div>
    );
}
