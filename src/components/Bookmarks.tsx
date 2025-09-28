import React, { useEffect, useState } from 'react';
import { MapPin, Star, Trash2 } from 'lucide-react';
import mockServices, { Service } from '../data/mockServices';
import { ServiceDetails } from './ServiceDetails';

export const Bookmarks: React.FC = () => {
  const [bookmarkedServices, setBookmarkedServices] = useState<Service[]>([]);
  const [selected, setSelected] = useState<Service | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('local_bookmarks');
      if (raw) {
        const ids: string[] = JSON.parse(raw);
        // try to read persisted service objects for dynamic CSV items
        const rawMap = localStorage.getItem('local_bookmark_items');
        const map: Record<string, any> = rawMap ? JSON.parse(rawMap) : {};
        const items = ids
          .map(id => (map[id] as Service) || mockServices.find(s => s.id === id))
          .filter((s): s is Service => Boolean(s));
        setBookmarkedServices(items);
        return;
      }
    } catch (e) {
      console.warn('Failed to read local_bookmarks', e);
    }
    setBookmarkedServices([]);
  }, []);

  useEffect(() => {
    const handler = () => {
      try {
        const raw = localStorage.getItem('local_bookmarks');
        if (raw) {
          const ids: string[] = JSON.parse(raw);
          const rawMap = localStorage.getItem('local_bookmark_items');
          const map: Record<string, any> = rawMap ? JSON.parse(rawMap) : {};
          const items = ids
            .map(id => (map[id] as Service) || mockServices.find(s => s.id === id))
            .filter((s): s is Service => Boolean(s));
          setBookmarkedServices(items);
          return;
        }
      } catch (e) {
        console.warn('Failed to read local_bookmarks', e);
      }
      setBookmarkedServices([]);
    };
    window.addEventListener('bookmarks:changed', handler);
    return () => window.removeEventListener('bookmarks:changed', handler);
  }, []);

  const removeLocal = (id: string) => {
    const next = bookmarkedServices.filter(x => x.id !== id);
    setBookmarkedServices(next);
    try {
      // persist local change immediately
      localStorage.setItem('local_bookmarks', JSON.stringify(next.map(x => x.id)));
      window.dispatchEvent(new CustomEvent('bookmarks:changed'));
      window.dispatchEvent(new CustomEvent('toast:show', { detail: { message: 'Removed from bookmarks', type: 'success' } }));
    } catch (e) { }

    // If the user is logged in, also try to remove the bookmark from the backend
    const token = localStorage.getItem('token');
    if (!token) return;

    (async () => {
      try {
        // fetch user's bookmarks to find the bookmark record id for this service
        const res = await fetch('/api/bookmarks', { headers: { 'Authorization': `Bearer ${token}` } });
        if (!res.ok) return;
        const data = await res.json();
        const found = (data.bookmarks || []).find((b: any) => b.service_id === id);
        if (!found) return;
        const del = await fetch(`/api/bookmarks/${found.id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
        if (!del.ok) {
          console.warn('Backend failed to delete bookmark', await del.text());
          window.dispatchEvent(new CustomEvent('toast:show', { detail: { message: 'Failed to remove from server', type: 'error' } }));
        }
      } catch (err) {
        console.error('Failed to remove bookmark from backend', err);
      }
    })();
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Your Bookmarks</h2>
        <p className="text-slate-600">Saved services you added to your bookmarks</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bookmarkedServices.map((service) => (
          <div key={service.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-md hover:scale-105 transition-all duration-300">
            <div className="relative">
              <img src={service.image} alt={service.name} className="w-full h-48 object-cover" />
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium">
                {service.type}
              </div>
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
                <div className="flex items-center gap-2">
                  <button onClick={() => setSelected(service)} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">View Details</button>
                  <button onClick={() => removeLocal(service.id)} className="bg-red-50 text-red-600 px-3 py-1 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {selected && <ServiceDetails service={selected} onClose={() => setSelected(null)} />}
    </div>
  );
};