import React from 'react';
import { MapPin, Star, Heart, LucideIcon } from 'lucide-react';

// Define the Service interface (this should match your existing Service type)
export interface Service {
  id: string;
  name: string;
  type: string;
  city: string;
  description: string;
  price: number;
  rating: number;
  image: string;
  features: string[];
}

// Helper function to get price unit based on service type
const getPriceUnit = (_serviceType: string) => {
  // All services now show monthly pricing for consistency
  return 'per month';
};

interface ServiceCardProps {
  service: Service;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onViewDetails: () => void;
  viewMode?: 'grid' | 'list';
  actionIcon?: React.ComponentType<{ className?: string }>;
  actionLabel?: string;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ 
  service, 
  isBookmarked, 
  onToggleBookmark, 
  onViewDetails, 
  viewMode = 'grid',
  actionIcon: ActionIcon = Heart,
  actionLabel = 'Bookmark'
}) => {
  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
        <img
          src={service.image}
          alt={service.name}
          className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 mb-1 truncate">{service.name}</h3>
          <div className="flex items-center gap-4 text-sm text-slate-600 mb-2">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{service.city}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span>{service.rating}</span>
            </div>
          </div>
          <p className="text-sm text-slate-600 truncate">{service.description}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-lg font-bold text-slate-900">
            ₹{service.price.toLocaleString()}
          </div>
          <div className="text-sm text-slate-600">{getPriceUnit(service.type)}</div>
          <div className="flex gap-2 mt-2">
            <button
              onClick={onToggleBookmark}
              className={`p-2 rounded ${isBookmarked
                ? 'text-red-500 hover:bg-red-50'
                : 'text-slate-400 hover:bg-slate-50'
                }`}
            >
              <ActionIcon className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={onViewDetails}
              className="px-3 py-1 bg-slate-900 text-white text-sm rounded hover:bg-slate-800 transition-colors"
            >
              View Details
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Source tag logic
  let sourceTag = 'General';
  if (service.type === 'accommodation') sourceTag = 'Housing.com';
  else if (service.type === 'food') sourceTag = 'Swiggy';
  else if (service.type === 'tiffin') sourceTag = 'General';

  return (
    <div
      className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group flex flex-col"
      onClick={(e) => {
        // Prevent opening details if bookmark button is clicked
        if ((e.target as HTMLElement).closest('button[data-bookmark]')) return;
        onViewDetails();
      }}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${service.name}`}
      style={{ minHeight: '370px' }}
    >
      <div className="relative">
        {/* Source tag badge */}
        <span className="absolute top-3 left-3 z-10 bg-slate-200 text-slate-900 text-xs font-semibold px-2 py-1 rounded shadow-md">
          {sourceTag}
        </span>
        <img
          src={service.image}
          alt={service.name}
          className="w-full h-48 object-cover rounded-xl"
        />
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleBookmark();
          }}
          data-bookmark
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm ${isBookmarked
            ? 'bg-red-500/20 text-red-500'
            : 'bg-white/20 text-white hover:bg-white/30'
            }`}
        >
          <ActionIcon className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
        </button>
      </div>

      <div className="flex-1 flex flex-col p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-slate-900 text-lg">{service.name}</h3>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm text-slate-600">{service.rating}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-slate-600 mb-2">
          <MapPin className="w-4 h-4" />
          <span className="text-sm">{service.city}</span>
        </div>

        <p className="text-sm text-slate-600 mb-4 line-clamp-2">{service.description}</p>

        <div className="mt-auto flex items-center justify-between">
          <div>
            <div className="text-xl font-bold text-slate-900">
              ₹{service.price.toLocaleString()}
            </div>
            <div className="text-sm text-slate-600">{getPriceUnit(service.type)}</div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails();
            }}
            className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;