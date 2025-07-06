"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Shield,
  ArrowLeft,
  Copy,
  Globe,
  AlertCircle,
  CheckCircle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Results() {
  const [darkMode, setDarkMode] = useState(false);
  const [scanResults, setScanResults] = useState(null);
  const [loading, setLoading] = useState(true);

  // AI summary states
  const [aiSummary, setAiSummary] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);

  const router = useRouter();

  useEffect(() => {
    // Theme setup
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const isDark = savedTheme === "dark" || (!savedTheme && prefersDark);
    setDarkMode(isDark);
    document.documentElement.classList.toggle("dark", isDark);

    // Fetch scan results by ID from backend
    const scanId = localStorage.getItem("lastScanId");
    if (!scanId) {
      router.push("/scanner");
      return;
    }

    async function fetchScan() {
      try {
        const res = await fetch(`/api/scan-results/${scanId}`);
        if (!res.ok) throw new Error("Failed to fetch scan results");
        const data = await res.json();
        setScanResults(data.scan); // assuming your API returns { scan: {...} }
        await generateAISummary(data.scan); // auto generate AI summary after loading scan
      } catch (error) {
        console.error(error);
        router.push("/scanner");
      } finally {
        setLoading(false);
      }
    }
    fetchScan();
  }, [router]);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("theme", newMode ? "dark" : "light");
    document.documentElement.classList.toggle("dark", newMode);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const generateAISummary = async (scan) => {
    try {
      setAiLoading(true);
      setAiError(null);
      setAiSummary(null);

      const aiRes = await fetch("/api/ai-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailContent: scan.emailPreview,
          riskScore: scan.riskScore,
          suspiciousKeywords: scan.suspiciousKeywords || [],
        }),
      });

      if (!aiRes.ok) throw new Error("Failed to generate summary");
      const aiData = await aiRes.json();
      setAiSummary(aiData.summary);
    } catch (error) {
      console.error(error);
      setAiError("Could not generate AI summary. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading scan results...</p>
        </div>
      </div>
    );
  }

  if (!scanResults) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600 dark:text-red-400">
          No scan results found. Redirecting...
        </p>
      </div>
    );
  }

  const {
    scanDate,
    riskCategory,
    riskScore,
    suspiciousKeywords = [],
    suspiciousUrls: urls = [],
    safeBrowsingResults = [],
    virusTotalResults = [],
    whoisResults = [],
    emailPreview: emailContent,
    status,
    senderDomain
  } = scanResults;

  // Colors and icons based on riskCategory or status
  const riskColors = {
    safe: "text-green-600 dark:text-green-400",
    suspicious: "text-yellow-600 dark:text-yellow-400",
    phishing: "text-red-600 dark:text-red-400",
  };

  const riskIcons = {
    safe: <CheckCircle className="inline-block h-6 w-6 mr-2" />,
    suspicious: <AlertCircle className="inline-block h-6 w-6 mr-2" />,
    phishing: <AlertCircle className="inline-block h-6 w-6 mr-2" />,
  };

  // Normalize to lowercase keys for safety:
  const key = (riskCategory || status || "safe").toLowerCase();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      {/* Navbar */}
      <nav className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-16">
          <Link
            href="/"
            className="flex items-center text-blue-600 hover:underline"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            <Shield className="h-8 w-8" />
            <span className="ml-2 font-bold text-lg">PhishGuard</span>
          </Link>
          <button
            onClick={toggleDarkMode}
            aria-label="Toggle Dark Mode"
            className="p-2"
          >
            {darkMode ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto py-12 px-4 space-y-8">
        {/* Overall Risk Summary */}
        <section className="bg-white dark:bg-slate-800 rounded-xl shadow p-6 text-center">
          <h1 className="text-4xl font-extrabold mb-2 flex justify-center items-center ">
            Overall Risk:{" "}
            <span className={`${riskColors[key] || ""} ml-3`}>
              {riskIcons[key] || null} {riskCategory || status}
            </span>
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-xl font-semibold">
            Risk Score: {riskScore}%
          </p>
          {suspiciousKeywords.length > 0 && (
            <p className="mt-3 text-yellow-700 dark:text-yellow-400 font-medium">
              Suspicious Keywords Detected ({suspiciousKeywords.length}):{" "}
              {suspiciousKeywords.map((k, i) => (
                <span key={i} className="italic">
                  &quot;{k}&quot;{i < suspiciousKeywords.length - 1 ? ", " : ""}
                </span>
              ))}
            </p>
          )}
          {urls.length === 0 && (
            <p className="mt-3 text-gray-600 dark:text-gray-400 font-medium">
              No URLs found in email content.
            </p>
          )}
        </section>

        {/* AI Risk Analysis Summary */}
        <section className="bg-white dark:bg-slate-800 rounded-xl shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 bg-clip-text text-transparent">
              AI Risk Analysis Summary
            </h2>

            <Button
              variant="outline"
              size="sm"
              onClick={() => generateAISummary(scanResults)}
              disabled={aiLoading}
              className="flex items-center gap-2  cursor-pointer"
            >
              <RefreshCw className="h-4 w-4" /> Regenerate
            </Button>
          </div>
          {aiLoading ? (
            <p className="text-gray-600 dark:text-gray-400">
              Generating summary...
            </p>
          ) : aiError ? (
            <p className="text-red-600 dark:text-red-400">{aiError}</p>
          ) : aiSummary ? (
            <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
              {aiSummary}
            </p>
          ) : (
            <p className="text-gray-600 dark:text-gray-400">
              No summary available.
            </p>
          )}
        </section>

        {/* URLs Section */}
        <section className="bg-white dark:bg-slate-800 rounded-xl shadow p-6">
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <Globe className="mr-2 h-6 w-6 text-blue-600" />
            URLs Scanned ({urls.length})
          </h2>
          {urls.length > 0 ? (
            urls.map((url, i) => (
              <div
                key={i}
                className="flex justify-between items-center p-2 border border-gray-200 rounded mb-2 dark:border-slate-700"
              >
                <code className="break-all text-sm">{url}</code>
                <button
                  onClick={() => copyToClipboard(url)}
                  className="text-blue-600 hover:text-blue-800"
                  title="Copy URL"
                >
                  <Copy className="h-5 w-5" />
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-600 dark:text-gray-400">No URLs found.</p>
          )}
        </section>

        {/* Google Safe Browsing */}
        <section className="bg-white dark:bg-slate-800 rounded-xl shadow p-6">
          <h2 className="text-2xl font-semibold mb-4">
            Google Safe Browsing Matches
          </h2>
          {safeBrowsingResults.length > 0 ? (
            safeBrowsingResults.map((match, i) => (
              <div
                key={i}
                className="p-3 border border-red-300 rounded mb-2 bg-red-50 dark:bg-red-900"
              >
                <p>
                  <strong>Threat Type:</strong> {match.threatType}
                </p>
                <p>
                  <strong>URL:</strong> {match.threat?.url}
                </p>
              </div>
            ))
          ) : (
            <p className="text-green-600 dark:text-green-400 font-semibold">
              None found. All URLs are considered safe.
            </p>
          )}
        </section>

        {/* VirusTotal Results */}
        <section className="bg-white dark:bg-slate-800 rounded-xl shadow p-6">
          <h2 className="text-2xl font-semibold mb-4">VirusTotal Results</h2>
          {virusTotalResults.length > 0 ? (
            virusTotalResults.map((vt, i) => (
              <div key={i} className="p-3 border rounded mb-2">
                <div className="flex justify-between items-center mb-1">
                  <div className="font-semibold break-all">{vt.url}</div>
                  {vt.success ? (
                    <span className="text-green-600 dark:text-green-400 font-semibold">
                      Safe
                    </span>
                  ) : (
                    <span className="text-red-600 dark:text-red-400 font-semibold">
                      Error: {vt.error}
                    </span>
                  )}
                </div>
                {vt.success && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Reputation:{" "}
                    {vt.data?.data?.attributes?.reputation ?? "Unknown"}
                  </p>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-600 dark:text-gray-400">
              No VirusTotal data available.
            </p>
          )}
        </section>

        {/* Whois Info */}
        {/* Whois Info */}
        <section className="bg-white dark:bg-slate-800 rounded-xl shadow p-6">
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <Globe className="mr-2 h-6 w-6 text-blue-600" /> Whois Info
          </h2>

          {senderDomain && (
            <div className="mb-4 p-3 border rounded bg-gray-50 dark:bg-slate-900">
              <p className="font-semibold break-all">
                Sender Domain: {senderDomain}
              </p>
              {whoisResults.find(w => w.domain === senderDomain) ? (
                <p className={`font-semibold ${
                  whoisResults.find(w => w.domain === senderDomain)?.reputation === "Malicious"
                    ? "text-red-600 dark:text-red-400"
                    : "text-green-600 dark:text-green-400"
                }`}>
                  Reputation: {whoisResults.find(w => w.domain === senderDomain)?.reputation}
                </p>
              ) : (
                <p className="text-gray-600 dark:text-gray-400">No Whois data for sender domain.</p>
              )}
            </div>
          )}

          {whoisResults.filter(w => w.domain !== senderDomain).length > 0 ? (
            whoisResults
              .filter(w => w.domain !== senderDomain)
              .map((whois, i) => (
                <div key={i} className="p-3 border rounded mb-2">
                  <div className="font-semibold break-all">{whois.domain}</div>
                  {whois.success ? (
                    <p className={`font-semibold ${
                      whois.reputation === "Malicious"
                        ? "text-red-600 dark:text-red-400"
                        : "text-green-600 dark:text-green-400"
                    }`}>
                      Reputation: {whois.reputation}
                    </p>
                  ) : (
                    <p className="text-red-600 dark:text-red-400">
                      Error: {whois.error}
                    </p>
                  )}
                </div>
              ))
          ) : (
            !senderDomain && (
              <p className="text-gray-600 dark:text-gray-400">
                No Whois data available.
              </p>
            )
          )}
        </section>


        {/* Email Content Preview */}
        <section className="bg-white dark:bg-slate-800 rounded-xl shadow p-6">
          <h2 className="text-2xl font-semibold mb-4">Email Content Preview</h2>
          <pre className="whitespace-pre-wrap text-sm bg-gray-50 dark:bg-slate-900 p-4 rounded">
            {emailContent}
          </pre>
        </section>

        {/* Actions */}
        <div className="flex justify-center gap-4 mt-6 ">
          <Link href="/scanner">
            <Button variant="default" className="cursor-pointer">
              Scan Another Email
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="default" className="cursor-pointer">
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}

// Icons for dark mode toggle (to avoid importing full libs)
function SunIcon() {
  return (
    <svg
      className="h-6 w-6 text-yellow-400"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
    >
      <circle cx={12} cy={12} r={5} />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M17.36 17.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M17.36 6.64l1.42-1.42" />
    </svg>
  );
}
function MoonIcon() {
  return (
    <svg
      className="h-6 w-6 text-gray-700 dark:text-gray-300"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
    >
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  );
}
