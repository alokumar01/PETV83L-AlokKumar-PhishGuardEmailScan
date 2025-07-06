import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Scan from '@/models/Scan';
import User from '@/models/User';

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    console.log('Session:', session);

    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Find the user by email to get _id
    const user = await User.findOne({ email: session.user.email }).lean();
    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    // Find scans by user _id
    const scans = await Scan.find({ user: user._id })
      .sort({ createdAt: -1 })
      .lean();

    return Response.json({ scans }, { status: 200 });
  } catch (error) {
    console.error('Fetch user scans error:', error);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}
