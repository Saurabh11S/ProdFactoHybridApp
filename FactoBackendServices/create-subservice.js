const mongoose = require('mongoose');
require('dotenv').config();

async function createSubService() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Define SubService schema
    const SubServiceSchema = new mongoose.Schema({
      serviceCode: {
        type: String,
        required: true,
        unique: true,
        trim: true,
      },
      serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service",
        required: true,
      },
      title: {
        type: String,
        required: true,
        trim: true,
      },
      description: {
        type: String,
        required: true,
      },
      features: [{
        type: String,
        required: true,
      }],
      requests: [{
        name: {
          type: String,
          required: true,
        },
        priceModifier: {
          type: Number,
          required: true,
        },
        needsQuotation: {
          type: Boolean,
          required: true,
        },
        inputType: {
          type: String,
          enum: ["dropdown", "checkbox"],
          required: true,
        },
        isMultipleSelect: {
          type: Boolean,
          default: false,
        },
        options: [{
          name: { type: String, required: true },
          priceModifier: { type: Number, required: true },
          needsQuotation: { type: Boolean, required: true },
        }],
      }],
      price: {
        type: Number,
        required: true,
        min: 0,
      },
      period: {
        type: String,
        enum: ["monthly", "quarterly", "half_yearly", "yearly", "one_time"],
        required: true,
      },
      isActive: {
        type: Boolean,
        default: true,
      },
      pricingStructure: [{
        price: { type: Number, required: true },
        period: {
          type: String,
          enum: ["monthly", "quarterly", "half_yearly", "yearly", "one_time"],
          required: true,
        },
      }],
    }, {
      timestamps: true,
    });

    const SubService = mongoose.model('SubService', SubServiceSchema, 'subService');

    // Check if itr-1 already exists
    const existingService = await SubService.findOne({ serviceCode: 'itr-1' });
    if (existingService) {
      console.log('✅ SubService with serviceCode "itr-1" already exists');
      console.log('📊 Service details:', {
        _id: existingService._id,
        serviceCode: existingService.serviceCode,
        title: existingService.title,
        price: existingService.price
      });
    } else {
      // Create a dummy Service first
      const ServiceSchema = new mongoose.Schema({
        title: String,
        description: String,
        isActive: { type: Boolean, default: true }
      });
      const Service = mongoose.model('Service', ServiceSchema, 'services');
      
      let service = await Service.findOne({ title: 'Tax Services' });
      if (!service) {
        service = await Service.create({
          title: 'Tax Services',
          description: 'Tax related services',
          isActive: true
        });
        console.log('✅ Created Service:', service._id);
      }

      // Create SubService with serviceCode "itr-1"
      const subService = await SubService.create({
        serviceCode: 'itr-1',
        serviceId: service._id,
        title: 'ITR-1',
        description: 'Salaried + 1 House property Plan',
        features: [
          'Error-free filing with government portal',
          'Priority CA consultation',
          'Express processing',
          'Document storage for 2 years',
          'Post-service support',
          'Tax planning advice'
        ],
        requests: [],
        price: 5, // ₹5 as shown in the frontend
        period: 'one_time',
        isActive: true,
        pricingStructure: [{
          price: 5,
          period: 'one_time'
        }]
      });

      console.log('✅ Created SubService with serviceCode "itr-1"');
      console.log('📊 Service details:', {
        _id: subService._id,
        serviceCode: subService.serviceCode,
        title: subService.title,
        price: subService.price
      });
    }

    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Error creating SubService:', error.message);
    process.exit(1);
  }
}

createSubService();

