import React, { useEffect, useState } from 'react';
import mockServices, { Service } from '../data/mockServices';
import { CustomSelect } from './CustomSelect';
import { Search, SlidersHorizontal, Grid2x2 as Grid, List, MapPin, Layers, Map, ArrowUpDown, DollarSign } from 'lucide-react';
import ServiceDetails from './ServiceDetails';
import Papa from 'papaparse';
import { useMemo } from "react";
import { UserStorage } from '../utils/userStorage';
import { VAISHNO_IMAGE, VAISHNO_LISTING } from '../data/areas/vaishno_devi_circle';
import { SHANTIGRAM_IMAGE, SHANTIGRAM_LISTING } from '../data/areas/shantigram';
import { JAGATPUR_IMAGE, JAGATPUR_LISTING } from '../data/areas/jagatpur';
import { BODAKDEV_IMAGE, BODAKDEV_LISTING } from '../data/areas/bodakdev';
import { MOTERA_IMAGE, MOTERA_LISTING } from '../data/areas/motera';
import { BOPAL_IMAGE, BOPAL_LISTING } from '../data/areas/bopal';
import { CHANDKHEDA_IMAGE, CHANDKHEDA_LISTING } from '../data/areas/chandkheda';
import { SHELA_IMAGE, SHELA_LISTING } from '../data/areas/shela';
import { CHHARODI_IMAGE, CHHARODI_LISTING } from '../data/areas/chharodi';
import { SANAND_IMAGE, SANAND_LISTING } from '../data/areas/sanand';
import { SHILAJ_IMAGE, SHILAJ_LISTING } from '../data/areas/shilaj';
import { TRAGAD_IMAGE, TRAGAD_LISTING } from '../data/areas/tragad';
import { VASTRAPUR_IMAGE, VASTRAPUR_LISTING } from '../data/areas/vastrapur';
import { AMBLI_IMAGE, AMBLI_LISTING } from '../data/areas/ambli';
import { PALDI_IMAGE, PALDI_LISTING } from '../data/areas/paldi';
import { SATELLITE_IMAGE, SATELLITE_LISTING } from '../data/areas/satellite';
import { GHUMA_IMAGE, GHUMA_LISTING } from '../data/areas/ghuma';
import { ELLISBRIDGE_IMAGE, ELLISBRIDGE_LISTING } from '../data/areas/ellisbridge';
import { GOTA_IMAGE, GOTA_LISTING } from '../data/areas/gota';
import { NAVRANGPURA_IMAGE, NAVRANGPURA_LISTING } from '../data/areas/navrangpura';
import { SOLA_IMAGE, SOLA_LISTING } from '../data/areas/sola';
import { JODHPUR_IMAGE, JODHPUR_LISTING } from '../data/areas/jodhpur';
import { MAKARBA_IMAGE, MAKARBA_LISTING } from '../data/areas/makarba';
import { VASTRAL_IMAGE, VASTRAL_LISTING } from '../data/areas/vastral';
import { NEW_MANINAGAR_IMAGE, NEW_MANINAGAR_LISTING } from '../data/areas/new_maninagar';
import { MAHADEV_NAGAR_IMAGE, MAHADEV_NAGAR_LISTING } from '../data/areas/mahadev_nagar';
import { ODHAV_IMAGE, ODHAV_LISTING } from '../data/areas/odhav';
import { RAMOL_IMAGE, RAMOL_LISTING } from '../data/areas/ramol';
import { ServiceCard } from './ServiceCard';

interface ServiceSearchProps {
  user?: any;
  onAuthRequired?: () => void;
}

