// =====================================================
// LOGIN PAGE - PETANI ONLY (AGRO TANI)
// =====================================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, ArrowRight, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useData } from '../context/DataContext';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { loginPetani } = useData();
  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const success = await loginPetani(phoneOrEmail, password);
      if (success) {
        navigate('/petani/dashboard');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Nomor telepon atau email tidak terdaftar atau sandi salah.');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center font-sans px-6 py-12">

      <div className="w-full max-w-[400px] px-6 py-12 flex flex-col">
        {/* Minimalist Logo Section */}
        <div className="mb-12 flex flex-col items-center">
          <div className="w-14 h-14 bg-primary-50 rounded-[20px] flex items-center justify-center text-primary-600 mb-4 transition-transform active:scale-95">
            <Leaf size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Agro Tani</h1>
          <p className="text-gray-400 text-sm mt-1">Pemberdayaan Petani Jawa Barat</p>
        </div>

        {/* Form Section */}
        <div className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-gray-800">Masuk</h2>
            <p className="text-gray-500 text-sm">Silakan masukkan detail akun Anda.</p>
            {errorMsg && (
              <div className="bg-red-50 text-red-600 px-4 py-2.5 rounded-xl text-xs font-semibold border border-red-100 mt-2">
                ⚠️ {errorMsg}
              </div>
            )}
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-gray-700 ml-0.5">No. HP / Email</label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors">
                    <User size={18} />
                  </span>
                  <input
                    type="text"
                    value={phoneOrEmail}
                    onChange={e => setPhoneOrEmail(e.target.value)}
                    placeholder="Masukkan nomor HP atau email"
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/5 transition-all outline-none text-gray-800"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center ml-0.5">
                  <label className="text-[13px] font-semibold text-gray-700">Password</label>
                </div>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors">
                    <Lock size={18} />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/5 transition-all outline-none text-gray-800"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary-100 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              Masuk <ArrowRight size={18} />
            </button>
          </form>

          {/* Registration Link */}
          <div className="pt-2 text-center">
            <p className="text-gray-400 text-sm">
              Belum punya akun?{' '}
              <button
                onClick={() => navigate('/petani/registrasi')}
                className="text-primary-600 font-bold hover:underline underline-offset-4"
              >
                Daftar sekarang
              </button>
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-12 pt-8 border-t border-gray-50 flex flex-col items-center gap-6">
          <button
            onClick={() => navigate('/admin/verifikasi-petani')}
            className="text-xs font-bold text-gray-300 hover:text-gray-500 transition-colors px-4 py-2 rounded-full hover:bg-gray-50"
          >
            🔐 Akses Portal Admin
          </button>
          
          <p className="text-[10px] text-gray-300 font-medium text-center uppercase tracking-widest">
            BUMD Agro Jabar · 2026
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
