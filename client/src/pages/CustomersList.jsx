import { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Eye, Edit2, Trash2, ShoppingCart } from 'lucide-react';
import { fetchCustomers } from '../services/api';

const ITEMS_PER_PAGE = 7;

export default function CustomersList({ user }) {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    useEffect(() => {
        loadCustomers();
    }, []);

    const loadCustomers = async () => {
        try {
            setLoading(true);
            const data = await fetchCustomers();
            setCustomers(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Filter & Search Logic
    const filteredCustomers = useMemo(() => {
        if (!searchTerm) return customers;

        const term = searchTerm.toLowerCase();
        return customers.filter(c =>
            c.name.toLowerCase().includes(term) ||
            c.country.toLowerCase().includes(term) ||
            c.email.toLowerCase().includes(term)
        );
    }, [customers, searchTerm]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE);
    const paginatedCustomers = filteredCustomers.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const getSegmentColor = (segment) => {
        switch (segment) {
            case 'Gold':
                return 'bg-yellow-100 text-yellow-800';
            case 'Platinum':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-slate-100 text-slate-800';
        }
    };

    const handleCreateOrder = (customer) => {
        alert(`Create order for ${customer.name}`);
    };

    const handleViewDetails = (customer) => {
        setSelectedCustomer(customer);
    };

    return (
        <div className="space-y-6 pb-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-1">Customers</h1>
                <p className="text-slate-600">View and manage customer information for order creation</p>
            </div>

            {/* Search Bar */}
            <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex-1 relative w-full">
                        <Search size={18} className="absolute left-3 top-3 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search customers by name, email, or country..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                        />
                    </div>
                </div>
            </div>

            {/* Customers Table */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center">
                        <p className="text-slate-600">Loading customers...</p>
                    </div>
                ) : paginatedCustomers.length === 0 ? (
                    <div className="p-8 text-center">
                        <p className="text-slate-600">No customers found.</p>
                    </div>
                ) : (
                    <>
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Customer Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Country</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Segment</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Total Purchase</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {paginatedCustomers.map((customer) => (
                                    <tr key={customer._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                                                    {customer.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-900">{customer.name}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{customer.email}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{customer.country}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getSegmentColor(customer.segment)}`}>
                                                {customer.segment}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-semibold text-slate-900">₦{(customer.totalPurchaseAmount / 1000).toFixed(0)}k</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleViewDetails(customer)}
                                                    className="p-1.5 text-slate-600 hover:text-blue-600 transition-colors"
                                                    title="View details"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleCreateOrder(customer)}
                                                    className="p-1.5 text-slate-600 hover:text-green-600 transition-colors"
                                                    title="Create order"
                                                >
                                                    <ShoppingCart size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                            <p className="text-sm text-slate-600">
                                Showing {paginatedCustomers.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredCustomers.length)} of {filteredCustomers.length} customers
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 border border-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white font-medium text-sm"
                                >
                                    Previous
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`px-3 py-2 rounded-lg text-sm font-medium ${currentPage === page
                                            ? 'bg-blue-600 text-white'
                                            : 'border border-slate-300 hover:bg-white'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 border border-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white font-medium text-sm"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Customer Details Modal */}
            {selectedCustomer && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 max-w-md w-full m-4 shadow-2xl">
                        <h3 className="text-2xl font-bold text-slate-900 mb-4">{selectedCustomer.name}</h3>
                        <div className="space-y-3 mb-6">
                            <div>
                                <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Email</p>
                                <p className="text-sm text-slate-900">{selectedCustomer.email}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Phone</p>
                                <p className="text-sm text-slate-900">{selectedCustomer.phone}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Country</p>
                                <p className="text-sm text-slate-900">{selectedCustomer.country}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Segment</p>
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getSegmentColor(selectedCustomer.segment)}`}>
                                    {selectedCustomer.segment}
                                </span>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Total Purchase Amount</p>
                                <p className="text-sm text-slate-900">₦{(selectedCustomer.totalPurchaseAmount / 1000).toFixed(0)}k</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setSelectedCustomer(null)}
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
