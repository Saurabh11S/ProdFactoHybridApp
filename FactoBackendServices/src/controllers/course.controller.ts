import { StatusCode } from "@/constants/constants";
import { createCustomError } from "@/errors/customAPIError";
import { AuthRequest } from "@/middlewares/auth";
import bigPromise from "@/middlewares/bigPromise";
import { sendSuccessApiResponse } from "@/middlewares/successApiResponse";
import { db } from "@/models";
import { Request, Response, NextFunction } from "express";

export const getCourses = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log('\n📚 === FETCHING PUBLISHED COURSES ===');
      console.log('📅 Timestamp:', new Date().toISOString());
      
      // Get all published courses with all lectures (not just free ones)
      // This allows the frontend to show course previews with free lectures unlocked
      // Use .lean() to return plain JavaScript objects for proper JSON serialization
      const courses = await db.Course.find({ status: "published" }).populate({
        path: "lectures",
        // Don't filter by isFree here - let frontend handle which lectures to show
      }).lean();
      
      console.log(`✅ Found ${courses.length} published courses:`);
      courses.forEach((course, index) => {
        console.log(`  ${index + 1}. ${course.title}`);
        console.log(`     - ID: ${course._id}`);
        console.log(`     - Status: ${course.status}`);
        console.log(`     - Category: ${course.category}`);
        console.log(`     - Price: ₹${course.price}`);
        console.log(`     - Lectures: ${course.lectures?.length || 0}`);
      });
      
      // Also check total courses (including drafts) for debugging
      const totalCourses = await db.Course.countDocuments();
      const draftCourses = await db.Course.countDocuments({ status: "draft" });
      console.log(`📊 Total courses in DB: ${totalCourses} (${draftCourses} drafts, ${courses.length} published)`);
      
      // Wrap courses array in an object for sendSuccessApiResponse
      const response = sendSuccessApiResponse(
        "Courses Fetched Successfully",
        { courses: courses }
      );
      
      console.log('📦 Response structure:', {
        success: response.success,
        dataType: typeof response.data,
        hasCourses: !!(response.data as any)?.courses,
        coursesCount: (response.data as any)?.courses?.length || 0
      });
      console.log('📚 === COURSES FETCH COMPLETE ===\n');
      
      res.status(StatusCode.OK).send(response);
    } catch (error) {
      console.error('❌ Error fetching courses:', error);
      next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

export const getCourseById = bigPromise(
  async (req: Request | AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { courseId } = req.params;
      const userId = (req as AuthRequest).user?.id; // Get user ID if authenticated

      // Check if user has purchased this course
      let isPurchased = false;
      if (userId) {
        const userPurchase = await db.UserPurchase.findOne({
          userId: userId,
          itemId: courseId,
          itemType: 'course',
          status: 'active'
        });
        isPurchased = !!userPurchase;
      }

      // If user has purchased the course, return all lectures
      // Otherwise, return only free lectures
      const course = await db.Course.findById(courseId).populate({
        path: "lectures",
        match: isPurchased ? {} : { isFree: true }, // Return all lectures if purchased, only free if not
      });

      // Add purchase status to course object
      const courseWithPurchaseStatus = {
        ...course.toObject(),
        isPurchased: isPurchased
      };

      const response = sendSuccessApiResponse(
        "Course Fetched Successfully",
        courseWithPurchaseStatus
      );
      res.status(StatusCode.OK).send(response);
    } catch (error) {
      next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

export const getYourCourses = bigPromise(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user.id; // Assuming you have middleware that attaches user info to the request

      // Find all user purchases of type 'course'
      const userPurchases = await db.UserPurchase.find({ 
        userId: userId, 
        itemType: 'course' 
      });

      // Extract course IDs from purchases
      const purchasedCourseIds = userPurchases.map(purchase => purchase.itemId);

      // Fetch full course details for purchased courses
      const courses = await db.Course.find({
        _id: { $in: purchasedCourseIds },
        status: 'published'
      }).populate({
        path: 'lectures'
      });

      const response = sendSuccessApiResponse(
        "Your Purchased Courses",
        courses
      );
      
      res.status(StatusCode.OK).send(response);
    } catch (error) {
      next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);





