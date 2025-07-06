import axios from 'axios';

// Google Safe Browsing check
export async function checkSafeBrowsing(urls) {
  if (!urls.length) return [];
  try {
    const res = await axios.post(
      `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${process.env.GOOGLE_SAFE_BROWSING_API_KEY}`,
      {
        client: { clientId: 'phishguard', clientVersion: '1.0' },
        threatInfo: {
          threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE', 'POTENTIALLY_HARMFUL_APPLICATION'],
          platformTypes: ['ANY_PLATFORM'],
          threatEntryTypes: ['URL'],
          threatEntries: urls.map(url => ({ url })),
        },
      }
    );
    return res.data.matches || [];
  } catch (error) {
    console.error('SafeBrowsing error:', error.response?.data || error.message);
    return [];
  }
}

// VirusTotal check for one URL
export async function checkVirusTotal(url) {
  try {
    const encoded = Buffer.from(url).toString('base64').replace(/=+$/, '');
    const res = await axios.get(
      `https://www.virustotal.com/api/v3/urls/${encoded}`,
      { headers: { 'x-apikey': process.env.VIRUSTOTAL_API_KEY } }
    );
    return { success: true, data: res.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.error?.message || error.message };
  }
}

// WhoisXML check for domain info
export async function checkWhois(domain) {
  try {
    const res = await axios.get('https://www.whoisxmlapi.com/whoisserver/WhoisService', {
      params: {
        apiKey: process.env.WHOISXML_API_KEY,
        domainName: domain,
        outputFormat: 'JSON',
      },
    });
    return { success: true, data: res.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.message || error.message };
  }
}

// (Optional) Extract a simple reputation from Whois data
export function extractDomainReputation(whoisData) {
  if (!whoisData?.success || !whoisData.data?.WhoisRecord) return 'Unknown';

  const record = whoisData.data.WhoisRecord;
  if (record.dataError) return 'No Whois data';

  // Very basic heuristic (customize based on your data)
  if (record.registrarName?.toLowerCase().includes('fraud') || record.domainName?.includes('fake')) {
    return 'Malicious';
  }
  return 'Good';
}
