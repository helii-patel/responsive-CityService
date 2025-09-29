import React, { useEffect, useMemo, useState } from 'react';
import { CostCalculator } from './components/CostCalculator';
import { mockServices, Service } from './data/mockServices';

export const CostCalculatorPage: React.FC = () => {
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const raw = localStorage.getItem('local_bookmarks');
      if (raw) setBookmarkedIds(new Set(JSON.parse(raw)));
    } catch { }
  }, []);

  const items = useMemo(() => {
    const all = mockServices;
    const chosen: Service[] = [];

    if (bookmarkedIds.size > 0) {
      for (const s of all) {
        if (s.id && bookmarkedIds.has(s.id)) chosen.push(s);
      }
    }

    if (chosen.length === 0) {
      chosen.push(...all.slice(0, 12));
    }

    return chosen.map(s => ({
      id: s.id || `${s.name}-${s.city}`,
      name: s.name,
      type: s.type,
      price: s.price || 0,
    }));
  }, [bookmarkedIds]);

  const [min, setMin] = useState<number>(() => Number(localStorage.getItem('calc_min_budget') || 0));
  const [max, setMax] = useState<number>(() => Number(localStorage.getItem('calc_max_budget') || 50000));

  useEffect(() => {
    localStorage.setItem('calc_min_budget', String(min || 0));
  }, [min]);
  useEffect(() => {
    localStorage.setItem('calc_max_budget', String(max || 0));
  }, [max]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-900 mb-3">Cost Calculator</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Plan your monthly expenses and stay within budget with our smart calculator
        </p>
      </div>

      {/* Budget Range Selector */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Set Your Budget Range</h3>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Minimum Budget: ₹{min.toLocaleString()}
              </label>
              <input
                type="range"
                min={0}
                max={100000}
                step={1000}
                value={min}
                onChange={(e) => {
                  const val = Math.min(Number(e.target.value), max - 1000);
                  setMin(val);
                }}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Maximum Budget: ₹{max.toLocaleString()}
              </label>
              <input
                type="range"
                min={0}
                max={100000}
                step={1000}
                value={max}
                onChange={(e) => {
                  const val = Math.max(Number(e.target.value), min + 1000);
                  setMax(val);
                }}
                className="w-full"
              />
            </div>
          </div>

          {/* Budget Display */}
          <div className="flex items-center justify-center">
            <div className="bg-slate-100 rounded-xl px-6 py-3">
              <span className="text-slate-600 text-sm">Your Budget Range: </span>
              <span className="font-bold text-slate-900">
                ₹{min.toLocaleString()} - ₹{max.toLocaleString()}/month
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Calculator Component */}
      <CostCalculator selectedServices={items} userBudget={{ min, max }} />
    </div>
  );
};

export default CostCalculatorPage;
