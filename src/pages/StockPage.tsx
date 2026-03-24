import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { RefreshCw, ArrowRightLeft } from 'lucide-react';

interface StockItem {
    productId: {
        _id: string;
        name: string;
        unit: string;
    };
    quantity: number;
}

interface Vehicle {
    _id: string;
    registrationNumber: string;
    name: string;
}

const StockPage: React.FC = () => {
    const [warehouseStock, setWarehouseStock] = useState<StockItem[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [selectedVehicle, setSelectedVehicle] = useState<string>('');
    const [vehicleStock, setVehicleStock] = useState<StockItem[]>([]);


    // Transfer Form State
    const [transferType, setTransferType] = useState('WAREHOUSE_TO_VEHICLE');
    const [transferItems, setTransferItems] = useState<{ productId: string; quantity: number }[]>([]);
    const [description, setDescription] = useState('');

    const fetchStock = async () => {

        try {
            // Fetch Warehouse Stock
            const { data: wData } = await api.get('/stock?location=warehouse');
            setWarehouseStock(wData.items || []);

            // Fetch Vehicles
            const { data: vData } = await api.get('/vehicles');
            setVehicles(vData);

            if (selectedVehicle) {
                const { data: vsData } = await api.get(`/stock?location=vehicle&vehicleId=${selectedVehicle}`);
                setVehicleStock(vsData.items || []);
            }
        } catch (error) {
            console.error('Error fetching stock:', error);
        } finally {

        }
    };

    useEffect(() => {
        fetchStock();
    }, [selectedVehicle]);

    const handleTransfer = async (e: React.FormEvent) => {
        e.preventDefault();
        if (transferItems.length === 0) return;

        try {
            await api.post('/stock/transfer', {
                type: transferType,
                vehicleId: selectedVehicle, // Target or Source depending on type
                items: transferItems,
                description,
            });
            alert('Transfer Successful');
            setTransferItems([]);
            setDescription('');
            fetchStock();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Transfer Failed');
        }
    };

    // Simple Item Adder for Transfer
    const [newItemId, setNewItemId] = useState('');
    const [newItemQty, setNewItemQty] = useState(0);

    const addItemToTransfer = () => {
        if (!newItemId || newItemQty <= 0) return;
        setTransferItems([...transferItems, { productId: newItemId, quantity: newItemQty }]);
        setNewItemId('');
        setNewItemQty(0);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Stock Management</h1>
                <button onClick={fetchStock} className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
                    <RefreshCw className="w-4 h-4" /> Refresh
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Warehouse View */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-lg font-semibold mb-4 border-b pb-2">Warehouse Stock</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="p-2">Product</th>
                                    <th className="p-2">Quantity</th>
                                </tr>
                            </thead>
                            <tbody>
                                {warehouseStock.map((item) => (
                                    <tr key={item.productId._id} className="border-t">
                                        <td className="p-2">{item.productId.name} ({item.productId.unit})</td>
                                        <td className="p-2 font-medium">{item.quantity}</td>
                                    </tr>
                                ))}
                                {warehouseStock.length === 0 && <tr><td colSpan={2} className="p-2 text-center text-gray-500">No stock in warehouse</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Vehicle View */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex justify-between items-center mb-4 border-b pb-2">
                        <h2 className="text-lg font-semibold">Vehicle Stock</h2>
                        <select
                            className="border rounded p-1 text-sm"
                            value={selectedVehicle}
                            onChange={(e) => setSelectedVehicle(e.target.value)}
                        >
                            <option value="">Select Vehicle</option>
                            {vehicles.map(v => (
                                <option key={v._id} value={v._id}>{v.name} ({v.registrationNumber})</option>
                            ))}
                        </select>
                    </div>

                    {selectedVehicle ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left text-sm">
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th className="p-2">Product</th>
                                        <th className="p-2">Quantity</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {vehicleStock.map((item) => (
                                        <tr key={item.productId._id} className="border-t">
                                            <td className="p-2">{item.productId.name} ({item.productId.unit})</td>
                                            <td className="p-2 font-medium">{item.quantity}</td>
                                        </tr>
                                    ))}
                                    {vehicleStock.length === 0 && <tr><td colSpan={2} className="p-2 text-center text-gray-500">No stock in vehicle</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-4">Select a vehicle to view stock</p>
                    )}
                </div>
            </div>

            {/* Transfer Section */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <ArrowRightLeft className="w-5 h-5 text-blue-600" />
                    Transfer Stock
                </h2>

                <form onSubmit={handleTransfer} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Type</label>
                            <select
                                className="w-full border rounded p-2 mt-1"
                                value={transferType}
                                onChange={(e) => setTransferType(e.target.value)}
                            >
                                <option value="WAREHOUSE_TO_VEHICLE">Warehouse to Vehicle</option>
                                <option value="VEHICLE_TO_WAREHOUSE">Vehicle to Warehouse</option>
                                <option value="FACTORY_TO_WAREHOUSE">Factory to Warehouse</option>
                            </select>
                        </div>

                        {(transferType === 'WAREHOUSE_TO_VEHICLE' || transferType === 'VEHICLE_TO_WAREHOUSE') && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Vehicle</label>
                                <select
                                    className="w-full border rounded p-2 mt-1"
                                    value={selectedVehicle}
                                    onChange={(e) => setSelectedVehicle(e.target.value)}
                                    required
                                >
                                    <option value="">Select Vehicle</option>
                                    {vehicles.map(v => (
                                        <option key={v._id} value={v._id}>{v.name} ({v.registrationNumber})</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <input
                                type="text"
                                className="w-full border rounded p-2 mt-1"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Optional note"
                            />
                        </div>
                    </div>

                    {/* Item Adder */}
                    <div className="border p-4 rounded bg-gray-50">
                        <h3 className="text-sm font-medium mb-2">Add Items to Transfer</h3>
                        <div className="flex gap-2">
                            <select
                                className="flex-1 border rounded p-2"
                                value={newItemId}
                                onChange={(e) => setNewItemId(e.target.value)}
                            >
                                <option value="">Select Product</option>
                                {/* We can use warehouse items or fetch all products. Ideally fetch all products. 
                    For now, assuming warehouseStock contains all product types is risky. 
                    Better to just rely on warehouseStock for W->V, but for others?
                    Let's just use what's available in warehouseStock map for simplicity or improve later.
                */}
                                {warehouseStock.map(i => (
                                    <option key={i.productId._id} value={i.productId._id}>{i.productId.name}</option>
                                ))}
                            </select>
                            <input
                                type="number"
                                className="w-24 border rounded p-2"
                                placeholder="Qty"
                                value={newItemQty}
                                onChange={(e) => setNewItemQty(Number(e.target.value))}
                            />
                            <button
                                type="button"
                                onClick={addItemToTransfer}
                                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                            >
                                Add
                            </button>
                        </div>

                        {/* List to be transferred */}
                        <ul className="mt-3 space-y-1">
                            {transferItems.map((item, idx) => {
                                const pName = warehouseStock.find(w => w.productId._id === item.productId)?.productId.name || item.productId;
                                return (
                                    <li key={idx} className="flex justify-between text-sm bg-white p-2 rounded border">
                                        <span>{pName}</span>
                                        <span className="font-bold">{item.quantity}</span>
                                    </li>
                                )
                            })}
                        </ul>
                    </div>

                    <button
                        type="submit"
                        disabled={transferItems.length === 0}
                        className="w-full bg-blue-600 text-white font-bold py-2 rounded disabled:bg-gray-300"
                    >
                        Confirm Transfer
                    </button>
                </form>
            </div>
        </div>
    );
};

export default StockPage;
