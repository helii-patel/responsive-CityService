import React from 'react';

export const CostComparisonChart: React.FC = () => {
  const cities = [
    { name: 'Mumbai', cost: 45000, color: 'bg-red-500' },
    { name: 'Delhi', cost: 38000, color: 'bg-orange-500' },
    { name: 'Bangalore', cost: 35000, color: 'bg-yellow-500' },
    { name: 'Pune', cost: 28000, color: 'bg-green-500' },
    { name: 'Hyderabad', cost: 26000, color: 'bg-blue-500' },
    { name: 'Chennai', cost: 24000, color: 'bg-purple-500' },
  ];

  const maxCost = Math.max(...cities.map(city => city.cost));

  return (
    <div className="space-y-4">
      {cities.map((city) => (
        <div key={city.name} className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-slate-700">{city.name}</span>
            <span className="text-sm text-slate-600">₹{city.cost.toLocaleString()}/month</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3">
            <div
              className={`h-3 rounded-full ${city.color} transition-all duration-1000 ease-out`}
              style={{ width: `${(city.cost / maxCost) * 100}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
};