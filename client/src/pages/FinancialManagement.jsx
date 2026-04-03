import { useState, useMemo } from 'react';
import { DollarSign, TrendingDown, PieChart as PieChartIcon, Plus, Edit2, Trash2, Eye, Check, X } from 'lucide-react';

export default function FinancialManagement({ user }) {
    const [expenses, setExpenses] = useState([
        {
            id: 1,
            date: '01 Mar 2024',
            category: 'Rent',
            description: 'Warehouse rent - March 2024',
            paymentMethod: 'Bank Transfer',
            amount: 450000,
            status: 'Approved'
        },
        {
            id: 2,
            date: '05 Mar 2024',
            category: 'Utilities',
            description: 'Electricity bill - February 2024',
            paymentMethod: 'Cash',
            amount: 85000,
            status: 'Approved'
        },
        {
            id: 3,
            date: '10 Mar 2024',
            category: 'Salaries',
            description: 'Staff salaries - March 2024',
            paymentMethod: 'Bank Transfer',
            amount: 680000,
            status: 'Approved'
        },
        {
            id: 4,
            date: '12 Mar 2024',
            category: 'Transport',
            description: 'Delivery truck fuel',
            paymentMethod: 'Cash',
            amount: 45000,
            status: 'Approved'
        },
        {
            id: 5,
            date: '14 Mar 2024',
            category: 'Maintenance',
            description: 'Forklift repair and servicing',
            paymentMethod: 'Bank Transfer',
            amount: 120000,
            status: 'Approved'
        }
    ]);

    const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        date: '',
        category: '',
        description: '',
        paymentMethod: '',
        amount: '',
        status: 'Pending'
    });

    const categories = ['Rent', 'Utilities', 'Salaries', 'Transport', 'Maintenance', 'Marketing', 'Office Supplies', 'Insurance', 'Other'];
    const paymentMethods = ['Bank Transfer', 'Cash', 'Cheque', 'Credit Card'];
    const statuses = ['Pending', 'Approved', 'Rejected'];

    // Calculate metrics
    const metrics = useMemo(() => {
        const totalRevenue = 2600000; // This would come from invoices
        const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
        const netProfit = totalRevenue - totalExpenses;
        const profitMargin = ((netProfit / totalRevenue) * 100).toFixed(1);

        return {
            totalRevenue,
            totalExpenses,
            netProfit,
            profitMargin
        };
    }, [expenses]);

    // Handle add/edit expense
    const handleSubmitExpense = (e) => {
        e.preventDefault();

        if (editingId) {
            // Update existing expense
            setExpenses(prev =>
                prev.map(exp =>
                    exp.id === editingId
                        ? { ...exp, ...formData, amount: parseFloat(formData.amount) }
                        : exp
                )
            );
            setEditingId(null);
        } else {
            // Add new expense
            const newExpense = {
                id: Math.max(...expenses.map(e => e.id), 0) + 1,
                ...formData,
                amount: parseFloat(formData.amount)
            };
            setExpenses(prev => [newExpense, ...prev]);
        }

        // Reset form
        setFormData({
            date: '',
            category: '',
            description: '',
            paymentMethod: '',
            amount: '',
            status: 'Pending'
        });
        setIsAddExpenseOpen(false);
    };

    const handleEditExpense = (expense) => {
        setEditingId(expense.id);
        setFormData({
            date: expense.date,
            category: expense.category,
            description: expense.description,
            paymentMethod: expense.paymentMethod,
            amount: expense.amount.toString(),
            status: expense.status
        });
        setIsAddExpenseOpen(true);
    };

    const handleDeleteExpense = (id) => {
        if (window.confirm('Are you sure you want to delete this expense?')) {
            setExpenses(prev => prev.filter(exp => exp.id !== id));
        }
    };

    const handleCancel = () => {
        setIsAddExpenseOpen(false);
        setEditingId(null);
        setFormData({
            date: '',
            category: '',
            description: '',
            paymentMethod: '',
            amount: '',
            status: 'Pending'
        });
    };

    const MetricCard = ({ icon: Icon, label, value, subtitle, bgColor, textColor }) => (
        <div className={`${bgColor} rounded-lg p-6 text-white border-0 shadow-sm`}>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium opacity-90 mb-2">{label}</p>
                    <p className={`text-3xl font-bold ${textColor}`}>{value}</p>
                    {subtitle && <p className="text-xs opacity-80 mt-2">{subtitle}</p>}
                </div>
                <div className="bg-white/20 p-3 rounded-lg">
                    <Icon size={24} className="text-white" />
                </div>
            </div>
        </div>
    );

    const getStatusColor = (status) => {
        switch (status) {
            case 'Approved':
                return 'bg-green-100 text-green-700';
            case 'Pending':
                return 'bg-yellow-100 text-yellow-700';
            case 'Rejected':
                return 'bg-red-100 text-red-700';
            default:
                return 'bg-slate-100 text-slate-700';
        }
    };

    const getCategoryColor = (category) => {
        const colors = {
            'Rent': 'bg-blue-100 text-blue-700',
            'Utilities': 'bg-yellow-100 text-yellow-700',
            'Salaries': 'bg-purple-100 text-purple-700',
            'Transport': 'bg-orange-100 text-orange-700',
            'Maintenance': 'bg-red-100 text-red-700',
            'Marketing': 'bg-pink-100 text-pink-700',
            'Office Supplies': 'bg-cyan-100 text-cyan-700',
            'Insurance': 'bg-indigo-100 text-indigo-700',
            'Other': 'bg-slate-100 text-slate-700'
        };
        return colors[category] || colors['Other'];
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-6 py-6 sticky top-0 z-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                            <DollarSign size={24} className="text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">Financial Management</h1>
                            <p className="text-sm text-slate-600">Track expenses, manage costs, and monitor profitability</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-6 space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <MetricCard
                        icon={DollarSign}
                        label="Total Revenue"
                        value={`₦${(metrics.totalRevenue / 1000000).toFixed(2)}M`}
                        subtitle="Current month"
                        bgColor="bg-white border border-slate-200"
                        textColor="text-slate-900"
                    />
                    <MetricCard
                        icon={TrendingDown}
                        label="Total Expenses"
                        value={`₦${(metrics.totalExpenses / 1000000).toFixed(2)}M`}
                        subtitle="Operational costs"
                        bgColor="bg-white border border-slate-200"
                        textColor="text-red-600"
                    />
                    <MetricCard
                        icon={PieChartIcon}
                        label="Net Profit"
                        value={`₦${(metrics.netProfit / 1000000).toFixed(2)}M`}
                        subtitle={`~${metrics.profitMargin}% profit margin`}
                        bgColor="bg-green-500"
                        textColor="text-white"
                    />
                </div>

                {/* Recent Expenses */}
                <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-slate-900">Recent Expenses</h2>
                        <button
                            onClick={() => {
                                setEditingId(null);
                                setFormData({
                                    date: '',
                                    category: '',
                                    description: '',
                                    paymentMethod: '',
                                    amount: '',
                                    status: 'Pending'
                                });
                                setIsAddExpenseOpen(true);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            <Plus size={18} />
                            Add Expense
                        </button>
                    </div>

                    {/* Expenses Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-200">
                                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">DATE</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">CATEGORY</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">DESCRIPTION</th>
                                    <th className="px-4 py-3 text-right text-xs font-bold text-slate-700 uppercase tracking-wider">AMOUNT</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">STATUS</th>
                                    <th className="px-4 py-3 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {expenses.map((expense) => (
                                    <tr key={expense.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3">
                                            <span className="text-sm text-slate-600">{expense.date}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(expense.category)}`}>
                                                {expense.category}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="text-sm font-medium text-slate-900">{expense.description}</p>
                                            <p className="text-xs text-slate-500">{expense.paymentMethod}</p>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <span className="text-sm font-semibold text-red-600">-₦{expense.amount.toLocaleString()}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(expense.status)}`}>
                                                {expense.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleEditExpense(expense)}
                                                    className="p-1.5 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteExpense(expense.id)}
                                                    className="p-1.5 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Add/Edit Expense Modal */}
            {isAddExpenseOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full shadow-2xl">
                        {/* Header */}
                        <div className="border-b border-slate-200 px-6 py-4">
                            <h2 className="text-2xl font-bold text-slate-900">
                                {editingId ? 'Edit Expense' : 'Add New Expense'}
                            </h2>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmitExpense} className="p-6 space-y-4">
                            {/* Date and Category Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">DATE *</label>
                                    <input
                                        type="text"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        placeholder="e.g., 01 Mar 2024"
                                        required
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">CATEGORY *</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        required
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select category...</option>
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">DESCRIPTION *</label>
                                <input
                                    type="text"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Enter expense description"
                                    required
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Payment Method and Amount Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">PAYMENT METHOD *</label>
                                    <select
                                        value={formData.paymentMethod}
                                        onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                                        required
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select method...</option>
                                        {paymentMethods.map(method => (
                                            <option key={method} value={method}>{method}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">AMOUNT (₦) *</label>
                                    <input
                                        type="number"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        placeholder="0"
                                        required
                                        min="0"
                                        step="1000"
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            {/* Status */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">STATUS</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {statuses.map(status => (
                                        <option key={status} value={status}>{status}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="flex-1 px-4 py-3 border border-slate-300 rounded-lg hover:bg-slate-50 font-semibold text-slate-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors flex items-center justify-center gap-2"
                                >
                                    <Check size={18} />
                                    {editingId ? 'Update Expense' : 'Add Expense'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
