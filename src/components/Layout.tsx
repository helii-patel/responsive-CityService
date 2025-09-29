import React, { useState, useEffect } from 'react';
import { MapPin, User, Heart, BarChart3, Calculator, Search, LogOut } from 'lucide-react';
import { UserStorage } from '../utils/userStorage';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
  onSignOut?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentPage, onPageChange, onSignOut }) => {
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
    { id: 'search', label: 'Find Services', icon: Search },
    { id: 'calculator', label: 'Calculator', icon: Calculator },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-slate-700 rounded-xl flex items-center justify-center shadow-sm">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">CityServices</h1>
                <p className="text-xs text-slate-500 hidden sm:block">Smart City Living</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isWishlist = item.id === 'wishlist';
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onPageChange(item.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative ${
                      isActive
                        ? 'bg-slate-700 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
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

            {/* Sign Out Button */}
            {onSignOut && (
              <div className="flex items-center space-x-3">
                <button 
                  onClick={onSignOut}
                  className="flex items-center space-x-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 lg:px-8 py-8 pb-24 md:pb-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 backdrop-blur-sm bg-white/95">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isWishlist = item.id === 'wishlist';
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-all duration-200 relative ${
                  isActive
                    ? 'text-slate-700'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
                {isActive && (
                  <div className="w-4 h-0.5 bg-slate-700 rounded-full mt-1"></div>
                )}
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
          {onSignOut && (
            <button
              onClick={onSignOut}
              className="flex flex-col items-center space-y-1 p-2 rounded-lg transition-all duration-200 text-red-500 hover:text-red-600"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-xs font-medium">Sign Out</span>
            </button>
          )}
        </div>
      </nav>
    </div>
  );
};