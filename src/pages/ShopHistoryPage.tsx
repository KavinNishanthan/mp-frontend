import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { ArrowLeft, Receipt, IndianRupee, ChevronDown, ChevronUp, Trash2, Clock, Filter } from 'lucide-react';
// import { ArrowLeft, Calendar, Receipt, IndianRupee, ChevronDown, ChevronUp, Trash2, Clock, Filter } from 'lucide-react';

interface Transaction {
    type: 'BILL' | 'PAYMENT';
    _id: string;
    date: string;
    amount: number;
    paidAmount?: number;
    balanceOnBill?: number;
    driver?: { _id: string; name: string };
    vehicle?: { _id: string; registrationNumber: string };
    items?: any[];
    isDeleted?: boolean;
    outstandingAfter?: number;
    runningBalance: number;
}

interface ShopHistoryData {
    shop: { _id: string; name: string; address: string };
    currentOutstanding: number;
    totalBills: number;
    totalPayments: number;
    transactions: Transaction[];
}

type DatePreset = 'today' | 'yesterday' | 'thisWeek' | 'thisMonth' | 'allTime' | 'custom';

const ShopHistoryPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [data, setData] = useState<ShopHistoryData | null>(null);
    const [loading, setLoading] = useState(true);
    const [preset, setPreset] = useState<DatePreset>('allTime');
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');
    const [expandedBills, setExpandedBills] = useState<Set<string>>(new Set());
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    const getDateRange = (p: DatePreset): { startDate?: string; endDate?: string } => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        switch (p) {
            case 'today':
                return { startDate: today.toISOString(), endDate: new Date(today.getTime() + 86400000 - 1).toISOString() };
            case 'yesterday': {
                const y = new Date(today.getTime() - 86400000);
                return { startDate: y.toISOString(), endDate: new Date(y.getTime() + 86400000 - 1).toISOString() };
            }
            case 'thisWeek': {
                const day = today.getDay();
                const start = new Date(today.getTime() - day * 86400000);
                return { startDate: start.toISOString(), endDate: now.toISOString() };
            }
            case 'thisMonth': {
                const start = new Date(now.getFullYear(), now.getMonth(), 1);
                return { startDate: start.toISOString(), endDate: now.toISOString() };
            }
            case 'custom':
                if (customStart && customEnd) {
                    return { startDate: new Date(customStart).toISOString(), endDate: new Date(customEnd + 'T23:59:59').toISOString() };
                }
                return {};
            case 'allTime':
            default:
                return {};
        }
    };

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const range = getDateRange(preset);
            const params = new URLSearchParams();
            if (range.startDate) params.set('startDate', range.startDate);
            if (range.endDate) params.set('endDate', range.endDate);

            const { data: d } = await api.get(`/shops/${id}/history?${params.toString()}`);
            setData(d);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { if (id) fetchHistory(); }, [id, preset, customStart, customEnd]);

    const toggleBill = (billId: string) => {
        const n = new Set(expandedBills);
        if (n.has(billId)) n.delete(billId);
        else n.add(billId);
        setExpandedBills(n);
    };

    const presetButtons: { label: string; value: DatePreset }[] = [
        { label: 'Today', value: 'today' },
        { label: 'Yesterday', value: 'yesterday' },
        { label: 'This Week', value: 'thisWeek' },
        { label: 'This Month', value: 'thisMonth' },
        { label: 'All Time', value: 'allTime' },
        { label: 'Custom', value: 'custom' },
    ];

    const transactions = data?.transactions
        ? (sortOrder === 'desc' ? [...data.transactions].reverse() : data.transactions)
        : [];

    if (loading && !data) {
        return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" /></div>;
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-3">
                <button onClick={() => navigate('/admin/shops')} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{data?.shop.name}</h1>
                    <p className="text-sm text-gray-500">{data?.shop.address}</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Current Outstanding</p>
                    <p className="text-xl font-bold text-red-600">₹{(data?.currentOutstanding ?? 0).toLocaleString()}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Total Bills</p>
                    <p className="text-xl font-bold text-indigo-600">{data?.totalBills ?? 0}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Total Payments</p>
                    <p className="text-xl font-bold text-green-600">{data?.totalPayments ?? 0}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Transactions</p>
                    <p className="text-xl font-bold text-gray-800">{transactions.length}</p>
                </div>
            </div>

            {/* Date Filters */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Filter className="w-4 h-4" /> Date Filter
                </div>
                <div className="flex flex-wrap gap-2">
                    {presetButtons.map(b => (
                        <button
                            key={b.value}
                            onClick={() => setPreset(b.value)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${preset === b.value
                                    ? 'bg-indigo-600 text-white shadow-sm'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {b.label}
                        </button>
                    ))}
                </div>
                {preset === 'custom' && (
                    <div className="flex gap-3 items-center">
                        <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm" />
                        <span className="text-gray-400 text-sm">to</span>
                        <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm" />
                    </div>
                )}
                <div className="flex justify-end">
                    <button
                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                        className="text-xs text-gray-500 hover:text-gray-800 flex items-center gap-1"
                    >
                        {sortOrder === 'asc' ? 'Oldest First' : 'Newest First'}
                        {sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                </div>
            </div>

            {/* Transaction Timeline */}
            <div className="space-y-3">
                {transactions.length === 0 && (
                    <div className="text-center text-gray-400 py-12">No transactions found for the selected period</div>
                )}
                {transactions.map(t => (
                    <div key={`${t.type}-${t._id}`} className={`bg-white rounded-2xl shadow-sm border overflow-hidden transition-all ${t.isDeleted ? 'border-red-200 opacity-60' : 'border-gray-100'}`}>
                        <div
                            className={`p-4 flex items-center justify-between cursor-pointer ${t.type === 'BILL' ? 'hover:bg-indigo-50/50' : 'hover:bg-green-50/50'}`}
                            onClick={() => t.type === 'BILL' && toggleBill(t._id)}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.type === 'BILL' ? 'bg-indigo-100 text-indigo-600' : 'bg-green-100 text-green-600'
                                    }`}>
                                    {t.type === 'BILL' ? <Receipt className="w-5 h-5" /> : <IndianRupee className="w-5 h-5" />}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-sm text-gray-900">
                                            {t.type === 'BILL' ? 'Bill' : 'Payment'}
                                        </span>
                                        {t.isDeleted && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5"><Trash2 className="w-2.5 h-2.5" /> Deleted</span>}
                                    </div>
                                    <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5"><Clock className="w-3 h-3" /> {new Date(t.date).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                                    {t.driver && <div className="text-[11px] text-gray-400 mt-0.5">By: {t.driver.name}</div>}
                                </div>
                            </div>
                            <div className="text-right">
                                <p className={`font-bold text-sm ${t.type === 'BILL' ? 'text-red-600' : 'text-green-600'}`}>
                                    {t.type === 'BILL' ? '+' : '-'}₹{t.amount.toLocaleString()}
                                </p>
                                {t.type === 'BILL' && t.paidAmount !== undefined && t.paidAmount > 0 && (
                                    <p className="text-[10px] text-green-500">Paid: ₹{t.paidAmount.toLocaleString()}</p>
                                )}
                                <p className="text-[10px] text-gray-400 mt-0.5">Bal: ₹{t.runningBalance.toLocaleString()}</p>
                            </div>
                        </div>

                        {/* Expanded Bill Items */}
                        {t.type === 'BILL' && expandedBills.has(t._id) && t.items && (
                            <div className="border-t border-gray-100 px-4 py-3 bg-gray-50/50 space-y-1.5">
                                {t.items.map((item: any, idx: number) => (
                                    <div key={idx} className="flex justify-between text-xs text-gray-600">
                                        <span>{item.productId?.name || 'Product'} × {item.quantity}</span>
                                        <span className="font-medium">₹{item.total}</span>
                                    </div>
                                ))}
                                <div className="border-t border-gray-200 pt-1.5 flex justify-between text-xs font-bold text-gray-800">
                                    <span>Total</span>
                                    <span>₹{t.amount.toLocaleString()}</span>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ShopHistoryPage;
