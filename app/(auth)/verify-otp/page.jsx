'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, ArrowLeft, Moon, Sun, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

export default function VerifyOtp() {
  const [darkMode, setDarkMode] = useState(false);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    setDarkMode(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newMode);
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      return setError('Please enter the 6-digit code.');
    }
    setIsLoading(true);
    setError('');

    try {
      const email = localStorage.getItem('resetEmail');
      if (!email) {
        setError('Session expired. Please start over.');
        setIsLoading(false);
        return;
      }
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();

      if (res.ok) {
        router.push('/reset-password');
      } else {
        setError(data.message || 'Invalid OTP, please try again.');
      }
    } catch (err) {
      console.error('Verify OTP error:', err);
      setError('Network error, please try again.');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 transition-colors">
      {/* Nav */}
      <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-16">
          <Link href="/" className="flex items-center">
            <ArrowLeft className="h-5 w-5 mr-2 text-gray-600 dark:text-gray-400" />
            <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">PhishGuard</span>
          </Link>
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      <div className="flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full space-y-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl p-8 border border-gray-200 dark:border-slate-700">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-full">
                  <Key className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Verify OTP</h2>
              <p className="mt-2 text-gray-600 dark:text-gray-300">Enter the 6-digit code sent to your email</p>
            </div>

            <form onSubmit={handleVerify} className="space-y-6">
              <InputOTP maxLength={6} value={otp} onChange={(value) => { setOtp(value); setError(''); }}>
                <InputOTPGroup>
                  {[...Array(6)].map((_, i) => (
                    <InputOTPSlot key={i} index={i} />
                  ))}
                </InputOTPGroup>
              </InputOTP>
              {error && <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>}

              <Button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                {isLoading ? 'Verifying...' : 'Verify Code'}
              </Button>
            </form>

            <div className="mt-6 text-center text-gray-600 dark:text-gray-300">
              Didn’t get the code?{' '}
              <button
                onClick={() => window.location.reload()}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-semibold"
              >
                Resend
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
