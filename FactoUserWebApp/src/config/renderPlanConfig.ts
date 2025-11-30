/**
 * Render.com Plan Configuration
 * 
 * This file helps optimize the app based on your Render.com plan.
 * Update RENDER_PLAN_TYPE based on your current plan.
 */

export type RenderPlanType = 'free' | 'starter' | 'standard' | 'pro' | 'pro-plus' | 'pro-max' | 'pro-ultra';

/**
 * ⚠️ IMPORTANT: Update this based on your Render.com plan
 * 
 * Current options:
 * - 'free': Free tier (spins down after 15 min, 30-60s wake-up)
 * - 'starter': $7/month (always awake, 512MB RAM, 0.5 CPU)
 * - 'standard': $25/month (always awake, 2GB RAM, 1 CPU) ⭐ RECOMMENDED
 * - 'pro': $85/month (always awake, 4GB RAM, 2 CPU)
 * - 'pro-plus': $175/month (always awake, 8GB RAM, 4 CPU)
 * - 'pro-max': $225/month (always awake, 16GB RAM, 4 CPU)
 * - 'pro-ultra': $450/month (always awake, 32GB RAM, 8 CPU)
 */
export const RENDER_PLAN_TYPE: RenderPlanType = 'free'; // ⚠️ CHANGE THIS when you upgrade!

/**
 * Plan configuration
 */
export const RENDER_PLAN_CONFIG = {
  free: {
    name: 'Free Tier',
    alwaysAwake: false,
    wakeUpTime: 30000, // 30-60 seconds
    recommendedTimeout: 120000, // 120 seconds
    wakeUpWaitTime: 5000, // 5 seconds initial wait
    retryDelays: [10000, 15000, 20000], // Progressive retry delays
    needsWakeUp: true,
  },
  starter: {
    name: 'Starter ($7/month)',
    alwaysAwake: true,
    wakeUpTime: 0,
    recommendedTimeout: 30000, // 30 seconds (service is always awake)
    wakeUpWaitTime: 0, // No wait needed
    retryDelays: [2000, 3000, 5000], // Shorter retries
    needsWakeUp: false,
  },
  standard: {
    name: 'Standard ($25/month) ⭐ RECOMMENDED',
    alwaysAwake: true,
    wakeUpTime: 0,
    recommendedTimeout: 30000, // 30 seconds
    wakeUpWaitTime: 0,
    retryDelays: [2000, 3000, 5000],
    needsWakeUp: false,
  },
  pro: {
    name: 'Pro ($85/month)',
    alwaysAwake: true,
    wakeUpTime: 0,
    recommendedTimeout: 30000,
    wakeUpWaitTime: 0,
    retryDelays: [2000, 3000, 5000],
    needsWakeUp: false,
  },
  'pro-plus': {
    name: 'Pro Plus ($175/month)',
    alwaysAwake: true,
    wakeUpTime: 0,
    recommendedTimeout: 30000,
    wakeUpWaitTime: 0,
    retryDelays: [2000, 3000, 5000],
    needsWakeUp: false,
  },
  'pro-max': {
    name: 'Pro Max ($225/month)',
    alwaysAwake: true,
    wakeUpTime: 0,
    recommendedTimeout: 30000,
    wakeUpWaitTime: 0,
    retryDelays: [2000, 3000, 5000],
    needsWakeUp: false,
  },
  'pro-ultra': {
    name: 'Pro Ultra ($450/month)',
    alwaysAwake: true,
    wakeUpTime: 0,
    recommendedTimeout: 30000,
    wakeUpWaitTime: 0,
    retryDelays: [2000, 3000, 5000],
    needsWakeUp: false,
  },
} as const;

/**
 * Get current plan configuration
 */
export const getRenderPlanConfig = () => {
  return RENDER_PLAN_CONFIG[RENDER_PLAN_TYPE];
};

/**
 * Check if backend needs wake-up (free tier only)
 */
export const needsWakeUp = (): boolean => {
  return getRenderPlanConfig().needsWakeUp;
};

/**
 * Get recommended timeout for API requests
 */
export const getRecommendedTimeout = (): number => {
  return getRenderPlanConfig().recommendedTimeout;
};

/**
 * Get wake-up wait time (0 for paid plans)
 */
export const getWakeUpWaitTime = (): number => {
  return getRenderPlanConfig().wakeUpWaitTime;
};

/**
 * Get retry delays based on plan
 */
export const getRetryDelays = (): readonly number[] => {
  return getRenderPlanConfig().retryDelays;
};

