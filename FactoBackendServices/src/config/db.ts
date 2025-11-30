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
    let uriWithOptions = mongoUri.includes('retryWrites') 
      ? mongoUri 
      : `${mongoUri}${mongoUri.includes('?') ? '&' : '?'}retryWrites=true&w=majority`;
    
    // If no database name is specified in the connection string, default to 'facto_app'
    // Connection string format: mongodb+srv://.../databaseName?options
    if (!uriWithOptions.match(/\/[^\/\?]+(\?|$)/)) {
      // No database name found, add 'facto_app' before the query string
      const separator = uriWithOptions.includes('?') ? '/' : '/';
      const parts = uriWithOptions.split('?');
      uriWithOptions = parts[0] + separator + 'facto_app' + (parts[1] ? '?' + parts[1] : '');
      console.log('⚠️  No database name in connection string, defaulting to "facto_app"');
    }
    
    console.log('🔗 Final MongoDB URI (with database):', uriWithOptions.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));
    
    const connect = await mongoose.connect(uriWithOptions);
    
    console.log('✅ MongoDB connected successfully!');
    console.log('🏠 Host:', connect.connection.host);
    console.log('🔌 Port:', connect.connection.port);
    console.log('🗄️ Database:', connect.connection.name);
    console.log('📊 Ready State:', connect.connection.readyState);
    
    // Check if this is production database
    const isProductionDB = connect.connection.host.includes('mongodb.net') || 
                          connect.connection.host.includes('atlas');
    if (isProductionDB) {
      console.log('🌐 Database Type: Production (MongoDB Atlas)');
    } else {
      console.log('💻 Database Type: Local/Development');
      console.log('⚠️  WARNING: Using local/development database. Data may differ from production!');
    }
    
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