/**
 * Billing period multipliers for additional options
 * These multipliers are used to calculate the total price of additional options
 * based on the selected billing period.
 * 
 * Example: If an additional option costs ₹1,000/month:
 * - Monthly: ₹1,000 × 1 = ₹1,000
 * - Quarterly: ₹1,000 × 3 = ₹3,000
 * - Half-Yearly: ₹1,000 × 6 = ₹6,000
 * - Yearly: ₹1,000 × 12 = ₹12,000
 * - One-Time: ₹1,000 × 1 = ₹1,000
 */
export const BILLING_MULTIPLIERS: Record<string, number> = {
  monthly: 1,
  quarterly: 3,
  half_yearly: 6,
  yearly: 12,
  one_time: 1
};

/**
 * Get the multiplier for a given billing period
 * @param period - The billing period (monthly, quarterly, half_yearly, yearly, one_time)
 * @returns The multiplier value (defaults to 1 if period is invalid)
 */
export const getBillingPeriodMultiplier = (period: string): number => {
  return BILLING_MULTIPLIERS[period] || 1;
};

/**
 * Calculate the adjusted price for an additional option based on billing period
 * @param basePrice - The base price of the additional option (monthly rate)
 * @param billingPeriod - The selected billing period
 * @returns The adjusted price after applying the billing period multiplier
 */
export const calculateAdjustedPrice = (basePrice: number, billingPeriod: string): number => {
  const multiplier = getBillingPeriodMultiplier(billingPeriod);
  return basePrice * multiplier;
};

/**
 * Get a formatted period label for display
 * @param period - The billing period
 * @returns A formatted label (e.g., "Monthly", "Quarterly", "One-Time")
 */
export const getPeriodLabel = (period: string): string => {
  if (period === 'one_time') {
    return 'One-Time';
  }
  return period.charAt(0).toUpperCase() + period.slice(1).replace('_', ' ');
};

