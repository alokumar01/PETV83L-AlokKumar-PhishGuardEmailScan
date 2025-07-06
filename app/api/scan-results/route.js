import { getServerSession } from 'next-auth/next';
// import { authOptions } from '@/lib/auth'; // better: extract to lib/auth.js
import { authOptions } from '../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Scan from '@/models/Scan';
import User from '@/models/User';

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    console.log('Session:', session);
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();

    await connectDB();

    // Find DB user by email
    const dbUser = await User.findOne({ email: session.user.email });
    if (!dbUser) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    const newScan = await Scan.create({
      user: dbUser._id,
      riskScore: data.riskScore,
      suspiciousUrls: data.suspiciousUrls,
      suspiciousKeywords: data.suspiciousKeywords,
      emailPreview: data.emailPreview,
      scanDate: new Date()
    });

    return Response.json({ message: 'Scan saved', scan: newScan }, { status: 201 });
  } catch (error) {
    console.error('Save scan error:', error);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}
