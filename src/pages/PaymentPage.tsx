import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { IndianRupee, Store, Check, AlertTriangle, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Shop {
    _id: string;
    name: string;
    outstandingBalance: number;
}

const PaymentPage: React.FC = () => {
    const { user } = useAuth();
    const [shops, setShops] = useState<Shop[]>([]);
    const [selectedShopId, setSelectedShopId] = useState('');
    const [amount, setAmount] = useState<number>(0);
    const [vehicleId, setVehicleId] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState('');
    const [showConfirm, setShowConfirm] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [shopsRes, vehiclesRes] = await Promise.all([
                    api.get('/shops'),
                    api.get('/vehicles'),
                ]);
                setShops(shopsRes.data);
                const myVehicle = vehiclesRes.data.find(
                    (v: any) => v.driverId?._id === user?._id || v.driverId === user?._id
                );
                if (myVehicle) setVehicleId(myVehicle._id);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    const selectedShop = shops.find(s => s._id === selectedShopId);
    const maxPayable = selectedShop ? Math.max(0, selectedShop.outstandingBalance) : 0;

    const handleAmountChange = (val: number) => {
        const clamped = Math.min(Math.max(0, val), maxPayable || Infinity);
        setAmount(clamped);
    };

    const handleConfirmPayment = () => {
        if (!selectedShopId || amount <= 0 || !vehicleId) return;
        setShowConfirm(true);
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        setSuccess('');
        try {
            await api.post('/payments', {
                shopId: selectedShopId,
                amount,
                vehicleId,
            });
            setShowConfirm(false);
            setSuccess(`Payment of ₹${amount} recorded successfully!`);
            setAmount(0);
            setSelectedShopId('');
            const { data } = await api.get('/shops');
            setShops(data);
        } catch (err: any) {
            setShowConfirm(false);
            alert(err.response?.data?.message || 'Payment failed');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-4 text-gray-500">Loading...</div>;
    if (!vehicleId) return <div className="p-4 text-red-600">No vehicle assigned. Contact admin.</div>;

    return (
      <>
        <div className='max-w-md mx-auto space-y-4 animate-fade-in'>
          <h1 className='text-xl font-bold flex items-center gap-2'>
            <IndianRupee className='w-6 h-6 text-green-600' />
            Collect Payment
          </h1>

          {success && (
            <div className='bg-green-50 border border-green-100 text-green-700 p-3 rounded-lg text-sm font-medium flex items-center gap-2 animate-slide-up'>
              <Check className='w-4 h-4' /> {success}
            </div>
          )}

          <div className='space-y-4'>
            <div className='bg-white p-4 rounded-lg shadow-sm border border-gray-100'>
              <label className='block text-sm font-semibold text-gray-700 mb-1'>
                <Store className='w-4 h-4 inline mr-1' />
                Select Shop
              </label>
              <select
                className='w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
                value={selectedShopId}
                onChange={(e) => {
                  setSelectedShopId(e.target.value);
                  setAmount(0);
                }}
                required>
                <option value=''>-- Choose Shop --</option>
                {shops.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} (Outstanding: ₹{Math.max(0, s.outstandingBalance)})
                  </option>
                ))}
              </select>
              {selectedShop && (
                <div
                  className={`mt-2 px-3 py-2 rounded-lg text-sm font-medium ${
                    selectedShop.outstandingBalance > 0
                      ? "bg-red-50 text-red-600"
                      : "bg-green-50 text-green-600"
                  }`}>
                  {selectedShop.outstandingBalance > 0
                    ? `Outstanding: ₹${selectedShop.outstandingBalance.toLocaleString()}`
                    : "✓ No outstanding balance"}
                </div>
              )}
            </div>

            <div className='bg-white p-4 rounded-lg shadow-sm border border-gray-100'>
              <label className='block text-sm font-semibold text-gray-700 mb-1'>
                Amount (₹)
              </label>
              <div className='relative'>
                <IndianRupee className='absolute left-3 top-2.5 w-4 h-4 text-gray-400' />
                <input
                  type='number'
                  className='w-full pl-9 border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
                  value={amount || ""}
                  onChange={(e) => handleAmountChange(Number(e.target.value))}
                  min='1'
                  max={maxPayable > 0 ? maxPayable : undefined}
                  placeholder='Enter amount'
                />
              </div>
              {selectedShop && selectedShop.outstandingBalance > 0 && (
                <p className='text-[11px] text-gray-400 mt-1.5'>
                  Max payable: ₹{maxPayable.toLocaleString()}
                </p>
              )}
              {selectedShop && selectedShop.outstandingBalance <= 0 && (
                <div className='flex items-center gap-1.5 mt-2 text-amber-600 text-xs'>
                  <AlertTriangle className='w-3.5 h-3.5' />
                  No outstanding balance for this shop
                </div>
              )}
            </div>

            <button
              type='button'
              onClick={handleConfirmPayment}
              disabled={
                submitting ||
                amount <= 0 ||
                !selectedShopId ||
                (selectedShop?.outstandingBalance ?? 0) <= 0
              }
              className='w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3 rounded-lg hover:from-green-500 hover:to-emerald-600 shadow-lg shadow-green-200 transition-all duration-200 active:scale-[0.98] disabled:from-gray-300 disabled:to-gray-300 disabled:shadow-none disabled:cursor-not-allowed'>
              Record Payment
            </button>
          </div>
        </div>

        {/* Confirmation Modal */}
        {showConfirm && (
          <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in'>
            <div className='bg-white rounded-lg shadow-2xl w-full max-w-sm overflow-hidden animate-scale-in'>
              {/* Header */}
              <div className='bg-emerald-600 px-5 py-4 flex items-center justify-between'>
                <h3 className='text-white font-bold text-lg flex items-center gap-2'>
                  <AlertTriangle className='w-5 h-5' />
                  Confirm Payment
                </h3>
                <button
                  onClick={() => setShowConfirm(false)}
                  className='text-white/80 hover:text-white'>
                  <X className='w-5 h-5' />
                </button>
              </div>

              {/* Body */}
              <div className='p-5 space-y-4'>
                <div className='bg-gray-50 rounded-lg p-3 space-y-1'>
                  <p className='text-xs text-gray-500 font-medium'>Shop</p>
                  <p className='font-semibold text-gray-800'>
                    {selectedShop?.name}
                  </p>
                </div>

                <div className='space-y-2'>
                  <div className='flex justify-between text-sm'>
                    <span className='text-gray-500'>Current Outstanding</span>
                    <span className='font-medium text-red-500'>
                      ₹{selectedShop?.outstandingBalance.toLocaleString()}
                    </span>
                  </div>
                  <div className='flex justify-between text-base font-bold'>
                    <span>Collecting</span>
                    <span className='text-green-600'>
                      ₹{amount.toLocaleString()}
                    </span>
                  </div>
                  <div className='border-t border-gray-100 pt-2 flex justify-between text-sm'>
                    <span className='text-gray-500'>Remaining Balance</span>
                    <span className='font-medium'>
                      ₹
                      {Math.max(
                        0,
                        (selectedShop?.outstandingBalance || 0) - amount,
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className='px-5 pb-5 flex gap-3'>
                <button
                  onClick={() => setShowConfirm(false)}
                  className='flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors'>
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className='flex-1 py-2.5 bg-emerald-600  text-white rounded-lg text-sm font-bold transition-all disabled:opacity-50'>
                  {submitting ? "Recording..." : "Yes, Collect ₹" + amount}
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
};

export default PaymentPage;
