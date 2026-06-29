import { Bell, AlertTriangle, CheckCircle, Info } from 'lucide-react';

export default function AlertsInsights({ user }) {
    return (
        <div className="min-h-screen bg-slate-50">
            <div className="bg-white border-b border-slate-200 px-6 py-6 sticky top-0 z-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-red-100 p-2 rounded-lg">
                            <Bell size={24} className="text-red-600" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">Alerts & Insights</h1>
                            <p className="text-sm text-slate-600">Monitor system alerts, inventory warnings, and receive decision support</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="p-6 space-y-6">
                <div className="grid gap-4">
                    <div className="bg-white shadow-sm rounded-lg p-5 border-l-4 border-l-red-500 border border-slate-200 flex items-start gap-4 hover:shadow-md transition-shadow">
                        <div className="bg-red-50 p-2 rounded-full">
                            <AlertTriangle className="text-red-500 shrink-0" size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900">Low Stock Alert: Premium Cement (50kg)</h3>
                            <p className="text-slate-600 text-sm mt-1">Current stock levels are critically below the minimum threshold (15 units remaining). Automatic reorder suggestion generated.</p>
                            <button className="mt-3 text-sm font-semibold text-red-600 hover:text-red-800">Review Reorder Request →</button>
                        </div>
                    </div>
                    
                    <div className="bg-white shadow-sm rounded-lg p-5 border-l-4 border-l-yellow-500 border border-slate-200 flex items-start gap-4 hover:shadow-md transition-shadow">
                        <div className="bg-yellow-50 p-2 rounded-full">
                            <Info className="text-yellow-600 shrink-0" size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900">Payment Overdue: BuildRight Supplies</h3>
                            <p className="text-slate-600 text-sm mt-1">Invoice #WHS-2024-004 for LKR 89,500 is 5 days overdue. Automated reminder sent to the customer.</p>
                            <button className="mt-3 text-sm font-semibold text-yellow-600 hover:text-yellow-700">View Invoice Details →</button>
                        </div>
                    </div>
                    
                    <div className="bg-white shadow-sm rounded-lg p-5 border-l-4 border-l-green-500 border border-slate-200 flex items-start gap-4 hover:shadow-md transition-shadow">
                        <div className="bg-green-50 p-2 rounded-full">
                            <CheckCircle className="text-green-500 shrink-0" size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900">Sales Milestone Achieved</h3>
                            <p className="text-slate-600 text-sm mt-1">Congratulations! Monthly revenue has surpassed last month's total by 18.2%. Excellent performance in the construction segment.</p>
                        </div>
                    </div>
                    
                    <div className="bg-white shadow-sm rounded-lg p-5 border-l-4 border-l-blue-500 border border-slate-200 flex items-start gap-4 hover:shadow-md transition-shadow">
                        <div className="bg-blue-50 p-2 rounded-full">
                            <Info className="text-blue-500 shrink-0" size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900">Market Insight Generated</h3>
                            <p className="text-slate-600 text-sm mt-1">Demand for PVC pipes is anticipated to rise by 15% next month based on local construction trends in your delivery zones.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
