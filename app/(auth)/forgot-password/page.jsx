'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, Mail, Moon, Sun, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ForgotPassword() {
  const [darkMode, setDarkMode] = useState(false);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return setError('Email is required');
    if (!/\S+@\S+\.\S+/.test(email)) return setError('Please enter a valid email');

    setIsLoading(true); setError('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ email })
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('resetEmail', email); // store email for next steps
        setIsSubmitted(true);   // optional: show success first
        setTimeout(() => {
          router.push('/verify-otp'); // redirect after short delay
        }, 1500);
      } else {
        setError(data.message || 'Failed to send OTP');
      }
    } catch(err) {
      console.error('Forgot password error:', err);
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
          <button onClick={toggleDarkMode} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300">
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      <div className="flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full space-y-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl p-8 border border-gray-200 dark:border-slate-700">
            {!isSubmitted ? (
              <>
                <div className="text-center mb-8">
                  <div className="flex justify-center mb-4">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
                      <Mail className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Forgot Password?</h2>
                  <p className="mt-2 text-gray-600 dark:text-gray-300">Enter your email, we’ll send an OTP to reset password</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={e=>setEmail(e.target.value)}
                      className={`mt-1 ${error ? 'border-red-500' : ''}`}
                      placeholder="you@example.com"
                    />
                    {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
                  </div>
                  <Button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    {isLoading ? 'Sending...' : 'Send OTP'}
                  </Button>
                </form>

                <div className="mt-6 text-center text-gray-600 dark:text-gray-300">
                  Remember password?{' '}
                  <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-semibold">
                    Sign in
                  </Link>
                </div>
              </>
            ) : (
              <div className="text-center">
                <div className="flex justify-center mb-6">
                  <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-full">
                    <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Check Your Email</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">We've sent an OTP to:</p>
                <p className="text-blue-600 dark:text-blue-400 font-semibold mb-6">{email}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Didn’t get it? You can request again.</p>
                <Button onClick={() => {setIsSubmitted(false); setEmail('');}} variant="outline" className="w-full">Try Different Email</Button>
                <Link href="/login" className="block mt-4">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">Back to Sign In</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
