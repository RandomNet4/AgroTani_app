// =====================================================
// LAYOUT WRAPPER - AGRO TANI (PETANI MULTI-PLATFORM)
// =====================================================

import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Home, TrendingUp, ShoppingCart, Sprout, Package, Users, ClipboardCheck } from 'lucide-react';
import BottomNav from './BottomNav';
import { useData } from '../context/DataContext';

// Top Navigation Header (Sticky on scroll)
const TopHeaderNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useData();

  const isKepala = currentUser?.role === 'kepala_petani';

  const desktopNavItems = [
    { path: '/petani/dashboard', label: 'Dashboard', icon: <Home size={18} /> },
    { path: '/petani/harga', label: 'Harga Jual', icon: <TrendingUp size={18} /> },
    { path: '/petani/jual-panen', label: 'Jual Panen', icon: <ShoppingCart size={18} /> },
    { path: '/petani/data-lahan', label: 'Data Lahan', icon: <Sprout size={18} /> },
    { path: '/petani/rekomendasi', label: 'Rekomendasi', icon: <Sprout size={18} /> },
    { path: '/petani/pesanan-gudang', label: 'PO Gudang', icon: <Package size={18} /> },
    ...(isKepala ? [
      { path: '/petani/kelompok', label: 'Kelompok Tani', icon: <Users size={18} /> },
      { path: '/petani/inspeksi', label: 'Inspeksi Lahan', icon: <ClipboardCheck size={18} /> }
    ] : [])
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-14 md:h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div 
          onClick={() => navigate('/petani/dashboard')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
            <Sprout size={18} className="md:w-5 md:h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-gray-900 text-sm md:text-base tracking-tight">
                AGRO TANI
              </span>
              <span className="text-[9px] md:text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
                {isKepala ? 'Kepala Petani' : 'Petani'}
              </span>
            </div>
            <p className="text-[10px] text-gray-400 font-medium hidden sm:block">Portal Pertanian Integrated</p>
          </div>
        </div>

        {/* Navigation Links (Desktop/Tablet) */}
        <nav className="hidden md:flex items-center gap-1">
          {desktopNavItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/petani/dashboard' && location.pathname.startsWith(item.path));
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-100'
                    : 'text-gray-600 hover:text-emerald-600 hover:bg-gray-50'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Profile Info Pill (Mobile & Desktop) */}
        <div 
          onClick={() => navigate('/petani/profil')}
          className="flex items-center gap-2.5 pl-2 md:pl-3 border-l border-gray-100 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-sm border border-emerald-200 shrink-0 group-hover:scale-105 transition-transform">
            {currentUser?.fotoProfil || '👨‍🌾'}
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-bold text-gray-800 leading-tight group-hover:text-emerald-600 transition-colors">
              {currentUser?.nama || 'Petani'}
            </p>
            <p className="text-[10px] text-gray-400 font-medium truncate max-w-[110px]">
              {currentUser?.kabupaten || 'Cianjur'}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

// Layout untuk App Petani (Responsive: Mobile BottomNav, Desktop TopNav)
export const PetaniLayout: React.FC = () => {
  const location = useLocation();
  const hideNavPaths = [
    '/petani/jual-panen/form',
    '/petani/edit-profile',
    '/petani/alamat',
    '/petani/mengenai'
  ];
  const shouldHideNav = hideNavPaths.includes(location.pathname);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Sticky Header Nav */}
      {!shouldHideNav && <TopHeaderNav />}

      {/* Main Content Area: Centered max-w-lg on Mobile, Responsive max-w-6xl on Desktop */}
      <main className={`flex-1 w-full max-w-lg md:max-w-6xl mx-auto px-3 sm:px-4 md:px-6 ${shouldHideNav ? 'py-4' : 'pt-16 md:pt-20 pb-24 md:pb-10'}`}>
        <Outlet />
      </main>

      {/* Mobile Fixed Bottom Nav */}
      {!shouldHideNav && <BottomNav />}
    </div>
  );
};
