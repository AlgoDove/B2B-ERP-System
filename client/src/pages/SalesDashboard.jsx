import { useState, useEffect, useMemo } from 'react';
import {
    Search, Plus, FileText, DollarSign, Download, Eye, Trash2,
    ChevronLeft, ChevronRight, TrendingUp, Clock, CheckCircle,
    AlertCircle, RefreshCw, RotateCcw, BarChart2, X, Check, Filter
} from 'lucide-react';
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import InvoiceFormModal from '../components/InvoiceFormModal';

const ITEMS_PER_PAGE = 7;

const TABS = [
    { id: 'invoices', label: 'Invoices', icon: FileText },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'returns', label: 'Returns', icon: RotateCcw },
];

const STATUS_COLORS = {
    Paid: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', border: 'border-emerald-200' },
    Pending: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400', border: 'border-amber-200' },
    Overdue: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500', border: 'border-red-200' },
    Approved: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', border: 'border-emerald-200' },
    Rejected: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500', border: 'border-red-200' },
};

const PAYMENT_METHOD_ICONS = {
    'Bank Transfer': '🏦',
    'Cash': '💵',
    'Credit': '💳',
    'Cheque': '📄',
};

export default function SalesDashboard({ user }) {
    const [activeTab, setActiveTab] = useState('invoices');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState('All');
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [notification, setNotification] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);

    const showNotification = (msg, type = 'success') => {
        setNotification({ msg, type });
        setTimeout(() => setNotification(null), 3500);
    };

    const [invoices, setInvoices] = useState([
        { id: 'WHS-2024-001', customer: 'Mega Structures Inc', customerCode: 'MSI', date: '16 Mar 2024', paymentMethod: 'Bank Transfer', status: 'Paid', amount: 201875 },
        { id: 'WHS-2024-002', customer: 'Skyline Contractors Ltd', customerCode: 'SCL', date: '15 Mar 2024', paymentMethod: 'Credit', status: 'Pending', amount: 41967 },
        { id: 'WHS-2024-003', customer: 'BuildRight Supplies', customerCode: 'BS', date: '14 Mar 2024', paymentMethod: 'Cash', status: 'Paid', amount: 16750 },
        { id: 'WHS-2024-004', customer: 'ABC Trading Co', customerCode: 'ATC', date: '13 Mar 2024', paymentMethod: 'Bank Transfer', status: 'Overdue', amount: 89500 },
        { id: 'WHS-2024-005', customer: 'XYZ Materials', customerCode: 'XYZ', date: '12 Mar 2024', paymentMethod: 'Credit', status: 'Paid', amount: 156200 },
        { id: 'WHS-2024-006', customer: 'BuildRight Supplies', customerCode: 'BS', date: '10 Mar 2024', paymentMethod: 'Cheque', status: 'Pending', amount: 33400 },
        { id: 'WHS-2024-007', customer: 'Urban Construct Ltd', customerCode: 'UCL', date: '09 Mar 2024', paymentMethod: 'Bank Transfer', status: 'Paid', amount: 98550 },
        { id: 'WHS-2024-008', customer: 'Mega Structures Inc', customerCode: 'MSI', date: '07 Mar 2024', paymentMethod: 'Cash', status: 'Paid', amount: 44000 },
        { id: 'WHS-2024-009', customer: 'Elite Builders Group', customerCode: 'EBG', date: '05 Mar 2024', paymentMethod: 'Credit', status: 'Pending', amount: 72300 },
    ]);

    const [returns, setReturns] = useState([
        { id: 'RET-2024-001', customer: 'Mega Structures Inc', invoiceRef: 'WHS-2024-001', date: '18 Mar 2024', reason: 'Damaged goods on delivery', status: 'Approved', amount: 5000 },
        { id: 'RET-2024-002', customer: 'BuildRight Supplies', invoiceRef: 'WHS-2024-003', date: '16 Mar 2024', reason: 'Wrong quantity shipped', status: 'Pending', amount: 2500 },
        { id: 'RET-2024-003', customer: 'XYZ Materials', invoiceRef: 'WHS-2024-005', date: '14 Mar 2024', reason: 'Quality did not meet spec', status: 'Rejected', amount: 8750 },
    ]);

    const metrics = useMemo(() => {
        const paid = invoices.filter(i => i.status === 'Paid');
        const pending = invoices.filter(i => i.status === 'Pending');
        const overdue = invoices.filter(i => i.status === 'Overdue');
        const totalRev = paid.reduce((s, i) => s + i.amount, 0);
        const pendingAmt = pending.reduce((s, i) => s + i.amount, 0) + overdue.reduce((s, i) => s + i.amount, 0);
        const avgOrder = invoices.length ? Math.round(invoices.reduce((s, i) => s + i.amount, 0) / invoices.length) : 0;
        return {
            totalRevenue: totalRev,
            pendingAmount: pendingAmt,
            invoiceCount: invoices.length,
            paidCount: paid.length,
            pendingCount: pending.length + overdue.length,
            avgOrderValue: avgOrder,
        };
    }, [invoices]);

    const revenueChartData = [
        { date: 'Mar 1', revenue: 32000, invoices: 2 },
        { date: 'Mar 5', revenue: 44000, invoices: 3 },
        { date: 'Mar 7', revenue: 98550, invoices: 1 },
        { date: 'Mar 9', revenue: 72300, invoices: 2 },
        { date: 'Mar 10', revenue: 33400, invoices: 2 },
        { date: 'Mar 12', revenue: 156200, invoices: 1 },
        { date: 'Mar 13', revenue: 89500, invoices: 1 },
        { date: 'Mar 14', revenue: 16750, invoices: 1 },
        { date: 'Mar 15', revenue: 41967, invoices: 1 },
        { date: 'Mar 16', revenue: 201875, invoices: 1 },
    ];

    const paymentMethodData = [
        { name: 'Bank Transfer', value: 3, color: '#3B82F6' },
        { name: 'Credit', value: 3, color: '#8B5CF6' },
        { name: 'Cash', value: 2, color: '#10B981' },
        { name: 'Cheque', value: 1, color: '#F59E0B' },
    ];

    const statusChartData = [
        { name: 'Paid', value: metrics.paidCount, color: '#10B981' },
        { name: 'Pending', value: metrics.pendingCount, color: '#F59E0B' },
    ];

    const filteredInvoices = useMemo(() => {
        return invoices.filter(inv => {
            const matchSearch = inv.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                inv.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                inv.customerCode.toLowerCase().includes(searchTerm.toLowerCase());
            const matchStatus = statusFilter === 'All' || inv.status === statusFilter;
            return matchSearch && matchStatus;
        });
    }, [invoices, searchTerm, statusFilter]);

    const totalPages = Math.ceil(filteredInvoices.length / ITEMS_PER_PAGE);
    const paginatedInvoices = filteredInvoices.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    useEffect(() => { setCurrentPage(1); }, [searchTerm, statusFilter]);

    const handleInvoiceSubmit = (invoiceData) => {
        const invoiceId = `WHS-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(3, '0')}`;
        const newInvoice = {
            id: invoiceId,
            customer: invoiceData.customer,
            customerCode: invoiceData.customerCode,
            date: new Date(invoiceData.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            paymentMethod: invoiceData.paymentMethod,
            status: 'Pending',
            amount: invoiceData.total,
        };
        setInvoices(prev => [newInvoice, ...prev]);
        setIsInvoiceModalOpen(false);
        showNotification(`Invoice ${invoiceId} created successfully!`);
    };

    const handleMarkPaid = (invoice) => {
        setInvoices(prev => prev.map(inv => inv.id === invoice.id ? { ...inv, status: 'Paid' } : inv));
        showNotification(`Invoice ${invoice.id} marked as Paid.`);
    };

    const handleDeleteInvoice = (invoice) => {
        setInvoices(prev => prev.filter(inv => inv.id !== invoice.id));
        setConfirmDelete(null);
        showNotification(`Invoice ${invoice.id} deleted.`, 'error');
    };

    const handleExport = () => {
        const headers = ['Invoice ID', 'Customer', 'Date', 'Payment Method', 'Status', 'Amount'];
        const rows = invoices.map(inv => [inv.id, inv.customer, inv.date, inv.paymentMethod, inv.status, `₦${inv.amount.toLocaleString()}`]);
        const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'invoices_export.csv';
        a.click();
        URL.revokeObjectURL(url);
        showNotification('Invoices exported as CSV.');
    };

    const StatusBadge = ({ status }) => {
        const s = STATUS_COLORS[status] || STATUS_COLORS['Pending'];
        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${s.bg} ${s.text} ${s.border}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`}></span>
                {status}
            </span>
        );
    };

    const KpiCard = ({ icon: Icon, iconBg, label, value, sub, subColor = 'text-slate-500', gradient }) => (
        <div className={`rounded-2xl p-6 shadow-sm border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${gradient || 'bg-white border-slate-200'}`}>
            <div className="flex items-start justify-between mb-4">
                <p className={`text-sm font-semibold ${gradient ? 'text-white/80' : 'text-slate-500'}`}>{label}</p>
                <div className={`p-2 rounded-xl ${iconBg}`}>
                    <Icon size={18} className={gradient ? 'text-white' : 'text-inherit'} />
                </div>
            </div>
            <p className={`text-3xl font-black tracking-tight ${gradient ? 'text-white' : 'text-slate-900'}`}>{value}</p>
            {sub && <p className={`text-xs font-medium mt-2 ${gradient ? 'text-white/70' : subColor}`}>{sub}</p>}
        </div>
    );

    return (
        <div className="space-y-6 pb-10 relative">

            {/* Toast Notification */}
            {notification && (
                <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl text-sm font-semibold animate-in slide-in-from-top-2 duration-300 ${notification.type === 'error' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'}`}>
                    {notification.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
                    {notification.msg}
                </div>
            )}

            {/* Delete Confirm Modal */}
            {confirmDelete && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-2xl p-7 max-w-sm w-full mx-4">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                            <Trash2 size={22} className="text-red-600" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1">Delete Invoice?</h3>
                        <p className="text-slate-500 text-sm mb-6">
                            Are you sure you want to delete <strong>{confirmDelete.id}</strong>? This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setConfirmDelete(null)} className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 transition-colors">
                                Cancel
                            </button>
                            <button onClick={() => handleDeleteInvoice(confirmDelete)} className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Invoice Detail Drawer */}
            {selectedInvoice && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-end z-50">
                    <div className="bg-white w-full max-w-md h-full overflow-y-auto shadow-2xl p-8 flex flex-col">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <p className="text-xs font-bold text-blue-600 tracking-widest uppercase mb-1">Invoice Detail</p>
                                <h2 className="text-2xl font-black text-slate-900">{selectedInvoice.id}</h2>
                            </div>
                            <button onClick={() => setSelectedInvoice(null)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                                <X size={20} className="text-slate-500" />
                            </button>
                        </div>
                        <div className="space-y-4 flex-1">
                            <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                                {[
                                    { label: 'Customer', value: selectedInvoice.customer },
                                    { label: 'Customer Code', value: selectedInvoice.customerCode },
                                    { label: 'Date', value: selectedInvoice.date },
                                    { label: 'Payment Method', value: `${PAYMENT_METHOD_ICONS[selectedInvoice.paymentMethod] || ''} ${selectedInvoice.paymentMethod}` },
                                ].map(({ label, value }) => (
                                    <div key={label} className="flex justify-between items-center">
                                        <span className="text-sm text-slate-500 font-medium">{label}</span>
                                        <span className="text-sm font-semibold text-slate-800">{value}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="bg-blue-50 rounded-xl p-4 flex justify-between items-center">
                                <span className="text-sm font-bold text-blue-800">Total Amount</span>
                                <span className="text-2xl font-black text-blue-700">₦{selectedInvoice.amount.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                <span className="text-sm font-medium text-slate-500">Status</span>
                                <StatusBadge status={selectedInvoice.status} />
                            </div>
                        </div>
                        <div className="mt-6 space-y-2">
                            {selectedInvoice.status !== 'Paid' && (
                                <button onClick={() => { handleMarkPaid(selectedInvoice); setSelectedInvoice(null); }}
                                    className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2">
                                    <Check size={18} /> Mark as Paid
                                </button>
                            )}
                            <button onClick={() => setSelectedInvoice(null)}
                                className="w-full py-3 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard
                    icon={TrendingUp}
                    iconBg="bg-blue-100 text-blue-600"
                    label="Total Revenue"
                    value={`₦${(metrics.totalRevenue / 1000).toFixed(0)}k`}
                    sub="↑ 18.2% vs last month"
                    subColor="text-emerald-600 font-semibold"
                />
                <KpiCard
                    icon={FileText}
                    iconBg="bg-purple-100 text-purple-600"
                    label="Invoices Issued"
                    value={metrics.invoiceCount}
                    sub={`${metrics.paidCount} paid · ${metrics.pendingCount} pending`}
                />
                <KpiCard
                    icon={Clock}
                    iconBg="bg-amber-100 text-amber-600"
                    label="Pending Payments"
                    value={`₦${(metrics.pendingAmount / 1000).toFixed(0)}k`}
                    sub="Follow up required"
                    subColor="text-amber-600"
                />
                <KpiCard
                    icon={DollarSign}
                    iconBg="bg-white/20"
                    label="Average Order Value"
                    value={`₦${(metrics.avgOrderValue / 1000).toFixed(0)}k`}
                    sub="Per transaction"
                    gradient="bg-gradient-to-br from-blue-600 to-indigo-700 border-transparent"
                />
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit">
                {TABS.map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        onClick={() => { setActiveTab(id); setCurrentPage(1); }}
                        className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${activeTab === id
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Icon size={16} />
                        {label}
                    </button>
                ))}
            </div>

            {/* ── INVOICES TAB ── */}
            {activeTab === 'invoices' && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    {/* Toolbar */}
                    <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 flex-wrap">
                            {/* Search */}
                            <div className="relative flex-1 min-w-[200px]">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search invoices or customers…"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                            </div>
                            {/* Status Filters */}
                            <div className="flex gap-1.5 flex-wrap">
                                {['All', 'Paid', 'Pending', 'Overdue'].map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setStatusFilter(s)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${statusFilter === s
                                            ? 'bg-blue-600 text-white shadow-sm'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {/* Actions */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleExport}
                                className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
                            >
                                <Download size={15} /> Export
                            </button>
                            <button
                                onClick={() => setIsInvoiceModalOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
                            >
                                <Plus size={15} /> New Invoice
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    {['Invoice #', 'Customer', 'Date', 'Payment Method', 'Status', 'Amount', 'Actions'].map(h => (
                                        <th key={h} className="px-5 py-3.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {paginatedInvoices.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-14 text-slate-400">
                                            <FileText size={36} className="mx-auto mb-3 opacity-30" />
                                            <p className="font-medium">No invoices found</p>
                                        </td>
                                    </tr>
                                ) : paginatedInvoices.map(invoice => (
                                    <tr key={invoice.id} className="hover:bg-slate-50/60 transition-colors group">
                                        <td className="px-5 py-4">
                                            <button
                                                onClick={() => setSelectedInvoice(invoice)}
                                                className="font-bold text-blue-600 hover:text-blue-800 hover:underline transition-colors text-sm"
                                            >
                                                {invoice.id}
                                            </button>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-[10px] font-black shrink-0">
                                                    {invoice.customerCode}
                                                </div>
                                                <span className="text-sm font-semibold text-slate-800">{invoice.customer}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-sm text-slate-500">{invoice.date}</td>
                                        <td className="px-5 py-4 text-sm text-slate-600">
                                            <span className="flex items-center gap-1.5">
                                                <span>{PAYMENT_METHOD_ICONS[invoice.paymentMethod] || ''}</span>
                                                {invoice.paymentMethod}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <StatusBadge status={invoice.status} />
                                        </td>
                                        <td className="px-5 py-4 text-sm font-bold text-slate-900">
                                            ₦{invoice.amount.toLocaleString()}
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => setSelectedInvoice(invoice)}
                                                    title="View"
                                                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                >
                                                    <Eye size={15} />
                                                </button>
                                                {invoice.status !== 'Paid' && (
                                                    <button
                                                        onClick={() => handleMarkPaid(invoice)}
                                                        title="Mark Paid"
                                                        className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                    >
                                                        <Check size={15} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => setConfirmDelete(invoice)}
                                                    title="Delete"
                                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 bg-slate-50/50">
                        <p className="text-sm text-slate-500">
                            Showing <strong>{paginatedInvoices.length}</strong> of <strong>{filteredInvoices.length}</strong> invoices
                        </p>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`w-8 h-8 rounded-lg text-sm font-semibold transition-colors ${currentPage === page
                                        ? 'bg-blue-600 text-white'
                                        : 'text-slate-600 hover:bg-white border border-transparent hover:border-slate-200'}`}
                                >
                                    {page}
                                </button>
                            ))}
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages || totalPages === 0}
                                className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── ANALYTICS TAB ── */}
            {activeTab === 'analytics' && (
                <div className="space-y-6">
                    {/* Revenue Chart */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Revenue Trend</h3>
                                <p className="text-sm text-slate-500 mt-0.5">Daily revenue for March 2024</p>
                            </div>
                            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200">↑ 18.2% this month</span>
                        </div>
                        <ResponsiveContainer width="100%" height={280}>
                            <AreaChart data={revenueChartData} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
                                <defs>
                                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={v => `₦${v / 1000}k`} />
                                <RechartsTooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '12px' }}
                                    formatter={v => [`₦${v.toLocaleString()}`, 'Revenue']}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2.5} fill="url(#revGrad)" dot={{ fill: '#3B82F6', r: 4, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Invoice Status Breakdown */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                            <h3 className="text-lg font-bold text-slate-900 mb-6">Invoice Status</h3>
                            <div className="flex items-center gap-4">
                                <ResponsiveContainer width="50%" height={180}>
                                    <PieChart>
                                        <Pie data={statusChartData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                                            {statusChartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                                        </Pie>
                                        <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="space-y-3">
                                    {statusChartData.map(d => (
                                        <div key={d.name} className="flex items-center gap-2">
                                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }}></span>
                                            <span className="text-sm text-slate-600 font-medium">{d.name}</span>
                                            <span className="ml-auto text-sm font-bold text-slate-900">{d.value}</span>
                                        </div>
                                    ))}
                                    <div className="pt-2 border-t border-slate-100">
                                        <p className="text-xs text-slate-400">Total: {invoices.length} invoices</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Method Breakdown */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                            <h3 className="text-lg font-bold text-slate-900 mb-6">Payment Methods</h3>
                            <ResponsiveContainer width="100%" height={180}>
                                <BarChart data={paymentMethodData} layout="vertical" margin={{ left: 0, right: 20 }}>
                                    <XAxis type="number" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} width={90} />
                                    <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                                    <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={18}>
                                        {paymentMethodData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Performance KPIs */}
                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { label: 'On-Time Deliveries', value: '92%', icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
                            { label: 'Customer Satisfaction', value: '4.7 / 5', icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
                            { label: 'Avg Invoice Cycle', value: '14 days', icon: RefreshCw, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
                        ].map(({ label, value, icon: Icon, color, bg }) => (
                            <div key={label} className={`rounded-2xl border p-5 ${bg}`}>
                                <div className="flex items-center gap-2 mb-3">
                                    <Icon size={16} className={color} />
                                    <p className={`text-sm font-semibold ${color}`}>{label}</p>
                                </div>
                                <p className="text-3xl font-black text-slate-900">{value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── RETURNS TAB ── */}
            {activeTab === 'returns' && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                        <div>
                            <h3 className="text-base font-bold text-slate-900">Return Requests</h3>
                            <p className="text-sm text-slate-500">{returns.length} total returns</p>
                        </div>
                        <button
                            onClick={() => showNotification('Return request submitted.')}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
                        >
                            <Plus size={15} /> New Return
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    {['Return ID', 'Customer', 'Invoice Ref', 'Date', 'Reason', 'Amount', 'Status'].map(h => (
                                        <th key={h} className="px-5 py-3.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {returns.map(ret => (
                                    <tr key={ret.id} className="hover:bg-slate-50/60 transition-colors">
                                        <td className="px-5 py-4 text-sm font-bold text-slate-800">{ret.id}</td>
                                        <td className="px-5 py-4 text-sm font-semibold text-slate-700">{ret.customer}</td>
                                        <td className="px-5 py-4 text-sm text-blue-600 font-semibold">{ret.invoiceRef}</td>
                                        <td className="px-5 py-4 text-sm text-slate-500">{ret.date}</td>
                                        <td className="px-5 py-4 text-sm text-slate-600 max-w-[200px] truncate">{ret.reason}</td>
                                        <td className="px-5 py-4 text-sm font-bold text-slate-900">₦{ret.amount.toLocaleString()}</td>
                                        <td className="px-5 py-4">
                                            <StatusBadge status={ret.status} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Invoice Form Modal */}
            <InvoiceFormModal
                isOpen={isInvoiceModalOpen}
                onClose={() => setIsInvoiceModalOpen(false)}
                onSubmit={handleInvoiceSubmit}
            />
        </div>
    );
}