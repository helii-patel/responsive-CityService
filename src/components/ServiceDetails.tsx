import React, { useEffect } from 'react';
import { MapPin, Star, X } from 'lucide-react'; // DollarSign icon removed — not used in this component
import { Service } from '../data/mockServices';
import { VAISHNO_LISTING } from '../data/areas/vaishno_devi_circle';
import { SHANTIGRAM_LISTING } from '../data/areas/shantigram';
import { JAGATPUR_LISTING } from '../data/areas/jagatpur';
import { BODAKDEV_LISTING } from '../data/areas/bodakdev';
import { MOTERA_LISTING } from '../data/areas/motera';
import { BOPAL_LISTING } from '../data/areas/bopal';
import { CHANDKHEDA_LISTING } from '../data/areas/chandkheda';
import { SHELA_LISTING } from '../data/areas/shela';
import { CHHARODI_LISTING } from '../data/areas/chharodi';
import { SANAND_LISTING } from '../data/areas/sanand';
import { SHILAJ_LISTING } from '../data/areas/shilaj';
import { TRAGAD_LISTING } from '../data/areas/tragad';
import { VASTRAPUR_LISTING } from '../data/areas/vastrapur';
import { AMBLI_LISTING } from '../data/areas/ambli';
import { PALDI_LISTING } from '../data/areas/paldi';
import { SATELLITE_LISTING } from '../data/areas/satellite';
import { GHUMA_LISTING } from '../data/areas/ghuma';
import { ELLISBRIDGE_LISTING } from '../data/areas/ellisbridge';
import { GOTA_LISTING } from '../data/areas/gota';
import { NAVRANGPURA_LISTING } from '../data/areas/navrangpura';
import { SOLA_LISTING } from '../data/areas/sola';
import { JODHPUR_LISTING } from '../data/areas/jodhpur';
import { MAKARBA_LISTING } from '../data/areas/makarba';
import { VASTRAL_LISTING } from '../data/areas/vastral';
import { NEW_MANINAGAR_LISTING } from '../data/areas/new_maninagar';
import { MAHADEV_NAGAR_LISTING } from '../data/areas/mahadev_nagar';
import { ODHAV_LISTING } from '../data/areas/odhav';
import { RAMOL_LISTING } from '../data/areas/ramol';

interface Props {
    service: Service | null;
    onClose: () => void;
}

