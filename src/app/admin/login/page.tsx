'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // sessionStorage-д username хадгалах
        sessionStorage.setItem('admin_username', data.user.username);
        router.push('/admin');
        router.refresh();
      } else {
        setError(data.error || 'Нэвтрэх явцад алдаа гарлаа');
      }
    } catch (err) {
      setError('Сервертэй холбогдоход алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5f7] px-4">
      <div className="w-full max-w-[420px]">
        {/* Card */}
        <div className="bg-white rounded-[18px] shadow-[0_2px_16px_rgba(0,0,0,0.12)] overflow-hidden">
          {/* Header */}
          <div className="text-center pt-12 pb-8 px-8">
            <div className="mx-auto mb-6 w-[76px] h-[76px] rounded-full bg-black flex items-center justify-center">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <h1 className="text-[32px] font-semibold text-[#1d1d1f] tracking-tight">
              Нэвтрэх
            </h1>
            <p className="text-[15px] text-[#86868b] mt-2">
              Admin панел руу нэвтэрнэ үү
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mx-8 mb-6">
              <div className="bg-[#fff5f5] border border-[#feb2b2] rounded-xl px-4 py-3.5 text-[13px] text-[#c53030]">
                {error}
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 pb-10">
            <div className="space-y-4">
              {/* Username */}
              <div>
                <label className="block text-[13px] font-medium text-[#1d1d1f] mb-2">
                  Нэвтрэх нэр
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin1 эсвэл superuser"
                  required
                  disabled={loading}
                  className="w-full px-4 py-3.5 rounded-xl
                    bg-white border border-[#d2d2d7]
                    text-[15px] text-[#1d1d1f] placeholder-[#86868b]
                    focus:outline-none focus:ring-2 focus:ring-[#0071e3] focus:border-transparent
                    disabled:bg-[#f5f5f7] disabled:cursor-not-allowed
                    transition-all duration-200"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-[13px] font-medium text-[#1d1d1f] mb-2">
                  Нууц үг
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Нууц үгээ оруулна уу"
                    required
                    disabled={loading}
                    className="w-full px-4 py-3.5 pr-12 rounded-xl
                      bg-white border border-[#d2d2d7]
                      text-[15px] text-[#1d1d1f] placeholder-[#86868b]
                      focus:outline-none focus:ring-2 focus:ring-[#0071e3] focus:border-transparent
                      disabled:bg-[#f5f5f7] disabled:cursor-not-allowed
                      transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                    className="absolute right-4 top-1/2 -translate-y-1/2
                      text-[#86868b] hover:text-[#1d1d1f]
                      disabled:cursor-not-allowed
                      transition-colors duration-200"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 py-3.5 rounded-xl font-medium text-[15px] text-white
                  bg-[#0071e3] hover:bg-[#0077ed]
                  active:scale-[0.98]
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all duration-200
                  flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Нэвтэрч байна...
                  </>
                ) : (
                  'Нэвтрэх'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-[12px] text-[#86868b] mt-6">
          © {new Date().getFullYear()} Auto Sugalaa Admin
        </p>
      </div>
    </div>
  );
}
