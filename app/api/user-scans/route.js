import { getServerSession } from "next-auth/next";  // <-- import from here
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/mongodb";
import Scan from "@/models/Scan";

export async function GET(request) {  // <-- accept request param
  const session = await getServerSession(authOptions, request);
  if (!session) {
    return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 401 });
  }

  await connectDB();
  const scans = await Scan.find({ user: session.user.id }).sort({ createdAt: -1 });
  return new Response(JSON.stringify({ scans }));
}
    