function ServiceSearch({ user, onAuthRequired }: ServiceSearchProps) {
  // State and ref declarations at top level
  const [minBudget, setMinBudget] = useState(() => {
    try { return Number(localStorage.getItem('search_min_budget')) || 0; } catch (e) { return 0; }
  });
  const [maxBudget, setMaxBudget] = useState(() => {
    try { return Number(localStorage.getItem('search_max_budget')) || 50000; } catch (e) { return 50000; }
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedServiceTypes, setSelectedServiceTypes] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [foodItem, setFoodItem] = useState('');
  const [showAreaDropdown, setShowAreaDropdown] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const areaButtonRef = React.useRef<HTMLDivElement | null>(null);
  const [showTypesDropdown, setShowTypesDropdown] = useState(false);
  const typesDropdownRef = React.useRef<HTMLDivElement | null>(null);
  const [bookmarkIdMap, setBookmarkIdMap] = useState<Record<string, number>>({});
  const [selected, setSelected] = useState<Service | null>(null);
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set());
  const [selectedCity, setSelectedCity] = useState<string>('');

  // Helper function used in mapTiffinRow
  // Removed duplicate computeNearbyFour
  const areaOptionsMap: Record<string, string[]> = {
    Ahmedabad: [
      'Vaishno Devi Circle', 'Shantigram', 'Jagatpur', 'Bodakdev', 'Motera', 'Bopal', 'Chandkheda', 'Shela', 'Chharodi', 'Sanand', 'Shilaj', 'Tragad', 'Vastrapur', 'Ambli', 'Paldi', 'Satellite', 'Ghuma', 'Ellisbridge', 'Gota', 'Navrangpura', 'Sola', 'Jodhpur', 'Makarba', 'Vastral', 'New Maninagar', 'Mahadev Nagar', 'Odhav', 'Ramol'
    ],
  };
  const areaOptions = areaOptionsMap[selectedCity] || [];
  const normalizedKnownAreas = new Set(areaOptions.map(a => a.toString().trim().toLowerCase()));

  // Close dropdowns when clicking outside
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (showAreaDropdown) {
        const el = areaButtonRef.current;
        if (el && !el.contains(e.target as Node)) setShowAreaDropdown(false);
      }
      if (showTypesDropdown) {
        const t = typesDropdownRef.current;
        if (t && !t.contains(e.target as Node)) setShowTypesDropdown(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [showAreaDropdown, showTypesDropdown]);

  // Bookmarks: fetch from Supabase database
  useEffect(() => {
    const init = async () => {
      try {
        if (!user) {
          // Clear bookmarks for unauthenticated users
          setBookmarked(new Set());
          return;
        }

        // Migrate any local bookmarks to database first
        await UserStorage.migrateWishlistToDatabase();
        
        // Load bookmarks from database
        const bookmarkIds = await UserStorage.getWishlistFromDB();
        setBookmarked(new Set(bookmarkIds));
      } catch (e) {
        console.warn('Failed to read user bookmarks from database', e);
      }
    };
    init();
  }, [user]); // Re-run when user changes

  // Clear area search when city changes
  useEffect(() => {
    setSearchTerm('');
  }, [selectedCity]);

  // close dropdown when clicking outside
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (showAreaDropdown) {
        const el = areaButtonRef.current;
        if (el && !el.contains(e.target as Node)) setShowAreaDropdown(false);
      }
      if (showTypesDropdown) {
        const t = typesDropdownRef.current;
        if (t && !t.contains(e.target as Node)) setShowTypesDropdown(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [showAreaDropdown, showTypesDropdown]);

  // Restore selectedCity from localStorage so filters persist across pages
  useEffect(() => {
    try {
      const sc = localStorage.getItem('selected_city');
      if (sc) setSelectedCity(sc);
    } catch (e) {
      console.warn('Failed to restore selected city', e);
    }
  }, []);

  // Restore selected serviceTypes from localStorage so this filter persists too
  useEffect(() => {
    try {
      const st = localStorage.getItem('selected_service_types');
      if (st) {
        const parsedTypes = JSON.parse(st);
        if (Array.isArray(parsedTypes)) {
          setSelectedServiceTypes(parsedTypes);
        }
      }
    } catch (e) {
      console.warn('Failed to restore selected service types', e);
    }
  }, []);

  // keep in-sync with other components/tabs when bookmarks change
  useEffect(() => {
    const refreshFromStorage = async () => {
      try {
        const bookmarkIds = await UserStorage.getWishlistFromDB();
        setBookmarked(new Set(bookmarkIds));
      } catch (e) {
        console.warn('Failed to refresh bookmarks from database', e);
      }
    };

    const handler = () => refreshFromStorage();

    // Listen for both localStorage and database changes
    window.addEventListener('bookmarks:changed', handler);
    window.addEventListener('wishlist:changed', handler);
    return () => {
      window.removeEventListener('bookmarks:changed', handler);
      window.removeEventListener('wishlist:changed', handler);
    };
  }, []);

  // Auto-collapse filters when scrolling down
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // If scrolling down and filters are open, close them
      if (currentScrollY > lastScrollY && currentScrollY > 100 && showFilters) {
        setShowFilters(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY, showFilters]);

  // Only Gujarat cities (match public/data/Accomodation CSV filenames)
  const cities = ['Ahmedabad', 'Baroda', 'Gandhinagar', 'Rajkot', 'Surat'];
  const serviceTypes = [
    { id: 'accommodation', label: 'Accommodation', icon: '🏠' },
    { id: 'food', label: 'Food', icon: '🍽️' },
    { id: 'tiffin', label: 'Tiffin Services', icon: '🥗' },
    { id: 'transport', label: 'Transport', icon: '🚗' },
    { id: 'coworking', label: 'Coworking', icon: '💼' },
    { id: 'utilities', label: 'Utilities', icon: '⚡' },
  ];


  // use shared mockServices from data module but allow CSV loading for accommodation/food
  const [csvServices, setCsvServices] = useState<Service[] | null>(null);
  const [isLoadingCsv, setIsLoadingCsv] = useState(false);
  const [csvError, setCsvError] = useState<string | null>(null);

  // Progressive loading removed for now (simplified to single-batch sampling)

  // Small helper: compute a stable pseudo-random rating around 4.0 based on an input string
  const computeNearbyFour = (seed: string) => {
    // simple hash of seed -> [0,1)
    let h = 2166136261 >>> 0;
    for (let i = 0; i < seed.length; i++) {
      h ^= seed.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    // map to 0..1
    const r = (h % 1000) / 1000;
    // map to a small variance around 4.0, e.g., 3.7..4.3
    const v = 3.7 + r * 0.6;
    // round to one decimal, e.g., 3.8, 4.0, 4.3
    return Math.round(v * 10) / 10;
  };

  // Display rating for cards (stable pseudo-random ~4.0)
  const displayRating = (service: Service) => computeNearbyFour(service.id);

  // normalize accommodation CSV row to Service
  const mapAccommodationRow = (row: any): Service | null => {
    try {
      const id = `${row.City || 'Surat'}-${(row['Locality / Area'] || 'unknown')}-${(row['Rent Price'] || '0')}`.replace(/\s+/g, '-');
      const rawRent = row['Rent Price'];
      // More robust price parsing
      let price = 0;
      if (rawRent) {
        const cleanRent = rawRent.toString().replace(/[^0-9.]/g, '');
        price = Number(cleanRent) || 0;
      }

      const svc = {
        id: id,
        name: `${row['Property Type'] || 'Property'} - ${row['Locality / Area'] || row.Locality}`,
        type: 'accommodation',
        city: row.City || selectedCity || 'Surat',
        price: price,
        rating: computeNearbyFour(id),
        description: row['Additional Notes'] || row.Amenities || '',
        image: '',
        features: (row.Amenities || '').split(/[,|;]/).map((s: string) => s.trim()).filter(Boolean),
      } as Service;

      // Inject area-specific images + listing when locality matches
      const locality = (row['Locality / Area'] || row['Locality'] || '').toString().trim();
      const city = (row['City'] || '').toString().trim().toLowerCase();
      if (locality && locality.toLowerCase() === 'vaishno devi circle') {
        svc.image = VAISHNO_IMAGE;
        // attach listing link into meta as well so ServiceDetails can show Visit listing
        (svc as any).meta = { ...(row || {}), ['Listing Link']: VAISHNO_LISTING };
      }

      // Inject Shantigram image + listing for Ahmedabad -> Shantigram
      if (locality && locality.toLowerCase() === 'shantigram' && city === 'ahmedabad') {
        svc.image = SHANTIGRAM_IMAGE;
        (svc as any).meta = { ...(row || {}), ['Listing Link']: SHANTIGRAM_LISTING };
      }

      // Inject Jagatpur image + listing for Ahmedabad -> Jagatpur
      if (locality && locality.toLowerCase() === 'jagatpur' && city === 'ahmedabad') {
        svc.image = JAGATPUR_IMAGE;
        (svc as any).meta = { ...(row || {}), ['Listing Link']: JAGATPUR_LISTING };
      }

      // Inject Bodakdev image + listing for Ahmedabad -> Bodakdev
      if (locality && locality.toLowerCase() === 'bodakdev' && city === 'ahmedabad') {
        svc.image = BODAKDEV_IMAGE;
        (svc as any).meta = { ...(row || {}), ['Listing Link']: BODAKDEV_LISTING };
      }

      // Inject Motera image + listing for Ahmedabad -> Motera
      if (locality && locality.toLowerCase() === 'motera' && city === 'ahmedabad') {
        svc.image = MOTERA_IMAGE;
        (svc as any).meta = { ...(row || {}), ['Listing Link']: MOTERA_LISTING };
      }

      // Inject Bopal image + listing for Ahmedabad -> Bopal
      if (locality && locality.toLowerCase() === 'bopal' && city === 'ahmedabad') {
        svc.image = BOPAL_IMAGE;
        (svc as any).meta = { ...(row || {}), ['Listing Link']: BOPAL_LISTING };
      }

      // Chandkheda
      if (locality && locality.toLowerCase() === 'chandkheda' && city === 'ahmedabad') {
        svc.image = CHANDKHEDA_IMAGE;
        (svc as any).meta = { ...(row || {}), ['Listing Link']: CHANDKHEDA_LISTING };
      }

      // Shela
      if (locality && locality.toLowerCase() === 'shela' && city === 'ahmedabad') {
        svc.image = SHELA_IMAGE;
        (svc as any).meta = { ...(row || {}), ['Listing Link']: SHELA_LISTING };
      }

      // Chharodi
      if (locality && locality.toLowerCase() === 'chharodi' && city === 'ahmedabad') {
        svc.image = CHHARODI_IMAGE;
        (svc as any).meta = { ...(row || {}), ['Listing Link']: CHHARODI_LISTING };
      }

      // Sanand
      if (locality && locality.toLowerCase() === 'sanand' && city === 'ahmedabad') {
        svc.image = SANAND_IMAGE;
        (svc as any).meta = { ...(row || {}), ['Listing Link']: SANAND_LISTING };
      }

      // Shilaj
      if (locality && locality.toLowerCase() === 'shilaj' && city === 'ahmedabad') {
        svc.image = SHILAJ_IMAGE;
        (svc as any).meta = { ...(row || {}), ['Listing Link']: SHILAJ_LISTING };
      }

      // Tragad
      if (locality && locality.toLowerCase() === 'tragad' && city === 'ahmedabad') {
        svc.image = TRAGAD_IMAGE;
        (svc as any).meta = { ...(row || {}), ['Listing Link']: TRAGAD_LISTING };
      }

      // Vastrapur
      if (locality && locality.toLowerCase() === 'vastrapur' && city === 'ahmedabad') {
        svc.image = VASTRAPUR_IMAGE;
        (svc as any).meta = { ...(row || {}), ['Listing Link']: VASTRAPUR_LISTING };
      }

      // Ambli
      if (locality && locality.toLowerCase() === 'ambli' && city === 'ahmedabad') {
        svc.image = AMBLI_IMAGE;
        (svc as any).meta = { ...(row || {}), ['Listing Link']: AMBLI_LISTING };
      }

      // Paldi
      if (locality && locality.toLowerCase() === 'paldi' && city === 'ahmedabad') {
        svc.image = PALDI_IMAGE;
        (svc as any).meta = { ...(row || {}), ['Listing Link']: PALDI_LISTING };
      }

      // Satellite
      if (locality && locality.toLowerCase() === 'satellite' && city === 'ahmedabad') {
        svc.image = SATELLITE_IMAGE;
        (svc as any).meta = { ...(row || {}), ['Listing Link']: SATELLITE_LISTING };
      }

      // Ghuma
      if (locality && locality.toLowerCase() === 'ghuma' && city === 'ahmedabad') {
        svc.image = GHUMA_IMAGE;
        (svc as any).meta = { ...(row || {}), ['Listing Link']: GHUMA_LISTING };
      }

      // Ellisbridge
      if (locality && locality.toLowerCase() === 'ellisbridge' && city === 'ahmedabad') {
        svc.image = ELLISBRIDGE_IMAGE;
        (svc as any).meta = { ...(row || {}), ['Listing Link']: ELLISBRIDGE_LISTING };
      }

      // Gota
      if (locality && locality.toLowerCase() === 'gota' && city === 'ahmedabad') {
        svc.image = GOTA_IMAGE;
        (svc as any).meta = { ...(row || {}), ['Listing Link']: GOTA_LISTING };
      }

      // Navrangpura
      if (locality && locality.toLowerCase() === 'navrangpura' && city === 'ahmedabad') {
        svc.image = NAVRANGPURA_IMAGE;
        (svc as any).meta = { ...(row || {}), ['Listing Link']: NAVRANGPURA_LISTING };
      }

      // Sola
      if (locality && locality.toLowerCase() === 'sola' && city === 'ahmedabad') {
        svc.image = SOLA_IMAGE;
        (svc as any).meta = { ...(row || {}), ['Listing Link']: SOLA_LISTING };
      }

      // Jodhpur
      if (locality && locality.toLowerCase() === 'jodhpur' && city === 'ahmedabad') {
        svc.image = JODHPUR_IMAGE;
        (svc as any).meta = { ...(row || {}), ['Listing Link']: JODHPUR_LISTING };
      }

      // Makarba
      if (locality && locality.toLowerCase() === 'makarba' && city === 'ahmedabad') {
        svc.image = MAKARBA_IMAGE;
        (svc as any).meta = { ...(row || {}), ['Listing Link']: MAKARBA_LISTING };
      }

      // Vastral
      if (locality && locality.toLowerCase() === 'vastral' && city === 'ahmedabad') {
        svc.image = VASTRAL_IMAGE;
        (svc as any).meta = { ...(row || {}), ['Listing Link']: VASTRAL_LISTING };
      }

      // New Maninagar
      if (locality && locality.toLowerCase() === 'new maninagar' && city === 'ahmedabad') {
        svc.image = NEW_MANINAGAR_IMAGE;
        (svc as any).meta = { ...(row || {}), ['Listing Link']: NEW_MANINAGAR_LISTING };
      }

      // Mahadev Nagar
      if (locality && locality.toLowerCase() === 'mahadev nagar' && city === 'ahmedabad') {
        svc.image = MAHADEV_NAGAR_IMAGE;
        (svc as any).meta = { ...(row || {}), ['Listing Link']: MAHADEV_NAGAR_LISTING };
      }

      // Odhav
      if (locality && locality.toLowerCase() === 'odhav' && city === 'ahmedabad') {
        svc.image = ODHAV_IMAGE;
        (svc as any).meta = { ...(row || {}), ['Listing Link']: ODHAV_LISTING };
      }

      // Ramol
      if (locality && locality.toLowerCase() === 'ramol' && city === 'ahmedabad') {
        svc.image = RAMOL_IMAGE;
        (svc as any).meta = { ...(row || {}), ['Listing Link']: RAMOL_LISTING };
      }
      return svc as Service;
    } catch (e) {
      return null;
    }
  };

  // Image mappings for common food keywords
  const foodImageMappings: { [key: string]: string } = {
    pizza: 'https://content.jdmagicbox.com/comp/def_content/pizza_outlets/default-pizza-outlets-3.jpg',
    chicken: 'https://recipes.timesofindia.com/thumb/53096628.cms?imgsize=294753&width=800&height=800',
    burger: 'https://www.shutterstock.com/image-photo/burger-tomateoes-lettuce-pickles-on-600nw-2309539129.jpg',
    fries: 'https://whisperofyum.com/wp-content/uploads/2024/10/whisper-of-yum-homemade-french-fries.jpg',
    roll: 'https://lh4.googleusercontent.com/proxy/EG-kWc7b5gqVrXOriIpVK4ao-jNHc5WfpDzv2g0PV_yIhzAl4tAXAy_9q69f00QG-3odYcWYf2jb7keCIUv5DCp2xp16tSMiXnpn',
    shake: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQCLEHanUKGeUgyUeL11JIOZxhel2wHL6VY0g&s',
    pasta: 'https://img.freepik.com/free-photo/penne-pasta-tomato-sauce-with-chicken-tomatoes-wooden-table_2829-19739.jpg',
    paneer: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ8WO9N5Dqc4qI0F-DpCgZWDUeA3wted-3GMw&s',
    strips: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQZcMaCXgOU152Hb5a2vcnPCmxwI-AFNtyZxg&s',
    pepsi: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRejMClxN69ZmomEGbAJMcI-8CjL8Par3l3og&s',
    bhajipav: 'https://www.cubesnjuliennes.com/wp-content/uploads/2020/07/Instant-Pot-Mumbai-Pav-Bhaji-Recipe.jpg',
    maggi: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRcnHYgh3JBgmJdU8ZYSVj5PJCq8SyiyVubug&s',
    popcorn: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRWh1QyaQlXvE_bi3UJCYX4xo9r__1WgQqgmA&s'
  };

  // Function to get image based on food name keywords
  const getFoodImage = (dishName: string): string => {
    const name = dishName.toLowerCase();

    // Check for pizza variations first (especially from Pizza Hut)
    if (name.includes('pizza') || name.includes('- pizza') || name.includes('pizza hut')) {
      return foodImageMappings.pizza;
    }

    // Check for roll variations (prioritized over chicken)
    if (name.includes('roll') || name.includes('wrap') || name.includes('kathi')) {
      return foodImageMappings.roll;
    }

    if (name.includes('maggi')) {
      return foodImageMappings.maggi;
    }
    // Check for burger variations
    if (name.includes('burger') || name.includes('burg')) {
      return foodImageMappings.burger;
    }

    // Check for chicken variations (including common misspellings)
    if (name.includes('chicken') || name.includes('chiken') || name.includes('tikka') || name.includes('ckn')) {
      return foodImageMappings.chicken;
    }

    // Check for fries variations
    if (name.includes('fries') || name.includes('fry') || name.includes('french')) {
      return foodImageMappings.fries;
    }

    // Check for shake variations
    if (name.includes('shake') || name.includes('smoothie') || name.includes('milkshake')) {
      return foodImageMappings.shake;
    }

    // Check for pasta variations
    if (name.includes('pasta') || name.includes('penne') || name.includes('spaghetti') || name.includes('macaroni')) {
      return foodImageMappings.pasta;
    }

    // Check for paneer variations
    if (name.includes('paneer') || name.includes('cottage cheese') || name.includes('panir')) {
      return foodImageMappings.paneer;
    }

    if (name.includes('popcorn')) {
      return foodImageMappings.popcorn;
    }

    if (name.includes('strips')) {
      return foodImageMappings.strips;
    }
    // Default fallback image for other food items
    if (name.includes('pepsi')) {
      return foodImageMappings.pepsi;
    }

    if (name.includes('bhajipav') || name.includes('bhaji pav')) {
      return foodImageMappings.bhajipav;
    }
    return 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRAD_kasqlYXaDOWO1rCq96ZJ77o2_3xYy1Tw&s';
  };

  // normalize food CSV (swiggy_Ahm.csv) row to Service-like item
  // Stub for mapTiffinRow to prevent reference errors
  const mapTiffinRow = (row: any, idx: number): Service => {
    return {
      id: `tiffin-${idx}`,
      name: row['Tiffin Name'] || 'Unknown Tiffin',
      type: 'tiffin',
      city: row['City'] || 'Ahmedabad',
      price: Number(row['Price']) || 0,
      rating: 4.0,
      description: row['Description'] || '',
      image: '',
      features: [row['Provider'] || '', row['Area'] || ''],
      meta: row
    } as Service;
  };
  const mapFoodRow = (row: any, idx: number): Service => {
    const id = `food-${idx}`;
    const price = Number(row['Price (INR)']) || 0;
    const rating = Number(row['Rating']) || 0;
    const ratingCount = Number(row['Rating Count']) || 0;
    const dishName = row['Dish Name'] || 'Unknown Dish';

    return {
      id,
      name: `${dishName} - ${row['Restaurant Name']}`,
      type: 'food',
      city: row['City'] || 'Ahmedabad',
      price: price,
      rating: rating > 0 ? rating : computeNearbyFour(id),
      description: `${row['Category']} dish from ${row['Restaurant Name']} in ${row['Location']}. ${ratingCount > 0 ? `Based on ${ratingCount} ratings.` : ''}`,
      image: getFoodImage(dishName),
      features: [row['Restaurant Name'], row['Location'], row['Category']],
    } as Service;
  };

  useEffect(() => {
    // Improved: reload CSV and filter data instantly on any filter change
    const loadCsv = async () => {
      const effectiveTypes = selectedServiceTypes.length === 0
        ? ['accommodation', 'food']
        : selectedServiceTypes;
      setIsLoadingCsv(true);
      setCsvError(null);
      try {
        let allItems: Service[] = [];
        // Accommodation
        if (effectiveTypes.includes('accommodation')) {
          const cityFile = selectedCity || 'Surat';
          const path = `/data/Accomodation/${cityFile}.csv`;
          const res = await fetch(path);
          if (res.ok) {
            const text = await res.text();
            const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
            const items = (parsed.data || []).map((r: any) => {
              const s = mapAccommodationRow(r);
              if (s) s.meta = r;
              return s;
            }).filter((x: any) => x) as Service[];
            allItems.push(...items);
          }
        }
        // Food
        if (effectiveTypes.includes('food')) {
          if (!selectedCity || selectedCity === 'Ahmedabad') {
            const path = `/data/Food/swiggy_Ahm.csv`;
            const res = await fetch(path);
            if (res.ok) {
              const text = await res.text();
              const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
              const allData = parsed.data || [];
              const categoryGroups: Record<string, any[]> = {};
              allData.forEach((item: any) => {
                const category = item['Category'] || 'Other';
                if (!categoryGroups[category]) categoryGroups[category] = [];
                categoryGroups[category].push(item);
              });
              const categories = Object.keys(categoryGroups);
              const totalDesired = 500;
              const sampledData: any[] = [];
              const itemsPerCategory = Math.floor(totalDesired / categories.length);
              const remainder = totalDesired % categories.length;
              categories.forEach((category, index) => {
                const categoryItems = categoryGroups[category];
                const itemsToTake = itemsPerCategory + (index < remainder ? 1 : 0);
                const taken = categoryItems.slice(0, Math.min(itemsToTake, categoryItems.length));
                sampledData.push(...taken);
              });
              const items = sampledData.map((r: any, i: number) => {
                const s = mapFoodRow(r, i);
                s.meta = r;
                return s;
              });
              allItems.push(...items);
            }
          }
        }
        // Tiffin
        if (effectiveTypes.includes('tiffin')) {
          const tiffinPath = `/data/Food/tifin_rental.csv`;
          const res = await fetch(tiffinPath);
          if (res.ok) {
            const text = await res.text();
            const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
            const tiffinData = parsed.data || [];
            const filteredTiffin = selectedCity
              ? tiffinData.filter((row: any) => (row.City || '').toLowerCase() === selectedCity.toLowerCase())
              : tiffinData;
            const tiffinItems = filteredTiffin.map((row: any, i: number) => mapTiffinRow(row, i));
            allItems.push(...tiffinItems);
          }
        }
        setCsvServices(allItems.length > 0 ? allItems : null);
        if (allItems.length === 0 && selectedServiceTypes.length > 0) {
          setCsvServices(null);
        }
      } catch (err) {
        setCsvError('Failed to load data. Please try again.');
        setCsvServices(null);
      } finally {
        setIsLoadingCsv(false);
      }
    };
    loadCsv();
  }, [selectedServiceTypes, selectedCity, minBudget, maxBudget, searchTerm]);

  // (Optional) Progressive loading function removed as it's currently unused.

  

const filteredServices = useMemo(() => {
  return (csvServices && csvServices.length > 0 ? csvServices : mockServices).filter(service => {
    // City filter
    const cityMatch = !selectedCity || (service.city && service.city.toLowerCase() === selectedCity.toLowerCase());

    // Area filter (strict, case-insensitive)
    let areaMatch = true;
    let selectedArea = searchTerm?.trim().toLowerCase();
    if (selectedArea && service.type === "accommodation") {
      const localityRaw = (service.meta?.["Locality / Area"] || service.meta?.["Locality"] || "").toString();
      areaMatch = localityRaw.trim().toLowerCase() === selectedArea;
    }

    // Type filter
    const typeMatch = selectedServiceTypes.length === 0 || selectedServiceTypes.includes(service.type);

    // Budget filter
    const price = Number.isFinite(Number(service.price)) ? Number(service.price) : 0;
    let maxBudgetNum = Number(maxBudget);
    let minBudgetNum = Number(minBudget);
    if (!Number.isFinite(maxBudgetNum) || maxBudgetNum < 0) maxBudgetNum = 0;
    if (!Number.isFinite(minBudgetNum) || minBudgetNum < 0) minBudgetNum = 0;
    
    // Budget match: price should be between min and max budget (if max is 0, no upper limit)
    const budgetMatch = (maxBudgetNum === 0 || price <= maxBudgetNum) && price >= minBudgetNum;

    // Search query filter
    const searchMatch = !searchQuery || 
      service.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (service.meta?.["Locality / Area"] || service.meta?.["Locality"] || "").toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description?.toLowerCase().includes(searchQuery.toLowerCase());

    // Strict: if area is searched, require BOTH area and budget
    if (searchTerm && service.type === "accommodation") {
      return cityMatch && areaMatch && typeMatch && budgetMatch && searchMatch;
    }

    return cityMatch && typeMatch && budgetMatch && searchMatch;
  });
}, [csvServices, mockServices, selectedCity, searchTerm, selectedServiceTypes, minBudget, maxBudget, searchQuery]);


  // --- Multi-need tabs and sorting ---
  type ActiveTypeTab = 'all' | Service['type'];
  const [activeTypeTab, setActiveTypeTab] = useState<ActiveTypeTab>('all');
  const [sortBy, setSortBy] = useState<'rating' | 'price-asc' | 'price-desc' | 'name'>('rating');

  // Determine which types are present after filters
  const presentTypes: Array<Service['type']> = Array.from(new Set(filteredServices.map(s => s.type))) as Array<Service['type']>;
  // Keep active tab valid
  useEffect(() => {
    if (presentTypes.length === 0) {
      setActiveTypeTab('all');
      return;
    }
    if (activeTypeTab !== 'all' && !presentTypes.includes(activeTypeTab as Service['type'])) {
      setActiveTypeTab('all');
    }
  }, [activeTypeTab, presentTypes.join('|')]);

  // Group counts for header badges
  const typeCounts: Partial<Record<Service['type'], number>> = filteredServices.reduce((acc: Partial<Record<Service['type'], number>>, s) => {
    acc[s.type] = (acc[s.type] || 0) + 1;
    return acc;
  }, {});

  const sortFns = {
    'rating': (a: Service, b: Service) => (displayRating(b) - displayRating(a)) || a.name.localeCompare(b.name),
    'price-asc': (a: Service, b: Service) => (Number.isFinite(a.price) ? a.price : Infinity) - (Number.isFinite(b.price) ? b.price : Infinity) || a.name.localeCompare(b.name),
    'price-desc': (a: Service, b: Service) => (Number.isFinite(b.price) ? b.price : -Infinity) - (Number.isFinite(a.price) ? a.price : -Infinity) || a.name.localeCompare(b.name),
    'name': (a: Service, b: Service) => a.name.localeCompare(b.name)
  } as const;

  const tabFiltered = activeTypeTab === 'all' ? filteredServices : filteredServices.filter(s => {
    const match = s.type === activeTypeTab;
    return match;
  });
  const sortedServices = [...tabFiltered].sort(sortFns[sortBy]);

  // Add/remove bookmark using Supabase database
  const toggleBookmark = async (serviceId: string) => {
    if (!user) {
      onAuthRequired?.();
      return;
    }

    const newBookmarked = new Set(bookmarked);
    
    try {
      if (bookmarked.has(serviceId)) {
        // Remove bookmark from database
        const success = await UserStorage.removeFromWishlistDB(serviceId);
        if (success) {
          newBookmarked.delete(serviceId);
          setBookmarked(newBookmarked);
          
          window.dispatchEvent(new CustomEvent('toast:show', { 
            detail: { message: 'Removed from wishlist', type: 'success' } 
          }));
        } else {
          throw new Error('Failed to remove from database');
        }
      } else {
        // Add bookmark to database
        const svc = (csvServices || mockServices).find(s => s.id === serviceId) || mockServices.find(s => s.id === serviceId);
        
        const success = await UserStorage.addToWishlistDB(serviceId, svc);
        if (success) {
          newBookmarked.add(serviceId);
          setBookmarked(newBookmarked);
          
          window.dispatchEvent(new CustomEvent('toast:show', { 
            detail: { message: 'Added to wishlist', type: 'success' } 
          }));
        } else {
          throw new Error('Failed to add to database');
        }
      }
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
      window.dispatchEvent(new CustomEvent('toast:show', { 
        detail: { message: 'Failed to update wishlist', type: 'error' } 
      }));
    }
  };

  // Handle food item search with price comparison
  // Removed unused handleFoodSearch

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">
          Find Your Perfect City Services
        </h2>
        <p className="text-slate-600">
          Discover accommodation, food, transport, coworking spaces, and utilities
        </p>
      </div>

      {/* Search Filters - Collapsible */}
      <div className="sticky top-20 z-40 bg-white/95 backdrop-blur-sm rounded-xl shadow-sm border border-slate-100 transition-all duration-200 ease-in-out mb-6">
        {/* Filter Header - Always visible - Compact for mobile */}
        <div className="flex items-center justify-between p-3 pb-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-800">Filters</span>
          </button>
          
          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
              <input
                type="text"
                placeholder="Search services, cities, or areas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-8 pr-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center">
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              {viewMode === 'grid' ? (
                <>
                  <List className="w-3.5 h-3.5" />
                  <span className="text-sm hidden sm:inline">List View</span>
                </>
              ) : (
                <>
                  <Grid className="w-3.5 h-3.5" />
                  <span className="text-sm hidden sm:inline">Grid View</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Collapsible Filter Content */}
        {showFilters && (
          <>
          <div className="px-6 pb-6">
          {/* Main filters row */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-3">
              <MapPin className="w-4 h-4" />
              City
            </label>
            <CustomSelect
              options={[
                { value: '', label: 'All Cities' },
                ...cities.map(city => ({ value: city, label: city }))
              ]}
              value={selectedCity}
              onChange={(value) => {
                setSelectedCity(value);
                try { localStorage.setItem('selected_city', value); } catch (err) { }
              }}
              placeholder="Select city"
              className="w-full"
            />
          </div>

          <div className="relative" ref={typesDropdownRef}>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-3">
              <Layers className="w-4 h-4" />
              Service Types
            </label>
            <button
              type="button"
              onClick={() => setShowTypesDropdown(s => !s)}
              className="w-full h-11 flex items-center justify-between px-3 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-50 focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors"
            >
              <span className="text-sm text-slate-700">
                {selectedServiceTypes.length === 0 ? 'All Services' : `${selectedServiceTypes.length} selected`}
              </span>
              <svg className={`w-4 h-4 transition-transform ${showTypesDropdown ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" /></svg>
            </button>
            {showTypesDropdown && (
              <div className="absolute z-50 mt-2 w-full bg-white border border-slate-200 rounded-lg shadow-md p-3 max-h-64 overflow-auto">
                <label className="flex items-center space-x-2 cursor-pointer px-1 py-1 rounded hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={selectedServiceTypes.length === 0}
                    onChange={() => {
                      setSelectedServiceTypes([]);
                      setFoodItem('');
                      try { localStorage.setItem('selected_service_types', JSON.stringify([])); } catch { }
                    }}
                    className="rounded text-slate-700 focus:ring-slate-700"
                  />
                  <span className="text-sm">All Services</span>
                </label>
                {serviceTypes.map(type => (
                  <label key={type.id} className="flex items-center space-x-2 cursor-pointer px-1 py-1 rounded hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={selectedServiceTypes.includes(type.id)}
                      onChange={(e) => {
                        const isChecked = e.target.checked;
                        let newSelectedTypes: string[];
                        if (isChecked) {
                          newSelectedTypes = [...selectedServiceTypes, type.id];
                        } else {
                          newSelectedTypes = selectedServiceTypes.filter(t => t !== type.id);
                          if (type.id === 'food') setFoodItem('');
                        }
                        setSelectedServiceTypes(newSelectedTypes);
                        try { localStorage.setItem('selected_service_types', JSON.stringify(newSelectedTypes)); } catch { }
                      }}
                      className="rounded text-slate-700 focus:ring-slate-700"
                    />
                    <span className="text-sm">{type.icon} {type.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Food Item Input (only when Food selected) */}
          {selectedServiceTypes.includes('food') && (
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-3">
                🍽️ Food Item
              </label>
              <input
                type="text"
                value={foodItem}
                onChange={(e) => setFoodItem(e.target.value)}
                placeholder="e.g., Burger, Pizza, Biryani"
                className="w-full h-11 px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors"
              />
            </div>
          )}

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-3">
              <Map className="w-4 h-4" />
              Search Area
            </label>
            <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => {
                    const value = e.target.value;
                    // Check if user is trying to enter area without selecting city first
                    if (value && !selectedCity) {
                      window.dispatchEvent(new CustomEvent('toast:show', { 
                        detail: { 
                          message: 'Please select a city first before searching for areas', 
                          type: 'warning' 
                        } 
                      }));
                      return;
                    }
                    setSearchTerm(value);
                  }}
                  onFocus={() => {
                    if (!selectedCity) {
                      window.dispatchEvent(new CustomEvent('toast:show', { 
                        detail: { 
                          message: 'Please select a city first before searching for areas', 
                          type: 'warning' 
                        } 
                      }));
                      return;
                    }
                    setShowSuggestions(true);
                  }}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  placeholder={selectedCity ? "Search or select area" : "Select city first"}
                  disabled={!selectedCity}
                  className={`w-full h-11 px-3 py-2.5 pr-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors ${!selectedCity ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                />
                {selectedCity && (
                  <button
                    type="button"
                    onClick={() => setShowSuggestions(!showSuggestions)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                  >
                    <svg className={`w-4 h-4 transition-transform ${showSuggestions ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
                {showSuggestions && selectedCity && (
                  <div className="absolute left-0 top-full w-full bg-white rounded-lg shadow-lg mt-1 z-50 border border-slate-100 max-h-64 overflow-auto">
                    {searchTerm ? (
                      // Show filtered results when user is typing
                      areaOptions.filter(a => a.toLowerCase().includes(searchTerm.trim().toLowerCase())).length > 0 ? (
                        areaOptions.filter(a => a.toLowerCase().includes(searchTerm.trim().toLowerCase())).map(suggestion => (
                          <button
                            key={suggestion}
                            type="button"
                            onMouseDown={() => {
                              setSearchTerm(suggestion);
                              setShowSuggestions(false);
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-slate-100 transition-colors cursor-pointer text-base"
                          >
                            {suggestion}
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-2 text-slate-400">No areas found</div>
                      )
                    ) : (
                      // Show all areas when user clicks without typing
                      <>
                        <button
                          type="button"
                          onMouseDown={() => {
                            setSearchTerm('');
                            setShowSuggestions(false);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-slate-100 transition-colors cursor-pointer text-base font-medium text-slate-600 border-b border-slate-100"
                        >
                          All Areas
                        </button>
                        {areaOptions.map(suggestion => (
                          <button
                            key={suggestion}
                            type="button"
                            onMouseDown={() => {
                              setSearchTerm(suggestion);
                              setShowSuggestions(false);
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-slate-100 transition-colors cursor-pointer text-base"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </>
                    )}
                  </div>
                )}
            </div>
          </div>

          {/* Sort Results - moved to main row */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-3">
              <ArrowUpDown className="w-4 h-4" />
              Sort Results
            </label>
            <CustomSelect
              options={[
                { value: 'rating', label: '⭐ Rating' },
                { value: 'price-asc', label: '💰 Price: Low to High' },
                { value: 'price-desc', label: '💸 Price: High to Low' },
                { value: 'name', label: '🔤 Name' }
              ]}
              value={sortBy}
              onChange={(value) => setSortBy(value as any)}
              placeholder="Sort by"
              className="w-full"
            />
          </div>
        </div>

        {/* Budget range slider */}
        <div className="mt-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-3">
              <DollarSign className="w-4 h-4" />
              Monthly Budget Range
            </label>
            <div className="flex flex-col gap-3">
              {/* Budget range display */}
              <div className="w-full flex justify-between items-center text-sm font-semibold">
                <span className="text-green-600">₹{minBudget.toLocaleString()}</span>
                <span className="text-blue-600">{maxBudget === 0 ? 'No limit' : `₹${maxBudget.toLocaleString()}`}</span>
              </div>
              
              {/* Compact dual-handle range slider */}
              <div className="relative w-full h-4 flex items-center">
                {/* Track background */}
                <div className="absolute w-full h-0.5 bg-gray-300 rounded-full"></div>
                
                {/* Active track (between handles) */}
                <div 
                  className="absolute h-0.5 bg-slate-700 rounded-full"
                  style={{
                    left: `${(minBudget / 100000) * 100}%`,
                    width: `${maxBudget === 0 ? (100 - (minBudget / 100000) * 100) : ((maxBudget - minBudget) / 100000) * 100}%`
                  }}
                ></div>
                
                {/* Min slider - higher z-index for better interaction */}
                <input
                  type="range"
                  min="0"
                  max="99999"
                  step="500"
                  value={minBudget}
                  onChange={e => {
                    const val = Math.min(Number(e.target.value) || 0, maxBudget === 0 ? 99999 : maxBudget);
                    setMinBudget(val);
                    try { localStorage.setItem('search_min_budget', String(val)); } catch { }
                  }}
                  className="absolute w-full h-4 bg-transparent appearance-none cursor-pointer z-30 compact-min-slider"
                />
                
                {/* Max slider */}
                <input
                  type="range"
                  min="1"
                  max="100000"
                  step="500"
                  value={maxBudget === 0 ? 100000 : maxBudget}
                  onChange={e => {
                    const val = Number(e.target.value) || 0;
                    if (val === 100000) {
                      setMaxBudget(0); // Set to no limit
                    } else if (val > minBudget) {
                      setMaxBudget(val);
                    }
                    try { localStorage.setItem('search_max_budget', String(val === 100000 ? 0 : val)); } catch { }
                  }}
                  className="absolute w-full h-4 bg-transparent appearance-none cursor-pointer z-20 compact-max-slider"
                />
              </div>
              
              {/* Quick preset buttons only */}
              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => {
                    setMinBudget(0);
                    setMaxBudget(20000);
                    localStorage.setItem('search_min_budget', '0');
                    localStorage.setItem('search_max_budget', '20000');
                  }}
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                >
                  ₹0-20k
                </button>
                <button
                  onClick={() => {
                    setMinBudget(20000);
                    setMaxBudget(40000);
                    localStorage.setItem('search_min_budget', '20000');
                    localStorage.setItem('search_max_budget', '40000');
                  }}
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                >
                  ₹20k-40k
                </button>
                <button
                  onClick={() => {
                    setMinBudget(40000);
                    setMaxBudget(0);
                    localStorage.setItem('search_min_budget', '40000');
                    localStorage.setItem('search_max_budget', '0');
                  }}
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                >
                  ₹40k+
                </button>
                <button
                  onClick={() => {
                    setMinBudget(0);
                    setMaxBudget(0);
                    localStorage.setItem('search_min_budget', '0');
                    localStorage.setItem('search_max_budget', '0');
                  }}
                  className="px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
          </div>
          </div>
          </>
        )}
      </div>

      {/* Cost Calculator moved to its own top-level page */}

      {/* Data availability note for Food */}
      {selectedServiceTypes.includes('food') && selectedCity && selectedCity !== 'Ahmedabad' && (
        <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <p className="text-sm text-slate-700">
            🍽️ Food dataset is currently available for Ahmedabad only. Switch city to Ahmedabad to see food items.
          </p>
        </div>
      )}

      {/* Results */}
      {selectedServiceTypes.includes('food') && csvServices && csvServices.some(s => s.type === 'food') && (!selectedCity || selectedCity === 'Ahmedabad') && (
        <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <p className="text-sm text-slate-700">
            📊 Showing {csvServices.filter(s => s.type === 'food').length} food items from Swiggy Ahmedabad.
            <span className="text-xs text-slate-600 ml-1">
              (Sampled from all categories for variety)
            </span>
          </p>
        </div>
      )}

      {/* Results Header */}
      {!isLoadingCsv && !csvError && filteredServices.length > 0 && (
        <div className="mb-6">
          <span className="text-sm text-slate-600">{filteredServices.length} results</span>
        </div>
      )}

      {/* Tabs + Sorting when multiple needs */}
      {!isLoadingCsv && !csvError && filteredServices.length > 0 && (
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              className={`px-3 py-1 rounded-full text-sm ${activeTypeTab === 'all' ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-700'}`}
              onClick={() => setActiveTypeTab('all')}
            >
              All <span className="ml-1 bg-white/70 text-orange-900 px-2 py-0.5 rounded-full text-xs">{filteredServices.length}</span>
            </button>
            {serviceTypes.map(t => (
                <button
                  key={t.id}
                  className={`px-3 py-1 rounded-full text-sm ${activeTypeTab === t.id ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-700'}`}
                  onClick={() => setActiveTypeTab(t.id as Service['type'])}
                >
                  <span className="mr-1">{t.icon}</span>{t.label}
                  <span className="ml-1 bg-white/70 text-orange-900 px-2 py-0.5 rounded-full text-xs">{typeCounts[t.id as Service['type']] || 0}</span>
                </button>
              ))}
          </div>
        </div>
      )}

      {isLoadingCsv ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <h3 className="text-lg font-medium text-slate-700 mb-2">Loading food data...</h3>
          <p className="text-slate-500 text-center">Please wait while we fetch the latest restaurant information</p>
        </div>
      ) : csvError ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-medium text-red-700 mb-2">Error Loading Data</h3>
          <p className="text-red-600 text-center">{csvError}</p>
        </div>
      ) : (
        <div className={`grid gap-6 ${viewMode === 'grid' 
          ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
          : 'grid-cols-1'
        }`}>
          {sortedServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              isBookmarked={bookmarked.has(service.id)}
              onToggleBookmark={() => toggleBookmark(service.id)}
              onViewDetails={() => setSelected(service)}
              viewMode={viewMode}
            />
          ))}

          {filteredServices.length === 0 && !isLoadingCsv && !csvError && (
            <div className="col-span-full text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">No services found</h3>
              <p className="text-slate-600">Try adjusting your filters to find more options</p>
            </div>
          )}
        </div>
      )}

      {selected && <ServiceDetails service={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
export default ServiceSearch;