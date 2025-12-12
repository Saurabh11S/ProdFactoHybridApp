import { Request, Response, NextFunction } from "express";
import { createCustomError } from "@/errors/customAPIError";
import { StatusCode } from "@/constants/constants";
import { sendSuccessApiResponse } from "@/middlewares/successApiResponse";
import bigPromise from "@/middlewares/bigPromise";
import { db } from "@/models";
import { AuthRequest } from "@/middlewares/auth";
// import { signup } from "./auth.controller";
import { ICourse, ILecture, IService, IUser } from "@/interfaces";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { INotification } from "@/interfaces/notificationInterface";
import {
  deleteCloudinaryImage,
  deleteUploadedFiles,
  processCourseMaterialsUpload,
} from "@/middlewares/upload";
export const getAllUsers = bigPromise(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const users = await db.User.find({ role: "user" }).select("-password");

      const response = sendSuccessApiResponse("Users retrieved successfully", {
        users,
      });
      res.status(StatusCode.OK).send(response);
    } catch (error: any) {
      return next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

// Get user services (purchased services) for admin
export const getUserServices = bigPromise(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return next(createCustomError("Invalid user ID", StatusCode.BAD_REQ));
      }

      // Get all user purchases of type 'service' (include all statuses)
      const userPurchases = await db.UserPurchase.find({ 
        userId: userId, 
        itemType: 'service'
      })
      .populate({
        path: 'paymentOrderId',
        select: 'amount currency status transactionId createdAt paymentActivatedByAdmin consultationPrice activatedAt'
      })
      .sort({ createdAt: -1 });

      // Get service details for each purchase
      const servicesWithDetails = await Promise.all(
        userPurchases.map(async (purchase) => {
          try {
            const subService = await db.SubService.findById(purchase.itemId)
              .populate('serviceId', 'title');
            
            if (!subService) {
              return null;
            }

            const serviceIdObj = subService.serviceId as any;

            return {
              _id: purchase._id,
              serviceId: serviceIdObj?._id || null,
              serviceTitle: serviceIdObj?.title || 'Unknown Service',
              subServiceId: subService._id,
              subServiceTitle: subService.title,
              selectedFeatures: purchase.selectedFeatures || [],
              billingPeriod: purchase.billingPeriod,
              status: purchase.status,
              purchaseDate: purchase.createdAt,
              expiryDate: purchase.expiryDate,
              amount: purchase.paymentOrderId && typeof purchase.paymentOrderId === 'object' && 'amount' in purchase.paymentOrderId 
                ? (purchase.paymentOrderId as any).amount 
                : null,
              currency: purchase.paymentOrderId && typeof purchase.paymentOrderId === 'object' && 'currency' in purchase.paymentOrderId
                ? (purchase.paymentOrderId as any).currency
                : 'INR',
              transactionId: purchase.paymentOrderId && typeof purchase.paymentOrderId === 'object' && 'transactionId' in purchase.paymentOrderId
                ? (purchase.paymentOrderId as any).transactionId
                : null,
              paymentStatus: purchase.paymentOrderId && typeof purchase.paymentOrderId === 'object' && 'status' in purchase.paymentOrderId
                ? (purchase.paymentOrderId as any).status
                : null,
              paymentActivatedByAdmin: purchase.paymentOrderId && typeof purchase.paymentOrderId === 'object' && 'paymentActivatedByAdmin' in purchase.paymentOrderId
                ? (purchase.paymentOrderId as any).paymentActivatedByAdmin
                : false,
              consultationPrice: purchase.paymentOrderId && typeof purchase.paymentOrderId === 'object' && 'consultationPrice' in purchase.paymentOrderId
                ? (purchase.paymentOrderId as any).consultationPrice
                : 0,
            };
          } catch (error) {
            console.error('Error fetching service details:', error);
            return null;
          }
        })
      );

      const filteredServices = servicesWithDetails.filter(service => service !== null);

      const response = sendSuccessApiResponse("User services retrieved successfully", {
        services: filteredServices,
        totalServices: filteredServices.length,
      });
      res.status(StatusCode.OK).send(response);
    } catch (error: any) {
      return next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

// Get users who purchased a specific service (for admin - service details page)
export const getServiceUsers = bigPromise(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { serviceId } = req.params; // This is subServiceId

      if (!mongoose.Types.ObjectId.isValid(serviceId)) {
        return next(createCustomError("Invalid service ID", StatusCode.BAD_REQ));
      }

      // Get all user purchases for this service
      const userPurchases = await db.UserPurchase.find({ 
        itemId: serviceId,
        itemType: 'service',
        status: { $in: ['active', 'expired'] }
      })
      .populate({
        path: 'userId',
        select: 'fullName email phoneNumber'
      })
      .populate({
        path: 'paymentOrderId',
        select: 'amount currency status transactionId createdAt paymentActivatedByAdmin consultationPrice activatedAt'
      })
      .sort({ createdAt: -1 });

      // Format the response
      const serviceUsers = userPurchases.map((purchase) => {
        const user = purchase.userId as any;
        const payment = purchase.paymentOrderId as any;
        
        return {
          userId: user?._id || null,
          userName: user?.fullName || 'Unknown',
          userEmail: user?.email || 'N/A',
          userPhone: user?.phoneNumber || 'N/A',
          purchaseId: purchase._id,
          purchaseDate: purchase.createdAt,
          status: purchase.status,
          amount: payment?.amount || null,
          currency: payment?.currency || 'INR',
          transactionId: payment?.transactionId || null,
          paymentStatus: payment?.status || null,
          paymentActivatedByAdmin: payment?.paymentActivatedByAdmin || false,
          consultationPrice: payment?.consultationPrice || 0,
        };
      });

      const response = sendSuccessApiResponse("Service users retrieved successfully", {
        users: serviceUsers,
        totalUsers: serviceUsers.length,
      });
      res.status(StatusCode.OK).send(response);
    } catch (error: any) {
      return next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

// Get user documents for a specific service (for admin)
export const getUserServiceDocuments = bigPromise(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { userId, serviceId } = req.params; // serviceId is subServiceId

      if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(serviceId)) {
        return next(createCustomError("Invalid user ID or service ID", StatusCode.BAD_REQ));
      }

      // Convert string IDs to ObjectIds for proper querying
      const userIdObjectId = new mongoose.Types.ObjectId(userId);
      const serviceIdObjectId = new mongoose.Types.ObjectId(serviceId);
      
      // Get all documents uploaded by user for this service
      const userDocuments = await db.UserDocument.find({ 
        userId: userIdObjectId,
        subServiceId: serviceIdObjectId
      })
      .populate('subServiceId', 'title')
      .sort({ createdAt: -1 });
      
      console.log(`Found ${userDocuments.length} documents for userId: ${userId}, serviceId: ${serviceId}`);

      const response = sendSuccessApiResponse("User service documents retrieved successfully", {
        documents: userDocuments,
        totalDocuments: userDocuments.length,
      });
      res.status(StatusCode.OK).send(response);
    } catch (error: any) {
      return next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

// Get all user documents (for admin - across all services)
export const getAllUserDocuments = bigPromise(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return next(createCustomError("Invalid user ID", StatusCode.BAD_REQ));
      }

      // Convert string ID to ObjectId for proper querying
      const userIdObjectId = new mongoose.Types.ObjectId(userId);
      
      // Get all documents uploaded by user across all services
      const userDocuments = await db.UserDocument.find({ 
        userId: userIdObjectId
      })
      .populate('subServiceId', 'title')
      .sort({ createdAt: -1 });
      
      console.log(`Found ${userDocuments.length} total documents for userId: ${userId}`);

      const response = sendSuccessApiResponse("All user documents retrieved successfully", {
        documents: userDocuments,
        totalDocuments: userDocuments.length,
      });
      res.status(StatusCode.OK).send(response);
    } catch (error: any) {
      return next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

// Get consultations for a specific service (for admin)
export const getServiceConsultations = bigPromise(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { serviceId } = req.params; // This is subServiceId or serviceId

      if (!mongoose.Types.ObjectId.isValid(serviceId)) {
        return next(createCustomError("Invalid service ID", StatusCode.BAD_REQ));
      }

      // Get service/sub-service title to match in queries
      const subService = await db.SubService.findById(serviceId);
      const serviceTitle = subService?.title || '';

      // Get all queries that mention this service in the query text or have matching category
      const consultations = await db.Query.find({
        $or: [
          { query: { $regex: serviceTitle, $options: 'i' } },
          { category: 'service' }
        ]
      })
      .sort({ createdAt: -1 })
      .limit(100); // Limit to recent consultations

      // Filter to only those that mention this specific service
      const filteredConsultations = consultations
        .filter((consultation) => {
          // Check if query mentions the service name
          if (consultation.query && serviceTitle) {
            return consultation.query.toLowerCase().includes(serviceTitle.toLowerCase());
          }
          return false;
        })
        .map((consultation) => {
          // Extract service name from query if available
          let itemName = null;
          if (consultation.query && consultation.query.includes('Regarding:')) {
            const match = consultation.query.match(/Regarding:\s*([^)]+)/);
            if (match) {
              itemName = match[1].trim();
            }
          }

          return {
            _id: consultation._id,
            name: consultation.name,
            email: consultation.email,
            phoneNo: consultation.phoneNo,
            category: consultation.category || 'general',
            itemName: itemName,
            query: consultation.query,
            comment: consultation.comment || null,
            isResponded: consultation.isResponded || false,
            respondedAt: consultation.respondedAt || null,
            createdAt: consultation.createdAt,
            updatedAt: consultation.updatedAt,
          };
        });

      const response = sendSuccessApiResponse("Service consultations retrieved successfully", {
        consultations: filteredConsultations,
        totalConsultations: filteredConsultations.length,
      });
      res.status(StatusCode.OK).send(response);
    } catch (error: any) {
      return next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

// Get user consultations (free consultations) for admin
export const getUserConsultations = bigPromise(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return next(createCustomError("Invalid user ID", StatusCode.BAD_REQ));
      }

      // Get user details first
      const user = await db.User.findById(userId);
      if (!user) {
        return next(createCustomError("User not found", StatusCode.NOT_FOUND));
      }

      // Get all queries for this user by email or phone number
      // Query model uses: email (string, lowercase), phoneNo (number), name
      const userEmail = user.email?.toLowerCase();
      const userPhoneStr = user.phoneNumber?.toString();
      const userPhoneNum = userPhoneStr ? parseInt(userPhoneStr.slice(-10)) : null; // Last 10 digits as number
      
      const queryConditions: any[] = [];
      
      if (userEmail) {
        queryConditions.push({ email: userEmail });
      }
      
      if (userPhoneNum) {
        // Query model stores phoneNo as number (10 digits)
        queryConditions.push({ phoneNo: userPhoneNum });
      }

      if (queryConditions.length === 0) {
        return next(createCustomError("User email or phone number not found", StatusCode.BAD_REQ));
      }

      // Get all queries for this user (all categories)
      const consultations = await db.Query.find({
        $or: queryConditions
      })
      .sort({ createdAt: -1 });

      // Format consultations with service/course names if available
      const formattedConsultations = consultations.map((consultation) => {
        // Extract service/course name from query if it contains "Regarding:"
        let itemName = null;
        if (consultation.query && consultation.query.includes('Regarding:')) {
          const match = consultation.query.match(/Regarding:\s*([^)]+)/);
          if (match) {
            itemName = match[1].trim();
          }
        }

        return {
          _id: consultation._id,
          category: consultation.category || 'general',
          itemName: itemName,
          query: consultation.query,
          comment: consultation.comment || null,
          isResponded: consultation.isResponded || false,
          respondedAt: consultation.respondedAt || null,
          createdAt: consultation.createdAt,
          updatedAt: consultation.updatedAt,
        };
      });

      const response = sendSuccessApiResponse("User consultations retrieved successfully", {
        consultations: formattedConsultations,
        totalConsultations: formattedConsultations.length,
      });
      res.status(StatusCode.OK).send(response);
    } catch (error: any) {
      return next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

export const addUser = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Use the existing signup controller

      const {
        email,
        password,
        fullName,
        phoneNo,
        aadharNumber,
        panNumber,
        dateOfBirth,
      } = req.body;
      if (!phoneNo) {
        return next(
          createCustomError("Phone Number is required", StatusCode.NOT_FOUND)
        );
      }

      let user = await db.User.findOne({
        phoneNumber: phoneNo,
      });

      if (user) {
        return next(
          createCustomError("Phone Number Already Exist", StatusCode.BAD_REQ)
        );
      }

      user = await db.User.create({
        phoneNumber: phoneNo,
        email,
        password,
        fullName,
        aadharNumber,
        panNumber,
        dateOfBirth,
      });

      const response = sendSuccessApiResponse("User added Successful!", {
        user,
      });
      res.status(StatusCode.OK).send(response);
      // await signup(req, res, next);
    } catch (error: any) {
      return next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

export const addEmployee = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { phoneNumber, email, fullName } = req.body;

      // Validate required fields
      if (!phoneNumber || !email || !fullName) {
        return next(
          createCustomError(
            "Phone number, email, and full name are required",
            StatusCode.BAD_REQ
          )
        );
      }

      // Convert phoneNumber to string if it's a number
      const phoneNumberStr = String(phoneNumber).trim();

      // Validate phone number format (10-digit Indian number)
      if (!/^[6-9]\d{9}$/.test(phoneNumberStr)) {
        return next(
          createCustomError(
            "Please enter a valid 10-digit Indian mobile number",
            StatusCode.BAD_REQ
          )
        );
      }

      // Validate email format
      if (!/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(email.trim())) {
        return next(
          createCustomError(
            "Please enter a valid email address",
            StatusCode.BAD_REQ
          )
        );
      }

      // Check if employee already exists by phone number
      const existingEmployeeByPhone = await db.User.findOne({ 
        phoneNumber: phoneNumberStr 
      });
      if (existingEmployeeByPhone) {
        return next(
          createCustomError(
            "Employee already exists with this phone number",
            StatusCode.BAD_REQ
          )
        );
      }

      // Check if employee already exists by email
      const existingEmployeeByEmail = await db.User.findOne({ 
        email: email.trim().toLowerCase() 
      });
      if (existingEmployeeByEmail) {
        return next(
          createCustomError(
            "Employee already exists with this email address",
            StatusCode.BAD_REQ
          )
        );
      }

      // Create employee
      const user = await db.User.create({
        phoneNumber: phoneNumberStr,
        email: email.trim().toLowerCase(),
        fullName: fullName.trim(),
        role: "employee",
      });

      // Remove password from response
      const userResponse = user.toObject();
      delete userResponse.password;

      const response = sendSuccessApiResponse("Employee added successfully", {
        employee: userResponse,
      });
      res.status(StatusCode.OK).send(response);
    } catch (error: any) {
      // Handle validation errors
      if (error.name === "ValidationError") {
        const validationErrors = Object.values(error.errors || {}).map((err: any) => err.message);
        return next(
          createCustomError(
            validationErrors.join(", ") || "Validation error",
            StatusCode.BAD_REQ
          )
        );
      }
      return next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

export const getEmployee = bigPromise(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const employees = await db.User.find({ role: "employee" }).select(
        "-password"
      );

      const response = sendSuccessApiResponse(
        "Employees retrieved successfully",
        {
          employees,
        }
      );
      res.status(StatusCode.OK).send(response);
    } catch (error: any) {
      return next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

export const addAdmin = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        email,
        password,
        fullName,
        phoneNumber,
        aadharNumber,
        panNumber,
        dateOfBirth,
        profilePictureUrl,
      }: IUser = req.body;

      if (
        !email ||
        !password ||
        !fullName ||
        !phoneNumber ||
        !aadharNumber ||
        !panNumber ||
        !dateOfBirth
      ) {
        return next(
          createCustomError("All fields are required", StatusCode.BAD_REQ)
        );
      }

      const existingUser = await db.User.findOne({ email });
      if (existingUser) {
        return next(
          createCustomError(
            "This email is already registered.",
            StatusCode.BAD_REQ
          )
        );
      }

      // Hash the password
      // const hashedPassword = await bcrypt.hash(password, 10);

      const newAdmin: IUser = await db.User.create({
        email,
        password,
        fullName,
        phoneNumber,
        aadharNumber,
        panNumber,
        dateOfBirth,
        profilePictureUrl,
        role: "admin",
        registrationDate: new Date(),
        lastLogin: null,
      });

      const adminResponse = newAdmin.toObject();
      delete adminResponse.password;

      const response = sendSuccessApiResponse(
        "Admin user created successfully",
        { admin: adminResponse }
      );
      res.status(StatusCode.CREATED).send(response);
    } catch (error: any) {
      if (error.name === "ValidationError") {
        return next(createCustomError(error.message, StatusCode.BAD_REQ));
      }
      return next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

export const login = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      console.log('\n🔐 === ADMIN LOGIN ATTEMPT ===');
      console.log('📅 Timestamp:', new Date().toISOString());
      console.log('📧 Email:', email);

      if (!email || !password) {
        console.log('❌ Missing email or password');
        return next(
          createCustomError(
            "Email and password are required",
            StatusCode.BAD_REQ
          )
        );
      }

      // Find user and explicitly select password
      console.log('🔍 Searching for admin user...');
      const user = await db.User.findOne({ email, role: "admin" }).select(
        "+password"
      );

      if (!user) {
        console.log('❌ Admin user not found for email:', email);
        return next(
          createCustomError("Invalid credentials", StatusCode.UNAUTH)
        );
      }

      console.log('✅ Admin user found:', user._id);
      console.log('🔐 Comparing passwords...');

      // Compare password
      const isPasswordValid = password == user.password;

      if (!isPasswordValid) {
        console.log('❌ Password mismatch');
        return next(
          createCustomError("Invalid credentials", StatusCode.UNAUTH)
        );
      }

      console.log('✅ Password verified successfully');

      // Update last login
      console.log('📅 Updating last login time...');
      user.lastLogin = new Date();
      await user.save();

      // Create token
      console.log('🎫 Creating JWT token...');
      const token = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: process.env.JWT_EXPIRES_IN || "24h" }
      );

      // Remove password from response
      const userResponse = user.toObject();
      delete userResponse.password;

      console.log('✅ Login successful!');
      console.log('👤 User ID:', user._id);
      console.log('🔐 === ADMIN LOGIN COMPLETE ===\n');

      const response = sendSuccessApiResponse("Login Successful!", {
        user: userResponse,
        token,
      });

      res.status(StatusCode.OK).send(response);
    } catch (error: any) {
      return next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

export const getUserById = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return next(createCustomError("Invalid user ID", StatusCode.BAD_REQ));
      }

      const user = await db.User.findById(userId).select("-password");

      if (!user) {
        return next(createCustomError("User not found", StatusCode.NOT_FOUND));
      }

      const response = sendSuccessApiResponse(
        "User details retrieved successfully",
        { user }
      );
      res.status(StatusCode.OK).send(response);
    } catch (error: any) {
      return next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

export const updateEmployee = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const { email, fullName, phoneNumber } = req.body;

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return next(createCustomError("Invalid user ID", StatusCode.BAD_REQ));
      }

      const user = await db.User.findById(userId).select("-password");

      if (user && user?.role !== "employee") {
        return next(createCustomError("User not found", StatusCode.NOT_FOUND));
      }

      const updatedEmail = email !== user.email ? email : user.email;
      const updatedFullName =
        fullName !== user.fullName ? fullName : user.fullName;
      const updatedPhone =
        phoneNumber !== user.phoneNumber ? phoneNumber : user.phoneNumber;

      const updatedUser = await db.User.findByIdAndUpdate(
        userId,
        {
          email: updatedEmail,
          fullName: updatedFullName,
          phoneNumber: updatedPhone,
        },
        { new: true }
      ).select("-password");

      if (!updatedUser) {
        return next(createCustomError("User not found", StatusCode.NOT_FOUND));
      }

      const response = sendSuccessApiResponse(
        "User details updated successfully",
        { user: updatedUser }
      );
      res.status(StatusCode.OK).send(response);
    } catch (error: any) {
      return next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

export const deleteUserById = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return next(createCustomError("Invalid user ID", StatusCode.BAD_REQ));
      }

      const user = await db.User.findByIdAndDelete(userId);

      if (!user) {
        return next(createCustomError("User not found", StatusCode.NOT_FOUND));
      }

      const response = sendSuccessApiResponse("User deleted successfully", {
        deletedUserId: userId,
      });
      res.status(StatusCode.OK).send(response);
    } catch (error: any) {
      return next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

export const editUserProfile = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const {
        fullName,
        phoneNumber,
        email,
        aadharNumber,
        panNumber,
        dateOfBirth,
        profilePictureUrl,
      }: Partial<IUser> = req.body;

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return next(createCustomError("Invalid user ID", StatusCode.BAD_REQ));
      }

      const user = await db.User.findById(userId);

      if (!user) {
        return next(createCustomError("User not found", StatusCode.NOT_FOUND));
      }

      // Update user fields
      if (fullName) user.fullName = fullName;
      if (phoneNumber) user.phoneNumber = phoneNumber;
      if (email) user.email = email;
      if (aadharNumber) user.aadharNumber = aadharNumber;
      if (panNumber) user.panNumber = panNumber;
      if (dateOfBirth) user.dateOfBirth = new Date(dateOfBirth);
      if (profilePictureUrl) user.profilePictureUrl = profilePictureUrl;

      await user.save();

      const updatedUser = user.toObject();
      delete updatedUser.password;

      const response = sendSuccessApiResponse(
        "User profile updated successfully",
        { user: updatedUser }
      );
      res.status(StatusCode.OK).send(response);
    } catch (error: any) {
      if (error.name === "ValidationError") {
        return next(createCustomError(error.message, StatusCode.BAD_REQ));
      }
      return next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

export const addNotification = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { title, content }: INotification = req.body;

      if (!title || !content) {
        return next(
          createCustomError(
            "Title and content are required",
            StatusCode.BAD_REQ
          )
        );
      }

      const notification = await db.Notification.create({ title, content });

      // Send push notification to all users with registered push tokens
      // Import dynamically to avoid circular dependencies
      const { sendPushNotificationToAllUsers } = await import('@/services/fcmService');
      
      try {
        await sendPushNotificationToAllUsers(title, content, {
          notificationId: notification._id.toString(),
          type: 'notification',
          title: title,
          body: content,
        });
        console.log('✅ Push notifications sent successfully');
      } catch (pushError: any) {
        // Log error but don't fail the request
        console.error('⚠️ Error sending push notifications:', pushError.message);
        // Continue with the response even if push notification fails
      }

      const response = sendSuccessApiResponse(
        "Notification created successfully",
        { notification }
      );
      res.status(StatusCode.CREATED).send(response);
    } catch (error: any) {
      if (error.name === "ValidationError") {
        return next(createCustomError(error.message, StatusCode.BAD_REQ));
      }
      return next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

export const deleteNotification = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { notificationId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(notificationId)) {
        return next(
          createCustomError("Invalid notification ID", StatusCode.BAD_REQ)
        );
      }

      const notification = await db.Notification.findByIdAndDelete(
        notificationId
      );

      if (!notification) {
        return next(
          createCustomError("Notification not found", StatusCode.NOT_FOUND)
        );
      }

      const response = sendSuccessApiResponse(
        "Notification deleted successfully",
        { deletedNotificationId: notificationId }
      );
      res.status(StatusCode.OK).send(response);
    } catch (error: any) {
      return next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

export const editNotification = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { notificationId } = req.params;
      const { title, content }: Partial<INotification> = req.body;

      if (!mongoose.Types.ObjectId.isValid(notificationId)) {
        return next(
          createCustomError("Invalid notification ID", StatusCode.BAD_REQ)
        );
      }

      const notification = await db.Notification.findById(notificationId);

      if (!notification) {
        return next(
          createCustomError("Notification not found", StatusCode.NOT_FOUND)
        );
      }

      if (title) notification.title = title;
      if (content) notification.content = content;

      await notification.save();

      const response = sendSuccessApiResponse(
        "Notification updated successfully",
        { notification }
      );
      res.status(StatusCode.OK).send(response);
    } catch (error: any) {
      if (error.name === "ValidationError") {
        return next(createCustomError(error.message, StatusCode.BAD_REQ));
      }
      return next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

export const addService = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { title, description, category }: IService = req.body;
      let features: string[] = [];

      // Parse features from form data if present
      if (req.body.features) {
        try {
          features = JSON.parse(req.body.features);
          // Validate that features is an array
          if (!Array.isArray(features)) {
            return next(
              createCustomError("Features must be an array", StatusCode.BAD_REQ)
            );
          }
        } catch (error) {
          return next(
            createCustomError("Invalid features format", StatusCode.BAD_REQ)
          );
        }
      }

      // Validate required fields
      if (!title || !description || !category) {
        return next(
          createCustomError(
            "Title, description, and category are required",
            StatusCode.BAD_REQ
          )
        );
      }

      // Check if service with same title exists
      const existingService = await db.Service.findOne({ title });
      if (existingService) {
        return next(
          createCustomError(
            "Service with this title already exists",
            StatusCode.BAD_REQ
          )
        );
      }

      // Get icon URL from uploaded file
      const iconUrl = req.file ? req.file.path : "http"; // default value if no file uploaded

      // Create new service with icon and features
      const service = await db.Service.create({
        title,
        description,
        category,
        features, // Add features array to service
        isActive: true,
        icon: iconUrl,
      });

      const response = sendSuccessApiResponse("Service created successfully", {
        service,
      });
      res.status(StatusCode.CREATED).send(response);
    } catch (error: any) {
      if (error.name === "ValidationError") {
        return next(createCustomError(error.message, StatusCode.BAD_REQ));
      }
      return next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

// Get all services

// Get service by ID
export const getServiceById = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { serviceId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(serviceId)) {
        return next(
          createCustomError("Invalid service ID", StatusCode.BAD_REQ)
        );
      }

      const service = await db.Service.findById(serviceId);

      if (!service) {
        return next(
          createCustomError("Service not found", StatusCode.NOT_FOUND)
        );
      }

      const response = sendSuccessApiResponse(
        "Service retrieved successfully",
        {
          service,
        }
      );
      res.status(StatusCode.OK).send(response);
    } catch (error: any) {
      return next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

// Update service
export const updateService = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { serviceId } = req.params;
      const { title, description, isActive, category }: Partial<IService> =
        req.body;

      if (!mongoose.Types.ObjectId.isValid(serviceId)) {
        return next(
          createCustomError("Invalid service ID", StatusCode.BAD_REQ)
        );
      }

      const service = await db.Service.findById(serviceId);

      if (!service) {
        return next(
          createCustomError("Service not found", StatusCode.NOT_FOUND)
        );
      }

      // Check if new title already exists (excluding current service)
      if (title && title !== service.title) {
        const existingService = await db.Service.findOne({
          title,
          _id: { $ne: serviceId },
        });
        if (existingService) {
          return next(
            createCustomError(
              "Service with this title already exists",
              StatusCode.BAD_REQ
            )
          );
        }
      }

      // Handle icon upload if new file is provided
      if (req.file) {
        // Delete old icon from Cloudinary if it exists
        await deleteCloudinaryImage(service.icon);

        // Update with new icon URL
        service.icon = req.file.path;
      }

      // Update other service fields
      if (title) service.title = title;
      if (description) service.description = description;
      if (typeof isActive === "boolean") service.isActive = isActive;
      if (category) service.category = category;
      await service.save();

      const response = sendSuccessApiResponse("Service updated successfully", {
        service,
      });
      res.status(StatusCode.OK).send(response);
    } catch (error: any) {
      if (error.name === "ValidationError") {
        return next(createCustomError(error.message, StatusCode.BAD_REQ));
      }
      return next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

// Delete service
export const deleteService = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { serviceId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(serviceId)) {
        return next(
          createCustomError("Invalid service ID", StatusCode.BAD_REQ)
        );
      }

      // Check if service exists
      const service = await db.Service.findById(serviceId);

      if (!service) {
        return next(
          createCustomError("Service not found", StatusCode.NOT_FOUND)
        );
      }

      // Check if service has any associated subservices
      const hasSubServices = await db.SubService.exists({ serviceId });
      if (hasSubServices) {
        return next(
          createCustomError(
            "Cannot delete service with existing sub-services. Please delete all sub-services first.",
            StatusCode.BAD_REQ
          )
        );
      }

      // Delete the service
      await db.Service.findByIdAndDelete(serviceId);
      await deleteCloudinaryImage(service.icon);
      const response = sendSuccessApiResponse("Service deleted successfully", {
        deletedServiceId: serviceId,
      });
      res.status(StatusCode.OK).send(response);
    } catch (error: any) {
      return next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

// Toggle service status
export const toggleServiceStatus = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { serviceId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(serviceId)) {
        return next(
          createCustomError("Invalid service ID", StatusCode.BAD_REQ)
        );
      }

      const service = await db.Service.findById(serviceId);

      if (!service) {
        return next(
          createCustomError("Service not found", StatusCode.NOT_FOUND)
        );
      }

      // Toggle the isActive status
      service.isActive = !service.isActive;
      await service.save();

      const response = sendSuccessApiResponse(
        `Service ${
          service.isActive ? "activated" : "deactivated"
        } successfully`,
        { service }
      );
      res.status(StatusCode.OK).send(response);
    } catch (error: any) {
      return next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

export const createSubService = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { serviceId } = req.params;
      const {
        serviceCode,
        title,
        description,
        features,
        price,
        period,
        isActive,
        requests,
        pricingStructure,
      } = req.body;

      // Validate serviceId
      if (!mongoose.Types.ObjectId.isValid(serviceId)) {
        return next(
          createCustomError("Invalid service ID", StatusCode.BAD_REQ)
        );
      }

      // Create the sub-service with updated data format
      const subService = await db.SubService.create({
        serviceCode,
        serviceId,
        title,
        description,
        features, // Array of features as strings
        price,
        period,
        isActive,
        requests, // Array of requests, each with its own structure
        pricingStructure,
      });

      const response = sendSuccessApiResponse(
        "SubService created successfully",
        { subService }
      );
      res.status(StatusCode.CREATED).send(response);
    } catch (error: any) {
      return next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

// Get all SubServices

// Get a single SubService by ID

// Update a SubService
export const updateSubService = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { subServiceId } = req.params;
      const updateData = req.body;

      // Validate subServiceId
      if (!mongoose.Types.ObjectId.isValid(subServiceId)) {
        return next(
          createCustomError("Invalid subService ID", StatusCode.BAD_REQ)
        );
      }

      // Validate and ensure requests array has inputType field
      if (updateData.requests && Array.isArray(updateData.requests)) {
        updateData.requests = updateData.requests.map((request: any) => {
          // Ensure inputType is present and valid
          if (!request.inputType || !['dropdown', 'checkbox'].includes(request.inputType)) {
            // Default to checkbox if not provided or invalid
            request.inputType = 'checkbox';
          }
          
          // Ensure options array exists and is properly formatted
          if (request.inputType === 'dropdown') {
            // For dropdown, ensure options array exists (even if empty)
            if (!request.options || !Array.isArray(request.options)) {
              request.options = [];
            }
            // Normalize options to use 'name' field (not 'title')
            request.options = request.options.map((option: any) => {
              // Convert 'title' to 'name' if present (for backward compatibility)
              if (option.title && !option.name) {
                option.name = option.title;
                delete option.title;
              }
              // Ensure all required fields are present
              return {
                name: option.name || '',
                priceModifier: option.priceModifier || 0,
                needsQuotation: option.needsQuotation || false,
              };
            });
          } else {
            // For checkbox, clear options array
            request.options = [];
          }
          
          return request;
        });
        console.log("Validated requests array:", JSON.stringify(updateData.requests, null, 2));
      }

      // Update the sub-service with the provided data
      const subService = await db.SubService.findByIdAndUpdate(
        subServiceId,
        updateData,
        {
          new: true,
          runValidators: true,
        }
      );

      if (!subService) {
        return next(
          createCustomError("SubService not found", StatusCode.NOT_FOUND)
        );
      }

      const response = sendSuccessApiResponse(
        "SubService updated successfully",
        { subService }
      );
      res.status(StatusCode.OK).send(response);
    } catch (error: any) {
      return next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);
