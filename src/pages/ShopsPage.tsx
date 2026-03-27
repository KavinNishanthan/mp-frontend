import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Plus, Pencil, Trash2, X, Store, IndianRupee } from 'lucide-react';

interface Product {
    _id: string;
    name: string;
    defaultSellingPrice: number;
    unit: string;
}

interface CustomPrice {
    productId: string;
    price: number;
}

interface Shop {
    _id: string;
    name: string;
    address: string;
    contactNumber?: string;
    customPrices: CustomPrice[];
    outstandingBalance: number;
    isActive: boolean;
}

interface ShopForm {
    name: string;
    address: string;
    contactNumber: string;
    customPrices: CustomPrice[];
}

const emptyForm: ShopForm = { name: '', address: '', contactNumber: '', customPrices: [] };

const ShopsPage: React.FC = () => {
    const [shops, setShops] = useState<Shop[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<ShopForm>(emptyForm);
    const [error, setError] = useState('');
    const [showPricing, setShowPricing] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            const [shopsRes, productsRes] = await Promise.all([
                api.get('/shops'),
                api.get('/products'),
            ]);
            setShops(shopsRes.data);
            setProducts(productsRes.data);
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const openAdd = () => {
        setForm(emptyForm);
        setEditingId(null);
        setError('');
        setShowModal(true);
    };

    const openEdit = (shop: Shop) => {
        setForm({
            name: shop.name,
            address: shop.address,
            contactNumber: shop.contactNumber || '',
            customPrices: [...shop.customPrices],
        });
        setEditingId(shop._id);
        setError('');
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const payload = {
                ...form,
                customPrices: form.customPrices.filter(cp => cp.price > 0),
            };
            if (editingId) {
                await api.put(`/shops/${editingId}`, payload);
            } else {
                await api.post('/shops', payload);
            }
            setShowModal(false);
            fetchData();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Operation failed');
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Delete shop "${name}"?`)) return;
        try {
            await api.delete(`/shops/${id}`);
            fetchData();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Delete failed');
        }
    };

    const updateCustomPrice = (productId: string, price: number) => {
        const existing = form.customPrices.findIndex(cp => cp.productId === productId);
        const updated = [...form.customPrices];
        if (existing >= 0) {
            if (price <= 0) {
                updated.splice(existing, 1);
            } else {
                updated[existing] = { productId, price };
            }
        } else if (price > 0) {
            updated.push({ productId, price });
        }
        setForm({ ...form, customPrices: updated });
    };

    const getCustomPrice = (productId: string): number => {
        return form.customPrices.find(cp => cp.productId === productId)?.price || 0;
    };

    // For the inline pricing view (non-modal)
    const getShopCustomPrice = (shop: Shop, productId: string): number | null => {
        const cp = shop.customPrices.find(c => c.productId === productId);
        return cp ? cp.price : null;
    };

    if (loading) return <div className="p-8 text-gray-500">Loading shops...</div>;

    return (
      <div className='space-y-6'>
        <div className='flex justify-between items-center'>
          <h1 className='text-2xl font-bold text-gray-800 flex items-center gap-2'>
            <Store className='w-7 h-7 text-blue-600' />
            Shops
          </h1>
          <button
            onClick={openAdd}
            className='flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-lg'>
            <Plus className='w-4 h-4' /> Add Shop
          </button>
        </div>

        <div className='bg-white rounded-lg shadow-md overflow-hidden p-4'>
          <div className='overflow-x-auto'>
            <table className='min-w-full text-left text-sm '>
              <thead>
                <tr className='bg-white border-b'>
                  <th className='px-6 py-3 font-semibold text-gray-600'>
                    Name
                  </th>
                  <th className='px-6 py-3 font-semibold text-gray-600'>
                    Address
                  </th>
                  <th className='px-6 py-3 font-semibold text-gray-600'>
                    Contact
                  </th>
                  <th className='px-6 py-3 font-semibold text-gray-600'>
                    Outstanding
                  </th>
                  <th className='px-6 py-3 font-semibold text-gray-600'>
                    Custom Prices
                  </th>
                  <th className='px-6 py-3 font-semibold text-gray-600 text-right'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {shops.map((shop, i) => (
                  <React.Fragment key={shop._id}>
                    <tr className={`${i % 2 ? "bg-gray-100" : "bg-white"}`}>
                      <td className='px-6 py-4 font-medium text-gray-800'>
                        {shop.name}
                      </td>
                      <td className='px-6 py-4 text-gray-600 max-w-xs truncate'>
                        {shop.address}
                      </td>
                      <td className='px-6 py-4 text-gray-600'>
                        {shop.contactNumber || "—"}
                      </td>
                      <td className='px-6 py-4'>
                        <span
                          className={`font-medium ${shop.outstandingBalance > 0 ? "text-red-600" : "text-green-600"}`}>
                          ₹{shop.outstandingBalance.toLocaleString()}
                        </span>
                      </td>
                      <td className='px-6 py-4'>
                        <button
                          onClick={() =>
                            setShowPricing(
                              showPricing === shop._id ? null : shop._id,
                            )
                          }
                          className='text-blue-600 hover:underline text-xs'>
                          {shop.customPrices.length > 0
                            ? `${shop.customPrices.length} override(s)`
                            : "None"}
                        </button>
                      </td>
                      <td className='px-6 py-4 text-right'>
                        <button
                          onClick={() => openEdit(shop)}
                          className='text-blue-600 hover:text-blue-800 p-1 mr-2'
                          title='Edit'>
                          <Pencil className='w-4 h-4' />
                        </button>
                        <button
                          onClick={() => handleDelete(shop._id, shop.name)}
                          className='text-red-500 hover:text-red-700 p-1'
                          title='Delete'>
                          <Trash2 className='w-4 h-4' />
                        </button>
                      </td>
                    </tr>
                    {showPricing === shop._id && (
                      <tr className='bg-blue-50/50'>
                        <td colSpan={6} className='px-6 py-3'>
                          <div className='text-xs space-y-1'>
                            <p className='font-semibold text-gray-700 mb-2'>
                              Custom Price Overrides:
                            </p>
                            {products.map((p) => {
                              const cp = getShopCustomPrice(shop, p._id);
                              if (!cp) return null;
                              return (
                                <div key={p._id} className='flex gap-4'>
                                  <span className='text-gray-600'>
                                    {p.name} ({p.unit})
                                  </span>
                                  <span className='font-medium'>₹{cp}</span>
                                  <span className='text-gray-400'>
                                    (Default: ₹{p.defaultSellingPrice})
                                  </span>
                                </div>
                              );
                            })}
                            {shop.customPrices.length === 0 && (
                              <span className='text-gray-400'>
                                No overrides set
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
                {shops.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className='px-6 py-8 text-center text-gray-400'>
                      No shops found. Add your first shop!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className='fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4'>
            <div className='bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto'>
              <div className='flex justify-between items-center p-5 border-b sticky top-0 bg-white rounded-t-xl'>
                <h2 className='text-lg font-bold text-gray-800'>
                  {editingId ? "Edit Shop" : "Add Shop"}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className='text-gray-400 hover:text-gray-600'>
                  <X className='w-5 h-5' />
                </button>
              </div>

              <form onSubmit={handleSubmit} className='p-5 space-y-4'>
                {error && (
                  <div className='bg-red-50 text-red-600 text-sm p-3 rounded-lg'>
                    {error}
                  </div>
                )}

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Shop Name
                  </label>
                  <input
                    type='text'
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className='w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                    required
                    placeholder='e.g., Sharma General Store'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Address
                  </label>
                  <input
                    type='text'
                    value={form.address}
                    onChange={(e) =>
                      setForm({ ...form, address: e.target.value })
                    }
                    className='w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                    required
                    placeholder='Full address'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Contact Number
                  </label>
                  <input
                    type='text'
                    value={form.contactNumber}
                    onChange={(e) =>
                      setForm({ ...form, contactNumber: e.target.value })
                    }
                    className='w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                    placeholder='Optional'
                  />
                </div>

                {/* Custom Pricing Section */}
                {editingId && products.length > 0 && (
                  <div className='border-t pt-4'>
                    <h3 className='text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1'>
                      <IndianRupee className='w-4 h-4' />
                      Custom Prices (leave 0 for default)
                    </h3>
                    <div className='space-y-2'>
                      {products.map((p) => (
                        <div
                          key={p._id}
                          className='flex items-center gap-3 text-sm'>
                          <span className='flex-1 text-gray-600'>
                            {p.name} ({p.unit})
                          </span>
                          <span className='text-gray-400 text-xs'>
                            Default: ₹{p.defaultSellingPrice}
                          </span>
                          <input
                            type='number'
                            step='0.01'
                            min='0'
                            value={getCustomPrice(p._id) || ""}
                            onChange={(e) =>
                              updateCustomPrice(p._id, Number(e.target.value))
                            }
                            className='w-24 border rounded px-2 py-1 text-right focus:outline-none focus:ring-2 focus:ring-blue-500'
                            placeholder='0'
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className='flex gap-3 pt-2'>
                  <button
                    type='button'
                    onClick={() => setShowModal(false)}
                    className='flex-1 px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 transition-colors'>
                    Cancel
                  </button>
                  <button
                    type='submit'
                    className='flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors'>
                    {editingId ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
};

export default ShopsPage;
