import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_POOLSIZE = process.env.MONGODB_POOLSIZE || 20;
const MONGODB_CONNECT_TIMEOUT = process.env.MONGODB_CONNECT_TIMEOUT || 10000;
const MONGODB_SOCKET_TIMEOUT = process.env.MONGODB_SOCKET_TIMEOUT || 45000;

if (!MONGODB_URI) {
    throw new Error('❌ Please define the MONGODB_URI environment variable inside .env.local');
}

let cached = global.mongoose ?? (global.mongoose = { conn: null, promise: null });

async function connectDB() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            ssl: true,
            maxPoolSize: parseInt(MONGODB_POOLSIZE, 10),
            connectTimeoutMS: parseInt(MONGODB_CONNECT_TIMEOUT, 10),
            socketTimeoutMS: parseInt(MONGODB_SOCKET_TIMEOUT, 10),
            w: 'majority',
        };

        cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
            console.log('✅ MongoDB connected successfully (Next.js)');
            return mongoose;
        }).catch((error) => {
            console.log('❌ MongoDB connection failed:', error);
            throw error;
        });
    }

    cached.conn = await cached.promise;
    return cached.conn;
}

export default connectDB;
