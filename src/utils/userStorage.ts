// User-specific storage utility functions with Supabase database integration
// This ensures data isolation between different users and persistent storage

import { supabase } from '../config/supabase';

export class UserStorage {
  private static getUserId(): string {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        return user.id || 'anonymous';
      }
    } catch (error) {
      console.warn('Failed to get user ID from localStorage:', error);
    }
    return 'anonymous';
  }

  private static getUserKey(key: string): string {
    const userId = this.getUserId();
    return `user_${userId}_${key}`;
  }

  static setItem(key: string, value: any): void {
    try {
      const userKey = this.getUserKey(key);
      const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(userKey, serializedValue);
    } catch (error) {
      console.warn(`Failed to set user-specific item ${key}:`, error);
    }
  }

  static getItem(key: string): string | null {
    try {
      const userKey = this.getUserKey(key);
      return localStorage.getItem(userKey);
    } catch (error) {
      console.warn(`Failed to get user-specific item ${key}:`, error);
      return null;
    }
  }

  static getItemAsJSON<T>(key: string, defaultValue: T = null as T): T {
    try {
      const item = this.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`Failed to parse JSON for user-specific item ${key}:`, error);
      return defaultValue;
    }
  }

  static removeItem(key: string): void {
    try {
      const userKey = this.getUserKey(key);
      localStorage.removeItem(userKey);
    } catch (error) {
      console.warn(`Failed to remove user-specific item ${key}:`, error);
    }
  }

  static clear(): void {
    try {
      const userId = this.getUserId();
      const prefix = `user_${userId}_`;
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.warn('Failed to clear user-specific data:', error);
    }
  }

  // Migration helper to convert old global bookmarks to user-specific
  static migrateOldBookmarks(): void {
    try {
      const userId = this.getUserId();
      if (userId === 'anonymous') return;

      // Check if we have old global bookmarks
      const oldBookmarks = localStorage.getItem('local_bookmarks');
      const oldBookmarkItems = localStorage.getItem('local_bookmark_items');

      if (oldBookmarks && !this.getItem('bookmarks')) {
        // Migrate old data to user-specific keys
        this.setItem('bookmarks', oldBookmarks);
        
        if (oldBookmarkItems) {
          this.setItem('bookmark_items', oldBookmarkItems);
        }

        console.log('Migrated old bookmarks to user-specific storage');
      }
    } catch (error) {
      console.warn('Failed to migrate old bookmarks:', error);
    }
  }

  // Bookmark-specific helper methods
  static getBookmarks(): string[] {
    this.migrateOldBookmarks();
    return this.getItemAsJSON<string[]>('bookmarks', []);
  }

  static setBookmarks(bookmarks: string[]): void {
    this.setItem('bookmarks', bookmarks);
    // Dispatch event to notify components
    window.dispatchEvent(new CustomEvent('bookmarks:changed'));
  }

  static getBookmarkItems(): Record<string, any> {
    return this.getItemAsJSON<Record<string, any>>('bookmark_items', {});
  }

  static setBookmarkItems(items: Record<string, any>): void {
    this.setItem('bookmark_items', items);
  }

  static addBookmark(serviceId: string, serviceData?: any): void {
    const bookmarks = this.getBookmarks();
    if (!bookmarks.includes(serviceId)) {
      bookmarks.push(serviceId);
      this.setBookmarks(bookmarks);

      if (serviceData) {
        const items = this.getBookmarkItems();
        items[serviceId] = serviceData;
        this.setBookmarkItems(items);
      }
    }
  }

  static removeBookmark(serviceId: string): void {
    const bookmarks = this.getBookmarks();
    const newBookmarks = bookmarks.filter(id => id !== serviceId);
    this.setBookmarks(newBookmarks);

    const items = this.getBookmarkItems();
    if (items[serviceId]) {
      delete items[serviceId];
      this.setBookmarkItems(items);
    }
  }

  static isBookmarked(serviceId: string): boolean {
    return this.getBookmarks().includes(serviceId);
  }

  // =================== SUPABASE DATABASE METHODS ===================
  // These methods handle wishlist data persistence in Supabase database

  static async getUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }

  static async getWishlistFromDB(): Promise<string[]> {
    try {
      const user = await this.getUser();
      if (!user) {
        console.log('No user logged in, returning empty wishlist');
        return [];
      }

      const { data, error } = await supabase
        .from('wishlists')
        .select('service_id')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching wishlist from database:', error);
        return [];
      }

      return data.map(item => item.service_id);
    } catch (error) {
      console.error('Failed to get wishlist from database:', error);
      return [];
    }
  }

  static async getWishlistItemsFromDB(): Promise<Record<string, any>> {
    try {
      const user = await this.getUser();
      if (!user) return {};

      const { data, error } = await supabase
        .from('wishlists')
        .select('service_id, service_data')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching wishlist items from database:', error);
        return {};
      }

      const items: Record<string, any> = {};
      data.forEach(item => {
        items[item.service_id] = item.service_data;
      });

      return items;
    } catch (error) {
      console.error('Failed to get wishlist items from database:', error);
      return {};
    }
  }

  static async addToWishlistDB(serviceId: string, serviceData?: any): Promise<boolean> {
    try {
      const user = await this.getUser();
      if (!user) {
        console.error('No user logged in, cannot add to wishlist');
        return false;
      }

      const { error } = await supabase
        .from('wishlists')
        .upsert({
          user_id: user.id,
          service_id: serviceId,
          service_data: serviceData || {},
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error adding to wishlist in database:', error);
        return false;
      }

      // Dispatch event to notify components
      window.dispatchEvent(new CustomEvent('wishlist:changed'));
      return true;
    } catch (error) {
      console.error('Failed to add to wishlist in database:', error);
      return false;
    }
  }

  static async removeFromWishlistDB(serviceId: string): Promise<boolean> {
    try {
      const user = await this.getUser();
      if (!user) {
        console.error('No user logged in, cannot remove from wishlist');
        return false;
      }

      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('user_id', user.id)
        .eq('service_id', serviceId);

      if (error) {
        console.error('Error removing from wishlist in database:', error);
        return false;
      }

      // Dispatch event to notify components
      window.dispatchEvent(new CustomEvent('wishlist:changed'));
      return true;
    } catch (error) {
      console.error('Failed to remove from wishlist in database:', error);
      return false;
    }
  }

  static async isInWishlistDB(serviceId: string): Promise<boolean> {
    try {
      const user = await this.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from('wishlists')
        .select('id')
        .eq('user_id', user.id)
        .eq('service_id', serviceId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('Error checking wishlist in database:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Failed to check wishlist in database:', error);
      return false;
    }
  }

  // Migration function to move localStorage data to Supabase
  static async migrateWishlistToDatabase(): Promise<void> {
    try {
      const user = await this.getUser();
      if (!user) {
        console.log('No user logged in, skipping migration');
        return;
      }

      // Get existing wishlist from localStorage
      const localBookmarks = this.getBookmarks();
      const localBookmarkItems = this.getBookmarkItems();

      if (localBookmarks.length === 0) {
        console.log('No local bookmarks to migrate');
        return;
      }

      console.log(`Migrating ${localBookmarks.length} bookmarks to database...`);

      // Add each bookmark to the database
      for (const serviceId of localBookmarks) {
        const serviceData = localBookmarkItems[serviceId] || {};
        await this.addToWishlistDB(serviceId, serviceData);
      }

      console.log('Migration completed successfully');

      // Clear local storage after successful migration
      this.setBookmarks([]);
      this.setBookmarkItems({});
      
    } catch (error) {
      console.error('Failed to migrate wishlist to database:', error);
    }
  }
}