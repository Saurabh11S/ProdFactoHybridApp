import mongoose from "mongoose";
import { logger } from "@/server";

export const connectDB = async () => {
  console.log('\n🔌 === DATABASE CONNECTION START ===');
  console.log('📅 Timestamp:', new Date().toISOString());
  console.log('🔗 MongoDB URI:', process.env.MONGODB_URI);
  
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }
    
    // Ensure connection string has retryWrites for better reliability
    const uriWithOptions = mongoUri.includes('retryWrites') 
      ? mongoUri 
      : `${mongoUri}${mongoUri.includes('?') ? '&' : '?'}retryWrites=true&w=majority`;
    
    const connect = await mongoose.connect(uriWithOptions);
    
    console.log('✅ MongoDB connected successfully!');
    console.log('🏠 Host:', connect.connection.host);
    console.log('🔌 Port:', connect.connection.port);
    console.log('🗄️ Database:', connect.connection.name);
    console.log('📊 Ready State:', connect.connection.readyState);
    console.log('🔌 === DATABASE CONNECTION COMPLETE ===\n');
    
    logger.info(
      `MongoDB connected => ` +
        `Host: ${connect.connection.host}:${connect.connection.port}, ` +
        `Database: ${connect.connection.name} `
    );
  } catch (error) {
    console.log('❌ MongoDB connection failed!');
    console.log('❌ Error:', error.message);
    console.log('🔌 === DATABASE CONNECTION FAILED ===\n');
    throw error;
  }
};