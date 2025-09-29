// Test file to validate food CSV data loading

// Sample data structure from swiggy_Ahm.csv
const sampleFoodRow = {
    'State': 'Gujarat',
    'City': 'Ahmedabad',
    'Restaurant Name': 'KFC',
    'Location': 'Hebatpur',
    'Category': 'Recommended',
    'Dish Name': 'Peri Peri Strips & Popcorn Party Bucket',
    'Price (INR)': '599.0',
    'Rating': '0.0',
    'Rating Count': '0'
};

// This is the updated mapFoodRow function from ServiceSearch.tsx
const mapFoodRow = (row: any, idx: number) => {
    const id = `food-${idx}`;
    const price = Number(row['Price (INR)']) || 0;
    const rating = Number(row['Rating']) || 0;
    const ratingCount = Number(row['Rating Count']) || 0;

    return {
        id,
        name: `${row['Dish Name']} - ${row['Restaurant Name']}`,
        type: 'food',
        city: row['City'] || 'Ahmedabad',
        price: price,
        rating: rating > 0 ? rating : 4.2, // fallback rating
        description: `${row['Category']} dish from ${row['Restaurant Name']} in ${row['Location']}. ${ratingCount > 0 ? `Based on ${ratingCount} ratings.` : ''}`,
        image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
        features: [row['Restaurant Name'], row['Location'], row['Category']],
    };
};

// Test the mapping function
const testResult = mapFoodRow(sampleFoodRow, 0);
console.log('Test food item mapping:', testResult);

export default testResult;