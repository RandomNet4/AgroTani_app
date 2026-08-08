// =====================================================
// LOGIN ADMIN PAGE - AGRO TANI (JWT-Based Auth)
// =====================================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, Eye, EyeOff, Lock, AlertCircle, ArrowLeft } from 'lucide-react';

const LoginAdminPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@agrotani.id');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/petani/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errObj = await res.json().catch(() => ({}));
        throw new Error(errObj.error || 'Email atau password salah.');
      }

      const { token } = await res.json();
      // Simpan JWT admin (bukan hanya flag boolean)
      localStorage.setItem('adminToken', token);
      navigate('/admin/verifikasi-petani');
    } catch (err: any) {
      setErrorMsg(err.message || 'Login gagal. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-800 via-primary-700 to-emerald-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Leaf className="text-white" size={32} />
          </div>
          <h1 className="font-display font-bold text-2xl text-gray-900">Agro Tani</h1>
          <p className="text-gray-500 text-sm mt-1">Panel Admin Petani</p>
        </div>

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-2 mb-4">
            <AlertCircle size={16} className="text-red-500 shrink-0" />
            <p className="text-red-700 text-sm font-medium">{errorMsg}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Admin</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
              placeholder="admin@agrotani.id"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all pr-12"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary-600 to-emerald-600 text-white py-3 rounded-xl font-bold hover:from-primary-700 hover:to-emerald-700 transition-all shadow-lg disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <Lock size={18} />
            )}
            {loading ? 'Memverifikasi...' : 'Masuk sebagai Admin'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-100 text-center">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-primary-600 transition-colors"
          >
            <ArrowLeft size={16} />
            Kembali ke Login Petani
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginAdminPage;
