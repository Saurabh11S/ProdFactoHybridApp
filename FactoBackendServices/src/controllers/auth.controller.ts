import { sendOTP, verifyOTP } from "@/config/twilio";
import { StatusCode } from "@/constants/constants";
import { createCustomError } from "@/errors/customAPIError";
import { IUser } from "@/interfaces";
import bigPromise from "@/middlewares/bigPromise";
import { sendSuccessApiResponse } from "@/middlewares/successApiResponse";
import { db } from "@/models";
import { NextFunction, Request, RequestHandler, Response } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h"; // Extended to 24 hours for better user experience

// Google OAuth Login
export const loginWithGoogle: RequestHandler = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { idToken, email, name, picture } = req.body;

      if (!idToken || !email) {
        return next(createCustomError("Google token and email are required", StatusCode.BAD_REQ));
      }

      // Verify Google token (in production, verify with Google's API)
      // For now, we'll trust the frontend and create/login user
      
      // Find or create user
      let user = await db.User.findOne({ email: email.toLowerCase() });

      if (!user) {
        // Create new user
        user = await db.User.create({
          email: email.toLowerCase(),
          fullName: name || email.split('@')[0],
          profilePictureUrl: picture,
          role: "user",
          registrationDate: new Date(),
        });
      } else {
        // Update profile picture if provided
        if (picture && !user.profilePictureUrl) {
          user.profilePictureUrl = picture;
        }
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Create token
      const token = jwt.sign(
        { userId: user._id, email: user.email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      // Remove password from response
      const userResponse = user.toObject();
      delete userResponse.password;

      const response = sendSuccessApiResponse("Google login successful", {
        user: userResponse,
        token,
      });

      res.status(StatusCode.OK).send(response);
    } catch (error: any) {
      return next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

// Facebook OAuth Login
export const loginWithFacebook: RequestHandler = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { accessToken, email, name, picture } = req.body;

      if (!accessToken || !email) {
        return next(createCustomError("Facebook token and email are required", StatusCode.BAD_REQ));
      }

      // Verify Facebook token (in production, verify with Facebook's API)
      // For now, we'll trust the frontend and create/login user
      
      // Find or create user
      let user = await db.User.findOne({ email: email.toLowerCase() });

      if (!user) {
        // Create new user
        user = await db.User.create({
          email: email.toLowerCase(),
          fullName: name || email.split('@')[0],
          profilePictureUrl: picture?.data?.url || picture,
          role: "user",
          registrationDate: new Date(),
        });
      } else {
        // Update profile picture if provided
        if (picture && !user.profilePictureUrl) {
          user.profilePictureUrl = picture?.data?.url || picture;
        }
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Create token
      const token = jwt.sign(
        { userId: user._id, email: user.email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      // Remove password from response
      const userResponse = user.toObject();
      delete userResponse.password;

      const response = sendSuccessApiResponse("Facebook login successful", {
        user: userResponse,
        token,
      });

      res.status(StatusCode.OK).send(response);
    } catch (error: any) {
      return next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);
  
  export const sendOtp: RequestHandler = bigPromise(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { phoneNo } = req.body;
  
        if (!phoneNo ) {
          return next(createCustomError("Phone number is required", StatusCode.BAD_REQ));
        }
  
      
        await sendOTP("+91"+String(phoneNo));
        

        
        const response = sendSuccessApiResponse(
          "OTP sent Successful!",
          {}
        );
  
        res.status(StatusCode.OK).send(response);
      } catch (error: any) {
        next(createCustomError(error.message, StatusCode.INT_SER_ERR));
      }
    }
  );

  export const verifyOtp: RequestHandler = bigPromise(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { phoneNo, otp } = req.body;
  
        if (!phoneNo || !otp) {
          return next(createCustomError("Phone Number and Otp are required", StatusCode.BAD_REQ));
        }
  
        // Find user and explicitly select password
        let user = await db.User.findOne({ phoneNumber:phoneNo });
  
        if (!user) {
          user = await db.User.create({phoneNumber:phoneNo});
        }
  
        // Compare password
        const status = await verifyOTP("+91"+String(phoneNo),otp)
        if(!(status=="approved")){
          return next(createCustomError("Invalid OTP", StatusCode.UNAUTH));
        }
        // Update last login
        user.lastLogin = new Date();
        await user.save();
  
        // Create token
        const token = jwt.sign(
          { userId: user._id, email: user.email },
          process.env.JWT_SECRET,
          { expiresIn: JWT_EXPIRES_IN }
        );
        // Remove password from response
        // const userResponse = user.toObject();
        // delete userResponse.password;
  
        const response = sendSuccessApiResponse(
          "Login Successful!",
          { user: user, token }
        );
  
        res.status(StatusCode.OK).send(response);
      } catch (error: any) {
        next(createCustomError(error.message, StatusCode.INT_SER_ERR));
      }
    }
  );

  // User Registration with Email/Password
  export const signup: RequestHandler = bigPromise(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { email, password, firstName, lastName, fullName, phoneNumber } = req.body;
  
        // Handle both firstName+lastName and fullName for flexibility
        let userFullName = fullName;
        if (firstName && lastName) {
          userFullName = `${firstName} ${lastName}`.trim();
        }
  
        if (!email || !password || !userFullName) {
          return next(createCustomError("Email, password, and name are required", StatusCode.BAD_REQ));
        }
  
        // Check if user already exists by email only (since phone number is optional)
        const existingUser = await db.User.findOne({ email: email.toLowerCase() });
  
        if (existingUser) {
          return next(createCustomError("User already exists with this email", StatusCode.CONFLICT));
        }
  
        // If phone number is provided, check if it's already in use
        if (phoneNumber && phoneNumber.trim() !== '') {
          const existingPhoneUser = await db.User.findOne({ phoneNumber });
          if (existingPhoneUser) {
            return next(createCustomError("Phone number is already registered", StatusCode.CONFLICT));
          }
        }
  
        // Create new user with minimal required fields
        const userData: any = {
          email: email.toLowerCase(),
          password, // In production, hash this with bcrypt
          fullName: userFullName,
          registrationDate: new Date(),
          role: 'user'
        };
  
        // Only add phone number if provided and not empty
        if (phoneNumber && phoneNumber.trim() !== '') {
          userData.phoneNumber = phoneNumber.trim();
        } else {
          // Explicitly exclude phoneNumber field if not provided
          delete userData.phoneNumber;
        }
  
        // Log the user data being created for debugging (remove in production)
        // console.log('Creating user with data:', JSON.stringify(userData, null, 2));
  
        // Create user without phone number if not provided
        const user = await db.User.create(userData);
  
        // Create token
        const token = jwt.sign(
          { userId: user._id, email: user.email },
          process.env.JWT_SECRET,
          { expiresIn: JWT_EXPIRES_IN }
        );
  
        const response = sendSuccessApiResponse(
          "Registration Successful!",
          { user: user, token }
        );
  
        res.status(StatusCode.CREATED).send(response);
      } catch (error: any) {
        next(createCustomError(error.message, StatusCode.INT_SER_ERR));
      }
    }
  );

  // Email/Password Login
  export const loginWithPassword: RequestHandler = bigPromise(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        console.log('\n🔐 === EMAIL/PASSWORD LOGIN START ===');
        console.log('📅 Timestamp:', new Date().toISOString());
        console.log('📦 Request body:', JSON.stringify(req.body, null, 2));
        
        const { email, password } = req.body;
  
        if (!email || !password) {
          console.log('❌ Missing email or password');
          console.log('❌ Email provided:', !!email);
          console.log('❌ Password provided:', !!password);
          return next(createCustomError("Email and password are required", StatusCode.BAD_REQ));
        }
  
        // Find user by email
        console.log('🔍 Searching for user with email:', email.toLowerCase());
        const user = await db.User.findOne({ email: email.toLowerCase() });
  
        if (!user) {
          console.log('❌ User not found for email:', email);
          return next(createCustomError("User not found", StatusCode.NOT_FOUND));
        }
        
        console.log('✅ User found:', user._id);
  
        // Check if user has a password set
        if (!user.password) {
          console.log('❌ User has no password set, should use OTP login');
          return next(createCustomError("Please use OTP login for this account", StatusCode.UNAUTH));
        }
  
        // Compare password (you should use bcrypt in production)
        console.log('🔐 Comparing passwords...');
        if (user.password !== password) {
          console.log('❌ Password mismatch');
          return next(createCustomError("Invalid password", StatusCode.UNAUTH));
        }
        
        console.log('✅ Password verified successfully');
  
        // Update last login
        console.log('📅 Updating last login time');
        user.lastLogin = new Date();
        await user.save();
  
        // Create token
        console.log('🎫 Creating JWT token');
        const token = jwt.sign(
          { userId: user._id, email: user.email },
          process.env.JWT_SECRET,
          { expiresIn: JWT_EXPIRES_IN }
        );
  
        console.log('✅ Login successful, sending response');
        const response = sendSuccessApiResponse(
          "Login Successful!",
          { user: user, token }
        );
  
        res.status(StatusCode.OK).send(response);
      } catch (error: any) {
        next(createCustomError(error.message, StatusCode.INT_SER_ERR));
      }
    }
  );

  // Test endpoint to create a test user
  export const createTestUser: RequestHandler = bigPromise(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const testUser = {
          email: process.env.TEST_USER_EMAIL || "test@example.com",
          password: process.env.TEST_USER_PASSWORD || "test123",
          fullName: "Test User",
          phoneNumber: "1234567890",
          role: "user"
        };

        // Check if test user already exists
        const existingUser = await db.User.findOne({ email: testUser.email });
        if (existingUser) {
          return res.status(200).json({
            success: true,
            message: "Test user already exists",
            data: { email: testUser.email, password: testUser.password }
          });
        }

        // Create test user
        const user = await db.User.create(testUser);
        
        res.status(201).json({
          success: true,
          message: "Test user created successfully",
          data: { 
            email: testUser.email, 
            password: testUser.password,
            fullName: testUser.fullName
          }
        });
      } catch (error: any) {
        next(createCustomError(error.message, StatusCode.INT_SER_ERR));
      }
    }
  );

// Token refresh endpoint
export const refreshToken: RequestHandler = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      
      if (!token) {
        return next(createCustomError('No token provided', StatusCode.UNAUTH));
      }

      // Verify the existing token (even if expired, we can still decode it)
      let decoded: any;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET) as { userId: string; email: string };
      } catch (error) {
        // If token is expired, try to decode without verification
        try {
          decoded = jwt.decode(token) as { userId: string; email: string };
        } catch (decodeError) {
          return next(createCustomError('Invalid token', StatusCode.UNAUTH));
        }
      }

      // Find the user
      const user = await db.User.findById(decoded.userId);
      if (!user) {
        return next(createCustomError('User not found', StatusCode.UNAUTH));
      }

      // Generate new token
      const newToken = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      // Remove password from response
      const userResponse = { ...user.toObject() };
      delete userResponse.password;

      const response = sendSuccessApiResponse("Token refreshed successfully", {
        user: userResponse,
        token: newToken,
      });

      res.status(StatusCode.OK).send(response);
    } catch (error: any) {
      next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

  // Export all functions as default
  export default {
    sendOtp,
    verifyOtp,
    signup,
    loginWithPassword,
    loginWithGoogle,
    loginWithFacebook,
    createTestUser,
    refreshToken
  };
  