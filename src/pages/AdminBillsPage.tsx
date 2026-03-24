import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { Receipt, Filter, Edit, Trash2, X, Check, AlertTriangle, Clock, ChevronDown, ChevronUp, Search } from 'lucide-react';

type DatePreset = 'today' | 'yesterday' | 'thisWeek' | 'thisMonth' | 'allTime' | 'custom';

interface BillItem {
    productId: { _id: string; name: string; unit: string } | string;
    quantity: number;
    sellingPrice: number;
    total: number;
    costPriceSnapshot: number;
}

interface Bill {
    _id: string;
    shopId: { _id: string; name: string };
    vehicleId: { _id: string; registrationNumber: string };
    driverId: { _id: string; name: string };
    date: string;
    items: BillItem[];
    totalAmount: number;
    paidAmount: number;
    balanceOnBill: number;
    isDeleted?: boolean;
}

interface Product {
    _id: string;
    name: string;
    unit: string;
    defaultSellingPrice: number;
    costPrice: number;
}

const AdminBillsPage: React.FC = () => {
    const [bills, setBills] = useState<Bill[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [preset, setPreset] = useState<DatePreset>('thisMonth');
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');
    const [searchShop, setSearchShop] = useState('');
    const [expandedBill, setExpandedBill] = useState<string | null>(null);
    const [editingBill, setEditingBill] = useState<Bill | null>(null);
    const [editItems, setEditItems] = useState<any[]>([]);
    const [editPaidAmount, setEditPaidAmount] = useState(0);
    const [editReason, setEditReason] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [deleteReason, setDeleteReason] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState('');
    const [auditLog, setAuditLog] = useState<any[] | null>(null);
    const [auditBillId, setAuditBillId] = useState<string | null>(null);

    const getDateRange = (p: DatePreset) => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        switch (p) {
            case 'today': return { startDate: today.toISOString(), endDate: new Date(today.getTime() + 86400000 - 1).toISOString() };
            case 'yesterday': { const y = new Date(today.getTime() - 86400000); return { startDate: y.toISOString(), endDate: new Date(y.getTime() + 86400000 - 1).toISOString() }; }
            case 'thisWeek': { const d = today.getDay(); return { startDate: new Date(today.getTime() - d * 86400000).toISOString(), endDate: now.toISOString() }; }
            case 'thisMonth': return { startDate: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(), endDate: now.toISOString() };
            case 'custom': return customStart && customEnd ? { startDate: new Date(customStart).toISOString(), endDate: new Date(customEnd + 'T23:59:59').toISOString() } : {};
            default: return {};
        }
    };

    const fetchBills = useCallback(async () => {
        setLoading(true);
        try {
            const range = getDateRange(preset);
            const params = new URLSearchParams();
            if (range.startDate) params.set('startDate', range.startDate);
            if (range.endDate) params.set('endDate', range.endDate);
            params.set('includeDeleted', 'true');
            const { data } = await api.get(`/bills?${params.toString()}`);
            setBills(data);
        } catch (err) { console.error(err); } finally { setLoading(false); }
    }, [preset, customStart, customEnd]);

    useEffect(() => { fetchBills(); }, [fetchBills]);
    useEffect(() => { api.get('/products').then(r => setProducts(r.data)).catch(console.error); }, []);

    const openEdit = (bill: Bill) => {
        setEditingBill(bill);
        setEditItems(bill.items.map(i => ({
            productId: typeof i.productId === 'object' ? i.productId._id : i.productId,
            productName: typeof i.productId === 'object' ? i.productId.name : '',
            quantity: i.quantity,
            sellingPrice: i.sellingPrice,
            costPriceSnapshot: i.costPriceSnapshot,
        })));
        setEditPaidAmount(bill.paidAmount);
        setEditReason('');
    };

    const handleEditSubmit = async () => {
        if (!editingBill) return;
        setSubmitting(true);
        try {
            await api.put(`/bills/${editingBill._id}`, {
                items: editItems.map(i => ({
                    productId: i.productId,
                    quantity: i.quantity,
                    sellingPrice: i.sellingPrice,
                    costPriceSnapshot: i.costPriceSnapshot,
                })),
                paidAmount: editPaidAmount,
                reason: editReason || 'Admin correction',
            });
            setEditingBill(null);
            setSuccess('Bill updated successfully');
            fetchBills();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) { alert(err.response?.data?.message || 'Update failed'); } finally { setSubmitting(false); }
    };

    const handleDelete = async (billId: string) => {
        setSubmitting(true);
        try {
            await api.delete(`/bills/${billId}`, { data: { reason: deleteReason || 'Admin deletion' } });
            setDeleteConfirm(null);
            setDeleteReason('');
            setSuccess('Bill deleted successfully');
            fetchBills();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) { alert(err.response?.data?.message || 'Delete failed'); } finally { setSubmitting(false); }
    };

    const viewAudit = async (billId: string) => {
        try {
            const { data } = await api.get(`/bills/${billId}/audit`);
            setAuditLog(data);
            setAuditBillId(billId);
        } catch (err) { console.error(err); }
    };

    const filteredBills = bills.filter(b => {
        if (searchShop) {
            const shopName = typeof b.shopId === 'object' ? b.shopId.name : '';
            return shopName.toLowerCase().includes(searchShop.toLowerCase());
        }
        return true;
    });

    const presetButtons = [
        { label: 'Today', value: 'today' as DatePreset },
        { label: 'Yesterday', value: 'yesterday' as DatePreset },
        { label: 'This Week', value: 'thisWeek' as DatePreset },
        { label: 'This Month', value: 'thisMonth' as DatePreset },
        { label: 'All Time', value: 'allTime' as DatePreset },
        { label: 'Custom', value: 'custom' as DatePreset },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Receipt className="w-7 h-7 text-indigo-600" />
                Bill Management
            </h1>

            {success && (
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2 animate-slide-up">
                    <Check className="w-4 h-4" /> {success}
                </div>
            )}

            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700"><Filter className="w-4 h-4" /> Filters</div>
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
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input type="text" placeholder="Filter by shop name..." value={searchShop} onChange={e => setSearchShop(e.target.value)}
                        className="w-full pl-9 border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                </div>
            </div>

            {/* Bills List */}
            {loading ? (
                <div className="flex justify-center py-8"><div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" /></div>
            ) : (
                <div className="space-y-3">
                    <p className="text-xs text-gray-400">{filteredBills.length} bills found</p>
                    {filteredBills.map(bill => (
                        <div key={bill._id} className={`bg-white rounded-2xl shadow-sm border overflow-hidden transition-all ${bill.isDeleted ? 'border-red-200 opacity-60' : 'border-gray-100'}`}>
                            <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50/50" onClick={() => setExpandedBill(expandedBill === bill._id ? null : bill._id)}>
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                                        <Receipt className="w-5 h-5 text-indigo-600" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-semibold text-sm text-gray-900 truncate">{typeof bill.shopId === 'object' ? bill.shopId.name : 'Shop'}</span>
                                            {bill.isDeleted && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-medium">Deleted</span>}
                                        </div>
                                        <div className="text-xs text-gray-400 flex items-center gap-2 mt-0.5">
                                            <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" />{new Date(bill.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                            <span>• {typeof bill.driverId === 'object' ? bill.driverId.name : ''}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right flex-shrink-0 flex items-center gap-3">
                                    <div>
                                        <p className="font-bold text-sm text-gray-900">₹{bill.totalAmount.toLocaleString()}</p>
                                        {bill.paidAmount > 0 && <p className="text-[10px] text-green-500">Paid: ₹{bill.paidAmount}</p>}
                                    </div>
                                    {expandedBill === bill._id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                                </div>
                            </div>

                            {expandedBill === bill._id && (
                                <div className="border-t border-gray-100 px-4 py-3 bg-gray-50/50 space-y-3">
                                    {/* Items */}
                                    <div className="space-y-1">
                                        {bill.items.map((item, idx) => (
                                            <div key={idx} className="flex justify-between text-xs text-gray-600">
                                                <span>{typeof item.productId === 'object' ? item.productId.name : 'Product'} × {item.quantity} @ ₹{item.sellingPrice}</span>
                                                <span className="font-medium">₹{item.total}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex justify-between text-xs border-t border-gray-200 pt-2">
                                        <span className="text-gray-500">Balance on Bill</span>
                                        <span className="font-bold text-red-500">₹{bill.balanceOnBill}</span>
                                    </div>
                                    <div className="text-[10px] text-gray-400">
                                        Vehicle: {typeof bill.vehicleId === 'object' ? bill.vehicleId.registrationNumber : ''} •
                                        Bill ID: {bill._id.slice(-6)}
                                    </div>
                                    {/* Actions */}
                                    {!bill.isDeleted && (
                                        <div className="flex gap-2 pt-1">
                                            <button onClick={(e) => { e.stopPropagation(); openEdit(bill); }}
                                                className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors">
                                                <Edit className="w-3 h-3" /> Edit
                                            </button>
                                            <button onClick={(e) => { e.stopPropagation(); setDeleteConfirm(bill._id); }}
                                                className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors">
                                                <Trash2 className="w-3 h-3" /> Delete
                                            </button>
                                            <button onClick={(e) => { e.stopPropagation(); viewAudit(bill._id); }}
                                                className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors">
                                                <Clock className="w-3 h-3" /> Audit Log
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Edit Modal */}
            {editingBill && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-5 py-4 flex items-center justify-between sticky top-0">
                            <h3 className="text-white font-bold text-lg flex items-center gap-2"><Edit className="w-5 h-5" /> Edit Bill</h3>
                            <button onClick={() => setEditingBill(null)} className="text-white/80 hover:text-white"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-5 space-y-4">
                            <div className="bg-gray-50 rounded-xl p-3">
                                <p className="text-xs text-gray-500">Shop: <span className="font-medium text-gray-800">{typeof editingBill.shopId === 'object' ? editingBill.shopId.name : ''}</span></p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-xs font-semibold text-gray-700">Items</p>
                                {editItems.map((item, idx) => (
                                    <div key={idx} className="flex gap-2 items-center bg-gray-50 p-2 rounded-lg">
                                        <select value={item.productId} className="flex-1 text-xs border border-gray-200 rounded-lg p-1.5"
                                            onChange={e => {
                                                const p = products.find(pr => pr._id === e.target.value);
                                                const n = [...editItems]; n[idx].productId = e.target.value;
                                                if (p) { n[idx].sellingPrice = p.defaultSellingPrice; n[idx].costPriceSnapshot = p.costPrice; n[idx].productName = p.name; }
                                                setEditItems(n);
                                            }}>
                                            {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                                        </select>
                                        <input type="number" min="1" value={item.quantity} className="w-14 text-xs border border-gray-200 rounded-lg p-1.5 text-center"
                                            onChange={e => { const n = [...editItems]; n[idx].quantity = Number(e.target.value); setEditItems(n); }} />
                                        <input type="number" min="0" value={item.sellingPrice} className="w-16 text-xs border border-gray-200 rounded-lg p-1.5 text-center"
                                            onChange={e => { const n = [...editItems]; n[idx].sellingPrice = Number(e.target.value); setEditItems(n); }} />
                                        <span className="text-xs font-medium text-gray-700 w-16 text-right">₹{(item.quantity * item.sellingPrice).toLocaleString()}</span>
                                        <button onClick={() => setEditItems(editItems.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-600"><X className="w-3 h-3" /></button>
                                    </div>
                                ))}
                                <button onClick={() => setEditItems([...editItems, { productId: products[0]?._id || '', quantity: 1, sellingPrice: products[0]?.defaultSellingPrice || 0, costPriceSnapshot: products[0]?.costPrice || 0 }])}
                                    className="text-xs text-indigo-600 hover:underline">+ Add Item</button>
                            </div>
                            <div className="border-t border-gray-100 pt-3">
                                <div className="flex justify-between text-sm font-bold mb-3">
                                    <span>New Total</span>
                                    <span>₹{editItems.reduce((a, i) => a + i.quantity * i.sellingPrice, 0).toLocaleString()}</span>
                                </div>
                                <label className="text-xs font-semibold text-gray-700">Paid Amount</label>
                                <input type="number" value={editPaidAmount} min={0} onChange={e => setEditPaidAmount(Number(e.target.value))}
                                    className="w-full border border-gray-200 rounded-lg p-2 text-sm mt-1" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-700">Reason for edit</label>
                                <input type="text" value={editReason} onChange={e => setEditReason(e.target.value)} placeholder="e.g. Quantity correction"
                                    className="w-full border border-gray-200 rounded-lg p-2 text-sm mt-1" />
                            </div>
                        </div>
                        <div className="px-5 pb-5 flex gap-3">
                            <button onClick={() => setEditingBill(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
                            <button onClick={handleEditSubmit} disabled={submitting}
                                className="flex-1 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl text-sm font-bold hover:from-blue-600 hover:to-blue-700 disabled:opacity-50">
                                {submitting ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirm Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
                        <div className="bg-gradient-to-r from-red-500 to-red-600 px-5 py-4 flex items-center justify-between">
                            <h3 className="text-white font-bold text-lg flex items-center gap-2"><AlertTriangle className="w-5 h-5" /> Delete Bill</h3>
                            <button onClick={() => setDeleteConfirm(null)} className="text-white/80 hover:text-white"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-5 space-y-4">
                            <p className="text-sm text-gray-600">This bill will be soft-deleted. Outstanding balance will be adjusted automatically.</p>
                            <div>
                                <label className="text-xs font-semibold text-gray-700">Reason (optional)</label>
                                <input type="text" value={deleteReason} onChange={e => setDeleteReason(e.target.value)} placeholder="e.g. Duplicate entry"
                                    className="w-full border border-gray-200 rounded-lg p-2 text-sm mt-1" />
                            </div>
                        </div>
                        <div className="px-5 pb-5 flex gap-3">
                            <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600">Cancel</button>
                            <button onClick={() => handleDelete(deleteConfirm)} disabled={submitting}
                                className="flex-1 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl text-sm font-bold disabled:opacity-50">
                                {submitting ? 'Deleting...' : 'Yes, Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Audit Log Modal */}
            {auditLog && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-y-auto">
                        <div className="bg-gradient-to-r from-gray-700 to-gray-800 px-5 py-4 flex items-center justify-between sticky top-0">
                            <h3 className="text-white font-bold text-lg flex items-center gap-2"><Clock className="w-5 h-5" /> Audit Log</h3>
                            <button onClick={() => { setAuditLog(null); setAuditBillId(null); }} className="text-white/80 hover:text-white"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-5 space-y-3">
                            {auditLog.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No audit records</p>}
                            {auditLog.map((log: any, i: number) => (
                                <div key={i} className="bg-gray-50 rounded-xl p-3 space-y-1.5">
                                    <div className="flex justify-between items-center">
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${log.action === 'DELETE' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                            {log.action}
                                        </span>
                                        <span className="text-[10px] text-gray-400">{new Date(log.timestamp).toLocaleString('en-IN')}</span>
                                    </div>
                                    <p className="text-xs text-gray-600">By: {log.adminId?.name || 'Admin'}</p>
                                    {log.reason && <p className="text-xs text-gray-500">Reason: {log.reason}</p>}
                                    {log.action === 'EDIT' && log.originalData && (
                                        <div className="text-[10px] text-gray-400 space-y-0.5">
                                            <p>Original: ₹{log.originalData.totalAmount} (Paid: ₹{log.originalData.paidAmount})</p>
                                            {log.modifiedData && <p>Modified: ₹{log.modifiedData.totalAmount} (Paid: ₹{log.modifiedData.paidAmount})</p>}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminBillsPage;
