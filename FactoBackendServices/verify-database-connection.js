const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  console.error('❌ MONGODB_URI not found in .env file');
  process.exit(1);
}

console.log('🔗 Connection String:', mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));

// Ensure database name is included
let uriWithOptions = mongoUri.includes('retryWrites') 
  ? mongoUri 
  : `${mongoUri}${mongoUri.includes('?') ? '&' : '?'}retryWrites=true&w=majority`;

// Add database name if missing
if (!uriWithOptions.match(/\/[^\/\?]+(\?|$)/)) {
  const parts = uriWithOptions.split('?');
  uriWithOptions = parts[0] + '/facto_app' + (parts[1] ? '?' + parts[1] : '');
  console.log('⚠️  Added database name "facto_app" to connection string');
}

mongoose.connect(uriWithOptions)
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    console.log('🗄️  Database:', mongoose.connection.name);
    
    const SubService = mongoose.model('SubService', new mongoose.Schema({}, { strict: false }), 'subService');
    const Service = mongoose.model('Service', new mongoose.Schema({}, { strict: false }), 'service');
    
    const subServiceCount = await SubService.countDocuments({ isActive: true });
    const serviceCount = await Service.countDocuments({ isActive: true });
    
    console.log('\n📊 Database Statistics:');
    console.log(`   Services: ${serviceCount}`);
    console.log(`   Active Sub-Services: ${subServiceCount}`);
    
    if (subServiceCount < 20) {
      console.log('\n⚠️  WARNING: Expected 24 sub-services, but found only', subServiceCount);
      console.log('   This might indicate connection to wrong database.');
    } else {
      console.log('\n✅ Database connection verified!');
    }
    
    // Get category breakdown
    const subs = await SubService.find({ isActive: true }).populate('serviceId', 'title category');
    const byCategory = {};
    subs.forEach(s => {
      const cat = s.serviceId?.category || 'Unknown';
      byCategory[cat] = (byCategory[cat] || 0) + 1;
    });
    console.log('\n📋 Sub-Services by Category:');
    console.log(JSON.stringify(byCategory, null, 2));
    
    await mongoose.connection.close();
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Connection failed:', err.message);
    process.exit(1);
  });

