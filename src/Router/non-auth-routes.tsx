import LoginPage from '@/pages/LoginPage';

interface RouteConfig {
  name: string;
  path: string;
  component: React.ReactElement;
}

const nonAuthRoutes: RouteConfig[] = [
  {
    name: 'Login',
    path: '/login',
    component: <LoginPage />,
  },
];

export default nonAuthRoutes;
