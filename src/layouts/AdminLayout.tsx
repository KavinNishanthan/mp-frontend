import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    Package,
    Store,
    Truck,
    Users,
    LogOut,
    Boxes,
    Milk,
    ChevronLeft,
    Menu,
    BarChart3,
    Receipt,
    History
} from 'lucide-react';
import clsx from 'clsx';

const AdminLayout: React.FC = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
        { name: 'Products', path: '/admin/products', icon: Package },
        { name: 'Stock', path: '/admin/stock', icon: Boxes },
        { name: 'Reports', path: '/admin/reports', icon: BarChart3 },
        { name: 'Bills', path: '/admin/bills', icon: Receipt },
        { name: 'Vehicle History', path: '/admin/vehicle-history', icon: History },
        { name: 'Users', path: '/admin/users', icon: Users },
        { name: 'Shops', path: '/admin/shops', icon: Store },
        { name: 'Vehicles', path: '/admin/vehicles', icon: Truck },
    ];

    const isActive = (path: string) => {
        if (path === '/admin') return location.pathname === '/admin';
        return location.pathname.startsWith(path);
    };

    const SidebarContent = () => (
      <>
        {/* Logo */}
        <div
          className={clsx(
            "p-5 border-b border-gray-100 flex items-center gap-3",
            collapsed && "justify-center px-3",
          )}>
          <div className='w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-indigo-200'>
            <Milk className='w-5 h-5 text-white' />
          </div>
          {!collapsed && (
            <div className='animate-fade-in'>
              <h1 className='text-sm font-bold text-gray-900'>
                Kodai Diary Distributor
              </h1>
              <p className='text-[10px] text-gray-400 leading-tight'>
                Management System
              </p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className='flex-1 overflow-y-auto py-4 px-3'>
          <div className={clsx("space-y-1", !collapsed && "stagger-children")}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={clsx(
                    "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200",
                    collapsed && "justify-center",
                    active
                      ? "bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 shadow-sm"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                  )}
                  title={collapsed ? item.name : undefined}>
                  <Icon
                    className={clsx(
                      "w-5 h-5 flex-shrink-0 transition-colors",
                      active && "text-indigo-600",
                    )}
                  />
                  {!collapsed && <span>{item.name}</span>}
                  {active && !collapsed && (
                    <div className='ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600' />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User section */}
        <div className='p-3 border-t border-gray-100'>
          {!collapsed && (
            <div className='flex items-center gap-3 mb-3 px-2'>
              <div className='w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-700 font-bold text-sm flex-shrink-0'>
                {user?.name.charAt(0).toUpperCase()}
              </div>
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-semibold text-gray-900 truncate'>
                  {user?.name}
                </p>
                <p className='text-[11px] text-gray-400 truncate'>
                  {user?.role === "admin" ? "Administrator" : "Driver"}
                </p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={clsx(
              "flex items-center gap-2 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200",
              collapsed ? "mx-auto p-2.5" : "w-full px-3 py-2.5",
              collapsed && "justify-center",
            )}
            title='Logout'>
            <LogOut className='w-4 h-4' />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </>
    );

    return (
        <div className="flex h-screen bg-gray-50/50">
            {/* Desktop Sidebar */}
            <aside className={clsx(
                "hidden md:flex flex-col bg-white border-r border-gray-100 transition-all duration-300 flex-shrink-0",
                collapsed ? "w-[68px]" : "w-64"
            )}>
                <SidebarContent />
                {/* Collapse toggle */}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="absolute top-5 -right-3 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors z-10 hidden md:flex"
                    style={{ left: collapsed ? '55px' : '249px' }}
                >
                    <ChevronLeft className={clsx("w-3 h-3 text-gray-500 transition-transform", collapsed && "rotate-180")} />
                </button>
            </aside>

            {/* Mobile overlay */}
            {mobileOpen && (
                <div className="fixed inset-0 bg-black/20 z-40 md:hidden" onClick={() => setMobileOpen(false)} />
            )}

            {/* Mobile sidebar */}
            <aside className={clsx(
                "fixed inset-y-0 left-0 w-64 bg-white z-50 flex flex-col transition-transform duration-300 md:hidden shadow-2xl",
                mobileOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <SidebarContent />
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Mobile Header */}
                <header className="md:hidden flex items-center gap-3 p-4 bg-white border-b border-gray-100">
                    <button onClick={() => setMobileOpen(true)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                        <Menu className="w-5 h-5 text-gray-600" />
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                            <Milk className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-semibold text-sm text-gray-800">Milk Distributor</span>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
