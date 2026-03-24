import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import PrivateRoute from './components/PrivateRoute';
import AdminLayout from './layouts/AdminLayout';
import DriverLayout from './layouts/DriverLayout';

import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import ShopsPage from './pages/ShopsPage';
import VehiclesPage from './pages/VehiclesPage';
import StockPage from './pages/StockPage';
import UsersPage from './pages/UsersPage';
import BillingPage from './pages/BillingPage';
import PaymentPage from './pages/PaymentPage';
import BillHistoryPage from './pages/BillHistoryPage';
import ReportsPage from './pages/ReportsPage';
import AdminBillsPage from './pages/AdminBillsPage';
import ShopHistoryPage from './pages/ShopHistoryPage';
import VehicleHistoryPage from './pages/VehicleHistoryPage';

const AppRoutes: React.FC = () => {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />

                    {/* Admin Routes */}
                    <Route element={<PrivateRoute roles={['admin']} />}>
                        <Route path="/admin" element={<AdminLayout />}>
                            <Route index element={<DashboardPage />} />
                            <Route path="products" element={<ProductsPage />} />
                            <Route path="shops" element={<ShopsPage />} />
                            <Route path="shops/:id/history" element={<ShopHistoryPage />} />
                            <Route path="vehicles" element={<VehiclesPage />} />
                            <Route path="stock" element={<StockPage />} />
                            <Route path="users" element={<UsersPage />} />
                            <Route path="reports" element={<ReportsPage />} />
                            <Route path="bills" element={<AdminBillsPage />} />
                            <Route path="vehicle-history" element={<VehicleHistoryPage />} />
                        </Route>
                    </Route>

                    {/* Driver Routes */}
                    <Route element={<PrivateRoute roles={['driver']} />}>
                        <Route path="/driver" element={<DriverLayout />}>
                            <Route index element={<BillingPage />} />
                            <Route path="payments" element={<PaymentPage />} />
                            <Route path="history" element={<BillHistoryPage />} />
                        </Route>
                    </Route>

                    {/* Catch all */}
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </AuthProvider>
        </Router>
    );
};

export default AppRoutes;
