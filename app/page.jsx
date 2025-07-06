'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { Shield, Scan, Eye, Users, Moon, Sun, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSession, signOut } from 'next-auth/react';

export default function Home() {
  const { data: session, status } = useSession();
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const isDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
      setDarkMode(isDark);
      document.documentElement.classList.toggle('dark', isDark);
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newMode ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', newMode);
    }
  };

  const features = [
    {
      icon: Scan,
      title: 'Smart Email Analysis',
      description: 'Advanced algorithms analyze email content, headers, and attachments to detect phishing attempts.',
    },
    {
      icon: Shield,
      title: 'Real-time Threat Intelligence',
      description: 'Leverages multiple threat intelligence APIs for up-to-date phishing detection.',
    },
    {
      icon: Eye,
      title: 'Detailed Risk Assessment',
      description: 'Get comprehensive reports with risk scores and explanations for each detection.',
    },
    {
      icon: Users,
      title: 'Team Management',
      description: 'Manage your organization\'s email security with admin controls and user management.',
    },
  ];

  return (
    <>
      <Head>
        <title>PhishGuard – AI-Powered Email Phishing Detection</title>
        <meta name="description" content="Protect your inbox with advanced AI and threat intelligence. Scan emails instantly and get detailed security assessments." />
      </Head>

      <div className={`min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 transition-colors duration-300`}>
        {/* Navigation */}
        <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-700 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">PhishGuard</span>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-8">
                <Link href="/scanner" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Scanner
                </Link>
                <Link href="/dashboard" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Dashboard
                </Link>

                {/* Conditionally show login/logout */}
                {status === 'loading' ? null : session ? (
                  <button
                    onClick={() => signOut()}
                    className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    Logout
                  </button>
                ) : (
                  <>
                    <Link href="/login" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      Login
                    </Link>
                    <Link href="/signup" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      Create Account
                    </Link>
                  </>
                )}

                <button onClick={toggleDarkMode} className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                  {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden flex items-center">
                <button onClick={toggleDarkMode} className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors mr-2">
                  {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>
                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                  {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
              </div>
            </div>

            {/* Mobile Navigation */}
            {mobileMenuOpen && (
              <div className="md:hidden py-4 border-t border-gray-200 dark:border-slate-700">
                <div className="flex flex-col space-y-2">
                  <Link href="/scanner" className="px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    Scanner
                  </Link>
                  <Link href="/dashboard" className="px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    Dashboard
                  </Link>
                  {status === 'loading' ? null : session ? (
                    <button
                      onClick={() => signOut()}
                      className="px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      Logout
                    </button>
                  ) : (
                    <>
                      <Link href="/login" className="px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        Login
                      </Link>
                      <Link href="/signup" className="px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        Create Account
                      </Link>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Protect Your <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Inbox</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Advanced phishing email detection powered by AI and threat intelligence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/scanner">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-semibold rounded-lg transition-all duration-200 transform hover:scale-105">
                  Start Scanning Now
                </Button>
              </Link>
                <Link href="/dashboard">
                  <Button variant="outline" className="border-2 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 px-8 py-3 text-lg font-semibold rounded-lg transition-all duration-200">
                    View Dashboard
                  </Button>
                </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-slate-800/50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Why Choose PhishGuard?
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Comprehensive email security analysis with cutting-edge technology
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-200 dark:border-slate-700">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg w-fit mb-4">
                    <feature.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-12">
              Trusted by Security Professionals
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700">
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">99.8%</div>
                <div className="text-gray-600 dark:text-gray-300">Detection Accuracy</div>
              </div>
              <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700">
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">1M+</div>
                <div className="text-gray-600 dark:text-gray-300">Emails Scanned</div>
              </div>
              <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700">
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">&lt;8s</div>
                <div className="text-gray-600 dark:text-gray-300">Average Scan Time</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Secure Your Email?</h2>
            <p className="text-xl text-blue-100 mb-8">Join thousands of users who trust PhishGuard to protect their inbox from phishing attacks.</p>
            <Link href="/scanner">
              <Button className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold rounded-lg transition-all duration-200 transform hover:scale-105">
                Get Started Free
              </Button>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-slate-900 dark:bg-slate-950 text-white py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center mb-4">
                  <Shield className="h-8 w-8 text-blue-400" />
                  <span className="ml-2 text-xl font-bold">PhishGuard</span>
                </div>
                <p className="text-gray-400">Advanced phishing email detection for modern businesses.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Product</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><Link href="/scanner" className="hover:text-white transition-colors">Email Scanner</Link></li>
                  <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>

                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Account</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><Link href="/login" className="hover:text-white transition-colors">Login</Link></li>
                  <li><Link href="/signup" className="hover:text-white transition-colors">Sign Up</Link></li>
                  <li><Link href="/forgot-password" className="hover:text-white transition-colors">Reset Password</Link></li>
                </ul>
              </div>
              {/* <div>
                <h3 className="text-lg font-semibold mb-4">Support</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                </ul>
              </div> */}
            </div>
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 space-y-2 text-sm">
              <p>&copy; 2025 <span className="text-white font-semibold">PhishGuard</span>. All rights reserved.</p>
              <p>
                Managed & Developed by{' '}
                <a
                  href="https://github.com/alokumar01"
                  className="hover:text-white transition-colors font-extrabold text-cyan-300 italic"
                >
                  Alok
                </a>{' '}
                and{' '}
                <a
                  href="https://github.com/SandeepTech06"
                  className="hover:text-white transition-colors font-extrabold italic text-cyan-300"
                >
                  Sandeep
                </a>
              </p>
            </div>


          </div>
        </footer>
      </div>
    </>
  );
}
