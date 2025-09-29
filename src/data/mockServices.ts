export interface Service {
    id: string;
    name: string;
    type: 'accommodation' | 'food' | 'tiffin' | 'transport' | 'coworking' | 'utilities';
    city: string;
    price: number;
    rating: number;
    description: string;
    image: string;
    features: string[];
    // optional raw/meta fields (used when loading from CSVs so we can display all original columns)
    meta?: Record<string, string>;
}

export const mockServices: Service[] = [
    {
        id: '1',
        name: 'Premium Co-living Space Ahmedabad',
        type: 'accommodation',
        city: 'Ahmedabad',
        price: 12000,
        rating: 4.5,
        description: 'Fully furnished shared apartment with all amenities in Ahmedabad',
        image: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400',
        features: ['WiFi', 'AC', 'Laundry', 'Kitchen', 'Security']
    },
    {
        id: '2',
        name: 'Healthy Meal Plans Surat',
        type: 'food',
        city: 'Surat',
        price: 4000,
        rating: 4.6,
        description: 'Fresh, healthy meals delivered daily to your doorstep in Surat',
        image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
        features: ['Daily Delivery', 'Customizable', 'Fresh Ingredients']
    },
    {
        id: '3',
        name: 'Family Suite Vadodara',
        type: 'accommodation',
        city: 'Vadodara',
        price: 15000,
        rating: 4.4,
        description: 'Spacious family suite with modern amenities in Vadodara',
        image: 'https://images.pexels.com/photos/2029667/pexels-photo-2029667.jpeg?auto=compress&cs=tinysrgb&w=400',
        features: ['Furnished', 'Parking', 'Gym Access', '24/7 Support']
    },
    {
        id: '4',
        name: 'Local Tiffin Service Rajkot',
        type: 'food',
        city: 'Rajkot',
        price: 3000,
        rating: 4.2,
        description: 'Home-cooked tiffin plans delivered in Rajkot',
        image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
        features: ['Home-cooked', 'Daily Delivery', 'Affordable']
    },
    {
        id: '5',
        name: 'Studio Apartment Gandhinagar',
        type: 'accommodation',
        city: 'Gandhinagar',
        price: 10000,
        rating: 4.3,
        description: 'Compact studio apartment near major transit in Gandhinagar',
        image: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400',
        features: ['Furnished', 'Close to Transit', 'High-speed Internet']
    },
    // Added from CSV: Tiffin Services
    {
        id: '6',
        name: 'Home Made Tiffin Service, Gujarati Tiffin Service In Ahmedabad, Kathiyawadi Tiffin, Jain Tiffin Service - Jay Ambe',
        type: 'tiffin',
        city: 'Ahmedabad',
        price: 95,
        rating: 4.3,
        description: '495, Prabhugokals Pole, Kachwada',
        image: 'https://lh3.googleusercontent.com/p/AF1QipOu7MZ4QIIQ0cr5LUe-3OgHn2Zl86btCXb1nWNs=w140-h140-p-k-no',
        features: ['Open ⋅ Closes 10 pm'],
        meta: {
            Reviews: '62',
            Type: 'Tiffin Service Provider',
            Estimated_Price_Per_Tiffin_INR: '₹70 - ₹120',
            Address: '495, Prabhugokals Pole, Kachwada',
            Hours: 'Open ⋅ Closes 10 pm',
            Phone: '',
            Menu: 'https://lh3.googleusercontent.com/p/AF1QipOu7MZ4QIIQ0cr5LUe-3OgHn2Zl86btCXb1nWNs=w140-h140-p-k-no',
            Other: 'https://lh3.googleusercontent.com/p/AF1QipP9uvEHEhYTyHXwhrZLVNqp89kTdff8ggzBXcT6=w426-h240-k-no',
            City: 'Ahmedabad'
        }
    },
    {
        id: '7',
        name: 'Gujarati Food And Tiffin Service',
        type: 'tiffin',
        city: 'Ahmedabad',
        price: 95,
        rating: 4.6,
        description: 'B-32 Rajchandra soc, Kathwada Rd',
        image: 'https://lh3.googleusercontent.com/p/AF1QipOudwwLsO6-6nWIdLOBWxFZjqMyDwpYi2tEVyYr=w140-h140-p-k-no',
        features: ['Open ⋅ Closes 9 am Wed'],
        meta: {
            Reviews: '39',
            Type: 'Tiffin Service Provider',
            Estimated_Price_Per_Tiffin_INR: '₹70 - ₹120',
            Address: 'B-32 Rajchandra soc, Kathwada Rd',
            Hours: 'Open ⋅ Closes 9 am Wed',
            Phone: '',
            Menu: 'https://lh3.googleusercontent.com/p/AF1QipOudwwLsO6-6nWIdLOBWxFZjqMyDwpYi2tEVyYr=w140-h140-p-k-no',
            Other: 'https://lh3.googleusercontent.com/p/AF1QipOvu7jl17ta2ZaYpbeB9q7mxzTn6npWD_sX1tvj=w426-h240-k-no',
            City: 'Ahmedabad'
        }
    },
    {
        id: '8',
        name: 'Aarti Tiffin Service - Best Tiffin Service',
        type: 'tiffin',
        city: 'Ahmedabad',
        price: 117.5,
        rating: 4.9,
        description: 'Shiv Aashish Flat, E1, Chandola Canal Garden Rd, nr. Sachi Hospital lane',
        image: 'https://lh3.googleusercontent.com/p/AF1QipOaGukXqB5qgOB4D_qRXckUccvSctfVSSDlBwv_=w408-h408-k-no',
        features: ['Open ⋅ Closes 8 pm'],
        meta: {
            Reviews: '409',
            Type: 'Tiffin Service Provider',
            Estimated_Price_Per_Tiffin_INR: '₹100 - ₹135',
            Address: 'Shiv Aashish Flat, E1, Chandola Canal Garden Rd, nr. Sachi Hospital lane',
            Hours: 'Open ⋅ Closes 8 pm',
            Phone: '',
            Menu: 'https://lh3.googleusercontent.com/p/AF1QipOaGukXqB5qgOB4D_qRXckUccvSctfVSSDlBwv_=w408-h408-k-no',
            Other: 'https://lh3.googleusercontent.com/p/AF1QipOaGukXqB5qgOB4D_qRXckUccvSctfVSSDlBwv_=w408-h408-k-no',
            City: 'Ahmedabad'
        }
    },
    {
        id: '9',
        name: 'Jay Siyaram Parcel Point (Porbandar vala) | Best Tiffin Services in Gandhinagar & Ahmedabad | Gujarati Tiffin Services',
        type: 'tiffin',
        city: 'Ahmedabad',
        price: 95,
        rating: 4.9,
        description: 'Sahjanand City, 103 B1',
        image: 'https://lh3.googleusercontent.com/p/AF1QipPRQ7NXAHtJ11_VN1ZC9rNl-gEVCXYuShM8Jwzx=w140-h140-p-k-no',
        features: ['Open ⋅ Closes 9 pm'],
        meta: {
            Reviews: '52',
            Type: 'Tiffin Service Provider',
            Estimated_Price_Per_Tiffin_INR: '₹70 - ₹120',
            Address: 'Sahjanand City, 103 B1',
            Hours: 'Open ⋅ Closes 9 pm',
            Phone: '',
            Menu: 'https://lh3.googleusercontent.com/p/AF1QipPRQ7NXAHtJ11_VN1ZC9rNl-gEVCXYuShM8Jwzx=w140-h140-p-k-no',
            Other: 'https://lh3.googleusercontent.com/p/AF1QipOVfNh1YKtj_kXdV1l6-r15U-dt2aZcPDzDair1=w408-h543-k-no',
            City: 'Ahmedabad'
        }
    },
    {
        id: '10',
        name: 'Tiffin Tour Services',
        type: 'tiffin',
        city: 'Vadodara',
        price: 95,
        rating: 5,
        description: 'Vinayak Enclave, B 101, Krunal char Rasta, opp. signate plaza',
        image: 'https://lh3.googleusercontent.com/p/AF1QipMaGtQebhdutq9vs8euoBcQU0nX8IgRLEfePLt9=w408-h408-k-no',
        features: ['Open ⋅ Closes 8 pm'],
        meta: {
            Reviews: '159',
            Type: 'Tiffin Service Provider',
            Estimated_Price_Per_Tiffin_INR: '₹70 - ₹120',
            Address: 'Vinayak Enclave, B 101, Krunal char Rasta, opp. signate plaza',
            Hours: 'Open ⋅ Closes 8 pm',
            Phone: '',
            Menu: '',
            Other: 'https://lh3.googleusercontent.com/p/AF1QipMaGtQebhdutq9vs8euoBcQU0nX8IgRLEfePLt9=w408-h408-k-no',
            City: 'Vadodara'
        }
    },
    {
        id: 't1',
        name: 'City Bus Service',
        type: 'transport',
        city: 'Ahmedabad',
        price: 150,
        rating: 4.0,
        description: 'Reliable public bus transportation service across Ahmedabad',
        image: 'https://images.pexels.com/photos/385998/pexels-photo-385998.jpeg?auto=compress&cs=tinysrgb&w=400',
        features: ['Regular Schedule', 'Multiple Routes', 'Affordable', 'Air Conditioned']
    },
    {
        id: 't2',
        name: 'Metro Rail Service',
        type: 'transport',
        city: 'Ahmedabad',
        price: 200,
        rating: 4.3,
        description: 'Modern metro rail system connecting major areas of Ahmedabad',
        image: 'https://images.pexels.com/photos/378570/pexels-photo-378570.jpeg?auto=compress&cs=tinysrgb&w=400',
        features: ['Fast Transit', 'Clean', 'Safe', 'Punctual']
    },
    {
        id: 'c1',
        name: 'Tech Hub Coworking',
        type: 'coworking',
        city: 'Ahmedabad',
        price: 5000,
        rating: 4.4,
        description: 'Modern coworking space with all amenities for startups and freelancers',
        image: 'https://images.pexels.com/photos/3184436/pexels-photo-3184436.jpeg?auto=compress&cs=tinysrgb&w=400',
        features: ['High-Speed WiFi', 'Meeting Rooms', 'Coffee Bar', '24/7 Access', 'Parking']
    },
    {
        id: 'c2',
        name: 'Creative Space Hub',
        type: 'coworking',
        city: 'Surat',
        price: 4500,
        rating: 4.2,
        description: 'Inspiring coworking environment for creative professionals and teams',
        image: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400',
        features: ['Designer Workspace', 'Collaboration Areas', 'Printing Services', 'Community Events']
    },
    {
        id: 'u1',
        name: 'Municipal Water Supply',
        type: 'utilities',
        city: 'Ahmedabad',
        price: 800,
        rating: 3.8,
        description: 'Reliable water supply connection for residential and commercial use',
        image: 'https://images.pexels.com/photos/416978/pexels-photo-416978.jpeg?auto=compress&cs=tinysrgb&w=400',
        features: ['24/7 Supply', 'Quality Water', 'Maintenance Support', 'Online Bill Payment']
    },
    {
        id: 'u2',
        name: 'Electricity Board Service',
        type: 'utilities',
        city: 'Ahmedabad',
        price: 1200,
        rating: 4.0,
        description: 'Reliable electricity connection and maintenance services',
        image: 'https://images.pexels.com/photos/159220/pexels-photo-159220.jpeg?auto=compress&cs=tinysrgb&w=400',
        features: ['Stable Power', 'Quick Repairs', 'Digital Billing', 'Emergency Support']
    }
    // Add more from CSV as needed, but keeping it to a few for brevity
];

export default mockServices;