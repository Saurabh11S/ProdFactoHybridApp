import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';

/**
 * Unified storage interface for web and mobile
 * Automatically uses Capacitor Preferences on mobile, localStorage on web
 */
export const Storage = {
  /**
   * Get a value from storage
   */
  async get(key: string): Promise<string | null> {
    if (Capacitor.isNativePlatform()) {
      // Mobile - use Capacitor Preferences (secure storage)
      const { value } = await Preferences.get({ key });
      return value;
    } else {
      // Web - use localStorage
      return localStorage.getItem(key);
    }
  },

  /**
   * Set a value in storage
   */
  async set(key: string, value: string): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      // Mobile - use Capacitor Preferences
      await Preferences.set({ key, value });
    } else {
      // Web - use localStorage
      localStorage.setItem(key, value);
    }
  },

  /**
   * Remove a value from storage
   */
  async remove(key: string): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      // Mobile - use Capacitor Preferences
      await Preferences.remove({ key });
    } else {
      // Web - use localStorage
      localStorage.removeItem(key);
    }
  },

  /**
   * Clear all storage
   */
  async clear(): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      // Mobile - use Capacitor Preferences
      await Preferences.clear();
    } else {
      // Web - use localStorage
      localStorage.clear();
    }
  }
};

