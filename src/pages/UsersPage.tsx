import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Plus, Pencil, Trash2, X, Users, Shield, Truck } from 'lucide-react';

interface User {
    _id: string;
    name: string;
    username: string;
    role: 'admin' | 'driver';
    isActive: boolean;
}

interface UserForm {
    name: string;
    username: string;
    password: string;
    role: 'admin' | 'driver';
}

const emptyForm: UserForm = { name: '', username: '', password: '', role: 'driver' };

const UsersPage: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<UserForm>(emptyForm);
    const [error, setError] = useState('');

    const fetchUsers = async () => {
        try {
            const { data } = await api.get('/users');
            setUsers(data);
        } catch (err) {
            console.error('Error fetching users:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    const openAdd = () => {
        setForm(emptyForm);
        setEditingId(null);
        setError('');
        setShowModal(true);
    };

    const openEdit = (user: User) => {
        setForm({
            name: user.name,
            username: user.username,
            password: '', // Don't populate password on edit
            role: user.role,
        });
        setEditingId(user._id);
        setError('');
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!editingId && !form.password) {
            setError('Password is required for new users');
            return;
        }

        try {
            const payload: any = {
                name: form.name,
                username: form.username,
                role: form.role,
            };
            // Only include password if it's set
            if (form.password) {
                payload.password = form.password;
            }

            if (editingId) {
                await api.put(`/users/${editingId}`, payload);
            } else {
                await api.post('/users', payload);
            }
            setShowModal(false);
            fetchUsers();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Operation failed');
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
        try {
            await api.delete(`/users/${id}`);
            fetchUsers();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Delete failed');
        }
    };

    if (loading) return <div className="p-8 text-gray-500">Loading users...</div>;

    const admins = users.filter(u => u.role === 'admin');
    const driversList = users.filter(u => u.role === 'driver');

    return (
      <div className='space-y-6'>
        <div className='flex justify-between items-center'>
          <h1 className='text-2xl font-bold text-gray-800 flex items-center gap-2'>
            <Users className='w-7 h-7 text-blue-600' />
            Users & Drivers
          </h1>
          <button
            onClick={openAdd}
            className='flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm'>
            <Plus className='w-4 h-4' /> Add User
          </button>
        </div>

        {/* Stats */}
        <div className='grid grid-cols-2 gap-4'>
          <div className='bg-white p-4 rounded-lg shadow-sm border-l-4 border-purple-500'>
            <div className='flex items-center gap-2 text-sm text-gray-500'>
              <Shield className='w-4 h-4' /> Admins
            </div>
            <p className='text-2xl font-bold text-gray-800 mt-1'>
              {admins.length}
            </p>
          </div>
          <div className='bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500'>
            <div className='flex items-center gap-2 text-sm text-gray-500'>
              <Truck className='w-4 h-4' /> Drivers
            </div>
            <p className='text-2xl font-bold text-gray-800 mt-1'>
              {driversList.length}
            </p>
          </div>
        </div>

        <div className='bg-white rounded-lg shadow-lg overflow-hidden p-4'>
          <div className='overflow-x-auto'>
            <table className='min-w-full text-left text-sm'>
              <thead>
                <tr className='bg-white border-b '>
                  <th className='px-6 py-3 font-semibold text-gray-600'>
                    Name
                  </th>
                  <th className='px-6 py-3 font-semibold text-gray-600'>
                    Username
                  </th>
                  <th className='px-6 py-3 font-semibold text-gray-600'>
                    Role
                  </th>
                  <th className='px-6 py-3 font-semibold text-gray-600 text-right'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, i) => (
                  <tr
                    key={user._id}
                    className={`${i % 2 ? "bg-gray-100" : "bg-white"}`}>
                    <td className='px-6 py-4 font-medium text-gray-800'>
                      <div className='flex items-center gap-3'>
                        <div className='w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm'>
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        {user.name}
                      </div>
                    </td>
                    <td className='px-6 py-4 text-gray-600 font-mono text-xs'>
                      {user.username}
                    </td>
                    <td className='px-6 py-4'>
                      {user.role === "admin" ? (
                        <span className='inline-flex items-center gap-1 bg-purple-50 text-purple-700 px-2 py-1 rounded-full text-xs font-medium'>
                          <Shield className='w-3 h-3' /> Admin
                        </span>
                      ) : (
                        <span className='inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs font-medium'>
                          <Truck className='w-3 h-3' /> Driver
                        </span>
                      )}
                    </td>
                    <td className='px-6 py-4 text-right'>
                      <button
                        onClick={() => openEdit(user)}
                        className='text-blue-600 hover:text-blue-800 p-1 mr-2'
                        title='Edit'>
                        <Pencil className='w-4 h-4' />
                      </button>
                      <button
                        onClick={() => handleDelete(user._id, user.name)}
                        className='text-red-500 hover:text-red-700 p-1'
                        title='Delete'>
                        <Trash2 className='w-4 h-4' />
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className='px-6 py-8 text-center text-gray-400'>
                      No users found.
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
                  {editingId ? "Edit User" : "Add User"}
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
                    Full Name
                  </label>
                  <input
                    type='text'
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className='w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                    required
                    placeholder='e.g., Ravi Kumar'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Username
                  </label>
                  <input
                    type='text'
                    value={form.username}
                    onChange={(e) =>
                      setForm({ ...form, username: e.target.value })
                    }
                    className='w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                    required
                    placeholder='e.g., ravi_driver'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Password{" "}
                    {editingId && (
                      <span className='text-gray-400 font-normal'>
                        (leave blank to keep current)
                      </span>
                    )}
                  </label>
                  <input
                    type='password'
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    className='w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                    {...(!editingId && { required: true })}
                    placeholder={
                      editingId
                        ? "Leave blank to keep unchanged"
                        : "Set password"
                    }
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Role
                  </label>
                  <select
                    value={form.role}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        role: e.target.value as "admin" | "driver",
                      })
                    }
                    className='w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'>
                    <option value='driver'>Driver</option>
                    <option value='admin'>Admin</option>
                  </select>
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

export default UsersPage;
