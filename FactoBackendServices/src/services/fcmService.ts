import * as admin from 'firebase-admin';
import { db } from '@/models';

// Initialize Firebase Admin SDK
// Note: You'll need to add your Firebase service account key JSON file
// and initialize Firebase Admin. For now, we'll check if it's initialized.
let firebaseInitialized = false;

/**
 * Initialize Firebase Admin SDK
 * Call this function at server startup with your service account key
 */
export const initializeFirebase = (serviceAccountKey?: any) => {
  try {
    if (admin.apps.length === 0) {
      if (serviceAccountKey) {
        // Initialize with service account key
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccountKey),
        });
        firebaseInitialized = true;
        console.log('✅ Firebase Admin SDK initialized successfully');
      } else if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        // Initialize with environment variable (base64 encoded JSON)
        const serviceAccount = JSON.parse(
          Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_KEY, 'base64').toString()
        );
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
        firebaseInitialized = true;
        console.log('✅ Firebase Admin SDK initialized successfully');
      } else {
        // Skip initialization if no credentials provided (for local development)
        // Firebase will be initialized later when credentials are available
        firebaseInitialized = false;
        console.log('⚠️ Firebase Admin SDK not initialized - no credentials provided. Push notifications will be disabled.');
      }
    } else {
      firebaseInitialized = true;
      console.log('✅ Firebase Admin SDK already initialized');
    }
  } catch (error) {
    console.error('❌ Error initializing Firebase Admin SDK:', error);
    firebaseInitialized = false;
  }
};

/**
 * Send push notification to a single user
 */
export const sendPushNotification = async (
  userId: string,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<void> => {
  if (!firebaseInitialized) {
    console.warn('⚠️ Firebase not initialized, skipping push notification');
    return;
  }

  try {
    const user = await db.User.findById(userId);
    if (!user || !user.pushToken) {
      console.log(`User ${userId} not found or has no push token`);
      return;
    }

    const message = {
      notification: {
        title,
        body,
      },
      data: data || {},
      token: user.pushToken,
      android: {
        priority: 'high' as const,
        notification: {
          sound: 'default',
          channelId: 'default',
        },
      },
    };

    const response = await admin.messaging().send(message);
    console.log(`✅ Successfully sent push notification to user ${userId}:`, response);
  } catch (error: any) {
    console.error(`❌ Error sending push notification to user ${userId}:`, error);
    // Don't throw - allow the request to continue even if push fails
  }
};

/**
 * Send push notification to all users with registered push tokens
 */
export const sendPushNotificationToAllUsers = async (
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<void> => {
  if (!firebaseInitialized) {
    console.warn('⚠️ Firebase not initialized, skipping push notification');
    return;
  }

  try {
    // Find all users with push tokens (not null, not empty string)
    const users = await db.User.find({
      pushToken: { $exists: true, $ne: null, $nin: [''] },
    }).select('pushToken');

    if (users.length === 0) {
      console.log('No users with push tokens found');
      return;
    }

    const tokens = users
      .map((u) => u.pushToken)
      .filter((token): token is string => Boolean(token));

    if (tokens.length === 0) {
      console.log('No valid push tokens found');
      return;
    }

    console.log(`📤 Sending push notification to ${tokens.length} users`);

    // Send to multiple tokens using multicast
    const message = {
      notification: {
        title,
        body,
      },
      data: data || {},
      android: {
        priority: 'high' as const,
        notification: {
          sound: 'default',
          channelId: 'default',
        },
      },
    };

    const response = await admin.messaging().sendEachForMulticast({
      ...message,
      tokens,
    });

    console.log(`✅ Successfully sent ${response.successCount} push notifications`);
    if (response.failureCount > 0) {
      console.warn(`⚠️ Failed to send ${response.failureCount} push notifications`);
      
      // Log failed tokens for cleanup
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          console.error(`Failed token ${tokens[idx]}:`, resp.error);
        }
      });
    }

    return;
  } catch (error: any) {
    console.error('❌ Error sending push notifications to all users:', error);
    // Don't throw - allow the request to continue even if push fails
  }
};

/**
 * Check if Firebase is initialized
 */
export const isFirebaseInitialized = (): boolean => {
  return firebaseInitialized && admin.apps.length > 0;
};

