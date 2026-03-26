import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Plus, Pencil, Trash2, X, Package } from 'lucide-react';

interface Product {
    _id: string;
    name: string;
    costPrice: number;
    defaultSellingPrice: number;
    unit: string;
    isActive: boolean;
}

interface ProductForm {
    name: string;
    costPrice: number;
    defaultSellingPrice: number;
    unit: string;
}

const emptyForm: ProductForm = { name: '', costPrice: 0, defaultSellingPrice: 0, unit: '' };

const ProductsPage: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<ProductForm>(emptyForm);
    const [error, setError] = useState('');

    const fetchProducts = async () => {
        try {
            const { data } = await api.get('/products');
            setProducts(data);
        } catch (err) {
            console.error('Error fetching products:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchProducts(); }, []);

    const openAdd = () => {
        setForm(emptyForm);
        setEditingId(null);
        setError('');
        setShowModal(true);
    };

    const openEdit = (product: Product) => {
        setForm({
            name: product.name,
            costPrice: product.costPrice,
            defaultSellingPrice: product.defaultSellingPrice,
            unit: product.unit,
        });
        setEditingId(product._id);
        setError('');
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            if (editingId) {
                await api.put(`/products/${editingId}`, form);
            } else {
                await api.post('/products', form);
            }
            setShowModal(false);
            fetchProducts();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Operation failed');
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Delete product "${name}"?`)) return;
        try {
            await api.delete(`/products/${id}`);
            fetchProducts();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Delete failed');
        }
    };

    if (loading) return <div className="p-8 text-gray-500">Loading products...</div>;

    return (
      <div className='space-y-6'>
        <div className='flex justify-between items-center'>
          <h1 className='text-2xl font-bold text-gray-800 flex items-center gap-2'>
            <Package className='w-7 h-7 text-blue-600' />
            Products
          </h1>
          <button
            onClick={openAdd}
            className='flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm'>
            <Plus className='w-4 h-4' /> Add Product
          </button>
        </div>

        <div className='bg-white rounded-lg shadow-lg overflow-hidden p-4'>
          <div className='overflow-x-auto'>
            <table className='min-w-full text-left text-sm'>
              <thead>
                <tr className='border-b'>
                  <th className='px-6 py-3 font-semibold text-gray-500'>
                    Name
                  </th>
                  <th className='px-6 py-3 font-semibold text-gray-500'>
                    Unit
                  </th>
                  <th className='px-6 py-3 font-semibold text-gray-500'>
                    Cost Price
                  </th>
                  <th className='px-6 py-3 font-semibold text-gray-500'>
                    Selling Price
                  </th>
                  <th className='px-6 py-3 font-semibold text-gray-500'>
                    Margin
                  </th>
                  <th className='px-6 py-3 font-semibold text-gray-500 text-right'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, i) => {
                  const margin =
                    product.defaultSellingPrice - product.costPrice;
                  let isActive = Boolean(i % 2);
                  return (
                    <tr
                      key={product._id}
                      className={`border-b-0 ${!isActive ? " bg-white" : "bg-gray-100 "} transition-colors`}>
                      <td className='px-6 py-4 font-medium text-gray-800'>
                        {product.name}
                      </td>
                      <td className='px-6 py-4 text-gray-600'>
                        {product.unit}
                      </td>
                      <td className='px-6 py-4 text-gray-600'>
                        ₹{" " + product.costPrice}
                      </td>
                      <td className='px-6 py-4 text-gray-600'>
                        ₹{" " + product.defaultSellingPrice}
                      </td>
                      <td className='px-6 py-4'>
                        <span
                          className={`font-medium ${margin >= 0 ? "text-green-600" : "text-red-600"}`}>
                          ₹{" " + margin}
                        </span>
                      </td>
                      <td className='px-6 py-4 text-right'>
                        <button
                          onClick={() => openEdit(product)}
                          className='text-blue-600 hover:text-blue-800 p-1 mr-2'
                          title='Edit'>
                          <Pencil className='w-4 h-4' />
                        </button>
                        <button
                          onClick={() =>
                            handleDelete(product._id, product.name)
                          }
                          className='text-red-500 hover:text-red-700 p-1'
                          title='Delete'>
                          <Trash2 className='w-4 h-4' />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {products.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className='px-6 py-8 text-center text-gray-400'>
                      No products found. Add your first product!
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
            <div className='bg-white rounded-xl shadow-xl w-full max-w-md'>
              <div className='flex justify-between items-center p-5 border-b'>
                <h2 className='text-lg font-bold text-gray-800'>
                  {editingId ? "Edit Product" : "Add Product"}
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
                    Product Name
                  </label>
                  <input
                    type='text'
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className='w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                    required
                    placeholder='e.g., Full Cream Milk'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Unit
                  </label>
                  <input
                    type='text'
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    className='w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                    required
                    placeholder='e.g., 500ml, 1L, pkt'
                  />
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Cost Price (₹)
                    </label>
                    <input
                      type='number'
                      step='0.01'
                      value={form.costPrice}
                      onChange={(e) =>
                        setForm({ ...form, costPrice: Number(e.target.value) })
                      }
                      className='w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                      required
                      min='0'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Selling Price (₹)
                    </label>
                    <input
                      type='number'
                      step='0.01'
                      value={form.defaultSellingPrice}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          defaultSellingPrice: Number(e.target.value),
                        })
                      }
                      className='w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                      required
                      min='0'
                    />
                  </div>
                </div>

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

export default ProductsPage;
