// app/api/scan-results/[id]/route.js
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Scan from '@/models/Scan';

export async function GET(req, context) {
  const { params } = await context;

  try {
    const session = await getServerSession(authOptions);
    console.log('Session:', session);

    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const scan = await Scan.findById(params.id).lean();

    if (!scan) {
      return Response.json({ error: 'Scan not found' }, { status: 404 });
    }

    return Response.json({ scan }, { status: 200 });
  } catch (error) {
    console.error('Fetch scan by ID error:', error);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}
