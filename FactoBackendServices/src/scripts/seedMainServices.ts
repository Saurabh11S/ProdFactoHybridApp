import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import Service from '../models/service.model';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Main service categories that should appear on landing page
const mainServices = [
  {
    title: 'ITR',
    category: 'ITR',
    description: 'Professional Income Tax Return filing services for individuals and businesses. Expert assistance with ITR-1 to ITR-7.',
    features: [
      'Individual Tax Filing',
      'Business Tax Filing',
      'Tax Planning',
      'Refund Assistance',
      'Expert CA Support'
    ],
    isActive: true,
    icon: 'http'
  },
  {
    title: 'GST',
    category: 'GST',
    description: 'Complete GST compliance and filing services. Handle all your GST returns, registrations, and compliance needs.',
    features: [
      'GST Registration',
      'Monthly/Quarterly Returns',
      'GSTR Filing',
      'Compliance Management',
      'Expert Consultation'
    ],
    isActive: true,
    icon: 'http'
  },
  {
    title: 'Tax Planning',
    category: 'Tax Planning',
    description: 'Strategic tax planning services to maximize your savings and minimize tax liability legally.',
    features: [
      'Individual Tax Planning',
      'Business Tax Planning',
      'Tax Notice Support',
      'Investment Advice',
      'Deduction Optimization'
    ],
    isActive: true,
    icon: 'http'
  },
  {
    title: 'Registration',
    category: 'Registration',
    description: 'Complete business registration services including company, LLP, partnership, and GST registration.',
    features: [
      'Company Registration',
      'LLP Registration',
      'Partnership Registration',
      'GST Registration',
      'PAN & TAN Registration'
    ],
    isActive: true,
    icon: 'http'
  },
  {
    title: 'Outsourcing',
    category: 'Outsourcing',
    description: 'Professional accounting and bookkeeping outsourcing services for businesses of all sizes.',
    features: [
      'Bookkeeping Services',
      'Payroll Management',
      'Financial Reporting',
      'Tax Compliance',
      'Monthly Accounting'
    ],
    isActive: true,
    icon: 'http'
  }
];

async function seedMainServices() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB successfully!');

    let servicesCreated = 0;
    let servicesUpdated = 0;

    // Create or update main services
    for (const serviceData of mainServices) {
      // Check if service already exists
      const existingService = await Service.findOne({ 
        $or: [
          { title: serviceData.title },
          { title: serviceData.title, category: serviceData.category }
        ]
      });
      
      if (existingService) {
        // Update existing service to ensure it's active and has correct data
        existingService.isActive = true;
        existingService.description = serviceData.description;
        existingService.features = serviceData.features;
        existingService.category = serviceData.category;
        await existingService.save();
        servicesUpdated++;
        console.log(`🔄 Updated service: ${serviceData.title}`);
      } else {
        // Create new service
        const service = await Service.create(serviceData);
        servicesCreated++;
        console.log(`✅ Created service: ${serviceData.title}`);
      }
    }

    console.log('\n📊 Summary:');
    console.log(`   Services created: ${servicesCreated}`);
    console.log(`   Services updated: ${servicesUpdated}`);
    console.log('\n✅ Seeding completed successfully!');

    // Close connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding services:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run the seed function
seedMainServices();

