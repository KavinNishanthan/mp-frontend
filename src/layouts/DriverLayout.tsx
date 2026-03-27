import React from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Truck, Receipt, IndianRupee, FileText, Milk } from 'lucide-react';
import clsx from 'clsx';

const DriverLayout: React.FC = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { name: 'New Bill', path: '/driver', icon: Receipt },
        { name: 'Collect', path: '/driver/payments', icon: IndianRupee },
        { name: 'History', path: '/driver/history', icon: FileText },
    ];

    return (
      <div className='min-h-screen bg-gray-50/50 flex flex-col'>
        {/* Header */}
        <header className='bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-200/30 px-4 py-3 flex items-center justify-between sticky top-0 z-30'>
          <div className='flex items-center gap-3'>
            <div className='w-9 h-9 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center'>
              <Milk className='w-5 h-5 text-white' />
            </div>
            <div>
              <h1 className='font-bold text-base leading-tight'>
                Kodai Diary Distributor
              </h1>
              <p className='text-[11px] text-white/70 flex items-center gap-1'>
                <Truck className='w-3 h-3' />
                Hi, {user?.name}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className='p-2 hover:bg-white/10 rounded-lg transition-colors'
            aria-label='Logout'>
            <LogOut className='w-5 h-5' />
          </button>
        </header>

        {/* Main content */}
        <main className='flex-1 p-4 pb-28'>
          <div className='max-w-lg mx-auto w-full'>
            <Outlet />
          </div>
        </main>

        {/* Bottom Navigation */}
        <nav className='fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-gray-200/50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-30'>
          <div className='flex justify-around max-w-lg mx-auto'>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={clsx(
                    "flex flex-col items-center py-2.5 px-5 text-[11px] font-medium transition-all duration-200 flex-1 relative",
                    isActive
                      ? "text-indigo-600"
                      : "text-gray-400 hover:text-gray-600",
                  )}>
                  {isActive && (
                    <div className='absolute -top-0.5 w-8 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full' />
                  )}
                  <Icon
                    className={clsx(
                      "w-5 h-5 mb-1",
                      isActive && "text-indigo-600",
                    )}
                  />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    );
};

export default DriverLayout;
