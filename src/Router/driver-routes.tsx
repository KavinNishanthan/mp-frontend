import BillingPage from '@/pages/BillingPage';
import PaymentPage from '@/pages/PaymentPage';
import BillHistoryPage from '@/pages/BillHistoryPage';

interface RouteConfig {
  name: string;
  path?: string;
  index?: boolean;
  component: React.ReactElement;
}

const driverRoutes: RouteConfig[] = [
  {
    name: 'Billing',
    index: true,
    component: <BillingPage />,
  },
  {
    name: 'Payments',
    path: 'payments',
    component: <PaymentPage />,
  },
  {
    name: 'History',
    path: 'history',
    component: <BillHistoryPage />,
  },
];

export default driverRoutes;
