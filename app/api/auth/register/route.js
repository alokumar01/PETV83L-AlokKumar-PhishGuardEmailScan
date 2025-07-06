import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return Response.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    await connectDB();

    // check if user already exists
    const existing = await User.findOne({ email }).lean();
    if (existing) {
      return Response.json({ error: 'User already exists' }, { status: 409 });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user
    const newUser = await User.create({ name, email, password: hashedPassword });

    // create JWT token
    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return Response.json(
      {
        message: 'User registered successfully',
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email
        },
        token
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Register error:', error);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}
