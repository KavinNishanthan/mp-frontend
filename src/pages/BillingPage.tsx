import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Plus, Trash, Receipt, IndianRupee, Store, Check, ShoppingBag, Package, RefreshCw, X, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Product {
    _id: string;
    name: string;
    unit: string;
    defaultSellingPrice: number;
}

interface Shop {
    _id: string;
    name: string;
    outstandingBalance: number;
    customPrices: { productId: string; price: number }[];
}

interface BillItem {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    total: number;
}

interface StockItem {
    productId: { _id: string; name: string; unit: string } | string;
    quantity: number;
}

const BillingPage: React.FC = () => {
    const { user } = useAuth();
    const [shops, setShops] = useState<Shop[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedShopId, setSelectedShopId] = useState('');
    const [billItems, setBillItems] = useState<BillItem[]>([]);
    const [paidAmount, setPaidAmount] = useState<number>(0);
    const [vehicleId, setVehicleId] = useState('');
    const [vehicleName, setVehicleName] = useState('');
    const [success, setSuccess] = useState('');
    const [vehicleStock, setVehicleStock] = useState<StockItem[]>([]);
    const [stockLoading, setStockLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const fetchVehicleStock = async (vId: string) => {
        setStockLoading(true);
        try {
            const { data } = await api.get(`/stock?location=vehicle&vehicleId=${vId}`);
            setVehicleStock(data?.items || []);
        } catch (err) {
            console.error(err);
        } finally {
            setStockLoading(false);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data: sData } = await api.get('/shops');
                setShops(sData);
                const { data: pData } = await api.get('/products');
                setProducts(pData);
                const { data: vData } = await api.get('/vehicles');
                const myVehicle = vData.find((v: any) => v.driverId?._id === user?._id || v.driverId === user?._id);
                if (myVehicle) {
                    setVehicleId(myVehicle._id);
                    setVehicleName(myVehicle.registrationNumber || myVehicle.name);
                    fetchVehicleStock(myVehicle._id);
                }
            } catch (error) {
                console.error(error);
            }
        };
        fetchData();
    }, [user]);

    const selectedShop = shops.find(s => s._id === selectedShopId);

    const [selectedProductId, setSelectedProductId] = useState('');
    const [qty, setQty] = useState(1);

    const getProductName = (item: StockItem): string => {
        if (typeof item.productId === 'object' && item.productId !== null) {
            return item.productId.name;
        }
        const p = products.find(pr => pr._id === item.productId);
        return p?.name || 'Unknown';
    };

    const getProductUnit = (item: StockItem): string => {
        if (typeof item.productId === 'object' && item.productId !== null) {
            return item.productId.unit;
        }
        const p = products.find(pr => pr._id === item.productId);
        return p?.unit || '';
    };

    const addItem = () => {
        if (!selectedProductId || qty <= 0) return;
        const product = products.find(p => p._id === selectedProductId);
        if (!product) return;

        let price = product.defaultSellingPrice;
        if (selectedShop) {
            const custom = selectedShop.customPrices.find(cp => cp.productId === product._id);
            if (custom) price = custom.price;
        }

        setBillItems([...billItems, {
            productId: product._id,
            productName: product.name,
            quantity: qty,
            price,
            total: price * qty,
        }]);
        setSelectedProductId('');
        setQty(1);
    };

    const removeItem = (idx: number) => {
        setBillItems(billItems.filter((_, i) => i !== idx));
    };

    const totalBillAmount = billItems.reduce((acc, item) => acc + item.total, 0);
    const balanceDue = totalBillAmount - paidAmount;

    const handleConfirmBill = () => {
        if (!selectedShopId || !vehicleId || billItems.length === 0) return;
        setShowConfirm(true);
    };

    const handleSubmitBill = async () => {
        setSubmitting(true);
        try {
            await api.post('/bills', {
                shopId: selectedShopId,
                vehicleId,
                items: billItems.map(i => ({ productId: i.productId, quantity: i.quantity })),
                paidAmount,
            });
            setShowConfirm(false);
            setSuccess('Bill created successfully!');
            setBillItems([]);
            setPaidAmount(0);
            setSelectedShopId('');
            const { data: sData } = await api.get('/shops');
            setShops(sData);
            fetchVehicleStock(vehicleId);
            setTimeout(() => setSuccess(''), 3000);
        } catch (error: any) {
            setShowConfirm(false);
            alert(error.response?.data?.message || 'Billing failed');
        } finally {
            setSubmitting(false);
        }
    };

    if (!vehicleId) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-center animate-fade-in">
                <div className="w-16 h-16 rounded-lg bg-red-50 flex items-center justify-center mb-4">
                    <ShoppingBag className="w-8 h-8 text-red-400" />
                </div>
                <p className="text-red-600 font-medium">No Vehicle Assigned</p>
                <p className="text-sm text-gray-400 mt-1">Please contact the admin to assign you a vehicle.</p>
            </div>
        );
    }

    return (
        <>
            <div className="max-w-md mx-auto space-y-4 animate-fade-in">
                <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Receipt className="w-6 h-6 text-indigo-600" />
                    New Bill
                </h1>

                {success && (
                    <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2 animate-slide-up">
                        <Check className="w-4 h-4" /> {success}
                    </div>
                )}

                {/* Vehicle Stock Card */}
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                            <Package className="w-4 h-4 text-indigo-500" />
                            Vehicle Stock
                            <span className="text-[10px] text-gray-400 font-normal">({vehicleName})</span>
                        </h2>
                        <button
                            onClick={() => fetchVehicleStock(vehicleId)}
                            className="text-indigo-500 hover:text-indigo-700 transition-colors p-1 rounded-lg hover:bg-indigo-50"
                            title="Refresh stock"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${stockLoading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                    {vehicleStock.length === 0 ? (
                        <p className="text-xs text-gray-400 text-center py-2">No stock in vehicle</p>
                    ) : (
                        <div className="grid grid-cols-2 gap-2">
                            {vehicleStock.filter(s => s.quantity > 0).map((item, i) => (
                                <div key={i} className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg px-3 py-2 border border-indigo-100/50">
                                    <p className="text-xs font-medium text-gray-700 truncate">{getProductName(item)}</p>
                                    <p className="text-lg font-bold text-indigo-600">
                                        {item.quantity}
                                        <span className="text-[10px] font-normal text-gray-400 ml-1">{getProductUnit(item)}</span>
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Shop Selection */}
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                        <Store className="w-4 h-4 text-gray-400" />
                        Select Shop
                    </label>
                    <select
                        className="w-full border border-gray-200 rounded-lg p-2.5 mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                        value={selectedShopId}
                        onChange={(e) => { setSelectedShopId(e.target.value); setBillItems([]); }}
                    >
                        <option value="">-- Choose Shop --</option>
                        {shops.map(s => (
                            <option key={s._id} value={s._id}>{s.name} (₹{Math.max(0, s.outstandingBalance)})</option>
                        ))}
                    </select>
                    {selectedShop && selectedShop.outstandingBalance > 0 && (
                        <p className="text-xs text-red-500 mt-2 font-medium bg-red-50 px-3 py-1.5 rounded-lg inline-block">
                            Outstanding: ₹{selectedShop.outstandingBalance.toLocaleString()}
                        </p>
                    )}
                </div>

                {/* Add Items */}
                {selectedShopId && (
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 space-y-3">
                        <div className="flex gap-2">
                            <select
                                className="flex-1 border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                value={selectedProductId}
                                onChange={(e) => setSelectedProductId(e.target.value)}
                            >
                                <option value="">Product</option>
                                {products.map(p => (
                                    <option key={p._id} value={p._id}>{p.name}</option>
                                ))}
                            </select>
                            <input
                                type="number"
                                className="w-16 border border-gray-200 rounded-lg p-2.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                value={qty}
                                min="1"
                                onChange={(e) => setQty(Number(e.target.value))}
                            />
                            <button
                                onClick={addItem}
                                className="bg-indigo-600 text-white p-2.5 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Items List */}
                        <div className="space-y-2 mt-2">
                            {billItems.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg text-sm border border-gray-100 group">
                                    <div>
                                        <span className="font-medium text-gray-800">{item.productName}</span>
                                        <div className="text-xs text-gray-400 mt-0.5">{item.quantity} × ₹{item.price}</div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-gray-900">₹{item.total}</span>
                                        <button onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Trash className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Totals & Payment */}
                {billItems.length > 0 && (
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 space-y-4 animate-slide-up">
                        <div className="flex justify-between text-lg font-bold border-b border-gray-100 pb-3">
                            <span className="text-gray-700">Total</span>
                            <span className="gradient-text">₹{totalBillAmount.toLocaleString()}</span>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Collection (₹)</label>
                            <div className="relative">
                                <IndianRupee className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                <input
                                    type="number"
                                    className="w-full pl-9 border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={paidAmount}
                                    onChange={(e) => setPaidAmount(Math.max(0, Number(e.target.value)))}
                                    placeholder="0"
                                    min="0"
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleConfirmBill}
                            className="btn-primary w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold py-3 rounded-lg hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-200 transition-all duration-200 active:scale-[0.98]"
                        >
                            Confirm Bill & Pay
                        </button>
                    </div>
                )}
            </div>

            {/* Confirmation Modal */}
            {showConfirm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm overflow-hidden animate-scale-in">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-4 flex items-center justify-between">
                            <h3 className="text-white font-bold text-lg flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5" />
                                Confirm Bill
                            </h3>
                            <button onClick={() => setShowConfirm(false)} className="text-white/80 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-5 space-y-4">
                            <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                                <p className="text-xs text-gray-500 font-medium">Shop</p>
                                <p className="font-semibold text-gray-800">{selectedShop?.name}</p>
                            </div>

                            <div className="space-y-1.5">
                                <p className="text-xs text-gray-500 font-medium">Items</p>
                                {billItems.map((item, i) => (
                                    <div key={i} className="flex justify-between text-sm">
                                        <span className="text-gray-700">{item.productName} × {item.quantity}</span>
                                        <span className="font-medium">₹{item.total}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-gray-100 pt-3 space-y-2">
                                <div className="flex justify-between text-base font-bold">
                                    <span>Total</span>
                                    <span className="text-emerald-600">₹{totalBillAmount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Collecting</span>
                                    <span className="font-medium text-green-600">₹{paidAmount.toLocaleString()}</span>
                                </div>
                                {balanceDue > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Balance Due</span>
                                        <span className="font-medium text-red-500">₹{balanceDue.toLocaleString()}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-5 pb-5 flex gap-3">
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmitBill}
                                disabled={submitting}
                                className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg text-sm font-bold hover:from-emerald-600 hover:to-emerald-700 transition-all disabled:opacity-50"
                            >
                                {submitting ? 'Submitting...' : 'Yes, Create Bill'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default BillingPage;
