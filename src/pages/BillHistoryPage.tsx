import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { FileText, Calendar, ChevronDown, ChevronUp, Search } from 'lucide-react';

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

    const totalCollected = bills.reduce((sum, b) => sum + b.paidAmount, 0);
    const totalDue = bills.reduce((sum, b) => sum + b.balanceOnBill, 0);

    return (
      <div className='max-w-lg mx-auto space-y-4 animate-fade-in'>
        <h1 className='text-xl font-bold flex items-center gap-2 text-gray-900'>
          <FileText className='w-6 h-6 text-indigo-600' />
          Bill History
        </h1>

        {/* Date Filter */}
        <form
          onSubmit={handleFilter}
          className='bg-white p-4 rounded-lg shadow-sm border border-gray-100 space-y-3'>
          <p className='text-xs font-semibold text-gray-500 uppercase tracking-wide'>Filter by Date</p>
          <div className='flex flex-col sm:flex-row items-stretch sm:items-end gap-2'>
            <div className='flex-1'>
              <label className='flex items-center gap-1 text-xs font-medium text-gray-600 mb-1'>
                <Calendar className='w-3 h-3' /> From
              </label>
              <input
                type='date'
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className='w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
              />
            </div>
            <div className='flex-1'>
              <label className='flex items-center gap-1 text-xs font-medium text-gray-600 mb-1'>
                <Calendar className='w-3 h-3' /> To
              </label>
              <input
                type='date'
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className='w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
              />
            </div>
            <button
              type='submit'
              className='flex items-center justify-center gap-1.5 bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm'>
              <Search className='w-3.5 h-3.5' />
              Search
            </button>
          </div>
        </form>

        {/* Summary Chips */}
        {!loading && bills.length > 0 && (
          <div className='flex gap-2'>
            <div className='flex-1 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2 text-center'>
              <p className='text-[10px] text-emerald-600 font-medium uppercase tracking-wide'>Collected</p>
              <p className='text-base font-bold text-emerald-700'>₹{totalCollected.toLocaleString()}</p>
            </div>
            <div className='flex-1 bg-red-50 border border-red-100 rounded-lg px-3 py-2 text-center'>
              <p className='text-[10px] text-red-500 font-medium uppercase tracking-wide'>Due</p>
              <p className='text-base font-bold text-red-600'>₹{totalDue.toLocaleString()}</p>
            </div>
            <div className='flex-1 bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-2 text-center'>
              <p className='text-[10px] text-indigo-500 font-medium uppercase tracking-wide'>Bills</p>
              <p className='text-base font-bold text-indigo-700'>{bills.length}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className='bg-white rounded-lg p-8 text-center text-gray-400 shadow-sm border border-gray-100'>
            <div className='w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2' />
            Loading bills...
          </div>
        ) : bills.length === 0 ? (
          <div className='bg-white p-8 rounded-lg shadow-sm border border-gray-100 text-center text-gray-400'>
            <FileText className='w-10 h-10 mx-auto mb-2 text-gray-300' />
            No bills found for the selected period.
          </div>
        ) : (
          <div className='space-y-3'>
            {bills.map((bill) => {
              const date = new Date(bill.date);
              const isExpanded = expandedBill === bill._id;
              return (
                <div
                  key={bill._id}
                  className='bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden'>
                  <button
                    onClick={() => setExpandedBill(isExpanded ? null : bill._id)}
                    className='w-full text-left p-4 hover:bg-gray-50/80 transition-colors'>
                    <div className='flex justify-between items-start'>
                      <div className='flex-1 min-w-0'>
                        <p className='font-semibold text-gray-800 truncate'>
                          {bill.shopId?.name || 'Unknown Shop'}
                        </p>
                        <p className='text-xs text-gray-400 mt-0.5'>
                          {date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          {' · '}
                          {date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div className='flex items-center gap-2 ml-2 shrink-0'>
                        <div className='text-right'>
                          <p className='font-bold text-gray-900'>₹{bill.totalAmount.toLocaleString()}</p>
                          <div className='flex gap-1.5 justify-end mt-0.5'>
                            {bill.paidAmount > 0 && (
                              <span className='text-[10px] bg-emerald-50 text-emerald-600 font-medium px-1.5 py-0.5 rounded-full'>
                                ₹{bill.paidAmount} paid
                              </span>
                            )}
                            {bill.balanceOnBill > 0 && (
                              <span className='text-[10px] bg-red-50 text-red-500 font-medium px-1.5 py-0.5 rounded-full'>
                                ₹{bill.balanceOnBill} due
                              </span>
                            )}
                          </div>
                        </div>
                        {isExpanded
                          ? <ChevronUp className='w-4 h-4 text-gray-400' />
                          : <ChevronDown className='w-4 h-4 text-gray-400' />
                        }
                      </div>
                    </div>
                  </button>
                  {isExpanded && (
                    <div className='border-t border-gray-100 px-4 py-3 bg-gray-50/50'>
                      <table className='w-full text-xs'>
                        <thead>
                          <tr className='text-gray-400 font-medium'>
                            <th className='text-left pb-2'>Item</th>
                            <th className='text-right pb-2'>Qty</th>
                            <th className='text-right pb-2'>Price</th>
                            <th className='text-right pb-2'>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bill.items.map((item, idx) => (
                            <tr key={idx} className='border-t border-gray-200'>
                              <td className='py-1.5 text-gray-700'>{item.productId?.name || 'Unknown'}</td>
                              <td className='py-1.5 text-right text-gray-600'>{item.quantity}</td>
                              <td className='py-1.5 text-right text-gray-600'>₹{item.sellingPrice}</td>
                              <td className='py-1.5 text-right font-semibold text-gray-800'>₹{item.total}</td>
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