// Delete a SubService
export const deleteSubService = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { subServiceId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(subServiceId)) {
        return next(
          createCustomError("Invalid subService ID", StatusCode.BAD_REQ)
        );
      }

      const subService = await db.SubService.findByIdAndDelete(subServiceId);

      if (!subService) {
        return next(
          createCustomError("SubService not found", StatusCode.NOT_FOUND)
        );
      }
      await db.SubServiceRequirement.deleteMany({ subServiceId: subServiceId });

      const response = sendSuccessApiResponse(
        "SubService deleted successfully",
        { subService }
      );
      res.status(StatusCode.OK).send(response);
    } catch (error: any) {
      return next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

// Toggle SubService status
export const toggleSubServiceStatus = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { subServiceId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(subServiceId)) {
        return next(
          createCustomError("Invalid subService ID", StatusCode.BAD_REQ)
        );
      }

      const subService = await db.SubService.findById(subServiceId);

      if (!subService) {
        return next(
          createCustomError("SubService not found", StatusCode.NOT_FOUND)
        );
      }

      // Toggle the isActive status
      subService.isActive = !subService.isActive;
      await subService.save();

      const response = sendSuccessApiResponse(
        `SubService ${
          subService.isActive ? "activated" : "deactivated"
        } successfully`,
        { subService }
      );
      res.status(StatusCode.OK).send(response);
    } catch (error: any) {
      return next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

export const createSubServiceRequirement = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { subServiceId } = req.params;
      const { title, description, isMandatory } = req.body;

      // Check if required fields are present
      if (!title) {
        return next(createCustomError("Title is required", StatusCode.BAD_REQ));
      }

      if (!mongoose.Types.ObjectId.isValid(subServiceId)) {
        return next(
          createCustomError("Invalid subService ID", StatusCode.BAD_REQ)
        );
      }

      const subServiceRequirement = await db.SubServiceRequirement.create({
        subServiceId,
        title,
        description,
        isMandatory,
      });

      const response = sendSuccessApiResponse(
        "SubServiceRequirement created successfully",
        { subServiceRequirement }
      );
      res.status(StatusCode.CREATED).send(response);
    } catch (error: any) {
      return next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

// Get all SubServiceRequirements for a specific SubService

// Get a single SubServiceRequirement by ID
export const getSubServiceRequirementById = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { subServiceId, requirementId } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(subServiceId) ||
        !mongoose.Types.ObjectId.isValid(requirementId)
      ) {
        return next(
          createCustomError("Invalid ID provided", StatusCode.BAD_REQ)
        );
      }

      const subServiceRequirement = await db.SubServiceRequirement.findOne({
        _id: requirementId,
        subServiceId: subServiceId,
      });

      if (!subServiceRequirement) {
        return next(
          createCustomError(
            "SubServiceRequirement not found",
            StatusCode.NOT_FOUND
          )
        );
      }

      const response = sendSuccessApiResponse(
        "SubServiceRequirement retrieved successfully",
        { subServiceRequirement }
      );
      res.status(StatusCode.OK).send(response);
    } catch (error: any) {
      return next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

// Update a SubServiceRequirement
export const updateSubServiceRequirement = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { requirementId } = req.params;
      const updateData = req.body;

      if (!mongoose.Types.ObjectId.isValid(requirementId)) {
        return next(
          createCustomError("Invalid ID provided", StatusCode.BAD_REQ)
        );
      }

      // Check if at least one field to update is provided
      if (Object.keys(updateData).length === 0) {
        return next(
          createCustomError("No update data provided", StatusCode.BAD_REQ)
        );
      }

      // Ensure that subServiceId cannot be updated
      if (updateData.subServiceId) {
        delete updateData.subServiceId;
      }

      const subServiceRequirement =
        await db.SubServiceRequirement.findOneAndUpdate(
          { _id: requirementId },
          updateData,
          { new: true, runValidators: true }
        );

      if (!subServiceRequirement) {
        return next(
          createCustomError(
            "SubServiceRequirement not found",
            StatusCode.NOT_FOUND
          )
        );
      }

      const response = sendSuccessApiResponse(
        "SubServiceRequirement updated successfully",
        { subServiceRequirement }
      );
      res.status(StatusCode.OK).send(response);
    } catch (error: any) {
      return next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

// Delete a SubServiceRequirement
export const deleteSubServiceRequirement = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { requirementId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(requirementId)) {
        return next(
          createCustomError("Invalid ID provided", StatusCode.BAD_REQ)
        );
      }

      const subServiceRequirement =
        await db.SubServiceRequirement.findOneAndDelete({
          _id: requirementId,
        });

      if (!subServiceRequirement) {
        return next(
          createCustomError(
            "SubServiceRequirement not found",
            StatusCode.NOT_FOUND
          )
        );
      }

      const response = sendSuccessApiResponse(
        "SubServiceRequirement deleted successfully",
        { subServiceRequirement }
      );
      res.status(StatusCode.OK).send(response);
    } catch (error: any) {
      return next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

// Toggle SubServiceRequirement mandatory status
export const toggleSubServiceRequirementMandatory = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { requirementId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(requirementId)) {
        return next(
          createCustomError("Invalid ID provided", StatusCode.BAD_REQ)
        );
      }

      const subServiceRequirement = await db.SubServiceRequirement.findOne({
        _id: requirementId,
      });

      if (!subServiceRequirement) {
        return next(
          createCustomError(
            "SubServiceRequirement not found",
            StatusCode.NOT_FOUND
          )
        );
      }

      // Toggle the isMandatory status
      subServiceRequirement.isMandatory = !subServiceRequirement.isMandatory;
      await subServiceRequirement.save();

      const response = sendSuccessApiResponse(
        `SubServiceRequirement is now ${
          subServiceRequirement.isMandatory ? "mandatory" : "optional"
        }`,
        { subServiceRequirement }
      );
      res.status(StatusCode.OK).send(response);
    } catch (error: any) {
      return next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

export const addCourse = bigPromise(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const {
        title,
        category,
        language,
        subtitleLanguage,
        duration,
        price,
        description,
        totalLectures,
      }: ICourse = req.body;

      // Validate required fields
      if (
        !title ||
        !category ||
        !language ||
        !duration ||
        !price ||
        !description ||
        !totalLectures
      ) {
        return next(
          createCustomError("All fields are required", StatusCode.BAD_REQ)
        );
      }

      // Check if course with same title exists
      const existingCourse = await db.Course.findOne({ title });
      if (existingCourse) {
        return next(
          createCustomError(
            "Course with this title already exists",
            StatusCode.BAD_REQ
          )
        );
      }

      // Create new course
      const course = await db.Course.create({
        title,
        category,
        language,
        subtitleLanguage,
        duration,
        price,
        description,
        totalLectures,
        lectures: [],
        status: "draft",
      });

      const response = sendSuccessApiResponse("Course created successfully", {
        course,
      });
      res.status(StatusCode.CREATED).send(response);
    } catch (error: any) {
      if (error.name === "ValidationError") {
        return next(createCustomError(error.message, StatusCode.BAD_REQ));
      }
      return next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

export const updateCourse = bigPromise(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { courseId } = req.params; // Assuming course ID is passed as a parameter
      const {
        title,
        category,
        language,
        subtitleLanguage,
        duration,
        price,
        description,
        totalLectures,
      }: Partial<ICourse> = req.body;

      // Check if the course exists
      const existingCourse = await db.Course.findById(courseId);
      if (!existingCourse) {
        return next(
          createCustomError("Course not found", StatusCode.NOT_FOUND)
        );
      }

      // Validate fields if provided
      if (title) {
        const duplicateTitle = await db.Course.findOne({
          title,
          _id: { $ne: courseId },
        });
        if (duplicateTitle) {
          return next(
            createCustomError(
              "Another course with this title already exists",
              StatusCode.BAD_REQ
            )
          );
        }
      }

      // Update course fields
      const updatedFields = {
        ...(title && { title }),
        ...(category && { category }),
        ...(language && { language }),
        ...(subtitleLanguage && { subtitleLanguage }),
        ...(duration && { duration }),
        ...(price && { price }),
        ...(description && { description }),
        ...(totalLectures && { totalLectures }),
      };

      const updatedCourse = await db.Course.findByIdAndUpdate(
        courseId,
        { $set: updatedFields },
        { new: true, runValidators: true }
      );

      const response = sendSuccessApiResponse("Course updated successfully", {
        course: updatedCourse,
      });
      res.status(StatusCode.OK).send(response);
    } catch (error: any) {
      if (error.name === "ValidationError") {
        return next(createCustomError(error.message, StatusCode.BAD_REQ));
      }
      return next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

export const deleteCourse = bigPromise(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { courseId } = req.params;

      // Check if the course exists
      const existingCourse = await db.Course.findById(courseId);
      if (!existingCourse) {
        return next(
          createCustomError("Course not found", StatusCode.NOT_FOUND)
        );
      }

      // Delete all lectures associated with the course
      if (existingCourse.lectures && existingCourse.lectures.length > 0) {
        await db.Lecture.deleteMany({ _id: { $in: existingCourse.lectures } });
      }

      // Delete the course
      await db.Course.findByIdAndDelete(courseId);

      const response = sendSuccessApiResponse("Course deleted successfully", {
        // course: existingCourse,
      });
      res.status(StatusCode.OK).send(response);
    } catch (error: any) {
      if (error.name === "ValidationError") {
        return next(createCustomError(error.message, StatusCode.BAD_REQ));
      }
      return next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

export const getCourses = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log('\n📚 === ADMIN: FETCHING ALL COURSES ===');
      console.log('📅 Timestamp:', new Date().toISOString());
      console.log('🔐 User ID:', (req as any).user?.id || 'Not authenticated');
      
      // Use .lean() to get plain JavaScript objects instead of Mongoose documents
      // This ensures proper JSON serialization
      const courses = await db.Course.find().populate({
        path: "lectures",
      }).lean();
      
      console.log(`✅ Found ${courses.length} total courses (all statuses):`);
      courses.forEach((course: any, index: number) => {
        console.log(`  ${index + 1}. ${course.title}`);
        console.log(`     - ID: ${course._id}`);
        console.log(`     - Status: ${course.status}`);
        console.log(`     - Category: ${course.category}`);
        console.log(`     - Price: ₹${course.price}`);
        console.log(`     - Lectures: ${course.lectures?.length || 0}`);
      });
      
      const publishedCount = courses.filter((c: any) => c.status === 'published').length;
      const draftCount = courses.filter((c: any) => c.status === 'draft').length;
      console.log(`📊 Breakdown: ${publishedCount} published, ${draftCount} draft`);
      
      // sendSuccessApiResponse expects Record<string, any>, but arrays work in runtime
      // The frontend expects data.data to be an array
      const response = sendSuccessApiResponse(
        "Courses Fetched Successfully",
        courses as any // Array serializes correctly as JSON
      );
      
      console.log('📦 Response structure:', {
        success: response.success,
        dataType: typeof response.data,
        isArray: Array.isArray(response.data),
        dataLength: Array.isArray(response.data) ? response.data.length : 'N/A',
        message: (response.status as any)?.message || 'N/A'
      });
      console.log('📚 === ADMIN COURSES FETCH COMPLETE ===\n');
      
      res.status(StatusCode.OK).send(response);
    } catch (error) {
      console.error('❌ Error fetching admin courses:', error);
      return next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);
export const getCourseById = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const course = await db.Course.findById(id).populate("lectures");
      const response = sendSuccessApiResponse(
        "Course Fetched Successfully",
        course
      );
      res.status(StatusCode.OK).send(response);
    } catch (error) {
      return next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);
export const getLecture = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { courseId } = req.params;
      const courses = await db.Course.findById(courseId).populate("lectures");
      const response = sendSuccessApiResponse("Course Fetched Successfully", {
        lectures: courses.lectures,
      });
      res.status(StatusCode.OK).send(response);
    } catch (error) {
      return next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

export const addLecture = bigPromise(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    let thumbnailUrl, videoUrl;
    try {
      try {
        req.body.duration = JSON.parse(req.body.duration);
        console.log(req.body.duration);
      } catch (parseError) {
        console.error("Error parsing duration:", parseError);
        return res.status(400).json({
          message: "Invalid duration format",
        });
      }
      const { courseId } = req.params;
      const {
        title,
        subtitle,
        lectureNumber,
        language,
        subtitleLanguage,
        duration,
        courseLevel,
        isFree,
      }: ILecture = req.body;
      // console.log(req.body)
      // Validate required fields
      if (!title || !lectureNumber || !language || !courseLevel) {
        return next(
          createCustomError("All fields are required", StatusCode.BAD_REQ)
        );
      }

      const course = await db.Course.findById(courseId);
      if (!course) {
        return next(
          createCustomError("Course not found", StatusCode.NOT_FOUND)
        );
      }

      thumbnailUrl = req.body.thumbnailUrl;
      videoUrl = req.body.videoUrl;

      if (!thumbnailUrl || !videoUrl) {
        return next(
          createCustomError(
            "Thumbnail and video are required",
            StatusCode.BAD_REQ
          )
        );
      }

      const lecture = await db.Lecture.create({
        title,
        subtitle,
        lectureNumber,
        language,
        subtitleLanguage,
        duration,
        courseLevel,
        thumbnail: thumbnailUrl,
        videoUrl: videoUrl,
        isFree,
      });

      course.lectures.push(lecture._id);
      course.totalLectures = course.lectures.length;
      await course.save();

      const response = sendSuccessApiResponse("Lecture added successfully", {
        lecture,
      });
      res.status(StatusCode.CREATED).send(response);
    } catch (error: any) {
      await deleteUploadedFiles(thumbnailUrl, videoUrl);
      if (error.name === "ValidationError") {
        console.log(error);
        return next(createCustomError(error.message, StatusCode.BAD_REQ));
      }
      return next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);
export const updateLecture = bigPromise(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    let updatedThumbnailUrl, updatedVideoUrl;
    try {
      const { courseId, lectureId } = req.params;
      const {
        title,
        subtitle,
        lectureNumber,
        language,
        subtitleLanguage,
        duration,
        courseLevel,
        isFree,
      }: Partial<ILecture> = req.body;

      // Check if the course exists
      const course = await db.Course.findById(courseId);
      if (!course) {
        return next(
          createCustomError("Course not found", StatusCode.NOT_FOUND)
        );
      }

      // Check if the lecture exists in the course
      const lecture = await db.Lecture.findById(lectureId);
      if (!lecture) {
        return next(
          createCustomError("Lecture not found", StatusCode.NOT_FOUND)
        );
      }

      // Handle file uploads
      updatedThumbnailUrl = req.body.thumbnailUrl || lecture.thumbnail;
      updatedVideoUrl = req.body.videoUrl || lecture.videoUrl;

      if (req.file) {
        if (req.file.fieldname === "thumbnail") {
          updatedThumbnailUrl = req.file.path;
        }
        if (req.file.fieldname === "video") {
          updatedVideoUrl = req.file.path;
        }
      }

      // Parse duration if provided
      if (req.body.duration) {
        try {
          req.body.duration = JSON.parse(req.body.duration);
          req.body.duration.value = Number(req.body.duration.value);
          console.log(req.body.duration);
        } catch (parseError) {
          console.error("Error parsing duration:", parseError);
          return res.status(400).json({
            message: "Invalid duration format",
          });
        }
      }

      // Update lecture fields
      lecture.title = title || lecture.title;
      lecture.subtitle = subtitle || lecture.subtitle;
      lecture.lectureNumber = lectureNumber || lecture.lectureNumber;
      lecture.language = language || lecture.language;
      lecture.subtitleLanguage = subtitleLanguage || lecture.subtitleLanguage;
      lecture.duration = req.body.duration || lecture.duration;
      lecture.courseLevel = courseLevel || lecture.courseLevel;
      lecture.thumbnail = updatedThumbnailUrl;
      lecture.videoUrl = updatedVideoUrl;
      lecture.isFree = isFree !== undefined ? isFree : lecture.isFree;

      // Save the updated lecture
      await lecture.save();

      const response = sendSuccessApiResponse("Lecture updated successfully", {
        lecture,
      });
      res.status(StatusCode.OK).send(response);
    } catch (error: any) {
      // Clean up uploaded files in case of error
      if (req.file) {
        await deleteUploadedFiles(updatedThumbnailUrl, updatedVideoUrl);
      }
      if (error.name === "ValidationError") {
        console.error(error);
        return next(createCustomError(error.message, StatusCode.BAD_REQ));
      }
      return next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

export const publishCourse = bigPromise(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { courseId } = req.params;

      // Check if course exists
      const course = await db.Course.findById(courseId);
      if (!course) {
        return next(
          createCustomError("Course not found", StatusCode.NOT_FOUND)
        );
      }

      // Check if course has lectures
      if (course.lectures.length === 0) {
        return next(
          createCustomError(
            "Cannot publish a course without lectures",
            StatusCode.BAD_REQ
          )
        );
      }

      // Update course status to published
      course.status = "published";
      await course.save();

      // Send newsletter notification to all active subscribers (async, don't block response)
      (async () => {
        try {
          const { sendNewsletterUpdate } = await import("@/utils/emailService");
          const activeSubscribers = await db.NewsletterSubscription.find({
            isActive: true,
          }).select("email");

          if (activeSubscribers.length > 0) {
            const subscriberEmails = activeSubscribers.map((sub) => sub.email);
            const frontendUrl = process.env.FRONTEND_URL || "https://facto.org.in";
            const courseUrl = `${frontendUrl}/courses/${course._id}`;

            await sendNewsletterUpdate(subscriberEmails, "course", {
              title: course.title,
              description: course.description?.substring(0, 200) + "..." || "Check out our new course!",
              url: courseUrl,
            });
          }
        } catch (emailError: any) {
          console.error("Error sending newsletter notifications:", emailError.message);
          // Don't fail the course publication if email fails
        }
      })();

      const response = sendSuccessApiResponse("Course published successfully", {
        course,
      });
      res.status(StatusCode.OK).send(response);
    } catch (error: any) {
      return next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

export const createBlog = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        title,
        content,
        contentType,
        contentUrl,
        reference,
        tags,
        author,
      } = req.body;
      console.log("sss");
      console.log(req.body);
      console.log(req.file);

      // Parse reference if it's a string
      const parsedReference =
        typeof reference === "string" ? JSON.parse(reference) : reference;

      // Parse tags if it's a string
      const parsedTags = typeof tags === "string" ? JSON.parse(tags) : tags;

      // Validate required fields
      if (
        !title ||
        !content ||
        !contentType ||
        !parsedReference ||
        !parsedReference.title
      ) {
        // Clean up any uploaded file if validation fails
        if (req.file) {
          await deleteUploadedFiles(req.file.path);
        }
        console.log("jsjs");
        return next(
          createCustomError(
            "Title, content, content type, content URL, and reference title are required",
            StatusCode.BAD_REQ
          )
        );
      }
      
      // Make reference URL optional, default to empty string if not provided
      if (!parsedReference.url) {
        parsedReference.url = "";
      }

      // Create blog
      const blog = await db.Blog.create({
        title,
        content,
        contentType,
        contentUrl,
        reference: {
          title: parsedReference.title,
          url: parsedReference.url,
        },
        tags: parsedTags || [],
        author,
      });

      console.log(blog);

      // Send newsletter notification to all active subscribers (async, don't block response)
      // Use setImmediate to ensure it runs after response is sent
      setImmediate(async () => {
        try {
          console.log('\n📧 === BLOG NEWSLETTER NOTIFICATION START ===');
          console.log('📅 Timestamp:', new Date().toISOString());
          console.log('🌍 Environment:', process.env.NODE_ENV || 'development');
          
          // Check email configuration first - prioritize SendGrid
          const sendGridApiKey = process.env.SENDGRID_API_KEY;
          const emailService = process.env.EMAIL_SERVICE || (sendGridApiKey ? 'sendgrid' : 'gmail');
          const emailUser = process.env.EMAIL_USER || process.env.GMAIL_USER;
          const emailPassword = process.env.EMAIL_PASSWORD || process.env.GMAIL_APP_PASSWORD;
          
          if (emailService === 'sendgrid' || sendGridApiKey) {
            if (!sendGridApiKey) {
              console.error('\n❌ === SENDGRID NOT CONFIGURED ===');
              console.error('❌ SENDGRID_API_KEY:', !!sendGridApiKey, sendGridApiKey ? '✓' : '✗');
              console.error('❌ Cannot send newsletter emails. Please set SENDGRID_API_KEY in environment variables.');
              return;
            }
            console.log('✅ SendGrid email service configured');
            console.log('📧 From email:', process.env.SENDGRID_FROM_EMAIL || emailUser || 'noreply@facto.org.in');
          } else {
            if (!emailUser || !emailPassword) {
              console.error('\n❌ === EMAIL SERVICE NOT CONFIGURED ===');
              console.error('❌ EMAIL_USER:', !!emailUser, emailUser ? '✓' : '✗');
              console.error('❌ EMAIL_PASSWORD:', !!emailPassword, emailPassword ? '✓' : '✗');
              console.error('❌ Cannot send newsletter emails. Please set EMAIL_USER and EMAIL_PASSWORD in environment variables.');
              return;
            }
            console.log('✅ Gmail email service configured');
            console.log('📧 From email:', emailUser);
          }
          
          const { sendNewsletterUpdate } = await import("@/utils/emailService");
          
          const activeSubscribers = await db.NewsletterSubscription.find({
            isActive: true,
          }).select("email");

          console.log(`📊 Found ${activeSubscribers.length} active subscribers`);

          if (activeSubscribers.length > 0) {
            const subscriberEmails = activeSubscribers.map((sub) => sub.email);
            const frontendUrl = process.env.FRONTEND_URL || "https://facto.org.in";
            const blogUrl = `${frontendUrl}/blogs/${blog._id}`;

            console.log(`📧 Preparing to send newsletter to ${subscriberEmails.length} subscribers`);
            console.log(`📧 Subscriber emails:`, subscriberEmails);
            console.log(`🔗 Blog URL: ${blogUrl}`);
            console.log(`📝 Blog Title: ${blog.title}`);

            await sendNewsletterUpdate(subscriberEmails, "blog", {
              title: blog.title,
              description: blog.content.substring(0, 200) + "...",
              url: blogUrl,
              author: blog.author || "FACTO Team",
            });

            console.log('✅ Newsletter notification process completed');
          } else {
            console.log('⚠️ No active subscribers found to notify');
          }
        } catch (emailError: any) {
          console.error('\n❌ === ERROR SENDING NEWSLETTER NOTIFICATIONS ===');
          console.error('❌ Error message:', emailError.message);
          console.error('❌ Error stack:', emailError.stack);
          console.error('❌ Error name:', emailError.name);
          console.error('❌ Error code:', emailError.code);
          if (emailError.response) {
            console.error('❌ SMTP Response:', emailError.response);
          }
          console.error('❌ Full error:', JSON.stringify(emailError, Object.getOwnPropertyNames(emailError), 2));
          // Don't fail the blog creation if email fails
        }
      });

      const response = sendSuccessApiResponse("Blog created successfully", {
        blog,
      });
      res.status(StatusCode.CREATED).send(response);
    } catch (error) {
      console.log(error);
      // Clean up any uploaded files in case of error
      if (req.file) {
        await deleteUploadedFiles(req.file.path);
      }
      return next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

export const ListBlogs = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { search = "", fromDate, toDate, page = 1, limit = 10 } = req.query;

      // Build filter
      const filter: any = {};

      // Text search on title
      if (search) {
        filter.$or = [{ title: { $regex: search, $options: "i" } }];
      }

      // Date range filtering
      if (fromDate && toDate) {
        filter.createdAt = {
          $gte: new Date(fromDate as string),
          $lte: new Date(toDate as string),
        };
      }

      // Pagination
      const options = {
        select: "title content createdAt contentType contentUrl tags author",
        sort: { createdAt: -1 },
        limit: Number(limit),
        skip: (Number(page) - 1) * Number(limit),
      };

      // Fetch blogs
      const blogs = await db.Blog.find(filter, null, options);
      const total = await db.Blog.countDocuments(filter);

      const response = sendSuccessApiResponse("Blogs retrieved successfully", {
        blogs,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / Number(limit)),
          totalBlogs: total,
        },
      });
      res.status(StatusCode.OK).send(response);
    } catch (error) {
      return next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

export const deleteBlog = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      // Validate ID
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(createCustomError("Invalid blog ID", StatusCode.BAD_REQ));
      }

      // Find the blog
      const blog = await db.Blog.findById(id);

      if (!blog) {
        return next(createCustomError("Blog not found", StatusCode.NOT_FOUND));
      }

      // Delete the associated file if it exists
      if (blog.contentUrl && blog.contentUrl.startsWith("/uploads/")) {
        await deleteUploadedFiles(blog.contentUrl.slice(1)); // Remove leading slash
      }

      // Delete blog
      await db.Blog.findByIdAndDelete(id);

      const response = sendSuccessApiResponse("Blog deleted successfully", {
        deletedBlog: blog,
      });
      res.status(StatusCode.OK).send(response);
    } catch (error) {
      return next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

export const updateBlog = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const {
        title,
        content,
        contentType,
        contentUrl,
        reference,
        tags,
        author,
      } = req.body;

      // Validate ID
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(createCustomError("Invalid blog ID", StatusCode.BAD_REQ));
      }

      // Find the blog
      const blog = await db.Blog.findById(id);

      if (!blog) {
        return next(createCustomError("Blog not found", StatusCode.NOT_FOUND));
      }

      // Parse reference if it's a string
      const parsedReference =
        typeof reference === "string" ? JSON.parse(reference) : reference;

      // Parse tags if it's a string
      const parsedTags = typeof tags === "string" ? JSON.parse(tags) : tags;

      // Update blog fields
      blog.title = title || blog.title;
      blog.content = content || blog.content;
      blog.contentType = contentType || blog.contentType;
      blog.author = author || blog.author;

      if (parsedReference) {
        blog.reference = {
          title: parsedReference.title || blog.reference.title,
          url: parsedReference.url || blog.reference.url,
        };
      }

      if (parsedTags) {
        blog.tags = parsedTags;
      }

      // Handle content URL update
      if (contentUrl && contentUrl !== blog.contentUrl) {
        // Delete old file if it exists
        if (blog.contentUrl && blog.contentUrl.startsWith("/uploads/")) {
          await deleteUploadedFiles(blog.contentUrl.slice(1)); // Remove leading slash
        }
        blog.contentUrl = contentUrl;
      }

      // Save updated blog
      await blog.save();

      const response = sendSuccessApiResponse("Blog updated successfully", {
        blog,
      });
      res.status(StatusCode.OK).send(response);
    } catch (error) {
      // Clean up any uploaded files in case of error
      if (req.file) {
        await deleteUploadedFiles(req.file.path);
      }
      return next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);
