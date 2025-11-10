import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import bcrypt from 'bcryptjs';
import User from '../models/user.model';
import Query from '../models/query.model';
import Quotation from '../models/quotations.model';
import Notification from '../models/notification.model';
import ConsultationRequest from '../models/consultationRequest.model';
import Request from '../models/request.model';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Sample Users Data
const sampleUsers = [
  {
    fullName: 'Rajesh Kumar',
    email: 'rajesh.kumar@example.com',
    phoneNumber: '9876543210',
    password: 'password123', // Will be hashed
    aadharNumber: '123456789012',
    panNumber: 'ABCDE1234F',
    dateOfBirth: new Date('1990-05-15'),
    role: 'user',
    registrationDate: new Date(),
    isActive: true
  },
  {
    fullName: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    phoneNumber: '9876543211',
    password: 'password123',
    aadharNumber: '123456789013',
    panNumber: 'FGHIJ5678K',
    dateOfBirth: new Date('1992-08-20'),
    role: 'user',
    registrationDate: new Date(),
    isActive: true
  },
  {
    fullName: 'Amit Patel',
    email: 'amit.patel@example.com',
    phoneNumber: '9876543212',
    password: 'password123',
    aadharNumber: '123456789014',
    panNumber: 'LMNOP9012Q',
    dateOfBirth: new Date('1988-12-10'),
    role: 'user',
    registrationDate: new Date(),
    isActive: true
  },
  {
    fullName: 'Sneha Reddy',
    email: 'sneha.reddy@example.com',
    phoneNumber: '9876543213',
    password: 'password123',
    aadharNumber: '123456789015',
    panNumber: 'RSTUV3456W',
    dateOfBirth: new Date('1995-03-25'),
    role: 'user',
    registrationDate: new Date(),
    isActive: true
  }
];

// Sample Queries Data (matches Query model: name, email, phoneNo, query, comment)
const sampleQueries = [
  {
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@example.com',
    phoneNo: 9876543210,
    query: 'I need help filing my ITR for FY 2023-24. I have income from salary and one house property.',
    comment: ''
  },
  {
    name: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    phoneNo: 9876543211,
    query: 'What documents are required for GST registration?',
    comment: 'Gathering required documents list. Will provide complete checklist.'
  },
  {
    name: 'Amit Patel',
    email: 'amit.patel@example.com',
    phoneNo: 9876543212,
    query: 'I want to register a Private Limited Company. What is the process and timeline?',
    comment: 'Process explained. Documents submitted. Registration in progress.'
  },
  {
    name: 'Sneha Reddy',
    email: 'sneha.reddy@example.com',
    phoneNo: 9876543213,
    query: 'Need assistance with tax planning for FY 2024-25. Looking for investment options.',
    comment: ''
  },
  {
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@example.com',
    phoneNo: 9876543210,
    query: 'How to file GSTR-1 and GSTR-3B? I am new to GST filing.',
    comment: 'Providing step-by-step guide and scheduling a consultation call.'
  }
];

// Sample Quotations Data
const sampleQuotations = [
  {
    price: 500,
    status: 'pending',
    selectedFeatures: ['Error-free filing', 'Priority CA consultation', 'Express processing'],
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
  },
  {
    price: 8000,
    status: 'accepted',
    selectedFeatures: ['Company name approval', 'DIN and DSC application', 'MOA and AOA preparation'],
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) // 15 days ago
  },
  {
    price: 3000,
    status: 'pending',
    selectedFeatures: ['Risk assessment', 'Portfolio analysis', 'Investment recommendations'],
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) // 4 days ago
  }
];

