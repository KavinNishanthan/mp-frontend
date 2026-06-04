import DashboardPage from '@/pages/DashboardPage';
import ProductsPage from '@/pages/ProductsPage';
import ShopsPage from '@/pages/ShopsPage';
import ShopHistoryPage from '@/pages/ShopHistoryPage';
import VehiclesPage from '@/pages/VehiclesPage';
import StockPage from '@/pages/StockPage';
import UsersPage from '@/pages/UsersPage';
import ReportsPage from '@/pages/ReportsPage';
import AdminBillsPage from '@/pages/AdminBillsPage';
import VehicleHistoryPage from '@/pages/VehicleHistoryPage';

interface RouteConfig {
  name: string;
  path?: string;
  index?: boolean;
  component: React.ReactElement;
}

const adminRoutes: RouteConfig[] = [
  {
    name: 'Dashboard',
    index: true,
    component: <DashboardPage />,
  },
  {
    name: 'Products',
    path: 'products',
    component: <ProductsPage />,
  },
  {
    name: 'Shops',
    path: 'shops',
    component: <ShopsPage />,
  },
  {
    name: 'Shop History',
    path: 'shops/:id/history',
    component: <ShopHistoryPage />,
  },
  {
    name: 'Vehicles',
    path: 'vehicles',
    component: <VehiclesPage />,
  },
  {
    name: 'Stock',
    path: 'stock',
    component: <StockPage />,
  },
  {
    name: 'Users',
    path: 'users',
    component: <UsersPage />,
  },
  {
    name: 'Reports',
    path: 'reports',
    component: <ReportsPage />,
  },
  {
    name: 'Bills',
    path: 'bills',
    component: <AdminBillsPage />,
  },
  {
    name: 'Vehicle History',
    path: 'vehicle-history',
    component: <VehicleHistoryPage />,
  },
];

export default adminRoutes;
