import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { BarChart3, IndianRupee, TrendingUp, AlertTriangle, Filter, Package, Store } from 'lucide-react';

type DatePreset = 'today' | 'yesterday' | 'thisWeek' | 'thisMonth' | 'allTime' | 'custom';
type TabType = 'sales' | 'profit' | 'outstanding';

interface ReportData {
    totalSales: number;
    totalCollections: number;
    totalProfit: number;
    totalOutstanding: number;
    billCount: number;
    profitByProduct: { name: string; unit: string; profit: number; sales: number; qty: number }[];
    profitByShop: { name: string; profit: number; sales: number; collections: number; outstanding: number }[];
    outstandingByShop: { name: string; outstanding: number }[];
}

const ReportsPage: React.FC = () => {
    const [data, setData] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState(true);
    const [preset, setPreset] = useState<DatePreset>('thisMonth');
    const [activeTab, setActiveTab] = useState<TabType>('sales');
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');

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

    const fetchReport = async () => {
        setLoading(true);
        try {
            const range = getDateRange(preset);
            const params = new URLSearchParams();
            if (range.startDate) params.set('startDate', range.startDate);
            if (range.endDate) params.set('endDate', range.endDate);
            const { data: d } = await api.get(`/dashboard/reports?${params.toString()}`);
            setData(d);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchReport(); }, [preset, customStart, customEnd]);

    const presetButtons: { label: string; value: DatePreset }[] = [
        { label: 'Today', value: 'today' },
        { label: 'Yesterday', value: 'yesterday' },
        { label: 'This Week', value: 'thisWeek' },
        { label: 'This Month', value: 'thisMonth' },
        { label: 'All Time', value: 'allTime' },
        { label: 'Custom', value: 'custom' },
    ];

    const tabs: { label: string; value: TabType; icon: React.ElementType }[] = [
        { label: 'Sales', value: 'sales', icon: BarChart3 },
        { label: 'Profit', value: 'profit', icon: TrendingUp },
        { label: 'Outstanding', value: 'outstanding', icon: AlertTriangle },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <BarChart3 className="w-7 h-7 text-indigo-600" />
                Financial Reports
            </h1>

            {/* Date Filters */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700"><Filter className="w-4 h-4" /> Period</div>
                <div className="flex flex-wrap gap-2">
                    {presetButtons.map(b => (
                        <button key={b.value} onClick={() => setPreset(b.value)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${preset === b.value ? 'bg-indigo-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
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
            </div>

            {/* Summary Cards */}
            {loading ? (
                <div className="flex justify-center py-8"><div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" /></div>
            ) : data && (
                <>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-5 rounded-2xl shadow-lg shadow-blue-200">
                            <p className="text-xs text-blue-100 mb-1">Total Sales</p>
                            <p className="text-2xl font-bold">₹{data.totalSales.toLocaleString()}</p>
                            <p className="text-[10px] text-blue-200 mt-1">{data.billCount} bills</p>
                        </div>
                        <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-5 rounded-2xl shadow-lg shadow-green-200">
                            <p className="text-xs text-green-100 mb-1">Collections</p>
                            <p className="text-2xl font-bold">₹{data.totalCollections.toLocaleString()}</p>
                        </div>
                        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-5 rounded-2xl shadow-lg shadow-purple-200">
                            <p className="text-xs text-purple-100 mb-1">Total Profit</p>
                            <p className="text-2xl font-bold">₹{data.totalProfit.toLocaleString()}</p>
                        </div>
                        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-5 rounded-2xl shadow-lg shadow-red-200">
                            <p className="text-xs text-red-100 mb-1">Outstanding</p>
                            <p className="text-2xl font-bold">₹{data.totalOutstanding.toLocaleString()}</p>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="flex border-b border-gray-100">
                            {tabs.map(t => {
                                const Icon = t.icon;
                                return (
                                    <button key={t.value} onClick={() => setActiveTab(t.value)}
                                        className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-all ${activeTab === t.value ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-gray-500 hover:text-gray-700'}`}>
                                        <Icon className="w-4 h-4" /> {t.label}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="p-4">
                            {/* Sales Tab */}
                            {activeTab === 'sales' && (
                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5"><Store className="w-4 h-4" /> Shop-wise Sales</h3>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead><tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                                                <th className="pb-2 pr-4">Shop</th><th className="pb-2 pr-4 text-right">Sales</th><th className="pb-2 pr-4 text-right">Collections</th><th className="pb-2 text-right">Outstanding</th>
                                            </tr></thead>
                                            <tbody>
                                                {data.profitByShop.map((s, i) => (
                                                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
                                                        <td className="py-2.5 pr-4 font-medium text-gray-800">{s.name}</td>
                                                        <td className="py-2.5 pr-4 text-right text-blue-600 font-medium">₹{s.sales.toLocaleString()}</td>
                                                        <td className="py-2.5 pr-4 text-right text-green-600">₹{s.collections.toLocaleString()}</td>
                                                        <td className="py-2.5 text-right text-red-500">₹{Math.max(0, s.outstanding).toLocaleString()}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Profit Tab */}
                            {activeTab === 'profit' && (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5 mb-3"><Package className="w-4 h-4" /> Product-wise Profit</h3>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead><tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                                                    <th className="pb-2 pr-4">Product</th><th className="pb-2 pr-4 text-right">Qty Sold</th><th className="pb-2 pr-4 text-right">Sales</th><th className="pb-2 text-right">Profit</th>
                                                </tr></thead>
                                                <tbody>
                                                    {data.profitByProduct.map((p, i) => (
                                                        <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
                                                            <td className="py-2.5 pr-4 font-medium text-gray-800">{p.name}</td>
                                                            <td className="py-2.5 pr-4 text-right text-gray-600">{p.qty} {p.unit}</td>
                                                            <td className="py-2.5 pr-4 text-right text-blue-600">₹{p.sales.toLocaleString()}</td>
                                                            <td className="py-2.5 text-right text-purple-600 font-bold">₹{p.profit.toLocaleString()}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5 mb-3"><Store className="w-4 h-4" /> Shop-wise Profit</h3>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead><tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                                                    <th className="pb-2 pr-4">Shop</th><th className="pb-2 pr-4 text-right">Sales</th><th className="pb-2 text-right">Profit</th>
                                                </tr></thead>
                                                <tbody>
                                                    {data.profitByShop.map((s, i) => (
                                                        <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
                                                            <td className="py-2.5 pr-4 font-medium text-gray-800">{s.name}</td>
                                                            <td className="py-2.5 pr-4 text-right text-blue-600">₹{s.sales.toLocaleString()}</td>
                                                            <td className="py-2.5 text-right text-purple-600 font-bold">₹{s.profit.toLocaleString()}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Outstanding Tab */}
                            {activeTab === 'outstanding' && (
                                <div className="space-y-3">
                                    <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                                        <p className="text-sm text-red-600 font-medium">Total Outstanding Debt</p>
                                        <p className="text-3xl font-bold text-red-700">₹{data.totalOutstanding.toLocaleString()}</p>
                                    </div>
                                    <div className="space-y-2">
                                        {data.outstandingByShop.map((s, i) => (
                                            <div key={i} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
                                                <span className="text-sm font-medium text-gray-800">{s.name}</span>
                                                <span className="text-sm font-bold text-red-600">₹{s.outstanding.toLocaleString()}</span>
                                            </div>
                                        ))}
                                        {data.outstandingByShop.length === 0 && (
                                            <div className="text-center text-gray-400 py-6">No outstanding balances</div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ReportsPage;
