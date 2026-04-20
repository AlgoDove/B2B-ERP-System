import { useEffect, useMemo, useState } from 'react';
import { AlertOctagon, AlertTriangle, Package, Plus } from 'lucide-react';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import ProductFormModal from '../components/inventory/ProductFormModal';
import ProductList from '../components/inventory/ProductList';
import StockUpdateModal from '../components/inventory/StockUpdateModal';
import NotificationsPanel from '../components/inventory/NotificationsPanel';
import AlertBanner from '../components/inventory/AlertBanner';
import {
    deleteProduct,
    fetchProducts,
    fetchSuppliers
} from '../services/inventoryApi';

const STATUS_COLORS = {
    InStock: '#10B981',
    LowStock: '#F59E0B',
    OutOfStock: '#EF4444'
};

function StatCard({ title, value, icon: Icon, iconClass }) {
    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
            <div className={`rounded-xl p-3 text-white ${iconClass}`}>
                <Icon className="h-6 w-6" />
            </div>
            <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{title}</p>
                <p className="text-2xl font-black text-slate-900">{value}</p>
            </div>
        </div>
    );
}

export default function InventoryDashboard({ user }) {
    const [products, setProducts] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [showProductModal, setShowProductModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [stockModalProduct, setStockModalProduct] = useState(null);

    const isAdmin = user?.role === 'admin';

    const loadInventory = async () => {
        try {
            setLoading(true);
            const [productsData, suppliersData] = await Promise.all([
                fetchProducts(),
                fetchSuppliers()
            ]);
            setProducts(productsData);
            setSuppliers(suppliersData);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load inventory dashboard');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadInventory();
    }, []);

    const stats = useMemo(() => ({
        total: products.length,
        inStock: products.filter((item) => item.status === 'InStock').length,
        lowStock: products.filter((item) => item.status === 'LowStock').length,
        outOfStock: products.filter((item) => item.status === 'OutOfStock').length
    }), [products]);

    const chartData = useMemo(() => ([
        { name: 'In Stock', value: stats.inStock, status: 'InStock' },
        { name: 'Low Stock', value: stats.lowStock, status: 'LowStock' },
        { name: 'Out of Stock', value: stats.outOfStock, status: 'OutOfStock' }
    ]).filter((entry) => entry.value > 0), [stats]);

    const handleDeleteProduct = async (productId) => {
        const confirmed = window.confirm('Are you sure you want to delete this product?');
        if (!confirmed) return;

        try {
            await deleteProduct(productId);
            await loadInventory();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete product');
        }
    };

    const openCreateModal = () => {
        setEditingProduct(null);
        setShowProductModal(true);
    };

    const handleSaved = () => {
        setShowProductModal(false);
        setEditingProduct(null);
        loadInventory();
    };

    const handleStockUpdated = () => {
        setStockModalProduct(null);
        loadInventory();
    };

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <AlertBanner type="error" message={error} onClose={() => setError('')} />

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Inventory Dashboard</h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Real-time stock levels, supplier-linked products, and low-stock alerts.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={openCreateModal}
                    disabled={!suppliers.length}
                    title={!suppliers.length ? 'Create suppliers first before adding products' : 'Add product'}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Plus className="h-4 w-4" />
                    Add Product
                </button>
            </div>

            {!suppliers.length ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-900">
                    No suppliers available yet. Create suppliers from the Suppliers module to start adding products.
                </div>
            ) : null}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard title="Total Products" value={stats.total} icon={Package} iconClass="bg-blue-600" />
                <StatCard title="In Stock" value={stats.inStock} icon={Package} iconClass="bg-emerald-600" />
                <StatCard title="Low Stock" value={stats.lowStock} icon={AlertTriangle} iconClass="bg-amber-500" />
                <StatCard title="Out of Stock" value={stats.outOfStock} icon={AlertOctagon} iconClass="bg-red-600" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 lg:col-span-2">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Stock Distribution</h3>
                    <div className="h-72">
                        {chartData.length ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={95}
                                        innerRadius={52}
                                        paddingAngle={4}
                                    >
                                        {chartData.map((entry) => (
                                            <Cell key={entry.status} fill={STATUS_COLORS[entry.status]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="h-full flex items-center justify-center text-sm text-slate-500">No stock data yet</p>
                        )}
                    </div>
                </div>
                <div className="lg:col-span-1">
                    <NotificationsPanel />
                </div>
            </div>

            <div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">Inventory Catalog</h3>
                <ProductList
                    products={products}
                    canDelete={isAdmin}
                    onEdit={(product) => {
                        setEditingProduct(product);
                        setShowProductModal(true);
                    }}
                    onUpdateStock={(product) => setStockModalProduct(product)}
                    onDelete={handleDeleteProduct}
                />
            </div>

            {showProductModal ? (
                <ProductFormModal
                    product={editingProduct}
                    suppliers={suppliers}
                    onClose={() => {
                        setShowProductModal(false);
                        setEditingProduct(null);
                    }}
                    onSave={handleSaved}
                />
            ) : null}

            {stockModalProduct ? (
                <StockUpdateModal
                    product={stockModalProduct}
                    onClose={() => setStockModalProduct(null)}
                    onUpdate={handleStockUpdated}
                />
            ) : null}
        </div>
    );
}
