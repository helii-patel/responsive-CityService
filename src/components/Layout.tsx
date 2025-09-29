import React, { useState, useEffect } from 'react';
import { MapPin, User, Heart, BarChart3, Calculator } from 'lucide-react';
import { UserStorage } from '../utils/userStorage';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentPage, onPageChange }) => {
  const [wishlistCount, setWishlistCount] = useState(0);
  const [showCountAnimation, setShowCountAnimation] = useState(false);

  // Listen for bookmark changes to update count and show animation
  useEffect(() => {
    const updateWishlistCount = async () => {
      try {
        // Get current user from localStorage or auth state
        const userData = localStorage.getItem('user');
        const user = userData ? JSON.parse(userData) : null;
        
        if (!user) {
          setWishlistCount(0);
          return;
        }

        const bookmarks = await UserStorage.getWishlistFromDB();
        const count = bookmarks.length;
        const prevCount = wishlistCount;
        
        setWishlistCount(count);
        
        // Show animation when count increases (item added)
        if (count > prevCount && prevCount > 0) {
          setShowCountAnimation(true);
          setTimeout(() => setShowCountAnimation(false), 1000);
        }
      } catch (e) {
        setWishlistCount(0);
      }
    };

    // Initial count
    updateWishlistCount();

    // Listen for changes
    const handler = () => updateWishlistCount();
    window.addEventListener('bookmarks:changed', handler);
    window.addEventListener('wishlist:changed', handler);

    return () => {
      window.removeEventListener('bookmarks:changed', handler);
      window.removeEventListener('wishlist:changed', handler);
    };
  }, [wishlistCount]);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'search', label: 'Find Services', icon: MapPin },
    { id: 'calculator', label: 'Cost Calculator', icon: Calculator },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-slate-800">CityServices</h1>
            </div>
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isWishlist = item.id === 'wishlist';
                return (
                  <button
                    key={item.id}
                    onClick={() => onPageChange(item.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative ${
                      currentPage === item.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                    {isWishlist && wishlistCount > 0 && (
                      <div className={`absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center transition-all duration-300 ${
                        showCountAnimation ? 'animate-bounce scale-125' : 'scale-100'
                      }`}>
                        {wishlistCount}
                      </div>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isWishlist = item.id === 'wishlist';
            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors relative ${
                  currentPage === item.id
                    ? 'text-blue-600'
                    : 'text-slate-500'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{item.label}</span>
                {isWishlist && wishlistCount > 0 && (
                  <div className={`absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center transition-all duration-300 ${
                    showCountAnimation ? 'animate-bounce scale-125' : 'scale-100'
                  }`}>
                    {wishlistCount}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};