'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  Shield, Scan, TrendingUp, AlertTriangle, CheckCircle, XCircle,
  Calendar, FileText, LogOut, Moon, Sun, User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  const [scanHistory, setScanHistory] = useState([]);
  const [stats, setStats] = useState({
    totalScans: 0,
    phishingDetected: 0,
    safeEmails: 0,
    suspiciousEmails: 0
  });

  // Dark mode init
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

  // Redirect if unauthenticated, else load data
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    if (status === 'authenticated') {
      loadDashboardData();
    }
  }, [status]);

  const loadDashboardData = async () => {
    const toastId = toast.loading('Loading your dashboard...');
    try {
      const res = await fetch('/api/scan-results/me');
      const data = await res.json();

      if (!data.scans || data.scans.length === 0) {
        toast.dismiss(toastId);
        toast.success('No scans available in your account');
        setScanHistory([]);
        setStats({ totalScans: 0, phishingDetected: 0, safeEmails: 0, suspiciousEmails: 0 });
        return;
      }

      setScanHistory(data.scans);

      // ✅ NEW: Use riskScore === 0 OR status === 'safe'
      const phishing = data.scans.filter(s =>
        (s.status?.toLowerCase?.() === 'phishing') || (s.riskCategory?.toLowerCase?.() === 'phishing')
      ).length;

      const suspicious = data.scans.filter(s =>
        (s.status?.toLowerCase?.() === 'suspicious') || (s.riskCategory?.toLowerCase?.() === 'suspicious')
      ).length;

      const safe = data.scans.filter(s =>
        s.riskScore === 0 || s.status?.toLowerCase?.() === 'safe' || s.riskCategory?.toLowerCase?.() === 'safe'
      ).length;

      setStats({
        totalScans: data.scans.length,
        phishingDetected: phishing,
        suspiciousEmails: suspicious,
        safeEmails: safe
      });

      toast.dismiss(toastId);
      toast.success('Dashboard loaded');
    } catch (error) {
      console.error(error);
      toast.dismiss(toastId);
      toast.error('Failed to load dashboard data');
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase?.()) {
      case 'safe': return <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />;
      case 'suspicious': return <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />;
      case 'phishing': return <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />;
      default: return <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase?.()) {
      case 'safe':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800';
      case 'suspicious':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800';
      case 'phishing':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800';
      default:
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-800';
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen">Loading...</div>
    );
  }

  const user = session?.user;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 transition-colors duration-300">
      {/* Navbar */}
      <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">PhishGuard</span>
            </Link>

            <div className="flex items-center space-x-4">
              <Link href="/scanner" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Scanner
              </Link>
              <div className="flex items-center text-gray-700 dark:text-gray-300">
                <User className="h-4 w-4 mr-1" />
                {user?.name || 'User'}
              </div>
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Toggle Dark Mode"
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Sign Out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Monitor your email security and view scan results
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Scans</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalScans}</p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                <Scan className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Safe Emails</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.safeEmails}</p>
              </div>
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Suspicious</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.suspiciousEmails}</p>
              </div>
              <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Phishing Detected</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.phishingDetected}</p>
              </div>
              <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Scans and Quick Actions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Scans */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700">
            <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                Recent Scans
              </h2>
              <Link href="/scanner" passHref>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  New Scan
                </Button>
              </Link>
            </div>

            <div className="p-6">
              {scanHistory.length > 0 ? (
                <div className="space-y-4">
                  {scanHistory.map(scan => (
                    <div key={scan._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900/50 rounded-lg border border-gray-200 dark:border-slate-700">
                      <div className="flex items-center space-x-4">
                        {getStatusIcon(scan.status)}
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {scan.emailPreview || scan.preview || 'No preview available'}
                          </p>
                          <div className="flex items-center mt-1 space-x-4">
                            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(scan.scanDate || scan.date).toLocaleDateString()}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(scan.status)}`}>
                              {scan.status ? scan.status.charAt(0).toUpperCase() + scan.status.slice(1) : 'Unknown'}
                            </span>

                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                          {scan.riskScore ?? 'N/A'}%
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Risk Score
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-300 mb-4">No scans yet</p>
                  <Link href="/scanner" passHref>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      Start Your First Scan
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Link href="/scanner" passHref>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white justify-start">
                    <Scan className="h-4 w-4 mr-2" />
                    Scan New Email
                  </Button>
                </Link>
                <Link href="/results" passHref>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    View Last Results
                  </Button>
                </Link>
                {/* Add Admin link conditionally if you have user roles */}
                {/* {user?.role === 'admin' && (
                  <Link href="/admin" passHref>
                    <Button variant="outline" className="w-full justify-start">
                      <Shield className="h-4 w-4 mr-2" />
                      Admin Panel
                    </Button>
                  </Link>
                )} */}
              </div>
            </div>

            {/* Security Tip */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">Security Tip</h3>
              <p className="text-blue-100 text-sm">
                Always verify sender identity before clicking links or downloading attachments. 
                When in doubt, scan it first!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
