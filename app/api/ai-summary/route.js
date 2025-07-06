import { GoogleGenAI } from "@google/genai";

export async function POST(req) {
  try {
    const { emailContent, riskScore, suspiciousKeywords } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return Response.json({ error: "Missing Gemini API key" }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const prompt = `
Analyze the following email and risk data:
- Risk Score: ${riskScore}
- Suspicious Keywords: ${suspiciousKeywords.join(", ")}
- Email Content: """${emailContent}"""

Please summarize: is this email likely safe, suspicious, or phishing? Explain why in 2-3 sentences, Hightlights the important things also.
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash", // or gemini-1.5-flash if that's what you have
      contents: prompt,
    });

    return Response.json({ summary: response.text }, { status: 200 });
  } catch (error) {
    console.error("Gemini summary error:", error);
    return Response.json({ error: "Failed to generate summary" }, { status: 500 });
  }
}