// Sample Consultation Requests Data
const sampleConsultationRequests = [
  {
    sessionId: 'session_' + Date.now(),
    serviceId: 'itr-service',
    serviceName: 'ITR Filing Service',
    planType: 'free_consultation' as const,
    userDetails: {
      name: 'Rajesh Kumar',
      email: 'rajesh.kumar@example.com',
      phoneNumber: '9876543210'
    },
    requestData: {
      additionalInfo: 'Interested in ITR filing service. Need help with form selection.',
      preferredContactTime: '10:00 AM - 12:00 PM',
      urgency: 'high' as const
    },
    status: 'pending' as const
  },
  {
    sessionId: 'session_' + (Date.now() + 1),
    serviceId: 'gst-service',
    serviceName: 'GST Registration',
    planType: 'paid_consultation' as const,
    userDetails: {
      name: 'Priya Sharma',
      email: 'priya.sharma@example.com',
      phoneNumber: '9876543211'
    },
    requestData: {
      additionalInfo: 'Want to register for GST. Need complete guidance.',
      preferredContactTime: '2:00 PM - 4:00 PM',
      urgency: 'medium' as const
    },
    status: 'contacted' as const,
    notes: 'Called back. Discussed GST registration requirements.'
  },
  {
    sessionId: 'session_' + (Date.now() + 2),
    serviceId: 'company-reg',
    serviceName: 'Company Registration',
    planType: 'free_consultation' as const,
    userDetails: {
      name: 'Amit Patel',
      email: 'amit.patel@example.com',
      phoneNumber: '9876543212'
    },
    requestData: {
      additionalInfo: 'Wants to know about company registration process and timeline.',
      preferredContactTime: '11:00 AM - 1:00 PM',
      urgency: 'high' as const
    },
    status: 'pending' as const
  }
];

// Sample Request Data (phoneNo, assignee)
const sampleRequests = [
  {
    phoneNo: 9876543210
  },
  {
    phoneNo: 9876543211
  },
  {
    phoneNo: 9876543212
  }
];

// Sample Notifications Data (title, content only)
const sampleNotifications = [
  {
    title: 'ITR Filing Deadline Approaching',
    content: 'The deadline for filing ITR for FY 2023-24 is July 31, 2024. Don\'t miss it!'
  },
  {
    title: 'GST Return Due Soon',
    content: 'Your GSTR-3B for the month of June 2024 is due on July 20, 2024.'
  },
  {
    title: 'Welcome to FACTO!',
    content: 'Thank you for registering with FACTO. We are here to help you with all your financial needs.'
  },
  {
    title: 'Tax Planning Season',
    content: 'Start planning your taxes for FY 2024-25. Consult with our experts to maximize your savings.'
  },
  {
    title: 'New Services Available',
    content: 'We have added new services including Company Registration and GST Filing. Check them out!'
  }
];