export const ServiceDetails: React.FC<Props> = ({ service, onClose }) => {
    if (!service) return null;

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);

    // Helper: determine the best listing URL for this service.
    const getListingUrl = () => {
        const meta = (service as any).meta || {};
        const locality = ((meta['Locality / Area'] || meta['Locality'] || '') + '').toString().trim().toLowerCase();
        const city = ((meta['City'] || service.city || '') + '').toString().trim().toLowerCase();

        // Common CSV keys that might contain a link
        const keys = [
            'Contact / Listing Link', 'Contact / Listing', 'Contact/ Listing Link', 'Contact/Listing Link',
            'Contact', 'Contact Link', 'Listing Link', 'listing_link', 'listing link', 'Contact / Listing Link'
        ];
        for (const k of keys) {
            const v = meta[k];
            if (v && typeof v === 'string' && /^https?:\/\//i.test(v.trim())) return v.trim();
        }

        // Sometimes the CSV cell contains extra text; scan all meta values for the first http(s) URL
        for (const v of Object.values(meta)) {
            if (typeof v === 'string') {
                const m = v.match(/https?:\/\/[^\s",)]+/i);
                if (m) return m[0];
            }
        }

        // Fallback: area-specific constants (only use when city matches Ahmedabad)
        const areaMap: Record<string, string> = {
            'vaishno devi circle': VAISHNO_LISTING,
            'shantigram': SHANTIGRAM_LISTING,
            'jagatpur': JAGATPUR_LISTING,
            'bodakdev': BODAKDEV_LISTING,
            'motera': MOTERA_LISTING,
            'bopal': BOPAL_LISTING,
            'chandkheda': CHANDKHEDA_LISTING,
            'shela': SHELA_LISTING,
            'chharodi': CHHARODI_LISTING,
            'sanand': SANAND_LISTING,
            'shilaj': SHILAJ_LISTING,
            'tragad': TRAGAD_LISTING,
            'vastrapur': VASTRAPUR_LISTING,
            'ambli': AMBLI_LISTING,
            'paldi': PALDI_LISTING,
            'satellite': SATELLITE_LISTING,
            'ghuma': GHUMA_LISTING,
            'ellisbridge': ELLISBRIDGE_LISTING,
            'gota': GOTA_LISTING,
            'navrangpura': NAVRANGPURA_LISTING,
            'sola': SOLA_LISTING,
            'jodhpur': JODHPUR_LISTING,
            'makarba': MAKARBA_LISTING,
            'vastral': VASTRAL_LISTING,
            'new maninagar': NEW_MANINAGAR_LISTING,
            'mahadev nagar': MAHADEV_NAGAR_LISTING,
            'odhav': ODHAV_LISTING,
            'ramol': RAMOL_LISTING,
        };
        if (city === 'ahmedabad' && locality && areaMap[locality]) return areaMap[locality];
        return null;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
            <div role="dialog" aria-modal="true" className="bg-white rounded-xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden shadow-xl" onClick={(e) => e.stopPropagation()}>
                {/* image or placeholder */}
                {service.image ? (
                    <div className="relative flex-shrink-0">
                        <img src={service.image} alt={service.name} className="w-full h-64 object-cover" />
                        <button onClick={onClose} className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 rounded-full p-2 text-white transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                ) : (
                    <div className="relative flex-shrink-0 bg-slate-100 w-full h-64 flex items-center justify-center text-slate-400">
                        <div className="absolute top-3 right-3">
                            <button onClick={onClose} className="bg-red-500 hover:bg-red-600 rounded-full p-2 text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="text-center">No image available</div>
                    </div>
                )}

                <div className="p-6 overflow-y-auto">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-2xl font-bold mb-1">{service.name}</h2>
                            <div className="flex items-center space-x-3 text-sm text-slate-600">
                                <div className="flex items-center gap-1"><MapPin className="w-4 h-4" />{service.city}</div>
                                <div className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-400" />{service.rating}</div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-lg font-bold text-slate-800">₹{service.price.toLocaleString()}</div>
                            <div className="text-sm text-slate-600">/month</div>
                        </div>
                    </div>

                    <p className="text-slate-700 mt-4">{service.description}</p>

                    <div className="mt-4">
                        <h4 className="text-sm font-semibold text-slate-700 mb-2">Features</h4>
                        <div className="flex flex-wrap gap-2">
                            {service.features.map((f, i) => (
                                <span key={i} className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs">{f}</span>
                            ))}
                        </div>
                    </div>

                    {service.meta && (
                        <div className="mt-6">
                            <h4 className="text-sm font-semibold text-slate-700 mb-2">Details</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-700">
                                {Object.entries(service.meta)
                                    .filter(([, v]) => {
                                        // hide empty or N/A-like values from the details table
                                        const s = String(v ?? '').trim();
                                        if (!s) return false;
                                        const bad = ['n/a', 'na', 'none', '-'];
                                        return !bad.includes(s.toLowerCase());
                                    })
                                    .map(([k, v]) => (
                                        <div key={k} className="flex items-start">
                                            <div className="w-36 font-medium text-slate-600">{k}</div>
                                            <div className="flex-1 whitespace-pre-wrap">{String(v)}</div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t flex justify-between items-center gap-3 flex-shrink-0 bg-white">
                    <div>
                        {(() => {
                            const url = getListingUrl();
                            if (url) {
                                return (
                                    <a 
                                        href={url} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors shadow-sm"
                                    >
                                        🔗 Visit listing
                                    </a>
                                );
                            }
                            return null;
                        })()}
                    </div>
                    <div className="flex items-center">
                        <button
                            onClick={() => {
                                const url = getListingUrl();
                                if (url) {
                                    window.open(url, '_blank', 'noopener');
                                } else {
                                    onClose();
                                }
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded"
                        >Contact</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiceDetails;
