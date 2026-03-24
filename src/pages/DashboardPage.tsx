import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { IndianRupee, TrendingUp, ShoppingCart, AlertTriangle, ArrowUpRight, ArrowDownRight, Receipt } from 'lucide-react';

interface Stats {
    totalOutstanding: number;
    totalSales: number;
    totalCollections: number;
    totalProfit: number;
}

const DashboardPage: React.FC = () => {
    const [stats, setStats] = useState<Stats>({
        totalOutstanding: 0,
        totalSales: 0,
        totalCollections: 0,
        totalProfit: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/dashboard/stats');
                setStats(data);
            } catch (err: any) {
                setError('Could not load dashboard data. Is the database connected?');
                console.error('Error fetching stats:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            </div>
        );
    }

    const cards = [
        {
            title: "Today's Sales",
            value: `₹${stats.totalSales.toLocaleString()}`,
            icon: ShoppingCart,
            gradient: 'from-blue-500 to-blue-600',
            bgGlow: 'bg-blue-500/10',
            iconBg: 'bg-blue-500/10 text-blue-600',
            trend: '+12%',
            trendUp: true,
        },
        {
            title: "Collections",
            value: `₹${stats.totalCollections.toLocaleString()}`,
            icon: IndianRupee,
            gradient: 'from-emerald-500 to-emerald-600',
            bgGlow: 'bg-emerald-500/10',
            iconBg: 'bg-emerald-500/10 text-emerald-600',
            trend: '+8%',
            trendUp: true,
        },
        {
            title: "Outstanding Debt",
            value: `₹${stats.totalOutstanding.toLocaleString()}`,
            icon: AlertTriangle,
            gradient: 'from-amber-500 to-orange-500',
            bgGlow: 'bg-amber-500/10',
            iconBg: 'bg-amber-500/10 text-amber-600',
            trend: '-3%',
            trendUp: false,
        },
        {
            title: "Today's Profit",
            value: `₹${stats.totalProfit.toLocaleString()}`,
            icon: TrendingUp,
            gradient: 'from-purple-500 to-indigo-600',
            bgGlow: 'bg-purple-500/10',
            iconBg: 'bg-purple-500/10 text-purple-600',
            trend: '+15%',
            trendUp: true,
        },
    ];

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-sm text-gray-500 mt-1">Overview of your milk distribution business</p>
            </div>

            {error && (
                <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    {error}
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 stagger-children">
                {cards.map((card, i) => {
                    const Icon = card.icon;
                    return (
                        <div
                            key={i}
                            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 card-hover relative overflow-hidden group"
                        >
                            {/* Background glow */}
                            <div className={`absolute -top-8 -right-8 w-24 h-24 rounded-full ${card.bgGlow} opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl`} />

                            <div className="flex items-start justify-between relative">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">{card.title}</p>
                                    <h3 className="text-2xl font-bold text-gray-900 mt-1 tracking-tight">{card.value}</h3>
                                </div>
                                <div className={`p-2.5 rounded-xl ${card.iconBg}`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                            </div>

                            <div className="flex items-center mt-3 text-xs">
                                {card.trendUp ? (
                                    <ArrowUpRight className="w-3 h-3 text-emerald-500 mr-1" />
                                ) : (
                                    <ArrowDownRight className="w-3 h-3 text-amber-500 mr-1" />
                                )}
                                <span className={card.trendUp ? 'text-emerald-600 font-medium' : 'text-amber-600 font-medium'}>
                                    {card.trend}
                                </span>
                                <span className="text-gray-400 ml-1">vs yesterday</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Quick Actions + Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Quick Actions */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
                    <div className="space-y-3">
                        {[
                            { label: 'Add New Product', path: '/admin/products', color: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
                            { label: 'Register Shop', path: '/admin/shops', color: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' },
                            { label: 'Manage Stock', path: '/admin/stock', color: 'bg-purple-50 text-purple-700 hover:bg-purple-100' },
                            { label: 'Assign Vehicles', path: '/admin/vehicles', color: 'bg-amber-50 text-amber-700 hover:bg-amber-100' },
                        ].map((action) => (
                            <a
                                key={action.label}
                                href={action.path}
                                className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors ${action.color}`}
                            >
                                {action.label}
                                <ArrowUpRight className="w-4 h-4 opacity-50" />
                            </a>
                        ))}
                    </div>
                </div>

                {/* Recent Bills */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-900">Recent Bills</h2>
                        <span className="text-xs text-gray-400">Today</span>
                    </div>
                    <RecentBills />
                </div>
            </div>
        </div>
    );
};

const RecentBills: React.FC = () => {
    const [bills, setBills] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBills = async () => {
            try {
                const startOfDay = new Date();
                startOfDay.setHours(0, 0, 0, 0);
                const endOfDay = new Date();
                endOfDay.setHours(23, 59, 59, 999);
                const { data } = await api.get(`/bills?startDate=${startOfDay.toISOString()}&endDate=${endOfDay.toISOString()}`);
                setBills(data.slice(0, 5));
            } catch {
                // Silently fail
            } finally {
                setLoading(false);
            }
        };
        fetchBills();
    }, []);

    if (loading) {
        return <div className="text-center py-6 text-gray-400 text-sm">Loading...</div>;
    }

    if (bills.length === 0) {
        return (
            <div className="text-center py-8">
                <Receipt className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No bills created today yet</p>
            </div>
        );
    }

    return (
        <div className="divide-y divide-gray-50">
            {bills.map((bill) => (
                <div key={bill._id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <Receipt className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-800">{bill.shopId?.name || 'Unknown Shop'}</p>
                            <p className="text-xs text-gray-400">
                                {new Date(bill.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">₹{bill.totalAmount.toLocaleString()}</p>
                        {bill.paidAmount > 0 && (
                            <p className="text-xs text-emerald-500">Paid: ₹{bill.paidAmount}</p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default DashboardPage;