async function seedAllData() {
  try {
    console.log('\n🌱 === SEEDING ALL DATABASE ENTITIES ===');
    console.log('📅 Timestamp:', new Date().toISOString());
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    console.log('🔌 Connecting to MongoDB...');
    
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
    
    await mongoose.connect(uriWithOptions);
    console.log('✅ Connected to MongoDB successfully!');
    console.log('🗄️  Database:', mongoose.connection.name);
    
    // Check if this is production database
    const isProductionDB = mongoose.connection.host.includes('mongodb.net') || 
                          mongoose.connection.host.includes('atlas');
    if (isProductionDB) {
      console.log('🌐 Database Type: Production (MongoDB Atlas)');
    } else {
      console.log('💻 Database Type: Local/Development');
    }

    // Import models dynamically to get SubService
    const { db } = await import('../models');
    
    // Get existing services and sub-services for linking
    const services = await db.Service.find({ isActive: true });
    const subServices = await db.SubService.find({ isActive: true });
    
    console.log(`\n📊 Found ${services.length} services and ${subServices.length} sub-services for linking`);

    // 1. Seed Users
    console.log('\n👥 === SEEDING USERS ===');
    let usersCreated = 0;
    const createdUsers = [];
    
    for (const userData of sampleUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        console.log(`⏭️  User "${userData.email}" already exists, skipping...`);
        createdUsers.push(existingUser);
        continue;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const newUser = await User.create({
        ...userData,
        password: hashedPassword
      });
      usersCreated++;
      createdUsers.push(newUser);
      console.log(`✅ Created user: ${userData.fullName} (${userData.email})`);
    }
    console.log(`📊 Users: ${usersCreated} created, ${sampleUsers.length - usersCreated} already existed`);

    // 2. Seed Queries
    console.log('\n❓ === SEEDING QUERIES ===');
    let queriesCreated = 0;
    
    for (const queryData of sampleQueries) {
      const existingQuery = await Query.findOne({
        email: queryData.email,
        query: queryData.query
      });
      
      if (existingQuery) {
        console.log(`⏭️  Similar query already exists, skipping...`);
        continue;
      }

      await Query.create(queryData);
      queriesCreated++;
      console.log(`✅ Created query: "${queryData.query.substring(0, 50)}..."`);
    }
    console.log(`📊 Queries: ${queriesCreated} created`);

    // 3. Seed Quotations (link to users and sub-services)
    console.log('\n💰 === SEEDING QUOTATIONS ===');
    let quotationsCreated = 0;
    
    for (let i = 0; i < sampleQuotations.length; i++) {
      const quotationData = sampleQuotations[i];
      const user = createdUsers[i % createdUsers.length];
      const subService = subServices[i % subServices.length];
      
      if (!user || !subService) {
        console.log(`⚠️  Skipping quotation ${i + 1}: Missing user or sub-service`);
        continue;
      }

      await Quotation.create({
        ...quotationData,
        userId: user._id,
        subServiceId: subService._id
      });
      quotationsCreated++;
      console.log(`✅ Created quotation: ₹${quotationData.price} (${quotationData.status})`);
    }
    console.log(`📊 Quotations: ${quotationsCreated} created`);

    // 4. Seed Consultation Requests
    console.log('\n📞 === SEEDING CONSULTATION REQUESTS ===');
    let consultationRequestsCreated = 0;
    
    for (const consultationData of sampleConsultationRequests) {
      // Link to a user if available
      const user = createdUsers[consultationRequestsCreated % createdUsers.length];
      
      await ConsultationRequest.create({
        ...consultationData,
        userId: user?._id
      });
      consultationRequestsCreated++;
      console.log(`✅ Created consultation request: ${consultationData.serviceName} (${consultationData.status})`);
    }
    console.log(`📊 Consultation Requests: ${consultationRequestsCreated} created`);

    // 5. Seed Requests
    console.log('\n📋 === SEEDING REQUESTS ===');
    let requestsCreated = 0;
    
    for (const requestData of sampleRequests) {
      await Request.create(requestData);
      requestsCreated++;
      console.log(`✅ Created request: ${requestData.phoneNo}`);
    }
    console.log(`📊 Requests: ${requestsCreated} created`);

    // 6. Seed Notifications
    console.log('\n🔔 === SEEDING NOTIFICATIONS ===');
    let notificationsCreated = 0;
    
    for (const notificationData of sampleNotifications) {
      await Notification.create(notificationData);
      notificationsCreated++;
      console.log(`✅ Created notification: ${notificationData.title}`);
    }
    console.log(`📊 Notifications: ${notificationsCreated} created`);

    // Summary
    console.log('\n📊 === SEEDING SUMMARY ===');
    console.log(`✅ Users: ${usersCreated} created`);
    console.log(`✅ Queries: ${queriesCreated} created`);
    console.log(`✅ Quotations: ${quotationsCreated} created`);
    console.log(`✅ Consultation Requests: ${consultationRequestsCreated} created`);
    console.log(`✅ Requests: ${requestsCreated} created`);
    console.log(`✅ Notifications: ${notificationsCreated} created`);
    console.log('\n✅ All data seeded successfully!');
    console.log('📱 Data is now available in Admin App for viewing and modification');

    // Close connection
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error seeding data:', error);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

// Run the function
seedAllData();

