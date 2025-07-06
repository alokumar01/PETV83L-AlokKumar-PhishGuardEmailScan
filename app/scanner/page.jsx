'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowLeft, Shield, Moon, Sun } from 'lucide-react';

export default function Scanner() {
  const { data: session, status } = useSession();
  const [emailContent, setEmailContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

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

  const handleScan = async () => {
    setError(null);
    if (!emailContent.trim()) {
      setError('Please enter email content to scan.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailContent }),
      });
      if (!res.ok) throw new Error('Failed to scan email.');
      const data = await res.json();

      const saveRes = await fetch('/api/scan-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          riskScore: data.riskScore,
          suspiciousUrls: data.suspiciousUrls,
          suspiciousKeywords: data.suspiciousKeywords,
          emailPreview: emailContent,
          status: data.status,
        }),
      });
      if (!saveRes.ok) throw new Error('Failed to save scan result.');
      const saveData = await saveRes.json();

      localStorage.setItem('lastScanId', saveData.scan._id);

      router.push('/results');
    } catch (err) {
      setError(err.message || 'Unexpected error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center mr-8">
                <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-2" />
                <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">PhishGuard</span>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Dashboard
              </Link>
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Toggle dark mode"
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="min-h-screen bg-gradient-to-br from-sky-100 to-blue-200 dark:from-slate-900 dark:to-slate-800 px-4 py-8 flex flex-col items-center">
        <header className="w-full max-w-4xl flex justify-end mb-8">
          <h1 className="text-3xl font-bold text-blue-900 dark:text-blue-400">
            PhishGuard Email Scanner
          </h1>
        </header>

        <textarea
          className="w-full max-w-4xl rounded-lg p-4 text-gray-800 dark:text-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 resize-none shadow-md"
          rows={14}
          placeholder="Paste your email content here to scan for phishing risks..."
          value={emailContent}
          onChange={(e) => setEmailContent(e.target.value)}
          spellCheck={false}
        />
        {error && <p className="mt-2 text-red-600 dark:text-red-400 font-semibold">{error}</p>}

        <button
          onClick={handleScan}
          disabled={loading}
          className="mt-6 px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg shadow-md transition"
        >
          {loading ? 'Scanning...' : 'Scan Email'}
        </button>

        <section className="mt-12 w-full max-w-4xl bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            What We Check For
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Suspicious URLs */}
            <div className="text-center">
              <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-lg w-fit mx-auto mb-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-red-600 dark:text-red-400 mx-auto"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Suspicious URLs</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Analyzes all links for known malicious domains and suspicious patterns
              </p>
            </div>

            {/* Content Analysis */}
            <div className="text-center">
              <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-lg w-fit mx-auto mb-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-yellow-600 dark:text-yellow-400 mx-auto"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Content Analysis</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Detects phishing keywords and social engineering tactics
              </p>
            </div>

            {/* Domain Reputation */}
            <div className="text-center">
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg w-fit mx-auto mb-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-green-600 dark:text-green-400 mx-auto"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Domain Reputation</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Checks sender domains against threat intelligence databases
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
