import { useState, useEffect } from 'react';
import { vehiclesApi } from '@/api/vehicles.api';
import { dashboardApi } from '@/api/dashboard.api';
import {
  Truck,
  Filter,
  Package,
  Store,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  Clock,
} from 'lucide-react';

type DatePreset = 'today' | 'yesterday' | 'thisWeek' | 'thisMonth' | 'allTime' | 'custom';

interface Vehicle {
  _id: string;
  registrationNumber: string;
  driverId?: { _id: string; name: string };
}

interface VehicleHistoryData {
  vehicle: { _id: string; registrationNumber: string; driver?: { name: string } };
  summary: { totalLoaded: number; totalDelivered: number; totalReturned: number; closingStock: number };
  currentStock: { productId?: { name: string; unit: string }; quantity: number }[];
  timeline: {
    type: string;
    date: string;
    shop?: { name: string };
    driver?: { name: string };
    performedBy?: { name: string };
    description?: string;
    items?: { productId?: { name: string; unit: string }; quantity: number }[];
    totalAmount?: number;
  }[];
}

const VehicleHistoryPage = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [data, setData] = useState<VehicleHistoryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [preset, setPreset] = useState<DatePreset>('today');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  useEffect(() => {
    vehiclesApi
      .getAll()
      .then((r) => {
        setVehicles(r.data);
        if (r.data.length > 0) setSelectedVehicle(r.data[0]._id);
      })
      .catch(console.error);
  }, []);

  const getDateRange = (p: DatePreset) => {
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
        const d = today.getDay();
        return { startDate: new Date(today.getTime() - d * 86400000).toISOString(), endDate: now.toISOString() };
      }
      case 'thisMonth':
        return { startDate: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(), endDate: now.toISOString() };
      case 'custom':
        return customStart && customEnd
          ? { startDate: new Date(customStart).toISOString(), endDate: new Date(customEnd + 'T23:59:59').toISOString() }
          : {};
      default:
        return {};
    }
  };

  const fetchHistory = async () => {
    if (!selectedVehicle) return;
    setLoading(true);
    try {
      const range = getDateRange(preset);
      const params: Record<string, string> = {};
      if (range.startDate) params.startDate = range.startDate;
      if (range.endDate) params.endDate = range.endDate;
      const { data: d } = await dashboardApi.getVehicleHistory(selectedVehicle, params);
      setData(d);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedVehicle) fetchHistory();
  }, [selectedVehicle, preset, customStart, customEnd]);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'LOADING':
        return { icon: ArrowDownToLine, color: 'bg-blue-100 text-blue-600', label: 'Stock Loaded' };
      case 'DELIVERY':
        return { icon: Store, color: 'bg-green-100 text-green-600', label: 'Delivery' };
      case 'RETURN':
        return { icon: ArrowUpFromLine, color: 'bg-amber-100 text-amber-600', label: 'Return' };
      case 'TRANSFER_IN':
        return { icon: ArrowLeftRight, color: 'bg-purple-100 text-purple-600', label: 'Transfer In' };
      case 'TRANSFER_OUT':
        return { icon: ArrowLeftRight, color: 'bg-orange-100 text-orange-600', label: 'Transfer Out' };
      default:
        return { icon: Package, color: 'bg-gray-100 text-gray-600', label: type };
    }
  };

  const presetButtons = [
    { label: 'Today', value: 'today' as DatePreset },
    { label: 'Yesterday', value: 'yesterday' as DatePreset },
    { label: 'This Week', value: 'thisWeek' as DatePreset },
    { label: 'This Month', value: 'thisMonth' as DatePreset },
    { label: 'All Time', value: 'allTime' as DatePreset },
    { label: 'Custom', value: 'custom' as DatePreset },
  ];

  return (
    <div className='space-y-6 animate-fade-in'>
      <h1 className='text-2xl font-bold text-gray-900 flex items-center gap-2'>
        <Truck className='w-7 h-7 text-indigo-600' />
        Vehicle History
      </h1>

      <div className='bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-3'>
        <div className='flex items-center gap-2 text-sm font-semibold text-gray-700'>
          <Filter className='w-4 h-4' /> Vehicle & Period
        </div>
        <select
          value={selectedVehicle}
          onChange={(e) => setSelectedVehicle(e.target.value)}
          className='w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'>
          {vehicles.map((v) => (
            <option key={v._id} value={v._id}>
              {v.registrationNumber}
              {v.driverId ? ` — ${typeof v.driverId === 'object' && v.driverId !== null ? v.driverId.name : ''}` : ''}
            </option>
          ))}
        </select>
        <div className='flex flex-wrap gap-2'>
          {presetButtons.map((b) => (
            <button
              key={b.value}
              onClick={() => setPreset(b.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${preset === b.value ? 'bg-indigo-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {b.label}
            </button>
          ))}
        </div>
        {preset === 'custom' && (
          <div className='flex gap-3 items-center'>
            <input
              type='date'
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className='border border-gray-200 rounded-lg px-3 py-1.5 text-sm'
            />
            <span className='text-gray-400 text-sm'>to</span>
            <input
              type='date'
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className='border border-gray-200 rounded-lg px-3 py-1.5 text-sm'
            />
          </div>
        )}
      </div>

      {loading ? (
        <div className='flex justify-center py-8'>
          <div className='animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full' />
        </div>
      ) : (
        data && (
          <>
            <div className='grid grid-cols-2 lg:grid-cols-4 gap-3'>
              {[
                { label: 'Total Loaded', value: data.summary.totalLoaded, color: 'from-blue-500 to-blue-600 shadow-blue-200' },
                { label: 'Delivered', value: data.summary.totalDelivered, color: 'from-green-500 to-emerald-600 shadow-green-200' },
                { label: 'Returned', value: data.summary.totalReturned, color: 'from-amber-500 to-amber-600 shadow-amber-200' },
                { label: 'Closing Stock', value: data.summary.closingStock, color: 'from-purple-500 to-purple-600 shadow-purple-200' },
              ].map((item) => (
                <div key={item.label} className={`bg-linear-to-br ${item.color} text-white p-4 rounded-2xl shadow-lg`}>
                  <p className='text-xs text-white/70 mb-1'>{item.label}</p>
                  <p className='text-2xl font-bold'>{item.value}</p>
                  <p className='text-[10px] text-white/60'>units</p>
                </div>
              ))}
            </div>

            {data.currentStock.length > 0 && (
              <div className='bg-white p-4 rounded-2xl shadow-sm border border-gray-100'>
                <h3 className='text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1.5'>
                  <Package className='w-4 h-4' /> Current Vehicle Stock
                </h3>
                <div className='grid grid-cols-2 md:grid-cols-4 gap-2'>
                  {data.currentStock.map((item, i) => (
                    <div key={i} className='bg-gray-50 px-3 py-2 rounded-lg'>
                      <p className='text-xs text-gray-500 truncate'>{item.productId?.name ?? 'Product'}</p>
                      <p className='text-sm font-bold text-gray-800'>
                        {item.quantity}{' '}
                        <span className='text-[10px] text-gray-400 font-normal'>{item.productId?.unit}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className='space-y-3'>
              <h3 className='text-sm font-semibold text-gray-700'>
                Activity Timeline ({data.timeline.length} events)
              </h3>
              {data.timeline.length === 0 && (
                <div className='text-center text-gray-400 py-12'>No activity recorded for this period</div>
              )}
              {data.timeline.map((event, i) => {
                const { icon: Icon, color, label } = getEventIcon(event.type);
                return (
                  <div
                    key={i}
                    className='bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-start gap-3 hover:shadow-md transition-shadow'>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                      <Icon className='w-5 h-5' />
                    </div>
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center justify-between flex-wrap gap-1'>
                        <span className='font-semibold text-sm text-gray-900'>{label}</span>
                        <span className='text-[10px] text-gray-400 flex items-center gap-0.5'>
                          <Clock className='w-3 h-3' />
                          {new Date(event.date).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {event.type === 'DELIVERY' && event.shop && (
                        <p className='text-xs text-gray-500 mt-0.5'>
                          to <span className='font-medium text-gray-700'>{event.shop.name}</span>
                        </p>
                      )}
                      {event.driver && <p className='text-[10px] text-gray-400 mt-0.5'>Driver: {event.driver.name}</p>}
                      {event.performedBy && <p className='text-[10px] text-gray-400 mt-0.5'>By: {event.performedBy.name}</p>}
                      {event.description && <p className='text-[10px] text-gray-400 mt-0.5'>{event.description}</p>}
                      {event.items && event.items.length > 0 && (
                        <div className='mt-2 flex flex-wrap gap-1.5'>
                          {event.items.map((item, j) => (
                            <span key={j} className='text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded-md font-medium'>
                              {item.productId?.name ?? 'P'}: {item.quantity} {item.productId?.unit ?? ''}
                            </span>
                          ))}
                        </div>
                      )}
                      {event.totalAmount && (
                        <p className='text-xs text-green-600 font-medium mt-1'>₹{event.totalAmount.toLocaleString()}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )
      )}
    </div>
  );
};

export default VehicleHistoryPage;
