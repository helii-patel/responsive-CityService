import React, { useEffect, useState } from 'react';
import { MapPin, Star, Trash2 } from 'lucide-react';
import mockServices, { Service } from '../data/mockServices';
import { ServiceDetails } from './ServiceDetails';
import { UserStorage } from '../utils/userStorage';

interface WishlistProps {
  user?: any;
  onAuthRequired?: () => void;
}

export const Wishlist: React.FC<WishlistProps> = ({ user, onAuthRequired }) => {
  const [wishlistServices, setWishlistServices] = useState<Service[]>([]);
  const [selected, setSelected] = useState<Service | null>(null);

  const loadWishlist = async () => {
    try {
      if (!user) {
        // Show empty wishlist for unauthenticated users
        setWishlistServices([]);
        return;
      }

      // First try to migrate any local data to database
      await UserStorage.migrateWishlistToDatabase();
      
      // Load wishlist from database
      const ids = await UserStorage.getWishlistFromDB();
      const map = await UserStorage.getWishlistItemsFromDB();
      
      const items = ids
        .map(id => (map[id] as Service) || mockServices.find(s => s.id === id))
        .filter((s): s is Service => Boolean(s));
      
      setWishlistServices(items);
    } catch (e) {
      console.warn('Failed to load user wishlist from database', e);
      setWishlistServices([]);
    }
  };

  useEffect(() => {
    loadWishlist();
  }, []);

  useEffect(() => {
    const handler = () => {
      loadWishlist();
    };
    // Listen for both localStorage and database changes
    window.addEventListener('bookmarks:changed', handler);
    window.addEventListener('wishlist:changed', handler);
    return () => {
      window.removeEventListener('bookmarks:changed', handler);
      window.removeEventListener('wishlist:changed', handler);
    };
  }, []);

  const removeLocal = async (id: string) => {
    if (!user) {
      onAuthRequired?.();
      return;
    }

    try {
      const success = await UserStorage.removeFromWishlistDB(id);
      if (success) {
        window.dispatchEvent(new CustomEvent('toast:show', { 
          detail: { message: 'Removed from wishlist', type: 'success' } 
        }));
        // Also update the local state immediately for better UX
        setWishlistServices(prev => prev.filter(service => service.id !== id));
      } else {
        throw new Error('Failed to remove from database');
      }
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
      window.dispatchEvent(new CustomEvent('toast:show', { 
        detail: { message: 'Failed to remove from wishlist', type: 'error' } 
      }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Your Wishlist</h2>
        <p className="text-slate-600">Services you've saved to your wishlist</p>
      </div>

      {!user ? (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="mb-6">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Login to View Your Wishlist</h3>
              <p className="text-gray-600 mb-6">
                Sign in to save your favorite services and access them from anywhere
              </p>
              <button 
                onClick={() => onAuthRequired?.()}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Login / Sign Up
              </button>
            </div>
          </div>
        </div>
      ) : wishlistServices.length === 0 ? (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="mb-6">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h3>
              <p className="text-gray-600">
                Start exploring services and add your favorites to see them here
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wishlistServices.map((service) => (
          <div 
            key={service.id} 
            className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-md hover:scale-105 transition-all duration-300 cursor-pointer"
            onClick={() => setSelected(service)}
          >
            <div className="relative">
              <img src={service.image} alt={service.name} className="w-full h-48 object-cover" />
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium">
                {service.type}
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  removeLocal(service.id);
                }} 
                className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors z-10"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </button>
            </div>

            <div className="p-4 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-slate-800">{service.name}</h3>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-slate-600">{service.rating}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 mb-2">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-600">{service.city}</span>
              </div>

              <p className="text-slate-600 text-sm mb-3">{service.description}</p>

              <div className="flex flex-wrap gap-1 mb-3">
                {service.features.slice(0, 3).map((feature, index) => (
                  <span key={index} className="bg-slate-100 text-slate-700 px-2 py-1 rounded-md text-xs">{feature}</span>
                ))}
                {service.features.length > 3 && (
                  <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded-md text-xs">+{service.features.length - 3} more</span>
                )}
              </div>

              <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center space-x-1">
                  <span className="text-lg font-bold text-slate-800">₹{service.price.toLocaleString()}</span>
                  <span className="text-sm text-slate-600">/month</span>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelected(service);
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
        </div>
      )}

      {selected && <ServiceDetails service={selected} onClose={() => setSelected(null)} />}
    </div>
  );
};