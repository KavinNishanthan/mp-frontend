import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Plus, Pencil, Trash2, X, Truck, UserCheck } from 'lucide-react';

interface Driver {
    _id: string;
    name: string;
    username: string;
}

interface Vehicle {
    _id: string;
    registrationNumber: string;
    name?: string;
    driverId?: Driver | null;
    isActive: boolean;
}

interface VehicleForm {
    registrationNumber: string;
    name: string;
}

const emptyForm: VehicleForm = { registrationNumber: '', name: '' };

const VehiclesPage: React.FC = () => {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [assignVehicleId, setAssignVehicleId] = useState<string | null>(null);
    const [assignDriverId, setAssignDriverId] = useState<string>('');
    const [form, setForm] = useState<VehicleForm>(emptyForm);
    const [error, setError] = useState('');

    const fetchData = async () => {
        try {
            const [vehiclesRes, usersRes] = await Promise.all([
                api.get('/vehicles'),
                api.get('/users'),
            ]);
            setVehicles(vehiclesRes.data);
            // Filter only drivers
            setDrivers(usersRes.data.filter((u: any) => u.role === 'driver'));
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

    const openEdit = (vehicle: Vehicle) => {
        setForm({
            registrationNumber: vehicle.registrationNumber,
            name: vehicle.name || '',
        });
        setEditingId(vehicle._id);
        setError('');
        setShowModal(true);
    };

    const openAssign = (vehicle: Vehicle) => {
        setAssignVehicleId(vehicle._id);
        setAssignDriverId(typeof vehicle.driverId === 'object' && vehicle.driverId ? vehicle.driverId._id : '');
        setError('');
        setShowAssignModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            if (editingId) {
                await api.put(`/vehicles/${editingId}`, form);
            } else {
                await api.post('/vehicles', form);
            }
            setShowModal(false);
            fetchData();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Operation failed');
        }
    };

    const handleAssign = async () => {
        if (!assignVehicleId) return;
        try {
            await api.put(`/vehicles/${assignVehicleId}/assign`, { driverId: assignDriverId || null });
            setShowAssignModal(false);
            fetchData();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Assignment failed');
        }
    };

    const handleDelete = async (id: string, regNo: string) => {
        if (!confirm(`Delete vehicle "${regNo}"?`)) return;
        try {
            await api.delete(`/vehicles/${id}`);
            fetchData();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Delete failed');
        }
    };

    if (loading) return <div className="p-8 text-gray-500">Loading vehicles...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Truck className="w-7 h-7 text-blue-600" />
                    Vehicles
                </h1>
                <button
                    onClick={openAdd}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4" /> Add Vehicle
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                        <thead>
                            <tr className="bg-gray-50 border-b">
                                <th className="px-6 py-3 font-semibold text-gray-600">Registration No.</th>
                                <th className="px-6 py-3 font-semibold text-gray-600">Name</th>
                                <th className="px-6 py-3 font-semibold text-gray-600">Assigned Driver</th>
                                <th className="px-6 py-3 font-semibold text-gray-600 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vehicles.map((vehicle) => {
                                const driver = typeof vehicle.driverId === 'object' ? vehicle.driverId : null;
                                return (
                                    <tr key={vehicle._id} className="border-b hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-800 font-mono">{vehicle.registrationNumber}</td>
                                        <td className="px-6 py-4 text-gray-600">{vehicle.name || '—'}</td>
                                        <td className="px-6 py-4">
                                            {driver ? (
                                                <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                                                    <UserCheck className="w-3 h-3" />
                                                    {driver.name}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400 text-xs">Unassigned</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => openAssign(vehicle)} className="text-green-600 hover:text-green-800 p-1 mr-2" title="Assign Driver">
                                                <UserCheck className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => openEdit(vehicle)} className="text-blue-600 hover:text-blue-800 p-1 mr-2" title="Edit">
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(vehicle._id, vehicle.registrationNumber)} className="text-red-500 hover:text-red-700 p-1" title="Delete">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            {vehicles.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                                        No vehicles found. Add your first vehicle!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Vehicle Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                        <div className="flex justify-between items-center p-5 border-b">
                            <h2 className="text-lg font-bold text-gray-800">
                                {editingId ? 'Edit Vehicle' : 'Add Vehicle'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-5 space-y-4">
                            {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</div>}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number</label>
                                <input
                                    type="text"
                                    value={form.registrationNumber}
                                    onChange={(e) => setForm({ ...form, registrationNumber: e.target.value })}
                                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                                    required
                                    placeholder="e.g., TN 01 AB 1234"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Name</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., Tata Ace 1 (Optional)"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    {editingId ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Assign Driver Modal */}
            {showAssignModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
                        <div className="flex justify-between items-center p-5 border-b">
                            <h2 className="text-lg font-bold text-gray-800">Assign Driver</h2>
                            <button onClick={() => setShowAssignModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-5 space-y-4">
                            {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</div>}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Select Driver</label>
                                <select
                                    value={assignDriverId}
                                    onChange={(e) => setAssignDriverId(e.target.value)}
                                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">-- Unassign --</option>
                                    {drivers.map(d => (
                                        <option key={d._id} value={d._id}>{d.name} ({d.username})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowAssignModal(false)}
                                    className="flex-1 px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAssign}
                                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    Assign
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VehiclesPage;
