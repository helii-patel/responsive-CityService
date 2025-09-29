import React, { useEffect, useState } from 'react';

export const TiffinRentalList: React.FC = () => {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        fetch('/api/tiffin-rental')
            .then(async (res) => {
                if (!res.ok) throw new Error(`Status ${res.status}`);
                return res.json();
            })
            .then((data) => {
                if (!mounted) return;
                setItems(Array.isArray(data) ? data : []);
            })
            .catch((err) => {
                console.error('Failed to load tiffin data', err);
                if (!mounted) return;
                setError('Failed to load data');
            })
            .finally(() => mounted && setLoading(false));

        return () => { mounted = false; };
    }, []);

    if (loading) return <div className="p-4">Loading tiffin rentals...</div>;
    if (error) return <div className="p-4 text-red-600">{error}</div>;
    if (!items.length) return <div className="p-4">No tiffin rental data found.</div>;

    return (
        <div className="p-4 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((row, idx) => (
                <div key={idx} className="bg-white shadow rounded p-4">
                    <h3 className="font-semibold text-lg">{row['Provider Name'] || row.provider || 'Provider'}</h3>
                    <p className="text-sm text-gray-600">Location: {row['Location'] || row.location || 'N/A'}</p>
                    <p className="mt-2">Price: {row['Price'] ? `₹${row['Price']}` : (row['price'] ? `₹${row['price']}` : 'N/A')}</p>
                    {row['Contact'] && <p className="text-sm">Contact: {row['Contact']}</p>}
                    {row['Details'] && <p className="mt-2 text-sm text-gray-700">{row['Details']}</p>}
                </div>
            ))}
        </div>
    );
};

export default TiffinRentalList;
