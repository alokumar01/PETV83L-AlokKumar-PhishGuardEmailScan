import { checkSafeBrowsing, checkVirusTotal, checkWhois, extractDomainReputation } from '@/lib/phishingApi';

function extractSenderDomain(emailContent) {
  let match = emailContent.match(/from:\s*.*<([^>]+)>/i);
  if (match && match[1]) return match[1].split('@')[1];
  match = emailContent.match(/mailed-by:\s*([^\s]+)/i);
  if (match && match[1]) return match[1];
  return null;
}

export async function POST(req) {
  try {
    const { emailContent } = await req.json();
    if (!emailContent || !emailContent.trim()) {
      return new Response(JSON.stringify({ error: 'Email content is required' }), { status: 400 });
    }

    const urls = emailContent.match(/(https?:\/\/[^\s]+)/g) || [];
    const senderDomain = extractSenderDomain(emailContent);

    const suspiciousKeywords = [
      'urgent action required',
      'verify your account',
      'click here immediately',
      'password expired',
      'account locked',
    ];
    const foundKeywords = suspiciousKeywords.filter(keyword =>
      emailContent.toLowerCase().includes(keyword.toLowerCase())
    );

    const safeBrowsingResults = await checkSafeBrowsing(urls);

    const virusTotalResults = [];
    for (const url of urls) {
      const vt = await checkVirusTotal(url);
      virusTotalResults.push({ url, ...vt });
    }

    const whoisResults = [];

    for (const url of urls) {
      try {
        const domain = new URL(url).hostname;
        const whois = await checkWhois(domain);
        const reputation = extractDomainReputation(whois);
        whoisResults.push({ domain, ...whois, reputation });
      } catch (e) { console.error('Whois failed for URL', url, e); }
    }

    if (senderDomain) {
      try {
        const whois = await checkWhois(senderDomain);
        const reputation = extractDomainReputation(whois);
        whoisResults.push({ domain: senderDomain, ...whois, reputation });
      } catch (e) { console.error('Whois failed for sender', senderDomain, e); }
    }

    let riskScore = 0;
    if (safeBrowsingResults?.length > 0) riskScore += 30;
    if (virusTotalResults.some(vt => !vt.success || vt.data?.data?.attributes?.reputation < 0)) riskScore += 20;
    riskScore += foundKeywords.length * 10;
    if (whoisResults.some(w => w.reputation === 'Malicious')) riskScore += 30;
    riskScore = Math.min(riskScore, 100);

    let riskCategory = 'Safe';
    if (riskScore > 70) riskCategory = 'Phishing';
    else if (riskScore > 30) riskCategory = 'Suspicious';

    return new Response(JSON.stringify({
      scannedAt: new Date().toISOString(),
      riskScore,
      riskCategory,
      suspiciousKeywords: foundKeywords,
      urls,
      safeBrowsingResults,
      virusTotalResults,
      whoisResults,
      emailContent,
      senderDomain,
    }), { status: 200 });

  } catch (error) {
    console.error('Scan API error:', error);
    return new Response(JSON.stringify({ error: 'Failed to scan email' }), { status: 500 });
  }
}
