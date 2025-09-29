import React from 'react';

export const CostComparisonChart: React.FC = () => {
  const cities = [
    { name: 'Mumbai', cost: 45000, color: '#334155' },
    { name: 'Delhi', cost: 38000, color: '#475569' },
    { name: 'Bangalore', cost: 35000, color: '#64748b' },
    { name: 'Pune', cost: 28000, color: '#94a3b8' },
    { name: 'Hyderabad', cost: 26000, color: '#cbd5e1' },
    { name: 'Chennai', cost: 24000, color: '#e2e8f0' },
  ];

  const maxCost = Math.max(...cities.map(city => city.cost));

  return (
    <div className="space-y-6">
      {cities.map((city) => (
        <div key={city.name} className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-slate-700">{city.name}</span>
            <span className="text-sm font-bold text-slate-900">₹{city.cost.toLocaleString()}</span>
          </div>
          <div className="relative">
            <div className="w-full bg-slate-100 rounded-full h-3">
              <div
                className="h-3 rounded-full transition-all duration-1000 ease-out shadow-sm"
                style={{ 
                  backgroundColor: city.color, 
                  width: `${(city.cost / maxCost) * 100}%` 
                }}
              ></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};