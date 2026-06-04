import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '@/layout/AdminLayout';
import DriverLayout from '@/layout/DriverLayout';
import ProtectedRoute from '@/Router/ProtectedRoute';
import PublicRoute from '@/Router/PublicRoute';
import adminRoutes from '@/Router/admin-routes';
import driverRoutes from '@/Router/driver-routes';
import nonAuthRoutes from '@/Router/non-auth-routes';
import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes — redirect to dashboard if already logged in */}
        <Route element={<PublicRoute />}>
          {nonAuthRoutes.map((route) => (
            <Route key={route.name} path={route.path} element={route.component} />
          ))}
        </Route>

        {/* Admin routes */}
        <Route element={<ProtectedRoute roles={['admin']} />}>
          <Route path='/admin' element={<AdminLayout />}>
            {adminRoutes.map((route) =>
              route.index ? (
                <Route key={route.name} index element={route.component} />
              ) : (
                <Route key={route.name} path={route.path} element={route.component} />
              ),
            )}
          </Route>
        </Route>

        {/* Driver routes */}
        <Route element={<ProtectedRoute roles={['driver']} />}>
          <Route path='/driver' element={<DriverLayout />}>
            {driverRoutes.map((route) =>
              route.index ? (
                <Route key={route.name} index element={route.component} />
              ) : (
                <Route key={route.name} path={route.path} element={route.component} />
              ),
            )}
          </Route>
        </Route>

        <Route path='*' element={<Navigate to='/login' replace />} />
      </Routes>
    </Router>
  );
}

export default App;