export const getQuery = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const queries = await db.Query.find().sort({ createdAt: -1 });
      const response = sendSuccessApiResponse(
        "Queries retrieved successfully",
        { queries }
      );
      res.status(StatusCode.OK).send(response);
    } catch (error) {
      return next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

export const addCommentToQuery = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { comment } = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(createCustomError("Invalid query ID", StatusCode.BAD_REQ));
      }
      if (!comment) {
        return next(
          createCustomError("Comment is required", StatusCode.BAD_REQ)
        );
      }

      const query = await db.Query.findById(id);

      if (!query) {
        return next(createCustomError("Query not found", StatusCode.NOT_FOUND));
      }

      // Check if query was already responded to and if comment changed
      const isFirstResponse = !query.isResponded;
      const oldComment = query.comment || '';
      const commentChanged = oldComment.trim() !== comment.trim();

      // Update query with comment and mark as responded
      query.comment = comment;
      query.isResponded = true;
      if (isFirstResponse) {
        query.respondedAt = new Date();
      }
      await query.save();

      // Send email notification to user (non-blocking) - send if first response OR if comment was updated
      if (query.email && query.email !== 'not-provided@example.com' && query.email.trim() !== '') {
        // Send email if it's the first response OR if the comment was changed
        if (isFirstResponse || commentChanged) {
          try {
            console.log('📧 Attempting to send response email to user:', query.email);
            console.log('📧 Query details:', {
              name: query.name,
              query: query.query,
              comment: comment,
              category: query.category,
              isFirstResponse,
              commentChanged,
              oldComment: oldComment,
              newComment: comment
            });
            
            const { sendQueryResponseToUser } = await import("@/utils/emailService");
            await sendQueryResponseToUser(
              query.email,
              query.name || 'Valued Customer',
              query.query,
              comment,
              query.category
            );
            console.log('✅ Response email sent successfully to user:', query.email);
          } catch (emailError: any) {
            console.error('❌ Failed to send response email to user:', query.email);
            console.error('❌ Error details:', emailError.message || emailError);
            console.error('❌ Full error:', JSON.stringify(emailError, null, 2));
            // Don't fail the request if email fails, but log the error
          }
        } else {
          console.log('ℹ️ Comment unchanged, skipping email notification');
        }
      } else {
        console.warn('⚠️ User email not available or invalid, skipping email notification');
        console.warn('⚠️ Email value:', query.email);
        console.warn('⚠️ Is first response:', isFirstResponse);
        console.warn('⚠️ Comment changed:', commentChanged);
      }

      // Determine response message based on whether email was sent
      let message = "Comment added to the query successfully";
      if (query.email && query.email !== 'not-provided@example.com' && query.email.trim() !== '') {
        if (isFirstResponse || commentChanged) {
          message = "Comment added to the query successfully. Email notification has been sent to the user.";
        } else {
          message = "Comment updated successfully. (No email sent - comment unchanged)";
        }
      } else {
        message = "Comment added to the query successfully. (No email sent - user email not available)";
      }

      const response = sendSuccessApiResponse(message, { query });
      res.status(StatusCode.OK).send(response);
    } catch (error: any) {
      return next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

export const getRequest = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const requests = await db.Request.find()
        .sort({ createdAt: -1 })
        .populate("assignee")
        .select("phoneNo fullName");
      const response = sendSuccessApiResponse("Requests fetched successfully", {
        requests,
      });
      res.status(StatusCode.OK).send(response);
    } catch (error) {
      return next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

export const getAllQuotationRequests = bigPromise(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { page = 1, limit = 10 } = req.query;

      const query = {};
      const skip = (Number(page) - 1) * Number(limit);

      const totalQuotations = await db.Quotation.countDocuments(query);
      const quotations = await db.Quotation.find(query)
        .populate("userId")
        .populate("subServiceId", "title")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit));

      console.log(quotations);

      const response = sendSuccessApiResponse(
        "Quotation requests retrieved successfully",
        {
          quotations,
          totalQuotations,
          page: Number(page),
          totalPages: Math.ceil(totalQuotations / Number(limit)),
        }
      );
      res.status(StatusCode.OK).send(response);
    } catch (error: any) {
      return next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

export const createAdminQuotation = bigPromise(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { userId, subServiceId, selectedFeatures, price } = req.body;

      // Validate required fields
      if (
        !userId ||
        !subServiceId ||
        !selectedFeatures ||
        !Array.isArray(selectedFeatures)
      ) {
        return next(
          createCustomError("All fields are required", StatusCode.BAD_REQ)
        );
      }

      // Validate price
      if (price === undefined || price < 0) {
        return next(
          createCustomError(
            "Valid price is required for admin quotation",
            StatusCode.BAD_REQ
          )
        );
      }

      // Validate if user exists
      const userExists = await db.User.findById(userId);
      if (!userExists) {
        return next(createCustomError("User not found", StatusCode.BAD_REQ));
      }

      // Validate if subService exists
      const subServiceExists = await db.SubService.findById(subServiceId);
      if (!subServiceExists) {
        return next(
          createCustomError("Sub Service not found", StatusCode.BAD_REQ)
        );
      }

      // Create quotation with price
      const newQuotation = await db.Quotation.create({
        userId,
        subServiceId,
        selectedFeatures,
        price,
      });

      // Send success response
      const response = sendSuccessApiResponse(
        "Admin quotation created successfully",
        newQuotation
      );
      res.status(StatusCode.OK).send(response);
    } catch (error: any) {
      return next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

export const updateQuotationPrice = bigPromise(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { quotationId } = req.params;
      const { totalPrice } = req.body;

      const updatedQuotation = await db.Quotation.findByIdAndUpdate(
        quotationId,
        {
          price: totalPrice,
        },
        { new: true, runValidators: true }
      );

      if (!updatedQuotation) {
        return next(
          createCustomError("Quotation not found", StatusCode.NOT_FOUND)
        );
      }

      const response = sendSuccessApiResponse(
        "Quotation updated successfully",
        updatedQuotation
      );
      res.status(StatusCode.OK).send(response);
    } catch (error: any) {
      return next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

export const findQuotationsByUserId = bigPromise(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const query = { userId };

      const skip = (Number(page) - 1) * Number(limit);

      const totalQuotations = await db.Quotation.countDocuments(query);
      const quotations = await db.Quotation.find(query)
        .populate("subServiceId", "title description")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit));

      const response = sendSuccessApiResponse(
        "User quotations retrieved successfully",
        {
          quotations,
          totalQuotations,
          page: Number(page),
          totalPages: Math.ceil(totalQuotations / Number(limit)),
        }
      );
      res.status(StatusCode.OK).send(response);
    } catch (error: any) {
      return next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

// controllers/applicationController.ts (add to existing file)

// Edit Application by ID
export const updateApplication = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { applicationId } = req.params;

      // Validate application ID
      if (!mongoose.Types.ObjectId.isValid(applicationId)) {
        return next(
          createCustomError("Invalid Application ID", StatusCode.BAD_REQ)
        );
      }

      const {
        userDocuments = [],
        additionalNotes,
        requestedFeatures,
        status,
      } = req.body;

      // Find the existing application
      const application = await db.Application.findOne({
        _id: applicationId,
      });

      if (!application) {
        return next(
          createCustomError("Application not found", StatusCode.NOT_FOUND)
        );
      }

      // Validate user documents
      const validatedDocuments = await Promise.all(
        userDocuments.map(async (docId: string) => {
          const doc = await db.UserDocument.findOne({
            _id: docId,
            // userId: userId,
            subServiceId: application.subServiceId,
          });
          return doc ? doc._id : null;
        })
      );

      // Filter out null values
      const filteredDocuments = validatedDocuments.filter(
        (doc) => doc !== null
      );

      // Update application
      application.userDocuments = filteredDocuments;
      if (additionalNotes) application.additionalNotes = additionalNotes;
      if (requestedFeatures) application.requestedFeatures = requestedFeatures;

      // Only allow certain status changes
      const allowedStatusChanges = {
        draft: ["submitted"],
        submitted: ["draft"],
      };

      if (status) {
        application.status = status;
      }

      await application.save();

      const response = sendSuccessApiResponse(
        "Application updated successfully",
        {
          application,
          message: status
            ? status === "submitted"
              ? "Your application has been submitted for review"
              : "Application draft saved"
            : "Application updated",
        }
      );

      res.status(StatusCode.OK).send(response);
    } catch (error) {
      return next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

// Get All Applications for a Specific SubService
export const getAllApplicationsBySubService = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { subServiceId } = req.params;
      const {
        status,
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = req.query;

      const subService = await db.SubService.findById(subServiceId);
      if (!subService) {
        return next(
          createCustomError("Invalid SubService", StatusCode.BAD_REQ)
        );
      }

      // Build query
      const query: any = { subServiceId };
      if (status) query.status = status;

      // Pagination and sorting
      const skipIndex = (Number(page) - 1) * Number(limit);
      const sortOptions: any = {};
      sortOptions[sortBy as string] = sortOrder === "desc" ? -1 : 1;

      // Fetch applications with pagination and population
      const applications = await db.Application.find(query)
        .sort(sortOptions)
        .skip(skipIndex)
        .limit(Number(limit))
        .populate({
          path: "userId",
          select: "name email phone", // Select specific user fields
        })
        .populate({
          path: "userDocuments",
          select: "title documentType documentUrl",
        });

      // Count total matching documents
      const total = await db.Application.countDocuments(query);

      const response = sendSuccessApiResponse(
        "Applications retrieved successfully",
        {
          applications,
          pagination: {
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / Number(limit)),
          },
        }
      );

      res.status(StatusCode.OK).send(response);
    } catch (error) {
      return next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

/**
 * Get all pending free consultation requests
 * Admin can see all consultation requests that need price activation
 */
export const getAllPendingConsultations = bigPromise(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = req.query;

      // First, find all PaymentOrders with free_consultation status
      const freeConsultationOrders = await db.PaymentOrder.find({
        status: 'free_consultation'
      })
      .select('_id status paymentActivatedByAdmin consultationPrice activatedAt')
      .lean();

      const paymentOrderIds = freeConsultationOrders.map(order => order._id);

      // Find all UserPurchases that reference these payment orders
      const userPurchases = await db.UserPurchase.find({
        itemType: 'service',
        status: 'active',
        paymentOrderId: { $in: paymentOrderIds }
      })
      .populate({
        path: 'userId',
        select: 'fullName email phoneNumber'
      })
      .sort({ createdAt: -1 })
      .lean();

      // Create a map of payment order details for quick lookup
      const paymentOrderMap = new Map(
        freeConsultationOrders.map((order: any) => [order._id.toString(), order])
      );

      // Get unique service IDs to fetch service details
      const serviceIds = [...new Set(userPurchases.map((p: any) => p.itemId))];
      
      // Convert string IDs to ObjectIds for querying
      const objectIdServiceIds = serviceIds
        .filter((id: any) => mongoose.Types.ObjectId.isValid(id))
        .map((id: any) => new mongoose.Types.ObjectId(id));
      
      // Fetch all SubServices
      const subServices = await db.SubService.find({
        _id: { $in: objectIdServiceIds }
      })
      .select('_id title description')
      .lean();

      // Create a map of service details for quick lookup
      const serviceMap = new Map(
        subServices.map((service: any) => [service._id.toString(), service])
      );

      // Filter and map to consultation format
      const consultations = userPurchases
        .filter((purchase: any) => {
          const paymentOrderId = purchase.paymentOrderId?.toString();
          return paymentOrderMap.has(paymentOrderId);
        })
        .map((purchase: any) => {
          const user = purchase.userId as any;
          const paymentOrderId = purchase.paymentOrderId?.toString();
          const payment = paymentOrderMap.get(paymentOrderId);
          const serviceId = purchase.itemId?.toString();
          const service = serviceMap.get(serviceId);

          return {
            _id: purchase._id,
            purchaseId: purchase._id,
            userId: {
              _id: user?._id,
              fullName: user?.fullName || 'Unknown',
              email: user?.email || 'N/A',
              phoneNumber: user?.phoneNumber || 'N/A'
            },
            service: {
              _id: service?._id,
              title: service?.title || 'Unknown Service',
              description: service?.description || ''
            },
            selectedFeatures: purchase.selectedFeatures || [],
            billingPeriod: purchase.billingPeriod || 'monthly',
            status: payment?.paymentActivatedByAdmin ? 'activated' : 'pending',
            consultationPrice: payment?.consultationPrice || 0,
            paymentActivatedByAdmin: payment?.paymentActivatedByAdmin || false,
            activatedAt: payment?.activatedAt || null,
            createdAt: purchase.createdAt,
            updatedAt: purchase.updatedAt
          };
        });

      // Pagination
      const skipIndex = (Number(page) - 1) * Number(limit);
      const paginatedConsultations = consultations.slice(skipIndex, skipIndex + Number(limit));
      const total = consultations.length;

      const response = sendSuccessApiResponse(
        "Pending consultations retrieved successfully",
        {
          consultations: paginatedConsultations,
          pagination: {
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / Number(limit)),
          },
        }
      );

      res.status(StatusCode.OK).send(response);
    } catch (error: any) {
      return next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

/**
 * Activate payment for a free consultation service
 * Admin sets the price and activates payment option for user
 */
export const activateConsultationPayment = bigPromise(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { purchaseId } = req.params;
      const { price } = req.body; // Price set by admin

      if (!price || price <= 0) {
        return next(createCustomError("Valid price is required", StatusCode.BAD_REQ));
      }

      if (!mongoose.Types.ObjectId.isValid(purchaseId)) {
        return next(createCustomError("Invalid purchase ID", StatusCode.BAD_REQ));
      }

      // Find the UserPurchase with free consultation
      const purchase = await db.UserPurchase.findById(purchaseId)
        .populate('paymentOrderId');

      if (!purchase) {
        return next(createCustomError("Purchase not found", StatusCode.NOT_FOUND));
      }

      const paymentOrder = await db.PaymentOrder.findById(purchase.paymentOrderId);
      
      if (!paymentOrder) {
        return next(createCustomError("Payment order not found", StatusCode.NOT_FOUND));
      }

      if (paymentOrder.status !== 'free_consultation') {
        return next(createCustomError("This is not a consultation service", StatusCode.BAD_REQ));
      }

      // Update payment order with admin-set price
      paymentOrder.amount = price;
      paymentOrder.status = 'pending'; // Change to pending so user can pay
      paymentOrder.paymentActivatedByAdmin = true;
      paymentOrder.activatedAt = new Date();
      paymentOrder.activatedBy = req.user._id;
      paymentOrder.isConsultationPayment = true;
      paymentOrder.consultationPrice = price;
      
      // Update item price in the items array
      if (paymentOrder.items && paymentOrder.items.length > 0) {
        paymentOrder.items[0].price = price;
      }
      
      await paymentOrder.save();

      const response = sendSuccessApiResponse(
        "Payment activated successfully. User can now proceed with payment.",
        { 
          paymentOrder: {
            _id: paymentOrder._id,
            amount: paymentOrder.amount,
            status: paymentOrder.status,
            paymentActivatedByAdmin: paymentOrder.paymentActivatedByAdmin,
            activatedAt: paymentOrder.activatedAt
          },
          purchase: {
            _id: purchase._id,
            itemId: purchase.itemId,
            status: purchase.status
          }
        }
      );
      res.status(StatusCode.OK).send(response);
    } catch (error: any) {
      next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);
