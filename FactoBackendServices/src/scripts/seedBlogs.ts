import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import Blog from '../models/blog.model';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Sample blogs data
const sampleBlogs = [
  {
    title: 'New GST Rate Changes Effective from April 2024',
    content: 'The government has announced several changes to GST rates effective from April 1, 2024. These changes primarily affect the hospitality sector, textiles, and certain electronic goods. Business owners are advised to update their accounting systems and inform their customers about the new rates. This update is crucial for maintaining compliance and avoiding penalties. We recommend consulting with a tax expert to understand how these changes impact your specific business.',
    contentType: 'image',
    contentUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=400&fit=crop',
    reference: {
      title: 'GST Portal',
      url: 'https://www.gst.gov.in/'
    },
    author: 'CA Rajesh Kumar',
    tags: ['GST', 'Tax Updates', 'Business']
  },
  {
    title: 'Income Tax Return Filing Deadline Extended',
    content: 'The Income Tax Department has extended the deadline for filing Income Tax Returns for the financial year 2023-24. The new deadline is July 31, 2024, giving taxpayers additional time to gather necessary documents and file their returns accurately. This extension provides relief to many taxpayers who were struggling to meet the original deadline. Make sure to take advantage of this extension and file your returns correctly to avoid any late fees or penalties.',
    contentType: 'image',
    contentUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&h=400&fit=crop',
    reference: {
      title: 'Income Tax Portal',
      url: 'https://www.incometax.gov.in/'
    },
    author: 'Tax Expert Team',
    tags: ['Income Tax', 'Deadline', 'ITR']
  },
  {
    title: 'Digital Banking Security Best Practices',
    content: 'With the increasing adoption of digital banking, it\'s crucial to understand and implement proper security measures. This article covers the latest security best practices, including two-factor authentication, secure password management, and recognizing phishing attempts. We also discuss how to protect your financial data and what to do if you suspect fraudulent activity. Stay safe online and protect your hard-earned money with these essential security tips.',
    contentType: 'image',
    contentUrl: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=400&fit=crop',
    reference: {
      title: 'RBI Guidelines',
      url: 'https://www.rbi.org.in/'
    },
    author: 'Security Expert',
    tags: ['Security', 'Digital Banking', 'Privacy']
  },
  {
    title: 'MSME Registration Benefits and Process',
    content: 'MSME registration provides numerous benefits including easier access to credit, government schemes, and preferential treatment in government tenders. This comprehensive guide walks you through the registration process and highlights all the advantages available to registered MSMEs. Learn about the various subsidies, tax benefits, and support programs that can help your small business grow and thrive in the competitive market.',
    contentType: 'image',
    contentUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop',
    reference: {
      title: 'MSME Portal',
      url: 'https://www.msme.gov.in/'
    },
    author: 'Business Advisor',
    tags: ['MSME', 'Business Registration', 'Government Schemes']
  },
  {
    title: 'Investment Trends for 2024',
    content: 'The investment landscape continues to evolve with new opportunities emerging in various sectors. From sustainable investments to technology stocks, this analysis covers the most promising investment trends for 2024 and provides insights for both beginners and experienced investors. Understand market dynamics, risk management strategies, and how to build a diversified portfolio that aligns with your financial goals.',
    contentType: 'image',
    contentUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=400&fit=crop',
    reference: {
      title: 'SEBI Guidelines',
      url: 'https://www.sebi.gov.in/'
    },
    author: 'Investment Analyst',
    tags: ['Investments', 'Market Trends', 'Financial Planning']
  },
  {
    title: 'Company Incorporation Process Simplified',
    content: 'The company incorporation process has been significantly simplified with the introduction of online portals and streamlined procedures. This guide covers everything from name reservation to obtaining the certificate of incorporation, including the latest regulatory updates. We walk you through each step, required documents, and timelines to help you incorporate your business quickly and efficiently.',
    contentType: 'image',
    contentUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=400&fit=crop',
    reference: {
      title: 'MCA Portal',
      url: 'https://www.mca.gov.in/'
    },
    author: 'Legal Expert',
    tags: ['Company Law', 'Incorporation', 'Legal Compliance']
  }
];

async function seedBlogs() {
  try {
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
      console.log('⚠️  WARNING: Using local/development database. Data may differ from production!');
    }

    // Clear existing blogs (optional - comment out if you want to keep existing data)
    // await Blog.deleteMany({});
    // console.log('🗑️  Cleared existing blogs');

    let blogsCreated = 0;

    // Create blogs
    for (const blogData of sampleBlogs) {
      // Check if blog already exists
      const existingBlog = await Blog.findOne({ title: blogData.title });
      if (existingBlog) {
        console.log(`⏭️  Blog "${blogData.title}" already exists, skipping...`);
        continue;
      }

      // Create blog
      const blog = await Blog.create(blogData);
      blogsCreated++;
      console.log(`✅ Created blog: ${blogData.title}`);
    }

    console.log('\n📊 Summary:');
    console.log(`   Blogs created: ${blogsCreated}`);
    console.log('\n✅ Seeding completed successfully!');

    // Close connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding blogs:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run the seed function
seedBlogs();

