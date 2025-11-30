import { StatusCode } from "@/constants/constants";
import { createCustomError } from "@/errors/customAPIError";
import bigPromise from "@/middlewares/bigPromise";
import { sendSuccessApiResponse } from "@/middlewares/successApiResponse";
import { db } from "@/models";
import { NextFunction, Request, Response } from "express";
import { sendConsultationConfirmationToUser, sendConsultationNotificationToAdmin } from "@/utils/emailService";
import { getTwilioClient, sendWhatsAppMessage } from "@/config/twilio";

export const addQuery = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, phoneNo, query } = req.body;
      if (!name || !email || !phoneNo || !query) {
        return next(
          createCustomError("All fields are required", StatusCode.BAD_REQ)
        );
      }
      const newQuery = await db.Query.create({
        name,
        email,
        phoneNo,
        query,
      });
      const response = sendSuccessApiResponse(
        "Query added successfully",
        newQuery
      );
      res.status(StatusCode.OK).send(response);
    } catch (error: any) {
      next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

/**
 * Schedule Free Consultation - Creates a consultation request
 * Sends email/SMS to user and admin
 */
export const scheduleConsultation = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, phoneNo, query, category } = req.body;

      // Validate required fields
      if (!name || !query || !category) {
        return next(
          createCustomError("Name, query, and category are required", StatusCode.BAD_REQ)
        );
      }

      // At least one contact method is required
      if (!email && !phoneNo) {
        return next(
          createCustomError("Either email or phone number is required", StatusCode.BAD_REQ)
        );
      }

      // Validate email format if provided
      if (email && !/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(email)) {
        return next(
          createCustomError("Please enter a valid email address", StatusCode.BAD_REQ)
        );
      }

      // Validate phone number format if provided (10-digit Indian number)
      if (phoneNo && !/^[6-9]\d{9}$/.test(phoneNo.toString())) {
        return next(
          createCustomError("Please enter a valid 10-digit Indian mobile number", StatusCode.BAD_REQ)
        );
      }

      // Create consultation query in database
      const consultationQuery = await db.Query.create({
        name,
        email: email || 'not-provided@example.com', // Required field, use placeholder if not provided
        phoneNo: phoneNo || 9999999999, // Required field, use placeholder if not provided
        query: query || `Consultation request for ${category}`,
        category: category || 'consultation',
      });

      // Send notifications (non-blocking)
      const adminEmail = process.env.ADMIN_EMAIL || 'facto.m.consultancy@gmail.com';
      
      // Send email to user if email is provided
      if (email) {
        try {
          console.log('📧 Attempting to send email to user:', email);
          await sendConsultationConfirmationToUser(email, name, category);
          console.log('✅ Email sent successfully to user');
        } catch (emailError: any) {
          console.error('❌ Failed to send email to user:', emailError.message || emailError);
          // Don't fail the request if email fails
        }
      }

      // Send SMS to user if phone number is provided
      if (phoneNo) {
        try {
          const twilioClient = getTwilioClient();
          const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
          if (twilioPhoneNumber) {
            const smsMessage = `Thank you ${name}! We have received your consultation request for ${category}. Our team will contact you within 24-48 hours. - FACTO Consultancy`;
            const message = await twilioClient.messages.create({
              body: smsMessage,
              from: twilioPhoneNumber,
              to: `+91${phoneNo}`,
            });
            console.log('✅ SMS sent to user:', message.sid);
          } else {
            console.warn('⚠️ TWILIO_PHONE_NUMBER not set. Skipping SMS to user.');
          }
        } catch (smsError: any) {
          console.error('❌ Failed to send SMS to user:', smsError.message || smsError);
          // Don't fail the request if SMS fails
        }
      }

      // Send WhatsApp message to user if phone number is provided
      if (phoneNo) {
        try {
          const whatsappMessage = `Thank you ${name}! 🙏\n\nWe have received your consultation request for *${category}*.\n\nOur expert team will review your request and get back to you within 24-48 hours.\n\nWe appreciate your interest in FACTO Consultancy services.\n\nBest regards,\nFACTO Consultancy Team`;
          await sendWhatsAppMessage(`+91${phoneNo}`, whatsappMessage);
          console.log('✅ WhatsApp message sent to user');
        } catch (whatsappError: any) {
          console.error('❌ Failed to send WhatsApp message to user:', whatsappError.message || whatsappError);
          // Don't fail the request if WhatsApp fails
        }
      }

      // Send email to admin
      try {
        console.log('📧 Attempting to send email to admin:', adminEmail);
        await sendConsultationNotificationToAdmin(adminEmail, {
          name,
          email: email || 'Not provided',
          phoneNo: phoneNo ? `+91${phoneNo}` : 'Not provided',
          category,
          query: query || `Consultation request for ${category}`,
        });
        console.log('✅ Email sent successfully to admin');
      } catch (adminEmailError: any) {
        console.error('❌ Failed to send email to admin:', adminEmailError.message || adminEmailError);
        // Don't fail the request if admin email fails
      }

      // Send SMS to admin (optional - you can remove this if not needed)
      try {
        const twilioClient = getTwilioClient();
        const adminPhone = process.env.ADMIN_PHONE_NUMBER; // Set this in .env if you want admin SMS
        const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
        if (adminPhone && twilioPhoneNumber) {
          await twilioClient.messages.create({
            body: `New consultation request: ${name} (${category}). Email: ${email || 'N/A'}, Phone: ${phoneNo || 'N/A'}`,
            from: twilioPhoneNumber,
            to: adminPhone,
          });
          console.log('✅ SMS sent to admin');
        }
      } catch (adminSmsError: any) {
        console.error('❌ Failed to send SMS to admin:', adminSmsError.message || adminSmsError);
        // Don't fail the request if admin SMS fails
      }

      // Send WhatsApp message to admin (optional)
      try {
        const adminPhone = process.env.ADMIN_PHONE_NUMBER;
        if (adminPhone) {
          const whatsappMessage = `🔔 *New Consultation Request*\n\n*Name:* ${name}\n*Category:* ${category}\n*Email:* ${email || 'Not provided'}\n*Phone:* ${phoneNo ? `+91${phoneNo}` : 'Not provided'}\n*Message:* ${query || `Consultation request for ${category}`}\n\nPlease review this request in the Admin Panel.`;
          await sendWhatsAppMessage(adminPhone, whatsappMessage);
          console.log('✅ WhatsApp message sent to admin');
        }
      } catch (adminWhatsappError: any) {
        console.error('❌ Failed to send WhatsApp message to admin:', adminWhatsappError.message || adminWhatsappError);
        // Don't fail the request if admin WhatsApp fails
      }

      const response = sendSuccessApiResponse(
        "Consultation request submitted successfully. We will contact you soon!",
        {
          consultationId: consultationQuery._id,
          message: "Your consultation request has been received. Our team will contact you within 24-48 hours.",
        }
      );
      res.status(StatusCode.OK).send(response);
    } catch (error: any) {
      next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);
