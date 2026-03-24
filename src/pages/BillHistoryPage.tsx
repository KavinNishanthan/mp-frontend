import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { FileText, Calendar } from 'lucide-react';

interface BillItem {
    productId: { name: string; unit: string };
    quantity: number;
    sellingPrice: number;
    total: number;
}

interface Bill {
    _id: string;
    shopId: { _id: string; name: string };
    driverId: { _id: string; name: string };
    date: string;
    items: BillItem[];
    totalAmount: number;
    paidAmount: number;
    balanceOnBill: number;
}

const BillHistoryPage: React.FC = () => {
    const [bills, setBills] = useState<Bill[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedBill, setExpandedBill] = useState<string | null>(null);

    // Date filter
    const today = new Date().toISOString().split('T')[0];
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);

    const fetchBills = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (startDate) params.append('startDate', new Date(startDate).toISOString());
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                params.append('endDate', end.toISOString());
            }
            const { data } = await api.get(`/bills?${params.toString()}`);
            setBills(data);
        } catch (err) {
            console.error('Error fetching bills:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchBills(); }, []);

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        fetchBills();
    };

    return (
        <div className="max-w-lg mx-auto space-y-4">
            <h1 className="text-xl font-bold flex items-center gap-2">
                <FileText className="w-6 h-6 text-blue-600" />
                Bill History
            </h1>

            {/* Date Filter */}
            <form onSubmit={handleFilter} className="bg-white p-3 rounded shadow-sm flex items-end gap-2 flex-wrap">
                <div className="flex-1 min-w-[120px]">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                        <Calendar className="w-3 h-3 inline mr-1" />From
                    </label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full border rounded p-1.5 text-sm"
                    />
                </div>
                <div className="flex-1 min-w-[120px]">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                        <Calendar className="w-3 h-3 inline mr-1" />To
                    </label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full border rounded p-1.5 text-sm"
                    />
                </div>
                <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm hover:bg-blue-700"
                >
                    Filter
                </button>
            </form>

            {loading ? (
                <div className="text-gray-500 text-center py-4">Loading bills...</div>
            ) : bills.length === 0 ? (
                <div className="bg-white p-6 rounded shadow-sm text-center text-gray-400">
                    No bills found for the selected period.
                </div>
            ) : (
                <div className="space-y-3">
                    {bills.map(bill => {
                        const date = new Date(bill.date);
                        const isExpanded = expandedBill === bill._id;
                        return (
                            <div key={bill._id} className="bg-white rounded shadow-sm overflow-hidden">
                                <button
                                    onClick={() => setExpandedBill(isExpanded ? null : bill._id)}
                                    className="w-full text-left p-4 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-medium text-gray-800">{bill.shopId?.name || 'Unknown Shop'}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                {date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                {' · '}
                                                {date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-gray-800">₹{bill.totalAmount.toLocaleString()}</p>
                                            {bill.paidAmount > 0 && (
                                                <p className="text-xs text-green-600">Paid: ₹{bill.paidAmount}</p>
                                            )}
                                            {bill.balanceOnBill > 0 && (
                                                <p className="text-xs text-red-500">Due: ₹{bill.balanceOnBill}</p>
                                            )}
                                        </div>
                                    </div>
                                </button>
                                {isExpanded && (
                                    <div className="border-t px-4 py-3 bg-gray-50 text-sm">
                                        <table className="w-full text-xs">
                                            <thead>
                                                <tr className="text-gray-500">
                                                    <th className="text-left pb-1">Item</th>
                                                    <th className="text-right pb-1">Qty</th>
                                                    <th className="text-right pb-1">Price</th>
                                                    <th className="text-right pb-1">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {bill.items.map((item, idx) => (
                                                    <tr key={idx} className="border-t border-gray-200">
                                                        <td className="py-1">{item.productId?.name || 'Unknown'}</td>
                                                        <td className="py-1 text-right">{item.quantity}</td>
                                                        <td className="py-1 text-right">₹{item.sellingPrice}</td>
                                                        <td className="py-1 text-right font-medium">₹{item.total}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default BillHistoryPage;
