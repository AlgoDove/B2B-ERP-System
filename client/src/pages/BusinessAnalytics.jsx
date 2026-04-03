import { useState, useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Area, AreaChart } from 'recharts';
import { TrendingUp, Download, Filter, Calendar, DollarSign, Users, Package, ShoppingCart } from 'lucide-react';

export default function BusinessAnalytics({ user }) {
    const [selectedMetric, setSelectedMetric] = useState('revenue');

    // Mock data for charts
    const revenueVsExpensesData = [
        { month: 'Jan', Revenue: 850000, Expenses: 720000 },
        { month: 'Feb', Revenue: 920000, Expenses: 810000 },
        { month: 'Mar', Revenue: 1150000, Expenses: 920000 },
    ];

    const topCustomersData = [
        { rank: 1, name: 'Mega Structures Inc', type: 'Construction Company', revenue: 720000, percentage: 30 },
        { rank: 2, name: 'Urban Developers', type: 'Construction Company', revenue: 560000, percentage: 23 },
        { rank: 3, name: 'BuildRight Supplies', type: 'Distributor', revenue: 425000, percentage: 18 },
        { rank: 4, name: 'ABC Trading Co', type: 'Retailer', revenue: 385000, percentage: 16 },
        { rank: 5, name: 'XYZ Materials', type: 'Wholesaler', revenue: 310000, percentage: 13 },
    ];

    const salesTrendData = [
        { date: 'Mar 1', sales: 28000, target: 35000 },
        { date: 'Mar 2', sales: 32000, target: 35000 },
        { date: 'Mar 3', sales: 29000, target: 35000 },
        { date: 'Mar 4', sales: 41000, target: 35000 },
        { date: 'Mar 5', sales: 38000, target: 35000 },
        { date: 'Mar 6', sales: 45000, target: 35000 },
        { date: 'Mar 7', sales: 52000, target: 35000 },
    ];

    const productCategoryData = [
        { category: 'Roofing Materials', sales: 380000, orders: 245 },
        { category: 'Pipes & Fittings', sales: 280000, orders: 380 },
        { category: 'Structural Materials', sales: 220000, orders: 165 },
        { category: 'Fasteners', sales: 150000, orders: 520 },
    ];

    // Calculate metrics
    const metrics = useMemo(() => {
        const totalRevenue = revenueVsExpensesData.reduce((sum, item) => sum + item.Revenue, 0);
        const totalExpenses = revenueVsExpensesData.reduce((sum, item) => sum + item.Expenses, 0);
        const netProfit = totalRevenue - totalExpenses;
        const profitMargin = ((netProfit / totalRevenue) * 100).toFixed(1);

        return {
            totalRevenue,
            netProfit,
            profitMargin,
            activeCustomers: 7,
            avgOrderValue: 87000,
        };
    }, []);

    const StatCard = ({ icon: Icon, label, value, change, bgColor }) => (
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
                <div className={`p-2.5 rounded-lg ${bgColor}`}>
                    <Icon size={20} className="text-white" />
                </div>
                {change && (
                    <span className="text-xs font-bold px-2.5 py-1 bg-green-100 text-green-700 rounded-full">
                        ↑ {change}
                    </span>
                )}
            </div>
            <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-6 py-6 sticky top-0 z-10">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                            <BarChart size={24} className="text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">Business Analytics</h1>
                            <p className="text-sm text-slate-600">Performance metrics, sales trends, and data-driven insights</p>
                        </div>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                        <Download size={18} />
                        Export Report
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-6 space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        icon={DollarSign}
                        label="Total Revenue"
                        value={`₦${(metrics.totalRevenue / 1000).toFixed(0)}k`}
                        change="+18.2%"
                        bgColor="bg-blue-600"
                    />
                    <StatCard
                        icon={TrendingUp}
                        label="Net Profit"
                        value={`₦${(metrics.netProfit / 1000).toFixed(0)}k`}
                        change={`${metrics.profitMargin}% margin`}
                        bgColor="bg-green-600"
                    />
                    <StatCard
                        icon={Users}
                        label="Active Customers"
                        value={metrics.activeCustomers}
                        change="+2"
                        bgColor="bg-purple-600"
                    />
                    <StatCard
                        icon={ShoppingCart}
                        label="Avg Order Value"
                        value={`₦${(metrics.avgOrderValue / 1000).toFixed(0)}k`}
                        change="+5.2%"
                        bgColor="bg-orange-600"
                    />
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Revenue vs Expenses */}
                    <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Revenue vs Expenses</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={revenueVsExpensesData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="month" stroke="#64748b" />
                                <YAxis stroke="#64748b" />
                                <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                                <Legend />
                                <Bar dataKey="Revenue" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                                <Bar dataKey="Expenses" fill="#ef4444" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Sales Trend */}
                    <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Sales Trend vs Target</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={salesTrendData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="date" stroke="#64748b" />
                                <YAxis stroke="#64748b" />
                                <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                                <Legend />
                                <Area type="monotone" dataKey="sales" stackId="1" stroke="#3b82f6" fill="#3b82f6" opacity={0.7} />
                                <Area type="monotone" dataKey="target" stackId="2" stroke="#10b981" fill="#10b981" opacity={0.5} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Customers Table */}
                <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Top Customers by Revenue</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-200">
                                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">RANK</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">CUSTOMER</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">TYPE</th>
                                    <th className="px-4 py-3 text-right text-xs font-bold text-slate-700 uppercase tracking-wider">TOTAL REVENUE</th>
                                    <th className="px-4 py-3 text-right text-xs font-bold text-slate-700 uppercase tracking-wider">% OF TOTAL</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topCustomersData.map((customer, index) => (
                                    <tr key={index} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3">
                                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-sm font-bold">
                                                {customer.rank}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="text-sm font-medium text-slate-900">{customer.name}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-sm text-slate-600">{customer.type}</span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <span className="text-sm font-semibold text-slate-900">₦{(customer.revenue / 1000).toFixed(0)}k</span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <span className="text-sm font-semibold text-blue-600">{customer.percentage}%</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Product Category Performance */}
                <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Product Category Performance</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={productCategoryData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="category" stroke="#64748b" />
                            <YAxis stroke="#64748b" />
                            <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                            <Legend />
                            <Bar dataKey="sales" fill="#3b82f6" radius={[8, 8, 0, 0]} name="Sales (₦)" />
                            <Bar dataKey="orders" fill="#8b5cf6" radius={[8, 8, 0, 0]} name="Orders" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Key Insights */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm font-medium text-blue-700 mb-2">💡 Insight</p>
                        <p className="text-xs text-blue-900">Revenue is up 18.2% this month, driven by increased orders from Construction companies</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                        <p className="text-sm font-medium text-green-700 mb-2">🎯 Opportunity</p>
                        <p className="text-xs text-green-900">Roofing Materials dominate 45% of sales - consider expanding this product line</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
                        <p className="text-sm font-medium text-purple-700 mb-2">⚠️ Alert</p>
                        <p className="text-xs text-purple-900">Customer concentration risk: Top 2 customers account for 53% of revenue</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
