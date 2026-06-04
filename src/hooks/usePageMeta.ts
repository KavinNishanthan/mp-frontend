import { useLocation } from 'react-router-dom';

const pageMeta: Record<string, { title: string; subtitle: string }> = {
  '/admin': { title: 'Dashboard', subtitle: 'Overview of your distribution business' },
  '/admin/products': { title: 'Products', subtitle: 'Manage your product catalog' },
  '/admin/shops': { title: 'Shops', subtitle: 'Manage shop accounts' },
  '/admin/vehicles': { title: 'Vehicles', subtitle: 'Manage fleet and assignments' },
  '/admin/stock': { title: 'Stock', subtitle: 'Warehouse and vehicle stock management' },
  '/admin/users': { title: 'Users & Drivers', subtitle: 'Manage accounts and roles' },
  '/admin/reports': { title: 'Reports', subtitle: 'Financial reports and analytics' },
  '/admin/bills': { title: 'Bill Management', subtitle: 'View and manage all bills' },
  '/admin/vehicle-history': { title: 'Vehicle History', subtitle: 'Track vehicle activity' },
  '/driver': { title: 'New Bill', subtitle: 'Create a delivery bill' },
  '/driver/payments': { title: 'Collect Payment', subtitle: 'Record cash collections' },
  '/driver/history': { title: 'Bill History', subtitle: 'Your delivery history' },
};

export function usePageMeta() {
  const { pathname } = useLocation();
  return pageMeta[pathname] ?? { title: 'Milk Distributor', subtitle: '' };
}
