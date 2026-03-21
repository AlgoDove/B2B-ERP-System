import { useState, useEffect } from 'react';
import { fetchSegments, updateSegment } from '../services/api';

export default function Segments() {
    const [segments, setSegments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        loadSegments();
    }, []);

    const loadSegments = async () => {
        try {
            setLoading(true);
            const data = await fetchSegments();
            setSegments(data);
        } catch (err) {
            setErrorMsg('Failed to load segments.');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (id, field, value) => {
        setSegments(segments.map(s => s._id === id ? { ...s, [field]: value === '' ? '' : Number(value) } : s));
    };

    const handleSave = async (id) => {
        setSaving(true);
        setSuccessMsg('');
        setErrorMsg('');
        try {
            const segment = segments.find(s => s._id === id);
            const dataToSave = { ...segment, maxPurchase: segment.maxPurchase === '' ? null : segment.maxPurchase };
            await updateSegment(id, dataToSave);
            setSuccessMsg(`Segment ${segment.segmentName} config updated successfully.`);
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
            setErrorMsg('Failed to update segment config.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="flex h-full items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500 mt-4">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-50 rounded-bl-full -z-10 opacity-60"></div>
                <h2 className="text-3xl font-extrabold text-indigo-900 tracking-tight">Segment Tuning</h2>
                <p className="text-gray-500 mt-2 text-base leading-relaxed max-w-2xl">
                    Adjust the minimum purchase limits and discount increment rules for dynamic segmentation.
                    These calculations apply instantly across the entire customer base.
                </p>
            </div>

            {successMsg && <div className="p-4 bg-green-50 text-green-700 font-medium rounded-xl border border-green-200 shadow-sm flex items-center gap-2">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                {successMsg}
            </div>}
            {errorMsg && <div className="p-4 bg-red-50 text-red-700 font-medium rounded-xl border border-red-200 shadow-sm flex items-center gap-2">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                {errorMsg}
            </div>}

            <div className="space-y-6">
                {segments.map(segment => (
                    <div key={segment._id} className="bg-white rounded-2xl shadow hover:shadow-md transition-shadow duration-300 overflow-hidden border border-gray-100 group">
                        <div className={`px-8 py-5 border-b flex justify-between items-center ${segment.segmentName === 'Platinum' ? 'bg-gradient-to-r from-purple-100 to-purple-50 text-purple-900 border-purple-200' :
                                segment.segmentName === 'Gold' ? 'bg-gradient-to-r from-amber-100 to-amber-50 text-amber-900 border-amber-200' :
                                    'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-900 border-gray-200'
                            }`}>
                            <div>
                                <h3 className="text-xl font-extrabold tracking-tight">
                                    {segment.segmentName} Tier
                                </h3>
                            </div>
                        </div>
                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-5">
                                <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                                    <div className="h-6 w-1 bg-indigo-500 rounded-full"></div>
                                    <h4 className="font-bold text-gray-800 tracking-wide">PURCHASE BOUNDARIES</h4>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Min Purchase ($)</label>
                                    <input
                                        type="number"
                                        value={segment.minPurchase}
                                        onChange={(e) => handleInputChange(segment._id, 'minPurchase', e.target.value)}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex justify-between">
                                        <span>Max Purchase ($)</span>
                                        <span className="text-xs text-gray-400 font-normal italic">Leave empty for infinite</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={segment.maxPurchase === null ? '' : segment.maxPurchase}
                                        onChange={(e) => handleInputChange(segment._id, 'maxPurchase', e.target.value)}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
                                    />
                                </div>
                            </div>
                            <div className="space-y-5">
                                <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                                    <div className="h-6 w-1 bg-green-500 rounded-full"></div>
                                    <h4 className="font-bold text-gray-800 tracking-wide">DISCOUNT RULES</h4>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Base Discount (%)</label>
                                    <input
                                        type="number" step="0.1"
                                        value={segment.baseDiscount}
                                        onChange={(e) => handleInputChange(segment._id, 'baseDiscount', e.target.value)}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
                                    />
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">+ Increment (%)</label>
                                        <input
                                            type="number" step="0.1"
                                            value={segment.incrementPerAmount}
                                            onChange={(e) => handleInputChange(segment._id, 'incrementPerAmount', e.target.value)}
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Per Amount ($)</label>
                                        <input
                                            type="number"
                                            value={segment.incrementUnit}
                                            onChange={(e) => handleInputChange(segment._id, 'incrementUnit', e.target.value)}
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 px-8 py-5 flex justify-end border-t border-gray-100">
                            <button
                                onClick={() => handleSave(segment._id)}
                                disabled={saving}
                                className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 hover:-translate-y-0.5 shadow-md shadow-indigo-200 transition-all disabled:bg-indigo-400 disabled:transform-none"
                            >
                                {saving ? 'Saving...' : 'Save Configuration'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
